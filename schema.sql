-- ====================================================================
-- BlicBloc Supabase Database Schema
-- Tables: profiles, feedback
-- Author: Moazzam Ali
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 1. PROFILES TABLE (User Registrations)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    handle TEXT UNIQUE,
    subdomain TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT DEFAULT 'creator',
    storage_used_bytes BIGINT DEFAULT 0,
    storage_limit_bytes BIGINT DEFAULT 5368709120, -- 5 GB Default Free Tier
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Automatic Trigger for Auto-Creating Profiles on Supabase Signup/OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    raw_handle TEXT;
    user_full_name TEXT;
BEGIN
    user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
    raw_handle := COALESCE(new.raw_user_meta_data->>'handle', split_part(new.email, '@', 1));
    
    -- Ensure unique handle fallback
    raw_handle := regexp_replace(lower(raw_handle), '[^a-z0-9_]', '', 'g');

    INSERT INTO public.profiles (id, full_name, email, handle, subdomain, avatar_url)
    VALUES (
        new.id,
        user_full_name,
        new.email,
        raw_handle,
        raw_handle || '.blicbloc.com',
        new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger binding
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ====================================================================
-- 2. FEEDBACK TABLE (Community & User Feedback)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT,
    email TEXT,
    creator_type TEXT, -- Freelancer, Teacher, Developer, Designer, Startup, Community Member
    feedback_type TEXT DEFAULT 'General', -- Idea Impression, Feature Request, MainSpace Feedback, General
    rating INT CHECK (rating >= 1 AND rating <= 5),
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new', -- new, reviewed, archived
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Feedback RLS Policies
CREATE POLICY "Anyone can submit feedback" 
    ON public.feedback FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Feedback is viewable by owner or authenticated creators" 
    ON public.feedback FOR SELECT 
    USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- ====================================================================
-- 3. HELPER VIEWS & INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON public.profiles(handle);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.feedback(created_at DESC);

COMMENT ON TABLE public.profiles IS 'Stores BlicBloc creator profiles, MainSpace handles, and storage metrics.';
COMMENT ON TABLE public.feedback IS 'Stores community feedback, ratings, and feature requests submitted from Discord/X links.';
