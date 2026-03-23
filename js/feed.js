/**
 * CampThread – Feed: empty state, filter pills with counts, rich cards, right panel
 */
(function () {
  let postStats = { up: {}, down: {}, mine: {}, comments: {} };
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

  function formatPostedDateTime(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
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
    if (post.type === 'post') return '';
    const requests = CampThread.getRequests();
    const alreadyRequested = requests.some((r) => r.postId === post.id && r.fromUserId === currentUserId);
    if (post.type === 'ride') {
      if (post.status !== 'open') return '';
      if (alreadyRequested) return '<span class="text-sm text-neutral-500">Ride offer sent</span>';
      return '<button type="button" class="post-action-request-join btn-action btn-action-ride text-neutral-700 dark:text-neutral-200 dark:border-neutral-600" data-post-id="' + post.id + '">Offer Ride</button>';
    }
    if (post.type === 'task') {
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

  function studentSubtitle(author) {
    if (!author.email) return 'Campus Student';
    const domain = author.email.split('@')[1] || '';
    const school = domain.replace(/\.(edu|ac\.uk|ac\.in|edu\..*)$/i, '').replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return (school || 'Campus') + ' · Student';
  }

  function authorRow(author, initials, verifiedBadge, type, timeAgo, postedAt, showSubtitle) {
    const avatarHtml = author.photoUrl
      ? '<img src="' + author.photoUrl + '" alt="" class="w-full h-full rounded-full object-cover" />'
      : initials;
    const subtitle = showSubtitle ? '<div class="text-neutral-400 dark:text-neutral-500 text-[13px]">' + studentSubtitle(author) + '</div>' : '';
    return `
      <div class="flex items-center gap-3">
        <div class="avatar-initials w-12 h-12 rounded-full flex-shrink-0 text-base font-bold ${avatarColor(type)}" style="width:48px;height:48px;">${avatarHtml}</div>
        <div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-semibold text-neutral-900 dark:text-neutral-100 text-[16px]">${(author.displayName || 'Unknown').replace(/</g, '&lt;')}</span>
            ${verifiedBadge}
          </div>
          ${subtitle}
          <div class="text-neutral-400 text-[12px]">Posted ${timeAgo}${postedAt ? ' · ' + postedAt : ''}</div>
        </div>
      </div>`;
  }

  function scrollHint() {
    return `<div class="mt-auto pt-4 flex flex-col items-center gap-1 opacity-40">
      <div class="w-8 h-1 rounded-full bg-neutral-400 dark:bg-neutral-500"></div>
      <p class="text-[10px] text-neutral-400 dark:text-neutral-500">scroll for next</p>
    </div>`;
  }

  function renderCard(post, currentUserId, index) {
    const author = getAuthor(post);
    const initials = (author.displayName || '?').trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
    const verifiedBadge = author.verified ? '<span class="verified-badge-inline" title="Verified student">✓</span>' : '';
    const isAuthor = post.authorId === currentUserId;
    const requests = CampThread.getRequests();
    const alreadyRequested = requests.some((r) => r.postId === post.id && r.fromUserId === currentUserId);
    const timeAgo = formatTimeAgo(post.createdAt);

    // ── POST (LinkedIn-style) ──────────────────────────────
    if (post.type === 'post') {
      const upCount = postStats.up[post.id] || 0;
      const downCount = postStats.down[post.id] || 0;
      const voteScore = upCount - downCount;
      const myVote = postStats.mine[post.id] || 0;
      const upVoted = myVote === 1;
      const downVoted = myVote === -1;
      const commentCount = postStats.comments[post.id] || 0;
      return `<div class="snap-slide" style="height:auto;min-height:0;">
        <article class="post-card-full bg-white dark:bg-neutral-800 flex flex-col" data-post-id="${post.id}">
          <!-- Author header -->
          <div class="px-6 pt-6 pb-4">
            ${authorRow(author, initials, verifiedBadge, 'post', timeAgo, formatPostedDateTime(post.createdAt), true)}
          </div>
          <!-- Content -->
          <div class="px-6 pb-2">
            <h2 class="text-xl font-bold text-neutral-900 dark:text-white leading-snug mb-3">${(post.title || '').replace(/</g, '&lt;')}</h2>
            ${post.content ? '<p class="text-neutral-700 dark:text-neutral-300 text-base leading-relaxed">' + post.content.replace(/</g, '&lt;') + '</p>' : ''}
            ${post.imageUrl ? '<div class="mt-4 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700"><img src="' + post.imageUrl.replace(/"/g, '&quot;') + '" alt="Post image" class="w-full h-auto max-h-[360px] object-cover" loading="lazy" /></div>' : ''}
          </div>
          <!-- Social action bar -->
          <div class="border-t border-neutral-100 dark:border-neutral-700 mt-2 px-4 pt-3 pb-3 flex items-center gap-4 overflow-x-auto">
            <div class="post-vote-box inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-700/60 text-neutral-800 dark:text-neutral-100 px-1.5 py-1 gap-2 whitespace-nowrap" data-post-id="${post.id}">
              <button type="button" class="post-vote-up inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors ${upVoted ? 'text-blue-600' : 'text-neutral-600 dark:text-neutral-300'}" data-post-id="${post.id}" aria-label="Upvote">
                <i data-lucide="arrow-big-up" class="w-5 h-5"></i>
              </button>
              <span class="vote-score min-w-[1.75rem] text-center text-base font-semibold">${voteScore}</span>
              <button type="button" class="post-vote-down inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors ${downVoted ? 'text-red-500' : 'text-neutral-600 dark:text-neutral-300'}" data-post-id="${post.id}" aria-label="Downvote">
                <i data-lucide="arrow-big-down" class="w-5 h-5"></i>
              </button>
            </div>
            <button type="button" class="post-comment-btn inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-700/60 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors text-base font-medium whitespace-nowrap" data-post-id="${post.id}">
              <i data-lucide="message-circle" class="w-5 h-5"></i>
              <span class="comment-count">${commentCount}</span>
            </button>
            <button type="button" class="post-share-btn inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-700/60 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors text-base font-semibold whitespace-nowrap" data-post-id="${post.id}">
              <i data-lucide="share-2" class="w-5 h-5"></i>
              <span class="text-base">Share</span>
            </button>
          </div>
        </article>
      </div>`;
    }

    // ── RIDE ──────────────────────────────────────────────
    if (post.type === 'ride') {
      const d = post.dateTime ? new Date(post.dateTime) : null;
      const dateStr = d ? d.toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
      const ctaHtml = alreadyRequested
        ? '<button class="btn-cta btn-cta-ride sent" disabled>✓ Ride offer sent</button>'
        : '<button type="button" class="post-action-request-join btn-cta btn-cta-ride" data-post-id="' + post.id + '">Offer Ride</button>';
      return `<div class="snap-slide">
        <article class="post-card-full bg-white dark:bg-neutral-800 flex flex-col" data-post-id="${post.id}">
          <div class="card-gradient-ride px-7 pt-8 pb-7 relative overflow-hidden">
            <div class="absolute right-5 top-3 text-[7rem] leading-none opacity-[0.09] select-none">🚗</div>
            <div class="flex items-center justify-between mb-4">
              <span class="card-type-label-ride text-[11px] font-black uppercase tracking-[0.18em]">Ride Share</span>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(post)}">${getStatusLabel(post)}</span>
            </div>
            <h2 class="text-2xl font-extrabold text-neutral-900 dark:text-white leading-tight">${(post.destination || 'Ride').replace(/</g, '&lt;')}</h2>
          </div>
          <div class="px-7 pt-5 pb-4 flex-1 flex flex-col gap-4">
            ${authorRow(author, initials, verifiedBadge, 'ride', timeAgo, formatPostedDateTime(post.createdAt), true)}
            <div class="space-y-2 mt-1">
              ${dateStr ? '<div class="detail-row"><span>🕐</span><div><div class="text-[13px] text-neutral-400 uppercase tracking-wide font-semibold">Date & Time</div><strong>' + dateStr + '</strong></div></div>' : ''}
              ${post.seats != null ? '<div class="detail-row"><span>💺</span><div><div class="text-[13px] text-neutral-400 uppercase tracking-wide font-semibold">Seats Available</div><strong>' + post.seats + ' seats</strong></div></div>' : ''}
              ${post.priceSplit != null ? '<div class="detail-row"><span>💵</span><div><div class="text-[13px] text-neutral-400 uppercase tracking-wide font-semibold">Cost Split</div><strong>$' + post.priceSplit + ' per person</strong></div></div>' : ''}
            </div>
            ${ctaHtml ? '<div class="mt-auto pt-3">' + ctaHtml + '</div>' : ''}
          </div>
          <div class="px-7 pb-5">${scrollHint()}</div>
        </article>
      </div>`;
    }

    // ── TASK ──────────────────────────────────────────────
    if (post.type === 'task') {
      const ctaHtml = alreadyRequested
        ? '<button class="btn-cta btn-cta-task sent" disabled>✓ Offer Sent</button>'
        : '<button type="button" class="post-action-offer-help btn-cta btn-cta-task" data-post-id="' + post.id + '">Offer Help</button>';
      return `<div class="snap-slide">
        <article class="post-card-full bg-white dark:bg-neutral-800 flex flex-col" data-post-id="${post.id}">
          <div class="card-gradient-task px-7 pt-8 pb-7 relative overflow-hidden">
            <div class="absolute right-5 top-3 text-[7rem] leading-none opacity-[0.09] select-none">🤝</div>
            <div class="flex items-center justify-between mb-4">
              <span class="card-type-label-task text-[11px] font-black uppercase tracking-[0.18em]">Task Request</span>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(post)}">${getStatusLabel(post)}</span>
            </div>
            <h2 class="text-2xl font-extrabold text-neutral-900 dark:text-white leading-tight">${(cardTitle(post)).replace(/</g, '&lt;')}</h2>
          </div>
          <div class="px-7 pt-5 pb-4 flex-1 flex flex-col gap-4">
            <div class="flex items-center gap-2">${authorRow(author, initials, verifiedBadge, 'task', timeAgo, formatPostedDateTime(post.createdAt), true)}</div>
            <div class="space-y-2">
              ${post.category ? '<div class="detail-row"><span>📁</span><div><div class="text-[13px] text-neutral-400 uppercase tracking-wide font-semibold">Category</div><strong>' + post.category.replace(/</g, '&lt;') + '</strong></div></div>' : ''}
              ${post.estimatedEffort ? '<div class="detail-row"><span>⏱</span><div><div class="text-[13px] text-neutral-400 uppercase tracking-wide font-semibold">Effort</div><strong>' + post.estimatedEffort.replace(/</g, '&lt;') + '</strong></div></div>' : ''}
              ${post.compensation ? '<div class="detail-row"><span>💵</span><div><div class="text-[13px] text-neutral-400 uppercase tracking-wide font-semibold">Compensation</div><strong>' + post.compensation.replace(/</g, '&lt;') + '</strong></div></div>' : '<div class="detail-row"><span>💵</span><div><div class="text-[13px] text-neutral-400 uppercase tracking-wide font-semibold">Compensation</div><strong>Volunteer</strong></div></div>'}
            </div>
            ${ctaHtml ? '<div class="mt-auto pt-3">' + ctaHtml + '</div>' : ''}
          </div>
          <div class="px-7 pb-5">${scrollHint()}</div>
        </article>
      </div>`;
    }

    // ── MAINTENANCE ────────────────────────────────────────
    if (post.type === 'maintenance') {
      const upvoteCount = CampThread.getUpvoteCount(post.id) || 0;
      const upvoted = CampThread.hasUserUpvoted(post.id);
      const requestSent = requests.some((r) => r.postId === post.id && r.fromUserId === currentUserId);
      const offerBtn = requestSent
        ? '<button class="btn-cta btn-cta-task sent" disabled>✓ Offer Sent</button>'
        : '<button type="button" class="post-action-maintenance-help btn-cta btn-cta-task" data-post-id="' + post.id + '">Offer Help</button>';
      const supportBtn = `<button type="button" class="post-action-upvote btn-cta btn-cta-maintenance ${upvoted ? 'sent' : ''}" data-post-id="${post.id}">
        ${upvoted ? '✓ You Supported This' : '▲ Support This — ' + upvoteCount + ' student' + (upvoteCount !== 1 ? 's' : '') + ' already'}
      </button>`;
      return `<div class="snap-slide">
        <article class="post-card-full bg-white dark:bg-neutral-800 flex flex-col" data-post-id="${post.id}">
          <div class="card-gradient-maintenance px-7 pt-7 pb-6 relative overflow-hidden">
            <div class="absolute right-5 top-3 text-[7rem] leading-none opacity-[0.09] select-none">🔧</div>
            <div class="flex items-center justify-between mb-3">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-black uppercase tracking-wide">🚨 Student Needs Help</span>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(post)}">${getStatusLabel(post)}</span>
            </div>
            <h2 class="text-2xl font-extrabold text-neutral-900 dark:text-white leading-tight">${(post.issueDescription || post.title || 'Maintenance issue').replace(/</g, '&lt;')}</h2>
          </div>
          <div class="px-7 pt-5 pb-4 flex-1 flex flex-col gap-4">
            <div class="flex items-center gap-2">${authorRow(author, initials, verifiedBadge, 'maintenance', timeAgo, formatPostedDateTime(post.createdAt), true)}</div>
            <div class="space-y-2">
              ${post.location ? '<div class="detail-row"><span>📍</span><div><div class="text-[13px] text-neutral-400 uppercase tracking-wide font-semibold">Location</div><strong>' + post.location.replace(/</g, '&lt;') + '</strong></div></div>' : ''}
              ${post.urgency ? '<div class="detail-row"><span>⚠️</span><div><div class="text-[13px] text-neutral-400 uppercase tracking-wide font-semibold">Urgency</div><strong>' + post.urgency.replace(/</g, '&lt;') + '</strong></div></div>' : ''}
            </div>
            <div class="mt-auto pt-3 post-upvote-area flex flex-col gap-2">${offerBtn}${supportBtn}</div>
          </div>
          <div class="px-7 pb-5">${scrollHint()}</div>
        </article>
      </div>`;
    }

    // fallback
    return `<div class="snap-slide"><article class="post-card-full bg-white dark:bg-neutral-800 flex flex-col items-center justify-center p-8" data-post-id="${post.id}"><p class="text-neutral-500">${(cardTitle(post)).replace(/</g, '&lt;')}</p></article></div>`;
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

  async function render() {
    const container = document.getElementById('view-feed');
    if (!container) return;
    if (CampThread.syncFromBackend) {
      try { await CampThread.syncFromBackend(); } catch (_) {}
    }
    const filter = (container.getAttribute('data-feed-filter') || 'post').toLowerCase();
    const sortOrder = (container.getAttribute('data-feed-sort') || 'newest').toLowerCase();
    const searchQuery = (document.getElementById('top-search') && document.getElementById('top-search').value) || '';
    let posts = CampThread.getPosts()
      .filter((p) => filter === 'all' || p.type === filter)
      .filter((p) => matchesSearch(p, searchQuery));
    posts.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortOrder === 'oldest' ? da - db : db - da;
    });
    const currentUserId = CampThread.getUser()?.id;
    postStats = { up: {}, down: {}, mine: {}, comments: {} };
    if (window.SupaClient && window.SupaClient.client) {
      try {
        const votes = await window.SupaClient.listVotes();
        const comments = await window.SupaClient.listComments();
        votes.forEach((v) => {
          if (v.vote_type === 1) postStats.up[v.post_id] = (postStats.up[v.post_id] || 0) + 1;
          if (v.vote_type === -1) postStats.down[v.post_id] = (postStats.down[v.post_id] || 0) + 1;
          if (currentUserId && v.user_id === currentUserId) postStats.mine[v.post_id] = v.vote_type;
        });
        comments.forEach((c) => {
          postStats.comments[c.post_id] = (postStats.comments[c.post_id] || 0) + 1;
        });
      } catch (_) {}
    }
    const countAll = CampThread.getPosts().length;
    const countRides = CampThread.getPosts().filter((p) => p.type === 'ride').length;
    const countTasks = CampThread.getPosts().filter((p) => p.type === 'task').length;
    const countMaint = CampThread.getPosts().filter((p) => p.type === 'maintenance').length;
    const countPosts = CampThread.getPosts().filter((p) => p.type === 'post').length;

    const filterLabels = { post: 'Posts', ride: 'Rides', task: 'Tasks', maintenance: 'Maintenance', all: 'All Posts' };
    const filterLabel = filterLabels[filter] || 'Posts';
    const sortLabels = { newest: 'Newest', oldest: 'Oldest' };
    const sortLabel = sortLabels[sortOrder] || 'Newest';
    const filterOptions = [
      { v: 'post', l: 'Posts' },
      { v: 'ride', l: 'Rides' },
      { v: 'task', l: 'Tasks' },
      { v: 'maintenance', l: 'Maintenance' },
      { v: 'all', l: 'All Posts' }
    ].map((o) => `
      <button type="button" class="filter-option w-full text-left px-4 py-2.5 text-sm rounded-xl flex items-center justify-between gap-3 transition-colors
        ${filter === o.v ? 'font-semibold text-[#001489] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'}"
        data-filter="${o.v}">
        <span>${o.l}</span>
        ${filter === o.v ? '<svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ''}
      </button>
    `).join('');
    const sortOptions = [
      { v: 'newest', l: 'Newest first' },
      { v: 'oldest', l: 'Oldest first' }
    ].map((o) => `
      <button type="button" class="sort-option w-full text-left px-4 py-2.5 text-sm rounded-xl flex items-center justify-between gap-3 transition-colors
        ${sortOrder === o.v ? 'font-semibold text-[#001489] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'}"
        data-sort="${o.v}">
        <span>${o.l}</span>
        ${sortOrder === o.v ? '<svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ''}
      </button>
    `).join('');

    container.setAttribute('data-feed-filter', filter);
    container.setAttribute('data-feed-sort', sortOrder);
    container.innerHTML = `
      <div class="feed-header sticky top-0 z-20 bg-[#F0F2F5] dark:bg-[#18191A] flex items-center justify-end gap-2 px-4 py-1.5 md:px-5 border-b border-neutral-200 dark:border-neutral-800">
        <div class="flex items-center gap-2 whitespace-nowrap">
          <div class="relative" id="filter-dropdown-wrapper">
          <button id="filter-dropdown-btn" type="button" class="filter-pill active px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
            ${filterLabel}
            <svg class="w-4 h-4 transition-transform duration-200" id="filter-chevron" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div id="filter-dropdown-menu" class="hidden absolute right-0 top-full mt-2 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-700 p-1.5 z-50 min-w-[170px]">
            ${filterOptions}
          </div>
          </div>
          <div class="relative" id="sort-dropdown-wrapper">
            <button id="sort-dropdown-btn" type="button" class="filter-pill px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
              Sort · ${sortLabel}
              <svg class="w-4 h-4 transition-transform duration-200" id="sort-chevron" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div id="sort-dropdown-menu" class="hidden absolute left-0 top-full mt-2 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-700 p-1.5 z-50 min-w-[170px]">
              ${sortOptions}
            </div>
          </div>
        </div>
      </div>
      <div class="feed-snap-container" id="feed-cards">
        ${posts.length ? posts.map((p, i) => renderCard(p, currentUserId, i)).join('') : `
          <div class="snap-slide">
            <div class="flex flex-col items-center justify-center text-center px-6">
              ${emptyStateSVG()}
              <h3 class="text-xl font-bold text-neutral-800 dark:text-white mt-6">Your campus feed is quiet...</h3>
              <p class="text-neutral-500 mt-2 max-w-sm text-sm">Be the first to share a ride, ask for help, or post some news.</p>
              <a href="#create" class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-[#001489] hover:opacity-90 transition-opacity">Create Your First Post</a>
            </div>
          </div>
        `}
      </div>
    `;

    // Filter + sort dropdowns
    const dropBtn = container.querySelector('#filter-dropdown-btn');
    const dropMenu = container.querySelector('#filter-dropdown-menu');
    const chevron = container.querySelector('#filter-chevron');
    const sortBtn = container.querySelector('#sort-dropdown-btn');
    const sortMenu = container.querySelector('#sort-dropdown-menu');
    const sortChevron = container.querySelector('#sort-chevron');

    function closeFeedDropdowns() {
      if (dropMenu) dropMenu.classList.add('hidden');
      if (chevron) chevron.style.transform = '';
      if (sortMenu) sortMenu.classList.add('hidden');
      if (sortChevron) sortChevron.style.transform = '';
    }

    if (dropBtn && dropMenu) {
      dropBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = !dropMenu.classList.contains('hidden');
        dropMenu.classList.toggle('hidden', isOpen);
        if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
        if (!dropMenu.classList.contains('hidden') && sortMenu) {
          sortMenu.classList.add('hidden');
          if (sortChevron) sortChevron.style.transform = '';
        }
      });
    }
    if (sortBtn && sortMenu) {
      sortBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const isOpen = !sortMenu.classList.contains('hidden');
        sortMenu.classList.toggle('hidden', isOpen);
        if (sortChevron) sortChevron.style.transform = isOpen ? '' : 'rotate(180deg)';
        if (!sortMenu.classList.contains('hidden') && dropMenu) {
          dropMenu.classList.add('hidden');
          if (chevron) chevron.style.transform = '';
        }
      });
    }
    document.addEventListener('click', function closeFeedMenus(e) {
      const fw = container.querySelector('#filter-dropdown-wrapper');
      const sw = container.querySelector('#sort-dropdown-wrapper');
      if (fw?.contains(e.target) || sw?.contains(e.target)) return;
      closeFeedDropdowns();
      document.removeEventListener('click', closeFeedMenus);
    });
    container.querySelectorAll('.filter-option').forEach((btn) => {
      btn.addEventListener('click', function () {
        const f = this.getAttribute('data-filter');
        closeFeedDropdowns();
        container.setAttribute('data-feed-filter', f);
        render();
      });
    });
    container.querySelectorAll('.sort-option').forEach((btn) => {
      btn.addEventListener('click', function () {
        const s = this.getAttribute('data-sort');
        closeFeedDropdowns();
        container.setAttribute('data-feed-sort', s);
        render();
      });
    });
    container.querySelectorAll('.post-vote-up').forEach((btn) => {
      btn.addEventListener('click', async function () {
        const postId = this.getAttribute('data-post-id');
        if (window.SupaClient && window.SupaClient.client && currentUserId) {
          const current = postStats.mine[postId] || 0;
          const next = current === 1 ? null : 1;
          await window.SupaClient.setVote(postId, currentUserId, next);
          await render();
          return;
        }
        const upKey = 'ut_up_' + postId;
        const downKey = 'ut_down_' + postId;
        const upUserKey = 'ut_upvoted_' + postId;
        const downUserKey = 'ut_downvoted_' + postId;
        const voteBox = this.closest('.post-vote-box');
        const downBtn = voteBox ? voteBox.querySelector('.post-vote-down') : null;
        const scoreEl = voteBox ? voteBox.querySelector('.vote-score') : null;
        const upActive = !this.classList.contains('text-blue-600');
        this.classList.toggle('text-blue-600', upActive);
        this.classList.toggle('text-neutral-600', !upActive);
        this.classList.toggle('dark:text-neutral-300', !upActive);
        let upCount = parseInt(localStorage.getItem(upKey) || '0');
        upCount = upActive ? upCount + 1 : Math.max(0, upCount - 1);
        localStorage.setItem(upKey, upCount);
        localStorage.setItem(upUserKey, upActive ? '1' : '0');
        if (upActive && downBtn && downBtn.classList.contains('text-red-500')) {
          downBtn.classList.remove('text-red-500');
          downBtn.classList.add('text-neutral-600', 'dark:text-neutral-300');
          let downCount = parseInt(localStorage.getItem(downKey) || '0');
          downCount = Math.max(0, downCount - 1);
          localStorage.setItem(downKey, downCount);
          localStorage.setItem(downUserKey, '0');
        }
        if (scoreEl) {
          const downCount = parseInt(localStorage.getItem(downKey) || '0');
          scoreEl.textContent = String(upCount - downCount);
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
    });
    container.querySelectorAll('.post-vote-down').forEach((btn) => {
      btn.addEventListener('click', async function () {
        const postId = this.getAttribute('data-post-id');
        if (window.SupaClient && window.SupaClient.client && currentUserId) {
          const current = postStats.mine[postId] || 0;
          const next = current === -1 ? null : -1;
          await window.SupaClient.setVote(postId, currentUserId, next);
          await render();
          return;
        }
        const downKey = 'ut_down_' + postId;
        const upKey = 'ut_up_' + postId;
        const downUserKey = 'ut_downvoted_' + postId;
        const upUserKey = 'ut_upvoted_' + postId;
        const voteBox = this.closest('.post-vote-box');
        const upBtn = voteBox ? voteBox.querySelector('.post-vote-up') : null;
        const scoreEl = voteBox ? voteBox.querySelector('.vote-score') : null;
        const downActive = !this.classList.contains('text-red-500');
        this.classList.toggle('text-red-500', downActive);
        this.classList.toggle('text-neutral-600', !downActive);
        this.classList.toggle('dark:text-neutral-300', !downActive);
        let downCount = parseInt(localStorage.getItem(downKey) || '0');
        downCount = downActive ? downCount + 1 : Math.max(0, downCount - 1);
        localStorage.setItem(downKey, downCount);
        localStorage.setItem(downUserKey, downActive ? '1' : '0');
        if (downActive && upBtn && upBtn.classList.contains('text-blue-600')) {
          upBtn.classList.remove('text-blue-600');
          upBtn.classList.add('text-neutral-600', 'dark:text-neutral-300');
          let upCount = parseInt(localStorage.getItem(upKey) || '0');
          upCount = Math.max(0, upCount - 1);
          localStorage.setItem(upKey, upCount);
          localStorage.setItem(upUserKey, '0');
        }
        if (scoreEl) {
          const upCount = parseInt(localStorage.getItem(upKey) || '0');
          scoreEl.textContent = String(upCount - downCount);
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
    });
    container.querySelectorAll('.post-comment-btn').forEach((btn) => {
      btn.addEventListener('click', async function () {
        const postId = this.getAttribute('data-post-id');
        const text = window.prompt('Write your comment');
        if (!text || !text.trim()) return;
        if (window.SupaClient && window.SupaClient.client && currentUserId) {
          await window.SupaClient.addComment(postId, currentUserId, text.trim());
          await render();
          return;
        }
        const key = 'ut_comments_' + postId;
        let comments = [];
        try { comments = JSON.parse(localStorage.getItem(key) || '[]') || []; } catch (_) {}
        comments.push(text.trim());
        localStorage.setItem(key, JSON.stringify(comments));
        const countEl = this.querySelector('.comment-count');
        if (countEl) countEl.textContent = String(comments.length);
      });
    });
    container.querySelectorAll('.post-share-btn').forEach((btn) => {
      btn.addEventListener('click', async function () {
        const postId = this.getAttribute('data-post-id');
        const shareUrl = window.location.origin + window.location.pathname + '#feed?post=' + encodeURIComponent(postId || '');
        let copied = false;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareUrl);
            copied = true;
          }
        } catch (_) {}
        if (!copied) {
          const ta = document.createElement('textarea');
          ta.value = shareUrl;
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand('copy');
            copied = true;
          } catch (_) {}
          document.body.removeChild(ta);
        }
        const old = this.querySelector('span:last-child')?.textContent || 'Share';
        const label = this.querySelector('span:last-child');
        if (label) label.textContent = copied ? 'Copied!' : 'Copy link';
        setTimeout(() => {
          if (label) label.textContent = old === 'Copied!' || old === 'Copy link' ? 'Share' : old;
        }, 1200);
      });
    });
    container.querySelectorAll('.post-action-request-join').forEach((btn) => {
      btn.addEventListener('click', async function () {
        const postId = this.getAttribute('data-post-id');
        const before = CampThread.getRequests().length;
        const created = await CampThread.addRequest({ postId, fromUserId: currentUserId, type: 'ride' });
        if (!created) {
          window.alert('You cannot request your own post.');
          return;
        }
        if (CampThread.getRequests().length === before) {
          window.alert('You already sent a ride offer on this post.');
        }
        this.textContent = 'Ride offer sent';
        this.disabled = true;
        this.classList.add('opacity-75');
      });
    });
    container.querySelectorAll('.post-action-offer-help').forEach((btn) => {
      btn.addEventListener('click', async function () {
        const postId = this.getAttribute('data-post-id');
        const before = CampThread.getRequests().length;
        const created = await CampThread.addRequest({ postId, fromUserId: currentUserId, type: 'task' });
        if (!created) {
          window.alert('You cannot offer help on your own post.');
          return;
        }
        if (CampThread.getRequests().length === before) {
          window.alert('You already sent an offer for this task.');
        }
        this.textContent = 'Offer sent';
        this.disabled = true;
        this.classList.add('opacity-75');
      });
    });
    container.querySelectorAll('.post-action-maintenance-help').forEach((btn) => {
      btn.addEventListener('click', async function () {
        const postId = this.getAttribute('data-post-id');
        const before = CampThread.getRequests().length;
        const created = await CampThread.addRequest({ postId, fromUserId: currentUserId, type: 'maintenance' });
        if (!created) {
          window.alert('You cannot offer help on your own post.');
          return;
        }
        if (CampThread.getRequests().length === before) {
          window.alert('You already sent an offer for this maintenance issue.');
        }
        this.textContent = 'Offer sent';
        this.disabled = true;
        this.classList.add('opacity-75');
      });
    });
    container.querySelectorAll('.post-action-upvote').forEach((btn) => {
      btn.addEventListener('click', async function () {
        const postId = this.getAttribute('data-post-id');
        await CampThread.toggleUpvote(postId);
        const count = CampThread.getUpvoteCount(postId);
        const upvoted = CampThread.hasUserUpvoted(postId);
        this.classList.toggle('sent', upvoted);
        this.textContent = upvoted ? '✓ You Supported This' : '▲ Support This — ' + count + ' student' + (count !== 1 ? 's' : '') + ' already';
        if (upvoted) window.alert('Thanks! Your support was added.');
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
