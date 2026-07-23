/**
 * BlicBloc Authentication Suite JavaScript Engine
 * Handles Login, Sign Up, Password Reset, Password Toggles, OAuth clicks, and Supabase integration hooks
 */

document.addEventListener('DOMContentLoaded', () => {
  // Password Visibility Toggle
  const togglePassBtns = document.querySelectorAll('#toggle-password-btn, #toggle-new-pass');
  togglePassBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.closest('.relative');
      const input = container ? container.querySelector('input') : null;
      const icon = btn.querySelector('.material-symbols-outlined');

      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          if (icon) icon.textContent = 'visibility_off';
        } else {
          input.type = 'password';
          if (icon) icon.textContent = 'visibility';
        }
      }
    });
  });

  // Alert Handler Helper
  function showAlert(msg, type = 'info') {
    const alertBox = document.getElementById('auth-alert');
    if (!alertBox) return;

    alertBox.classList.remove('hidden', 'bg-red-50', 'text-red-700', 'border-red-200', 'bg-emerald-50', 'text-emerald-700', 'border-emerald-200', 'bg-blue-50', 'text-blue-700', 'border-blue-200');

    if (type === 'error') {
      alertBox.classList.add('bg-red-50', 'text-red-700', 'border-red-200');
    } else if (type === 'success') {
      alertBox.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-200');
    } else {
      alertBox.classList.add('bg-blue-50', 'text-blue-700', 'border-blue-200');
    }

    alertBox.textContent = msg;
  }

  // OAuth Provider Click Handlers
  const oauthButtons = {
    google: document.getElementById('btn-oauth-google'),
    discord: document.getElementById('btn-oauth-discord'),
    x: document.getElementById('btn-oauth-x'),
    email: document.getElementById('btn-oauth-email')
  };

  if (oauthButtons.google) {
    oauthButtons.google.addEventListener('click', () => {
      showAlert('Connecting with Google OAuth... (Supabase configuration pending)', 'info');
    });
  }

  if (oauthButtons.discord) {
    oauthButtons.discord.addEventListener('click', () => {
      showAlert('Connecting with Discord OAuth... (Supabase configuration pending)', 'info');
    });
  }

  if (oauthButtons.x) {
    oauthButtons.x.addEventListener('click', () => {
      showAlert('Connecting with Twitter / X OAuth... (Supabase configuration pending)', 'info');
    });
  }

  if (oauthButtons.email) {
    oauthButtons.email.addEventListener('click', () => {
      const emailInput = document.getElementById('email');
      if (emailInput) emailInput.focus();
    });
  }

  // Form Submissions
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      showAlert(`Logging in as ${email}... Connecting to Supabase authentication backend...`, 'success');
      setTimeout(() => {
        // Redirect demo
        window.location.href = 'index.html';
      }, 1500);
    });
  }

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const handle = document.getElementById('handle').value;
      showAlert(`Creating MainSpace https://${handle}.blicbloc.com for ${email}... Registering with Supabase...`, 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1800);
    });
  }

  const forgotForm = document.getElementById('forgot-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      showAlert(`Password reset email sent to ${email}! Please check your inbox.`, 'success');
    });
  }

  const resetForm = document.getElementById('reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPass = document.getElementById('newPassword').value;
      const confirmPass = document.getElementById('confirmPassword').value;

      if (newPass !== confirmPass) {
        showAlert('Passwords do not match. Please verify and try again.', 'error');
        return;
      }

      showAlert('Password updated successfully! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    });
  }
});
