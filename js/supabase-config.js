/**
 * Supabase Client Configuration for BlicBloc
 */
window.SUPABASE_URL = "https://pzpahwbtlbchleuucazk.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cGFod2J0bGJjaGxldXVjYXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDE1NTEsImV4cCI6MjEwMDExNzU1MX0.E4Ae2BJEfo79Bt6KXYKkjncIsbUL9ArVGIHwIJ1KxiE";

// Initialize Supabase Client if SDK is loaded
if (window.supabase && typeof window.supabase.createClient === 'function') {
  window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
}
