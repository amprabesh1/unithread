/**
 * CampThread – view renderers (feed, create, activity, profile, settings)
 */
(function () {
  function getUserById(id) {
    try {
      const s = localStorage.getItem('campthread_users');
      const users = s ? JSON.parse(s) : [];
      return users.find((u) => u.id === id) || null;
    } catch (_) {
      return null;
    }
  }

  function render(page) {
    switch (page) {
      case 'feed':
        if (window.CampThreadFeed) window.CampThreadFeed.render();
        break;
      case 'create':
        if (window.CampThreadCreatePost) window.CampThreadCreatePost.render();
        break;
      case 'messages':
        if (window.UniThreadMessages) window.UniThreadMessages.render();
        break;
      case 'groups':
        if (window.UniThreadGroups) window.UniThreadGroups.render();
        break;
      case 'activity':
        if (window.CampThreadActivity) window.CampThreadActivity.render();
        break;
      case 'profile':
        if (window.CampThreadProfile) window.CampThreadProfile.renderProfile();
        break;
      case 'settings':
        if (window.CampThreadProfile) window.CampThreadProfile.renderSettings();
        break;
      default:
        break;
    }
  }

  window.CampThreadViews = { render, getUserById };
})();
