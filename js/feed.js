/**
 * CampThread – Feed: empty state, filter pills with counts, rich cards, right panel
 */
(function () {
  function getStatusBadgeClass(post) {
    if (post.type === 'ride') {
      if (post.status === 'open') return 'badge-open';
      if (post.status === 'full') return 'badge-full';
      return 'badge-completed';
    }
    if (post.type === 'task') {
      if (post.status === 'open') return 'badge-open';
      if (post.status === 'assigned') return 'badge-assigned';
      return 'badge-done';
    }
    if (post.type === 'maintenance') {
      if (post.status === 'reported') return 'badge-reported';
      if (post.status === 'inProgress') return 'badge-inProgress';
      return 'badge-resolved';
    }
    if (post.type === 'post') return 'badge-completed';
    return '';
  }

  function getTypeBadgeClass(type) {
    if (type === 'ride') return 'badge-type-ride';
    if (type === 'task') return 'badge-type-task';
    if (type === 'post') return 'badge-type-post';
    return 'badge-type-maintenance';
  }

  function getTypeIcon(type) {
    if (type === 'ride') return '🚗';
    if (type === 'task') return '🤝';
    if (type === 'post') return '📢';
    return '🔧';
  }

  function getStatusLabel(post) {
    if (post.type === 'ride') return post.status === 'open' ? 'Open' : post.status === 'full' ? 'Full' : 'Completed';
    if (post.type === 'task') return post.status === 'open' ? 'Open' : post.status === 'assigned' ? 'Assigned' : 'Done';
    if (post.type === 'maintenance') return post.status === 'reported' ? 'Reported' : post.status === 'inProgress' ? 'In Progress' : 'Resolved';
    if (post.type === 'post') return 'Posted';
    return post.status || '';
  }

  function getAuthor(post) {
    const u = window.CampThreadViews.getUserById(post.authorId);
    return u || { displayName: 'Unknown', photoUrl: null, verified: false };
  }

  function formatTimeAgo(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return d.toLocaleDateString();
  }

  function cardTitle(post) {
    if (post.title) return post.title;
    if (post.type === 'ride') return post.destination || 'Ride share';
    if (post.type === 'task') return (post.description || 'Task').substring(0, 50) + (post.description && post.description.length > 50 ? '…' : '');
    if (post.type === 'post') return post.title || 'Post';
    return post.location || post.issueDescription?.substring(0, 40) || 'Maintenance';
  }

  function detailChips(post) {
    const chips = [];
    if (post.type === 'post' && post.content) {
      chips.push({ icon: '💬', text: (post.content || '').substring(0, 50) + (post.content && post.content.length > 50 ? '…' : '') });
      return chips.map((c) => '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 text-xs">' + c.icon + ' ' + (c.text || '').replace(/</g, '&lt;') + '</span>').join('');
    }
    if (post.type === 'ride') {
      if (post.destination) chips.push({ icon: '📍', text: post.destination });
      if (post.dateTime) {
        const d = new Date(post.dateTime);
        chips.push({ icon: '🕐', text: d.toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' }) });
      }
      if (post.seats != null) chips.push({ icon: '💺', text: post.seats + ' seats' });
      if (post.priceSplit != null) chips.push({ icon: '💵', text: '$' + post.priceSplit + '/person' });
    }
    if (post.type === 'task') {
      if (post.category) chips.push({ icon: '📁', text: post.category });
      if (post.estimatedEffort) chips.push({ icon: '⏱', text: post.estimatedEffort });
      if (post.compensation) chips.push({ icon: '💵', text: post.compensation });
    }
    if (post.type === 'maintenance') {
      if (post.location) chips.push({ icon: '📍', text: post.location });
      if (post.urgency) chips.push({ icon: '⚠', text: post.urgency });
    }
    return chips.map((c) => '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 text-xs">' + c.icon + ' ' + (c.text || '').replace(/</g, '&lt;') + '</span>').join('');
  }

  function primaryAction(post, currentUserId) {
    const isAuthor = post.authorId === currentUserId;
    if (post.type === 'post') return '';
    const requests = CampThread.getRequests();
    const alreadyRequested = requests.some((r) => r.postId === post.id && r.fromUserId === currentUserId);
    if (post.type === 'ride') {
      if (isAuthor) return '';
      if (post.status !== 'open') return '';
      if (alreadyRequested) return '<span class="text-sm text-neutral-500">Requested</span>';
      return '<button type="button" class="post-action-request-join btn-action btn-action-ride text-neutral-700 dark:text-neutral-200 dark:border-neutral-600" data-post-id="' + post.id + '">Request to Join</button>';
    }
    if (post.type === 'task') {
      if (isAuthor) return '';
      if (post.status !== 'open') return '';
      if (alreadyRequested) return '<span class="text-sm text-neutral-500">Offer sent</span>';
      return '<button type="button" class="post-action-offer-help btn-action btn-action-task text-neutral-700 dark:text-neutral-200 dark:border-neutral-600" data-post-id="' + post.id + '">Offer Help</button>';
    }
    if (post.type === 'maintenance') {
      const count = CampThread.getUpvoteCount(post.id) || 0;
      const upvoted = CampThread.hasUserUpvoted(post.id);
      return '<button type="button" class="post-action-upvote btn-action btn-action-upvote ' + (upvoted ? '!bg-type-rideBg !border-type-rideText !text-type-rideText' : '') + '" data-post-id="' + post.id + '">▲ <span class="post-upvote-count">' + count + '</span> Upvote</button>';
    }
    return '';
  }

  function avatarColor(type) {
    if (type === 'ride') return 'bg-type-rideBg text-type-rideText';
    if (type === 'task') return 'bg-type-taskBg text-type-taskText';
    if (type === 'post') return 'bg-type-postBg text-type-postText';
    return 'bg-type-maintenanceBg text-type-maintenanceText';
  }

  function renderCard(post, currentUserId, index) {
    const author = getAuthor(post);
    const initials = (author.displayName || '?').trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
    const verifiedBadge = author.verified ? '<span class="verified-badge ml-0.5" title="Verified student">✓</span>' : '';
    const delay = Math.min(index, 7);
    return `
      <article class="post-card app-card p-4 md:p-5 fade-in-up delay-${delay} bg-white dark:bg-neutral-800 border border-transparent dark:border-neutral-700 type-${post.type}" data-post-id="${post.id}" style="animation-fill-mode: both;">
        <div class="flex gap-3">
          <div class="avatar-initials w-10 h-10 rounded-full flex-shrink-0 text-sm ${avatarColor(post.type)}">${author.photoUrl ? '<img src="' + author.photoUrl + '" alt="" class="w-full h-full rounded-full object-cover" />' : initials}</div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="font-semibold text-neutral-800 dark:text-neutral-100 text-[15px]">${(author.displayName || 'Unknown').replace(/</g, '&lt;')}</span>
                ${verifiedBadge}
                <span class="text-neutral-400 text-sm flex-shrink-0">${formatTimeAgo(post.createdAt)}</span>
              </div>
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getTypeBadgeClass(post.type)}">${getTypeIcon(post.type)} ${post.type.charAt(0).toUpperCase() + post.type.slice(1)}</span>
            </div>
            <h3 class="font-bold text-neutral-800 dark:text-neutral-50 text-base mt-2 leading-snug">${(cardTitle(post)).replace(/</g, '&lt;')}</h3>
            <div class="flex flex-wrap gap-1.5 mt-2">${detailChips(post)}</div>
            <div class="mt-4 flex items-center justify-between flex-wrap gap-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(post)}">${getStatusLabel(post)}</span>
              <div class="post-upvote-area">${primaryAction(post, currentUserId)}</div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function emptyStateSVG() {
    return `
      <svg class="w-full max-w-[280px] mx-auto text-neutral-300" viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 95 L260 95" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <rect x="50" y="70" width="36" height="24" rx="4" fill="#E3F0FF" stroke="#2A85FF" stroke-width="1.5"/>
        <circle cx="68" cy="82" r="4" fill="#2A85FF"/>
        <rect x="120" y="65" width="32" height="32" rx="4" fill="#FFF3E8" stroke="#FF8C00" stroke-width="1.5"/>
        <path d="M128 78 L136 86 L144 76" stroke="#FF8C00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <rect x="190" y="68" width="36" height="28" rx="4" fill="#FFE8E4" stroke="#FF6A55" stroke-width="1.5"/>
        <path d="M202 82 L208 88 L218 78" stroke="#FF6A55" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <circle cx="140" cy="45" r="18" fill="#E8F5E3" stroke="#2D7A3A" stroke-width="2"/>
        <path d="M132 45 L138 51 L152 38" stroke="#2D7A3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
    `;
  }

  function renderRightPanel() {
    const panel = document.getElementById('right-panel');
    if (!panel) return;
    const posts = CampThread.getPosts();
    const user = CampThread.getUser();
    const myPosts = user ? posts.filter((p) => p.authorId === user.id).length : 0;
    const myRequests = user ? CampThread.getRequests().filter((r) => r.fromUserId === user.id && r.status === 'pending').length : 0;
    const maintenance = posts.filter((p) => p.type === 'maintenance');
    const trending = maintenance
      .map((p) => ({ post: p, count: CampThread.getUpvoteCount(p.id) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    panel.innerHTML = `
      <div class="space-y-4">
        <div class="app-card p-4 bg-white dark:bg-neutral-800 border border-transparent dark:border-neutral-700">
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2 h-2 rounded-full bg-green-500"></span>
            <h3 class="font-semibold text-neutral-800 dark:text-white text-sm">Campus Pulse</h3>
          </div>
          <p class="text-neutral-600 dark:text-neutral-400 text-sm">${posts.length} active post${posts.length !== 1 ? 's' : ''} today</p>
        </div>
        <div class="app-card p-4 bg-white dark:bg-neutral-800 border border-transparent dark:border-neutral-700">
          <h3 class="font-semibold text-neutral-800 dark:text-white text-sm mb-2">Trending</h3>
          <ul class="space-y-2">
            ${trending.length ? trending.map((t) => '<li class="text-sm text-neutral-600 dark:text-neutral-400 truncate">' + (t.post.location || t.post.issueDescription || 'Issue').substring(0, 30) + '… <span class="text-neutral-400">▲ ' + t.count + '</span></li>').join('') : '<li class="text-sm text-neutral-500 dark:text-neutral-400">No maintenance posts yet</li>'}
          </ul>
        </div>
        ${user ? `
        <div class="app-card p-4 bg-white dark:bg-neutral-800 border border-transparent dark:border-neutral-700">
          <h3 class="font-semibold text-neutral-800 dark:text-white text-sm mb-1">Your Activity</h3>
          <p class="text-neutral-600 dark:text-neutral-400 text-sm">${myPosts} post${myPosts !== 1 ? 's' : ''} · ${myRequests} pending request${myRequests !== 1 ? 's' : ''}</p>
        </div>
        ` : ''}
      </div>
    `;
  }

  function matchesSearch(post, q) {
    if (!q || !q.trim()) return true;
    const lower = q.trim().toLowerCase();
    const str = [
      post.title,
      post.content,
      post.destination,
      post.description,
      post.location,
      post.issueDescription,
      post.category
    ].filter(Boolean).join(' ').toLowerCase();
    return str.includes(lower);
  }

  function render() {
    const container = document.getElementById('view-feed');
    if (!container) return;
    const filter = (container.getAttribute('data-feed-filter') || 'all').toLowerCase();
    const searchQuery = (document.getElementById('top-search') && document.getElementById('top-search').value) || '';
    let posts = CampThread.getPosts()
      .filter((p) => filter === 'all' || p.type === filter)
      .filter((p) => matchesSearch(p, searchQuery))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const currentUserId = CampThread.getUser()?.id;
    const countAll = CampThread.getPosts().length;
    const countRides = CampThread.getPosts().filter((p) => p.type === 'ride').length;
    const countTasks = CampThread.getPosts().filter((p) => p.type === 'task').length;
    const countMaint = CampThread.getPosts().filter((p) => p.type === 'maintenance').length;
    const countPosts = CampThread.getPosts().filter((p) => p.type === 'post').length;

    container.setAttribute('data-feed-filter', filter);
    container.innerHTML = `
      <div class="mb-4 fade-in-up delay-0">
        <h2 class="text-xl font-bold text-neutral-800 dark:text-white mb-3">Feed</h2>
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button type="button" class="feed-tab filter-pill px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'post' ? 'active' : ''}" data-filter="post">Posts (${countPosts})</button>
          <button type="button" class="feed-tab filter-pill px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'ride' ? 'active' : ''}" data-filter="ride">Rides (${countRides})</button>
          <button type="button" class="feed-tab filter-pill px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'task' ? 'active' : ''}" data-filter="task">Tasks (${countTasks})</button>
          <button type="button" class="feed-tab filter-pill px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'maintenance' ? 'active' : ''}" data-filter="maintenance">Maintenance (${countMaint})</button>
          <button type="button" class="feed-tab filter-pill px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'all' ? 'active' : ''}" data-filter="all">All (${countAll})</button>
        </div>
      </div>
      <div class="space-y-4" id="feed-cards">
        ${posts.length ? posts.map((p, i) => renderCard(p, currentUserId, i)).join('') : `
        <div class="empty-state fade-in-up flex flex-col items-center justify-center py-12 px-4 text-center">
          ${emptyStateSVG()}
          <h3 class="text-xl font-bold text-neutral-800 dark:text-white mt-6">Your campus feed is quiet... for now</h3>
          <p class="text-neutral-500 mt-2 max-w-sm">Be the first to share a ride, ask for help, or report an issue.</p>
          <a href="#create" class="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-sidebar-activeText hover:opacity-90 transition-opacity duration-200">Create Your First Post</a>
        </div>
        `}
      </div>
    `;

    container.querySelectorAll('.feed-tab').forEach((btn) => {
      btn.addEventListener('click', function () {
        const f = this.getAttribute('data-filter');
        container.setAttribute('data-feed-filter', f);
        render();
      });
    });
    container.querySelectorAll('.post-action-request-join').forEach((btn) => {
      btn.addEventListener('click', function () {
        const postId = this.getAttribute('data-post-id');
        CampThread.addRequest({ postId, fromUserId: currentUserId, type: 'ride' });
        this.textContent = 'Requested';
        this.disabled = true;
        this.classList.add('opacity-75');
      });
    });
    container.querySelectorAll('.post-action-offer-help').forEach((btn) => {
      btn.addEventListener('click', function () {
        const postId = this.getAttribute('data-post-id');
        CampThread.addRequest({ postId, fromUserId: currentUserId, type: 'task' });
        this.textContent = 'Offer sent';
        this.disabled = true;
        this.classList.add('opacity-75');
      });
    });
    container.querySelectorAll('.post-action-upvote').forEach((btn) => {
      btn.addEventListener('click', function () {
        const postId = this.getAttribute('data-post-id');
        CampThread.toggleUpvote(postId);
        const countEl = this.querySelector('.post-upvote-count');
        if (countEl) countEl.textContent = CampThread.getUpvoteCount(postId);
        this.classList.toggle('!bg-type-rideBg', CampThread.hasUserUpvoted(postId));
        this.classList.toggle('!border-type-rideText', CampThread.hasUserUpvoted(postId));
        this.classList.toggle('!text-type-rideText', CampThread.hasUserUpvoted(postId));
      });
    });

    const searchEl = document.getElementById('top-search');
    if (searchEl && !searchEl.dataset.feedBound) {
      searchEl.dataset.feedBound = '1';
      searchEl.addEventListener('input', function () {
        if (window.location.hash.replace('#', '') === 'feed') render();
      });
    }

    renderRightPanel();
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }

  window.CampThreadFeed = { render };
})();
