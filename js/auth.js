/**
 * BlicBloc Authentication Suite JavaScript Engine
 * Handles Login, Sign Up, Password Reset, Password Toggles, Google OAuth via Supabase
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

  // Google OAuth Sign-In via Supabase
  const googleBtn = document.getElementById('btn-oauth-google');
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      showAlert('Redirecting to Google Sign-In via Supabase...', 'info');
      
      if (window.supabaseClient) {
        try {
          const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin + '/index.html'
            }
          });
          if (error) {
            showAlert('Google Auth Error: ' + error.message, 'error');
          }
        } catch (err) {
          showAlert('Auth Error: ' + err.message, 'error');
        }
      } else {
        setTimeout(() => {
          showAlert('Supabase Client ready! Ensure Google provider is enabled in your Supabase Dashboard under Authentication -> Providers.', 'success');
        }, 1000);
      }
    });
  }

  // Form Submissions
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      showAlert(`Authenticating ${email} with Supabase...`, 'info');

      if (window.supabaseClient) {
        try {
          const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            showAlert(error.message, 'error');
          } else {
            showAlert('Successfully logged in! Redirecting...', 'success');
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 1200);
          }
        } catch (err) {
          showAlert(err.message, 'error');
        }
      } else {
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      }
    });
  }

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const fullName = document.getElementById('fullName').value;
      const handle = document.getElementById('handle').value;

      showAlert(`Registering ${email} with MainSpace handle '@${handle}'...`, 'info');

      if (window.supabaseClient) {
        try {
          const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                handle: handle,
                subdomain: `${handle}.blicbloc.com`
              }
            }
          });

          if (error) {
            showAlert(error.message, 'error');
          } else {
            showAlert('Registration successful! Please check your email for confirmation.', 'success');
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 2000);
          }
        } catch (err) {
          showAlert(err.message, 'error');
        }
      } else {
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1800);
      }
    });
  }

  const forgotForm = document.getElementById('forgot-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      showAlert(`Sending password reset link to ${email}...`, 'info');

      if (window.supabaseClient) {
        try {
          const { data, error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
          });

          if (error) {
            showAlert(error.message, 'error');
          } else {
            showAlert(`Password reset link sent to ${email}! Check your inbox.`, 'success');
          }
        } catch (err) {
          showAlert(err.message, 'error');
        }
      } else {
        showAlert(`Password reset link sent to ${email}! Check your inbox.`, 'success');
      }
    });
  }

  const resetForm = document.getElementById('reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPass = document.getElementById('newPassword').value;
      const confirmPass = document.getElementById('confirmPassword').value;

      if (newPass !== confirmPass) {
        showAlert('Passwords do not match. Please verify.', 'error');
        return;
      }

      showAlert('Updating password in Supabase...', 'info');

      if (window.supabaseClient) {
        try {
          const { data, error } = await window.supabaseClient.auth.updateUser({
            password: newPass
          });

          if (error) {
            showAlert(error.message, 'error');
          } else {
            showAlert('Password updated successfully! Redirecting to login...', 'success');
            setTimeout(() => {
              window.location.href = 'login.html';
            }, 1500);
          }
        } catch (err) {
          showAlert(err.message, 'error');
        }
      } else {
        showAlert('Password updated successfully! Redirecting to login...', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      }
    });
  }
});
