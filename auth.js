/* ===================================================
   auth.js — Stackly Zero Waste Authentication
   Handles Login & Sign-Up with localStorage persistence
   =================================================== */

(function () {
  'use strict';

  /* ── Utility helpers ─────────────────────────────── */

  /**
   * Simple obfuscation (NOT real encryption — for demo purposes).
   * In production, use a proper backend with hashed passwords.
   */
  function obscure(str) {
    return btoa(encodeURIComponent(str));
  }

  function deobscure(str) {
    try { return decodeURIComponent(atob(str)); } catch (e) { return ''; }
  }

  function getUsers() {
    try { return JSON.parse(localStorage.getItem('stackly_users') || '[]'); } catch (e) { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem('stackly_users', JSON.stringify(users));
  }

  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('stackly_current_user') || 'null'); } catch (e) { return null; }
  }

  function setCurrentUser(user) {
    localStorage.setItem('stackly_current_user', JSON.stringify(user));
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
  }

  function setLoading(btn, loading) {
    const text = btn.querySelector('.submit-text');
    const arrow = btn.querySelector('.submit-arrow');
    btn.disabled = loading;
    if (loading) {
      if (text) text.textContent = 'Please wait…';
      if (arrow) arrow.textContent = '⏳';
    } else {
      // Restore original text based on page
      if (text) text.textContent = btn.id === 'login-submit-btn' ? 'Sign In' : 'Create Account';
      if (arrow) arrow.textContent = '→';
    }
  }

  /* ── Password visibility toggle ─────────────────── */
  function initPasswordToggle(toggleId, inputId) {
    const toggleBtn = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (!toggleBtn || !input) return;

    toggleBtn.addEventListener('click', function () {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      toggleBtn.textContent = isPassword ? '🙈' : '👁️';
      toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  }

  /* ── Password strength meter ─────────────────────── */
  function initPasswordStrength() {
    const input = document.getElementById('signup-password');
    const fill = document.getElementById('pw-fill');
    const label = document.getElementById('pw-label');
    if (!input || !fill || !label) return;

    input.addEventListener('input', function () {
      const val = input.value;
      let score = 0;

      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      const pct = (score / 4) * 100;
      fill.style.width = pct + '%';

      const levels = [
        { color: '#ef4444', text: 'Too weak' },
        { color: '#f97316', text: 'Weak' },
        { color: '#eab308', text: 'Fair' },
        { color: '#22c55e', text: 'Strong' },
        { color: '#16a34a', text: 'Very strong' },
      ];
      const level = levels[score] || levels[0];
      fill.style.background = level.color;
      label.textContent = val.length === 0 ? 'Enter password' : level.text;
      label.style.color = val.length === 0 ? '' : level.color;
    });
  }

  /* ── Email validation ────────────────────────────── */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  /* ── SIGN UP PAGE ────────────────────────────────── */
  function initSignup() {
    const form = document.getElementById('signup-form');
    if (!form) return;

    initPasswordToggle('toggle-signup-pw', 'signup-password');
    initPasswordStrength();

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Clear previous errors
      ['fname-error', 'lname-error', 'semail-error', 'org-error', 'spw-error', 'cpw-error', 'terms-error'].forEach(function (id) {
        showError(id, '');
      });

      const firstName = document.getElementById('first-name').value.trim();
      const lastName = document.getElementById('last-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const organization = document.getElementById('organization').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const agreeTerms = document.getElementById('agree-terms').checked;

      let hasError = false;

      if (!firstName) { showError('fname-error', 'First name is required.'); hasError = true; }
      if (!lastName) { showError('lname-error', 'Last name is required.'); hasError = true; }
      if (!email || !isValidEmail(email)) { showError('semail-error', 'Please enter a valid email address.'); hasError = true; }
      if (!organization) { showError('org-error', 'Organisation name is required.'); hasError = true; }
      if (!password || password.length < 8) { showError('spw-error', 'Password must be at least 8 characters.'); hasError = true; }
      if (password !== confirmPassword) { showError('cpw-error', 'Passwords do not match.'); hasError = true; }
      if (!agreeTerms) { showError('terms-error', 'You must agree to the Terms & Privacy Policy.'); hasError = true; }

      if (hasError) return;

      // Check if email already registered
      const users = getUsers();
      const exists = users.find(function (u) { return u.email.toLowerCase() === email.toLowerCase(); });
      if (exists) {
        showError('semail-error', 'An account with this email already exists. Please sign in.');
        return;
      }

      const btn = document.getElementById('signup-submit-btn');
      setLoading(btn, true);

      // Simulate async registration (in production, call your API here)
      setTimeout(function () {
        const newUser = {
          id: Date.now().toString(),
          firstName: firstName,
          lastName: lastName,
          email: email.toLowerCase(),
          organization: organization,
          password: obscure(password),
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        saveUsers(users);

        // Show success toast then redirect
        showSignupSuccess(email);

        setTimeout(function () {
          window.location.href = 'login.html?registered=1&email=' + encodeURIComponent(email);
        }, 1800);
      }, 1000);
    });
  }

  function showSignupSuccess(email) {
    const errorDiv = document.getElementById('signup-error');
    if (errorDiv) {
      errorDiv.hidden = false;
      errorDiv.classList.add('success-msg');
      errorDiv.innerHTML = '<span>✅</span> <span id="signup-error-text">Account created! Redirecting to Sign In…</span>';
    }
  }

  /* ── LOGIN PAGE ──────────────────────────────────── */
  function initLogin() {
    const form = document.getElementById('login-form');
    if (!form) return;

    initPasswordToggle('toggle-login-pw', 'login-password');

    // Pre-fill email if coming from signup
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === '1') {
      const emailInput = document.getElementById('login-email');
      if (emailInput && params.get('email')) {
        emailInput.value = decodeURIComponent(params.get('email'));
      }
      // Show a success banner
      showRegistrationBanner();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      showError('email-error', '');
      showError('pw-error', '');
      const loginErrorDiv = document.getElementById('login-error');
      if (loginErrorDiv) loginErrorDiv.hidden = true;

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      let hasError = false;
      if (!email || !isValidEmail(email)) { showError('email-error', 'Please enter a valid email address.'); hasError = true; }
      if (!password) { showError('pw-error', 'Password is required.'); hasError = true; }
      if (hasError) return;

      const btn = document.getElementById('login-submit-btn');
      setLoading(btn, true);

      setTimeout(function () {
        const users = getUsers();

        // First: try to match a registered account
        const registeredUser = users.find(function (u) {
          return u.email.toLowerCase() === email.toLowerCase() &&
                 deobscure(u.password) === password;
        });

        // Demo mode: also allow any valid email + password (min 6 chars)
        const isDemoLogin = !registeredUser && password.length >= 6;

        if (registeredUser || isDemoLogin) {
          let sessionUser;

          if (registeredUser) {
            // Use real registered account data
            sessionUser = {
              id: registeredUser.id,
              firstName: registeredUser.firstName,
              lastName: registeredUser.lastName,
              email: registeredUser.email,
              organization: registeredUser.organization,
            };
          } else {
            // Guest / demo session — derive a display name from the email
            const localPart = email.split('@')[0];
            const parts = localPart.split(/[._\-+]/);
            const firstName = parts[0]
              ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
              : 'User';
            const lastName = parts[1]
              ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
              : '';

            sessionUser = {
              id: 'demo_' + Date.now(),
              firstName: firstName,
              lastName: lastName,
              email: email.toLowerCase(),
              organization: 'Stackly Demo',
            };
          }

          setCurrentUser(sessionUser);

          // Show success briefly then redirect
          if (loginErrorDiv) {
            loginErrorDiv.hidden = false;
            loginErrorDiv.classList.add('success-msg');
            loginErrorDiv.innerHTML = '<span>✅</span> Login successful! Redirecting to dashboard…';
          }

          setTimeout(function () {
            window.location.href = 'dashboard.html';
          }, 1000);

        } else {
          // Password too short
          setLoading(btn, false);
          if (loginErrorDiv) {
            loginErrorDiv.hidden = false;
            loginErrorDiv.classList.remove('success-msg');
            loginErrorDiv.innerHTML = '<span>❌</span> Password must be at least 6 characters.';
          }
        }
      }, 900);
    });
  }

  function showRegistrationBanner() {
    const card = document.getElementById('login-card');
    if (!card) return;
    const banner = document.createElement('div');
    banner.className = 'registration-success-banner';
    banner.innerHTML = '🎉 Account created successfully! Please sign in below.';
    card.insertBefore(banner, card.firstChild);
  }

  /* ── DASHBOARD AUTH GUARD ────────────────────────── */
  function initDashboardGuard() {
    if (!document.body.classList.contains('dash-body')) return;
    const user = getCurrentUser();
    if (!user) {
      // Not logged in → redirect to login
      window.location.href = 'login.html';
      return;
    }
    // Populate user info in sidebar
    populateDashboardUser(user);
  }

  function populateDashboardUser(user) {
    // Avatar initials
    const fInit = user.firstName ? user.firstName.charAt(0) : '';
    const lInit = user.lastName ? user.lastName.charAt(0) : '';
    const initials = (fInit + lInit).toUpperCase() || 'U';

    // Sidebar avatar
    const sidebarAvatar = document.getElementById('user-avatar-sidebar');
    if (sidebarAvatar) sidebarAvatar.textContent = initials;

    // Topbar avatar
    const topbarAvatar = document.getElementById('topbar-avatar');
    if (topbarAvatar) topbarAvatar.textContent = initials;

    // Dropdown avatar
    const dropdownAvatar = document.getElementById('dropdown-avatar');
    if (dropdownAvatar) dropdownAvatar.textContent = initials;

    // Sidebar user name & org
    const nameEl = document.querySelector('.user-name');
    if (nameEl) nameEl.textContent = user.firstName + ' ' + user.lastName;
    const roleEl = document.querySelector('.user-role');
    if (roleEl) roleEl.textContent = user.organization || 'Stackly Member';

    // Dropdown name & email
    const dropdownName = document.getElementById('dropdown-name');
    if (dropdownName) dropdownName.textContent = user.firstName + ' ' + user.lastName;
    const dropdownEmail = document.getElementById('dropdown-email');
    if (dropdownEmail) dropdownEmail.textContent = user.email;

    // Header greeting (if present)
    const greetingEl = document.querySelector('#dash-user-name, .dash-greeting-name');
    if (greetingEl) greetingEl.textContent = user.firstName;

    // Logout button handler — override default href behaviour
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('stackly_current_user');
        window.location.href = 'login.html';
      });
    }
  }

  /* ── INIT ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initSignup();
    initLogin();
    initDashboardGuard();
  });

})();
