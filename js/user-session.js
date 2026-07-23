/**
 * BlicBloc User Session & Header Profile Dropdown Manager
 * Updates header across index.html and docs.html dynamically when logged in vs guest
 */

(function () {
  function getStoredUser() {
    try {
      const u = localStorage.getItem('blicbloc_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  }

  function saveStoredUser(user) {
    if (user) {
      localStorage.setItem('blicbloc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('blicbloc_user');
    }
  }

  window.BlicBlocSession = {
    getUser: getStoredUser,
    setUser: saveStoredUser,
    logout: async function () {
      localStorage.removeItem('blicbloc_user');
      if (window.supabaseClient) {
        try {
          await window.supabaseClient.auth.signOut();
        } catch (e) {}
      }
      window.location.reload();
    }
  };

  document.addEventListener('DOMContentLoaded', async () => {
    let currentUser = getStoredUser();

    // Check Supabase session if available
    if (window.supabaseClient) {
      try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session && session.user) {
          const u = session.user;
          currentUser = {
            id: u.id,
            email: u.email,
            full_name: u.user_metadata?.full_name || u.user_metadata?.name || u.email.split('@')[0],
            handle: u.user_metadata?.handle || u.email.split('@')[0],
            avatar_url: u.user_metadata?.avatar_url || null
          };
          saveStoredUser(currentUser);
        }
      } catch (e) {}
    }

    renderHeaderAuthState(currentUser);
  });

  function renderHeaderAuthState(user) {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    // Remove any existing guest/user auth containers
    const existingGuest = headerActions.querySelector('.header-auth-guest');
    const existingUser = headerActions.querySelector('.header-auth-user');
    if (existingGuest) existingGuest.remove();
    if (existingUser) existingUser.remove();

    if (user) {
      // LOGGED IN STATE: Show Profile Avatar & Dropdown Menu
      const initial = user.full_name ? user.full_name.charAt(0).toUpperCase() : 'C';
      const handle = user.handle || user.email.split('@')[0];
      const name = user.full_name || 'Creator';

      const userContainer = document.createElement('div');
      userContainer.className = 'header-auth-user relative';
      userContainer.style.position = 'relative';

      userContainer.innerHTML = `
        <button id="profile-dropdown-btn" class="profile-btn" style="display:flex; align-items:center; gap:0.5rem; padding:0.35rem 0.65rem; border-radius:9999px; background:var(--bg-secondary); border:1px solid var(--border-subtle); transition:all 0.2s;" title="Manage MainSpace">
          <div style="width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg, var(--primary) 0%, var(--accent-cyan) 100%); color:white; font-weight:700; font-size:0.85rem; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            ${user.avatar_url ? `<img src="${user.avatar_url}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" />` : initial}
          </div>
          <span style="font-size:0.85rem; font-weight:700; color:var(--text-primary); max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</span>
          <span style="font-size:0.7rem; color:var(--text-muted);">▼</span>
        </button>

        <div id="profile-dropdown-menu" class="profile-menu" style="display:none; position:absolute; right:0; top:calc(100% + 8px); width:240px; background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:16px; padding:1rem; box-shadow:0 10px 30px rgba(0,0,0,0.15); z-index:200;">
          <div style="padding-bottom:0.75rem; margin-bottom:0.75rem; border-bottom:1px solid var(--border-subtle);">
            <div style="font-weight:700; font-size:0.95rem; color:var(--text-primary);">${name}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">@${handle}</div>
            <div style="margin-top:0.35rem;">
              <span class="badge badge-spark" style="font-size:0.7rem;">https://${handle}.blicbloc.com</span>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.5rem; font-size:0.85rem;">
            <a href="index.html#showcase" style="color:var(--text-primary); font-weight:600; text-decoration:none; display:flex; align-items:center; gap:0.5rem; padding:0.35rem 0.5rem; border-radius:8px; transition:background 0.2s;" onmouseover="this.style.background='var(--bg-surface)'" onmouseout="this.style.background='transparent'">
              <span>🏛️ My MainSpace Profile</span>
            </a>
            <a href="docs.html" style="color:var(--text-primary); font-weight:600; text-decoration:none; display:flex; align-items:center; gap:0.5rem; padding:0.35rem 0.5rem; border-radius:8px; transition:background 0.2s;" onmouseover="this.style.background='var(--bg-surface)'" onmouseout="this.style.background='transparent'">
              <span>📊 Creator Cockpit & Docs</span>
            </a>
          </div>

          <div style="margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.75rem; color:var(--text-muted);">Storage: 5 GB Free</span>
            <button id="logout-btn" style="color:#ef4444; font-size:0.8rem; font-weight:700; background:none; border:none; cursor:pointer;" onclick="window.BlicBlocSession.logout()">Log Out</button>
          </div>
        </div>
      `;

      headerActions.appendChild(userContainer);

      // Dropdown toggle logic
      const dropdownBtn = userContainer.querySelector('#profile-dropdown-btn');
      const dropdownMenu = userContainer.querySelector('#profile-dropdown-menu');

      if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isVisible = dropdownMenu.style.display === 'block';
          dropdownMenu.style.display = isVisible ? 'none' : 'block';
        });

        document.addEventListener('click', (e) => {
          if (!userContainer.contains(e.target)) {
            dropdownMenu.style.display = 'none';
          }
        });
      }

    } else {
      // GUEST STATE: Show Log In & Get Started / Sign Up Buttons
      const guestContainer = document.createElement('div');
      guestContainer.className = 'header-auth-guest';
      guestContainer.style.display = 'flex';
      guestContainer.style.alignItems = 'center';
      guestContainer.style.gap = '0.5rem';

      guestContainer.innerHTML = `
        <a href="login.html" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size:0.85rem;">Log In</a>
        <a href="signup.html" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size:0.85rem;">
          <span>Get Started</span>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
      `;

      headerActions.appendChild(guestContainer);
    }
  }
})();
