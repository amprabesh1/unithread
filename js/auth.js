/**
 * UniThread – auth UI: sign-up, sign-in, .edu validation, verified badge
 * Hero-style landing with gradient background and top-right CTA.
 */
(function () {
  const ALLOWED_DOMAINS = ['.edu'];
  const MIN_PASSWORD_LENGTH = 6;

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

  function renderLogin(container) {
    container.innerHTML = `
      <div class="w-full h-full flex flex-col overflow-hidden">
        <!-- Top nav — full width -->
        <header class="w-full flex items-center justify-between px-6 md:px-10 py-4 shrink-0">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-sidebar-activeText flex items-center justify-center text-xs font-bold text-white">UT</span>
            <span class="text-base font-semibold text-white">UniThread</span>
          </div>
          <a href="#signup" class="inline-flex items-center px-4 py-2 rounded-full border border-white/30 text-sm font-medium text-white bg-white/5 hover:bg-white/15 transition-colors">
            Sign up
          </a>
        </header>

        <!-- Full-screen split — no card wrapper, fills 100% width and remaining height -->
        <div class="flex-1 grid grid-cols-1 md:grid-cols-[3fr_2fr] overflow-hidden">

          <!-- Left: blue gradient hero -->
          <div class="bg-gradient-to-br from-sky-400 to-indigo-600 text-white flex items-center justify-center p-8 md:p-14">
            <div class="space-y-6 max-w-[680px] w-full">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs">
                <span class="w-6 h-6 rounded-full bg-emerald-400/90 flex items-center justify-center text-xs font-semibold text-emerald-950">A</span>
                <span class="w-6 h-6 rounded-full bg-sky-400/90 flex items-center justify-center text-xs font-semibold text-sky-950 -ml-2">B</span>
                <span class="w-6 h-6 rounded-full bg-violet-400/90 flex items-center justify-center text-xs font-semibold text-violet-950 -ml-2">C</span>
                <span class="ml-1">Friends sharing rides, tasks, and campus news.</span>
              </div>
              <p class="text-xl md:text-2xl lg:text-3xl font-bold leading-[1.2] tracking-tight">
                Threads for rides, tasks, memes, and late‑night campus chatter—all in one campus feed.
              </p>
              <p class="text-sm md:text-base text-white/80 max-w-[520px]">
                UniThread keeps your campus rides, tasks, memes, and group chats in one clean feed.
                Sign in to jump back into the conversation.
              </p>
              <div class="flex flex-wrap gap-3 pt-1">
                <a href="#signup" class="inline-flex items-center px-5 py-2.5 rounded-full bg-white text-neutral-900 text-sm font-semibold hover:bg-white/90 transition-colors">
                  Create an account
                </a>
                <a href="#feed" class="inline-flex items-center px-5 py-2.5 rounded-full border border-white/30 text-white text-sm font-semibold bg-white/5 hover:bg-white/15 transition-colors">
                  Explore UniThread
                </a>
              </div>
            </div>
          </div>

          <!-- Right: dark login panel -->
          <div class="bg-neutral-950 text-white flex items-center justify-center p-8 md:p-12">
            <div class="w-full max-w-[400px] space-y-5">
              <div>
                <h2 class="text-2xl font-bold text-white">Welcome back</h2>
                <p class="text-sm text-neutral-400 mt-1">Sign in to your UniThread account</p>
              </div>
              <form id="login-form" class="space-y-4">
                <div>
                  <label for="login-email" class="block text-sm font-medium text-neutral-300 mb-1">Email</label>
                  <input type="email" id="login-email" required placeholder="you@school.edu"
                    class="w-full px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" />
                  <p id="login-email-error" class="mt-1 text-sm text-red-400 hidden"></p>
                </div>
                <div>
                  <label for="login-password" class="block text-sm font-medium text-neutral-300 mb-1">Password</label>
                  <input type="password" id="login-password" required placeholder="••••••"
                    class="w-full px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all" />
                </div>
                <button type="submit" class="w-full py-2.5 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors">
                  Sign in
                </button>
              </form>
              <p class="text-center text-xs text-neutral-500 pt-1">
                New here? Use the <span class="text-white font-medium">Sign up</span> button at the top-right.
              </p>
            </div>
          </div>

        </div>
      </div>
    `;
    const form = container.querySelector('#login-form');
    const emailEl = container.querySelector('#login-email');
    const emailError = container.querySelector('#login-email-error');
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
            <span class="w-8 h-8 rounded-full bg-sidebar-activeText flex items-center justify-center text-xs font-bold text-white">UT</span>
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
                <button type="submit" class="w-full py-2.5 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors">
                  Sign up
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    `;
    const form = container.querySelector('#signup-form');
    const emailEl = container.querySelector('#signup-email');
    const emailError = container.querySelector('#signup-email-error');
    form.addEventListener('submit', function (e) {
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
      const newUser = {
        id: String(Date.now()),
        email,
        password,
        displayName,
        photoUrl: null,
        verified: true
      };
      allUsers.push(newUser);
      localStorage.setItem('campthread_users', JSON.stringify(allUsers));
      CampThread.setUser(newUser);
      window.dispatchEvent(new CustomEvent('campthread:auth-change'));
      window.location.hash = 'feed';
    });
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
