/**
 * CampThread – Profile display and Settings (editable)
 */
(function () {
  function renderProfile() {
    const container = document.getElementById('view-profile');
    if (!container) return;
    const user = CampThread.getUser();
    if (!user) return;
    const initials = window.CampThreadAuth.getInitials(user.displayName);
    container.innerHTML = `
      <div class="app-card p-6 md:p-8 fade-in-up delay-0">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div class="avatar-initials w-24 h-24 rounded-full flex-shrink-0 text-2xl bg-neutral-200 text-neutral-700">
            ${user.photoUrl ? `<img src="${user.photoUrl}" alt="" class="w-full h-full rounded-full object-cover" />` : initials}
          </div>
          <div class="flex-1 text-center sm:text-left">
            <h2 class="text-xl font-bold text-neutral-800">${(user.displayName || 'Unknown').replace(/</g, '&lt;')}</h2>
            <p class="text-neutral-600 mt-1">${(user.email || '').replace(/</g, '&lt;')}</p>
            ${user.verified ? '<p class="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-[#E8F5E3] text-[#2D7A3A]"><span class="verified-badge">✓</span> Verified student</p>' : ''}
            <a href="#settings" class="inline-block mt-4 px-4 py-2.5 rounded-xl font-medium text-white bg-[#2D7A3A] hover:opacity-90 transition-opacity duration-200">Edit profile</a>
          </div>
        </div>
      </div>
    `;
  }

  function renderSettings() {
    const container = document.getElementById('view-settings');
    if (!container) return;
    const user = CampThread.getUser();
    if (!user) return;
    var theme = (typeof UniThread !== 'undefined' && UniThread.getTheme) ? UniThread.getTheme() : 'light';
    container.innerHTML = `
      <div class="app-card p-6 md:p-8 fade-in-up delay-0 bg-white dark:bg-neutral-800">
        <h2 class="text-xl font-bold text-neutral-800 dark:text-white mb-6">Profile settings</h2>
        <form id="settings-form" class="space-y-4 max-w-md">
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Display name</label>
            <input type="text" name="displayName" value="${(user.displayName || '').replace(/"/g, '&quot;')}" class="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white focus:ring-2 focus:ring-[#2D7A3A]/30 focus:border-[#2D7A3A] transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>
            <input type="email" value="${(user.email || '').replace(/"/g, '&quot;')}" disabled class="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-700 text-neutral-500" />
            <p class="text-xs text-neutral-400 mt-1">School email cannot be changed.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Profile photo URL (optional)</label>
            <input type="url" name="photoUrl" value="${(user.photoUrl || '').replace(/"/g, '&quot;')}" placeholder="https://..." class="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white focus:ring-2 focus:ring-[#2D7A3A]/30 focus:border-[#2D7A3A] transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Theme</label>
            <select id="settings-theme" class="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white">
              <option value="light" ${theme === 'light' ? 'selected' : ''}>Light</option>
              <option value="dark" ${theme === 'dark' ? 'selected' : ''}>Dark</option>
            </select>
          </div>
          <div class="pt-4">
            <button type="submit" class="px-4 py-2.5 rounded-xl font-medium text-white bg-[#2D7A3A] hover:opacity-90 transition-opacity duration-200">Save changes</button>
            <a href="#profile" class="ml-3 px-4 py-2.5 rounded-xl font-medium text-neutral-600 dark:text-neutral-300 bg-[#F4F4F4] dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 inline-block transition-colors duration-200">Cancel</a>
          </div>
        </form>
        <hr class="my-8 border-neutral-200 dark:border-neutral-700" />
        <div>
          <button type="button" id="settings-logout" class="px-4 py-2 rounded-xl font-medium text-red-600 border border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">Sign out</button>
        </div>
      </div>
    `;
    var themeEl = container.querySelector('#settings-theme');
    if (themeEl && typeof UniThread !== 'undefined' && UniThread.setTheme) {
      themeEl.addEventListener('change', function () {
        var next = themeEl.value;
        UniThread.setTheme(next);
        document.documentElement.classList.toggle('dark', next === 'dark');
      });
    }
    container.querySelector('#settings-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const form = this;
      const displayName = form.querySelector('input[name="displayName"]').value.trim();
      const photoUrl = form.querySelector('input[name="photoUrl"]').value.trim() || null;
      const updated = { ...user, displayName, photoUrl: photoUrl || null };
      CampThread.setUser(updated);
      const users = JSON.parse(localStorage.getItem('campthread_users') || '[]');
      const i = users.findIndex((u) => u.id === user.id);
      if (i >= 0) {
        users[i] = { ...users[i], displayName, photoUrl: updated.photoUrl };
        localStorage.setItem('campthread_users', JSON.stringify(users));
      }
      window.CampThreadAuth.updateHeaderAvatar();
      window.location.hash = 'profile';
    });
    container.querySelector('#settings-logout').addEventListener('click', function () {
      CampThread.logout();
      window.dispatchEvent(new CustomEvent('campthread:auth-change'));
      window.location.hash = 'login';
    });
  }

  window.CampThreadProfile = { renderProfile, renderSettings };
})();
