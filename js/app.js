/**
 * UniThread – routing, theme, logo → homepage, Lucide icons
 */
(function () {
  const appShell = document.getElementById('app-shell');
  const authContainer = document.getElementById('auth-container');

  function applyTheme(isDark) {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function initTheme() {
    const saved = UniThread.getTheme();
    applyTheme(saved === 'dark');
  }

  function showAuth() {
    appShell.classList.add('hidden');
    authContainer.classList.remove('hidden');
    authContainer.querySelector('#view-login').classList.remove('active');
    authContainer.querySelector('#view-signup').classList.remove('active');
    const hash = (window.location.hash || '#login').replace('#', '');
    if (hash === 'signup') {
      authContainer.querySelector('#view-signup').classList.add('active');
      window.CampThreadAuth.renderSignup(document.getElementById('view-signup'));
    } else {
      authContainer.querySelector('#view-login').classList.add('active');
      window.CampThreadAuth.renderLogin(document.getElementById('view-login'));
    }
  }

  function updateSidebarUser() {
    const user = UniThread.getUser();
    const nameEl = document.getElementById('sidebar-name');
    const avatarEl = document.getElementById('sidebar-avatar');
    if (nameEl) nameEl.textContent = user ? (user.displayName || 'User') : '—';
    if (avatarEl) {
      if (user && user.photoUrl) {
        avatarEl.innerHTML = '<img src="' + user.photoUrl + '" alt="" class="w-full h-full rounded-full object-cover" />';
        avatarEl.className = 'w-8 h-8 rounded-full overflow-hidden flex-shrink-0';
      } else {
        var initials = user ? (user.displayName || '?').trim().split(/\s+/).map(function (p) { return p[0]; }).slice(0, 2).join('').toUpperCase() || '?' : '—';
        avatarEl.textContent = initials;
        avatarEl.className = 'w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0';
      }
    }
    const signOut = document.getElementById('sidebar-signout');
    if (signOut) {
      signOut.href = '#';
      signOut.onclick = function (e) {
        e.preventDefault();
        UniThread.logout();
        window.dispatchEvent(new CustomEvent('campthread:auth-change'));
        window.location.hash = 'login';
      };
    }
  }

  function showApp(page) {
    authContainer.classList.add('hidden');
    appShell.classList.remove('hidden');
    CampThreadAuth.updateHeaderAvatar();
    updateSidebarUser();
    document.querySelectorAll('[data-view].view-content').forEach(function (el) { el.classList.remove('active'); });
    const viewEl = document.getElementById('view-' + page);
    if (viewEl) viewEl.classList.add('active');
    document.querySelectorAll('.nav-link, .bottom-nav a').forEach(function (a) {
      a.classList.remove('nav-active');
      var linkPage = a.getAttribute('data-page') || (a.getAttribute('href') || '').replace('#', '');
      if (linkPage === page) a.classList.add('nav-active');
    });
    if (window.CampThreadViews && window.CampThreadViews.render) window.CampThreadViews.render(page);
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  function route() {
    var user = UniThread.getUser();
    var hash = (window.location.hash || '#feed').replace('#', '');
    if (!user) {
      showAuth();
      return;
    }
    var validPages = ['feed', 'create', 'messages', 'groups', 'activity', 'profile', 'settings'];
    var pageFromHash = hash.split('/')[0];
    var page = validPages.indexOf(pageFromHash) >= 0 ? pageFromHash : 'feed';
    if (validPages.indexOf(pageFromHash) < 0) window.location.hash = 'feed';
    showApp(page);
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('campthread:auth-change', route);
  window.addEventListener('load', function () {
    initTheme();
    route();
    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var next = UniThread.getTheme() === 'dark' ? 'light' : 'dark';
        UniThread.setTheme(next);
        applyTheme(next === 'dark');
      });
    }
    function logoClick(e) {
      if (window.location.hash === '#feed' || window.location.hash === '') {
        e.preventDefault();
        if (window.CampThreadFeed && window.CampThreadFeed.render) window.CampThreadFeed.render();
      }
    }
    var logoMobile = document.getElementById('logo-home-link');
    var logoMobileMobile = document.getElementById('logo-home-link-mobile');
    if (logoMobile) logoMobile.addEventListener('click', logoClick);
    if (logoMobileMobile) logoMobileMobile.addEventListener('click', logoClick);
  });
})();
