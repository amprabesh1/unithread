/**
 * UniThread – auth UI: sign-up, sign-in, .edu validation, verified badge
 * Hero-style landing with gradient background and top-right CTA.
 */
(function () {
  const ALLOWED_DOMAINS = ['.edu'];
  const MIN_PASSWORD_LENGTH = 6;
  const SIGNUP_PENDING_KEY = 'campthread_pending_signup';
  const RESET_CODES_KEY = 'campthread_reset_codes';
  const EMAILJS_CFG_KEY = 'unithread_emailjs_cfg';

  function isSchoolEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const lower = email.trim().toLowerCase();
    return ALLOWED_DOMAINS.some((d) => lower.endsWith(d));
  }

  function getInitials(displayName) {
    if (!displayName || !displayName.trim()) return '?';
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (parts[0][0] || '?').toUpperCase();
  }

  function generateCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  async function sendCodeByEmail(email, code, purpose) {
    const cfg = window.UNITHREAD_EMAILJS || loadJson(EMAILJS_CFG_KEY, null);
    if (!cfg || !cfg.serviceId || !cfg.templateId || !cfg.publicKey) return false;
    try {
      const body = {
        service_id: cfg.serviceId,
        template_id: cfg.templateId,
        user_id: cfg.publicKey,
        template_params: {
          to_email: email,
          code,
          purpose: purpose || 'verification',
          app_name: 'UniThread'
        }
      };
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return !!res.ok;
    } catch (_) {
      return false;
    }
  }

  function renderLogin(container) {
    container.innerHTML = `
      <div class="w-full min-h-full flex flex-col bg-[#050816]">
        <header class="w-full flex items-center justify-between px-6 md:px-8 py-4 shrink-0 border-b border-white/5">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-full bg-white/90 overflow-hidden flex items-center justify-center">
              <img src="assets/unithread-logo.png" alt="UniThread logo" class="w-full h-full object-cover" />
            </span>
            <span class="text-base font-semibold text-white">UniThread</span>
          </div>
          <div class="flex items-center gap-2">
            <a href="#signup" class="inline-flex items-center px-4 py-2 rounded-full border border-white/20 text-sm font-medium text-white bg-white/5 hover:bg-white/15 transition-colors">Sign up</a>
          </div>
        </header>

        <div class="flex-1 p-3 md:p-4">
          <div class="min-h-[calc(100vh-104px)] grid grid-cols-1 md:grid-cols-[3fr_2fr] rounded-[22px] overflow-hidden bg-[#0a0f24]">
            <div class="relative min-h-[300px] md:min-h-0 bg-[#0e1538]">
              <img src="assets/login-hero-main.png" alt="Campus collage" class="absolute inset-0 z-10 w-full h-full object-cover object-center" />
              <div class="absolute inset-0 z-20 bg-gradient-to-t from-[#2447ff]/28 via-[#2447ff]/10 to-black/5"></div>
              <div class="absolute left-6 right-6 md:left-8 md:right-8 bottom-6 md:bottom-8 z-30 rounded-2xl bg-black/22 backdrop-blur-[2px] px-5 py-4 md:px-6 md:py-5">
                <h1 class="text-white text-3xl md:text-6xl font-extrabold leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">Connect on Campus.</h1>
                <p class="mt-2 text-white/90 text-lg md:text-3xl font-medium drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">Your central hub for campus rides, tasks, and chats.</p>
                <div class="mt-4 flex flex-wrap gap-3">
                  <a id="hero-create-account" href="#signup" class="inline-flex items-center px-5 py-2.5 rounded-full bg-white text-neutral-900 text-sm font-semibold hover:bg-white/90 transition-colors">Create an account</a>
                  <a id="hero-explore" href="#login" class="inline-flex items-center px-5 py-2.5 rounded-full bg-blue-500/80 text-white text-sm font-semibold hover:bg-blue-500 transition-colors">Explore UniThread</a>
                </div>
              </div>
            </div>

            <div class="bg-black/85 text-white flex items-center justify-center p-7 md:p-10 overflow-y-auto">
              <div class="w-full max-w-[390px] space-y-5 my-4">
                <div>
                  <h2 class="text-4xl font-bold text-white">Welcome back</h2>
                  <p class="text-lg text-neutral-400 mt-2">Sign in to your UniThread account</p>
                </div>
                <form id="login-form" class="space-y-4">
                  <div>
                    <label for="login-email" class="block text-sm font-medium text-neutral-300 mb-1">Email</label>
                    <input type="email" id="login-email" required placeholder="you@school.edu"
                      class="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" />
                    <p id="login-email-error" class="mt-1 text-sm text-red-400 hidden"></p>
                  </div>
                  <div>
                    <label for="login-password" class="block text-sm font-medium text-neutral-300 mb-1">Password</label>
                    <input type="password" id="login-password" required placeholder="••••••"
                      class="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" />
                  </div>
                  <button type="button" id="forgot-password-toggle" class="text-sm text-blue-300 hover:text-blue-200 transition-colors">Forgot password?</button>
                  <button type="submit" class="w-full py-3 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors">
                    Sign in
                  </button>
                </form>
                <div id="forgot-password-box" class="hidden rounded-2xl border border-white/15 bg-white/[0.08] p-4 space-y-3 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                  <p class="text-xs text-neutral-300">Reset your password with a verification code sent to your email.</p>
                  <input type="email" id="forgot-email" placeholder="you@school.edu" class="w-full px-3 py-2.5 rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500" />
                  <button type="button" id="send-reset-code" class="w-full py-2.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-sm font-medium">Send verification code</button>
                  <input type="text" id="reset-code" placeholder="Enter 6-digit code" class="w-full px-3 py-2.5 rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500" />
                  <input type="password" id="reset-new-password" placeholder="New password" class="w-full px-3 py-2.5 rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500" />
                  <button type="button" id="confirm-reset-password" class="w-full py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-sm font-semibold">Reset password</button>
                  <p id="forgot-password-msg" class="text-xs text-neutral-200 hidden"></p>
                </div>
                <p class="text-center text-xs text-neutral-500 pt-1">New here? Use the <span class="text-white font-medium">Sign up</span> button at the top-right.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    const form = container.querySelector('#login-form');
    const emailEl = container.querySelector('#login-email');
    const emailError = container.querySelector('#login-email-error');
    const forgotToggle = container.querySelector('#forgot-password-toggle');
    const forgotBox = container.querySelector('#forgot-password-box');
    const forgotMsg = container.querySelector('#forgot-password-msg');
    const sendResetBtn = container.querySelector('#send-reset-code');
    const confirmResetBtn = container.querySelector('#confirm-reset-password');
    const heroExplore = container.querySelector('#hero-explore');
    if (heroExplore) {
      heroExplore.addEventListener('click', function (e) {
        e.preventDefault();
        const target = container.querySelector('#login-email');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.focus();
          target.classList.add('ring-2', 'ring-blue-400');
          setTimeout(function () {
            target.classList.remove('ring-2', 'ring-blue-400');
          }, 900);
        }
      });
    }
    if (forgotToggle && forgotBox) {
      forgotToggle.addEventListener('click', function () {
        const willOpen = forgotBox.classList.contains('hidden');
        forgotBox.classList.toggle('hidden');
        if (willOpen) {
          setTimeout(function () {
            forgotBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 80);
        }
      });
    }
    if (sendResetBtn) {
      sendResetBtn.addEventListener('click', async function () {
        const email = (container.querySelector('#forgot-email')?.value || '').trim().toLowerCase();
        if (!email) return;
        const users = loadJson('campthread_users', []);
        const exists = users.some((u) => (u.email || '').toLowerCase() === email);
        if (!exists) {
          if (forgotMsg) {
            forgotMsg.textContent = 'No account found with this email.';
            forgotMsg.classList.remove('hidden');
          }
          return;
        }
        const code = generateCode();
        const codes = loadJson(RESET_CODES_KEY, {});
        codes[email] = { code, expiresAt: Date.now() + 10 * 60 * 1000 };
        localStorage.setItem(RESET_CODES_KEY, JSON.stringify(codes));
        const sent = await sendCodeByEmail(email, code, 'password_reset');
        if (!sent) window.alert('Email provider not configured yet. Your reset code: ' + code);
        if (forgotMsg) {
          forgotMsg.textContent = sent ? 'Code sent to your email. Enter it below.' : 'Code generated (shown in alert). Configure EmailJS to send real emails.';
          forgotMsg.classList.remove('hidden');
        }
      });
    }
    if (confirmResetBtn) {
      confirmResetBtn.addEventListener('click', function () {
        const email = (container.querySelector('#forgot-email')?.value || '').trim().toLowerCase();
        const code = (container.querySelector('#reset-code')?.value || '').trim();
        const nextPassword = (container.querySelector('#reset-new-password')?.value || '');
        const codes = loadJson(RESET_CODES_KEY, {});
        const entry = codes[email];
        if (!entry || entry.code !== code || Date.now() > entry.expiresAt) {
          if (forgotMsg) {
            forgotMsg.textContent = 'Invalid or expired code.';
            forgotMsg.classList.remove('hidden');
          }
          return;
        }
        if (nextPassword.length < MIN_PASSWORD_LENGTH) {
          if (forgotMsg) {
            forgotMsg.textContent = 'Password must be at least 6 characters.';
            forgotMsg.classList.remove('hidden');
          }
          return;
        }
        const allUsers = loadJson('campthread_users', []);
        const i = allUsers.findIndex((u) => (u.email || '').toLowerCase() === email);
        if (i < 0) return;
        allUsers[i].password = nextPassword;
        localStorage.setItem('campthread_users', JSON.stringify(allUsers));
        delete codes[email];
        localStorage.setItem(RESET_CODES_KEY, JSON.stringify(codes));
        if (forgotMsg) {
          forgotMsg.textContent = 'Password updated. You can sign in now.';
          forgotMsg.classList.remove('hidden');
        }
      });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      emailError.classList.add('hidden');
      const email = emailEl.value.trim();
      const password = container.querySelector('#login-password').value;
      const users = [CampThread.getUser()];
      const stored = localStorage.getItem('campthread_users');
      const allUsers = stored ? JSON.parse(stored) : [];
      const u = allUsers.find((x) => x.email.toLowerCase() === email.toLowerCase());
      if (!u) {
        emailError.textContent = 'No account found with this email.';
        emailError.classList.remove('hidden');
        return;
      }
      if (u.password !== password) {
        emailError.textContent = 'Incorrect password.';
        emailError.classList.remove('hidden');
        return;
      }
      CampThread.setUser(u);
      window.dispatchEvent(new CustomEvent('campthread:auth-change'));
      window.location.hash = 'feed';
    });
  }

  function renderSignup(container) {
    container.innerHTML = `
      <div class="w-full h-full flex flex-col items-center justify-center px-4 sm:px-6">
        <header class="w-full max-w-lg flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-white/90 overflow-hidden flex items-center justify-center">
              <img src="assets/unithread-logo.png" alt="UniThread logo" class="w-full h-full object-cover" />
            </span>
            <span class="text-base font-semibold text-white">UniThread</span>
          </div>
          <a href="#login" class="inline-flex items-center px-4 py-2 rounded-full border border-white/30 text-sm font-medium text-white bg-white/5 hover:bg-white/15 transition-colors">
            Sign in
          </a>
        </header>

        <main class="w-full max-w-lg flex flex-col items-center justify-center gap-4">
          <h1 class="text-center text-xl font-semibold text-white">
            Create your UniThread account
          </h1>
          <div class="w-full">
            <div class="bg-white dark:bg-neutral-900/95 rounded-2xl shadow-card p-7 sm:p-8 border border-white/10">
              <form id="signup-form" class="space-y-4">
                <div>
                  <label for="signup-displayName" class="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Display name</label>
                  <input type="text" id="signup-displayName" required placeholder="Alex Smith"
                    class="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder-neutral-400" />
                </div>
                <div>
                  <label for="signup-email" class="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">School email</label>
                  <input type="email" id="signup-email" required placeholder="you@school.edu"
                    class="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder-neutral-400" />
                  <p id="signup-email-error" class="mt-1 text-sm text-red-500 hidden"></p>
                  <p class="mt-1 text-xs text-neutral-300">Only .edu (and similar) school domains are allowed.</p>
                </div>
                <div>
                  <label for="signup-password" class="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Password</label>
                  <input type="password" id="signup-password" required placeholder="At least 6 characters"
                    minlength="${MIN_PASSWORD_LENGTH}" class="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder-neutral-400" />
                </div>
                <button type="submit" id="signup-send-code" class="w-full py-2.5 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors">
                  Send verification code
                </button>
                <div id="signup-verify-box" class="hidden space-y-3">
                  <input type="text" id="signup-verify-code" placeholder="Enter 6-digit verification code"
                    class="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 placeholder-neutral-400" />
                  <button type="button" id="signup-verify-btn" class="w-full py-2.5 rounded-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                    Verify and create account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    `;
    const form = container.querySelector('#signup-form');
    const emailEl = container.querySelector('#signup-email');
    const emailError = container.querySelector('#signup-email-error');
    const verifyBox = container.querySelector('#signup-verify-box');
    const verifyBtn = container.querySelector('#signup-verify-btn');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      emailError.classList.add('hidden');
      const displayName = container.querySelector('#signup-displayName').value.trim();
      const email = emailEl.value.trim();
      const password = container.querySelector('#signup-password').value;
      if (!isSchoolEmail(email)) {
        emailError.textContent = 'Please use a school email address (e.g. ending in .edu).';
        emailError.classList.remove('hidden');
        return;
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        emailError.textContent = 'Password must be at least 6 characters.';
        emailError.classList.remove('hidden');
        return;
      }
      const stored = localStorage.getItem('campthread_users') || '[]';
      const allUsers = JSON.parse(stored);
      if (allUsers.some((x) => x.email.toLowerCase() === email.toLowerCase())) {
        emailError.textContent = 'An account with this email already exists.';
        emailError.classList.remove('hidden');
        return;
      }
      const code = generateCode();
      localStorage.setItem(SIGNUP_PENDING_KEY, JSON.stringify({
        displayName,
        email,
        password,
        code,
        expiresAt: Date.now() + 10 * 60 * 1000
      }));
      if (verifyBox) verifyBox.classList.remove('hidden');
      const sent = await sendCodeByEmail(email, code, 'signup_verification');
      if (!sent) window.alert('Email provider not configured yet. Your verification code: ' + code);
      emailError.textContent = sent
        ? 'Verification code sent to your email. Enter it below to finish sign up.'
        : 'Code generated (shown in alert). Configure EmailJS to send real emails.';
      emailError.classList.remove('hidden');
    });
    if (verifyBtn) {
      verifyBtn.addEventListener('click', function () {
        const pending = loadJson(SIGNUP_PENDING_KEY, null);
        const codeInput = (container.querySelector('#signup-verify-code')?.value || '').trim();
        if (!pending || !pending.code || Date.now() > pending.expiresAt || codeInput !== pending.code) {
          emailError.textContent = 'Invalid or expired verification code.';
          emailError.classList.remove('hidden');
          return;
        }
        const stored = localStorage.getItem('campthread_users') || '[]';
        const allUsers = JSON.parse(stored);
        if (allUsers.some((x) => x.email.toLowerCase() === pending.email.toLowerCase())) {
          emailError.textContent = 'An account with this email already exists.';
          emailError.classList.remove('hidden');
          return;
        }
        const newUser = {
          id: String(Date.now()),
          email: pending.email,
          password: pending.password,
          displayName: pending.displayName,
          photoUrl: null,
          verified: true
        };
        allUsers.push(newUser);
        localStorage.setItem('campthread_users', JSON.stringify(allUsers));
        localStorage.removeItem(SIGNUP_PENDING_KEY);
        CampThread.setUser(newUser);
        window.dispatchEvent(new CustomEvent('campthread:auth-change'));
        window.location.hash = 'feed';
      });
    }
  }

  function updateHeaderAvatar() {
    const u = CampThread.getUser();
    const el = document.getElementById('header-avatar');
    if (!el || !u) return;
    if (u.photoUrl) {
      el.innerHTML = `<img src="${u.photoUrl}" alt="" class="w-full h-full rounded-full object-cover" />`;
    } else {
      el.textContent = getInitials(u.displayName);
      el.className = 'w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center text-sm font-semibold text-neutral-700';
    }
  }

  window.CampThreadAuth = {
    renderLogin,
    renderSignup,
    updateHeaderAvatar,
    isSchoolEmail,
    getInitials
  };
})();
