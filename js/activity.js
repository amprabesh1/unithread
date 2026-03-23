/**
 * CampThread – My Activity: My Posts, My Requests, Offers Received
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

  function getStatusLabel(post) {
    if (post.type === 'ride') return post.status === 'open' ? 'Open' : post.status === 'full' ? 'Full' : 'Completed';
    if (post.type === 'task') return post.status === 'open' ? 'Open' : post.status === 'assigned' ? 'Assigned' : 'Done';
    if (post.type === 'maintenance') return post.status === 'reported' ? 'Reported' : post.status === 'inProgress' ? 'In Progress' : 'Resolved';
    if (post.type === 'post') return 'Posted';
    return post.status || '';
  }

  function getAuthor(id) {
    return window.CampThreadViews.getUserById(id) || { displayName: 'Unknown' };
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'short' });
  }

  function render() {
    const container = document.getElementById('view-activity');
    if (!container) return;
    const tab = (container.getAttribute('data-activity-tab') || 'posts').toLowerCase();
    const user = CampThread.getUser();
    const userId = user?.id;
    const posts = CampThread.getPosts().filter((p) => p.authorId === userId);
    const requests = CampThread.getRequests();
    const myRequests = requests.filter((r) => r.fromUserId === userId);
    const offersReceived = requests.filter((r) => {
      const post = CampThread.getPost(r.postId);
      return post && post.authorId === userId && r.fromUserId !== userId;
    });

    container.setAttribute('data-activity-tab', tab);
    container.innerHTML = `
      <h2 class="text-xl font-bold text-neutral-800 dark:text-white mb-4">My Activity</h2>
      <div class="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button type="button" class="activity-tab filter-pill px-4 py-2 rounded-full text-sm font-medium ${tab === 'posts' ? 'active' : ''}" data-tab="posts">My Posts</button>
        <button type="button" class="activity-tab filter-pill px-4 py-2 rounded-full text-sm font-medium ${tab === 'requests' ? 'active' : ''}" data-tab="requests">My Requests</button>
        <button type="button" class="activity-tab filter-pill px-4 py-2 rounded-full text-sm font-medium ${tab === 'offers' ? 'active' : ''}" data-tab="offers">Offers Received</button>
      </div>

      <div id="activity-posts" class="space-y-4 ${tab !== 'posts' ? 'hidden' : ''}">
        ${posts.length ? posts.map((p, i) => `
          <div class="app-card p-4 flex flex-wrap items-center justify-between gap-3 fade-in-up bg-white dark:bg-neutral-800 border border-transparent dark:border-neutral-700" style="animation-delay: ${i * 50}ms;">
            <div>
              <span class="font-medium text-neutral-800 dark:text-white">${(p.type === 'ride' ? p.destination : p.type === 'task' ? (p.description || '').slice(0, 50) : p.type === 'post' ? (p.title || 'Post') : p.location || 'Maintenance') || p.type}</span>
              <span class="inline-flex items-center ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(p)}">${getStatusLabel(p)}</span>
            </div>
            <span class="text-sm text-neutral-500">${formatDate(p.createdAt)}</span>
          </div>
        `).join('') : '<p class="text-neutral-500 py-6">You haven\'t created any posts yet.</p>'}
      </div>

      <div id="activity-requests" class="space-y-4 ${tab !== 'requests' ? 'hidden' : ''}">
        ${myRequests.length ? myRequests.map((r, i) => {
          const post = CampThread.getPost(r.postId);
          const status = r.status === 'pending' ? 'Pending' : r.status === 'accepted' ? 'Accepted' : 'Declined';
          return `
            <div class="app-card p-4 flex flex-wrap items-center justify-between gap-3 fade-in-up bg-white dark:bg-neutral-800 border border-transparent dark:border-neutral-700" style="animation-delay: ${i * 50}ms;">
              <div>
                <span class="text-neutral-800 dark:text-neutral-200">${post ? (post.type === 'ride' ? 'Ride: ' + (post.destination || '—') : post.type === 'task' ? 'Task: ' + (post.description || '—').slice(0, 40) : 'Maintenance: ' + (post.location || '—')) : 'Post'}</span>
                <span class="inline-flex items-center ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${r.status === 'pending' ? 'badge-open' : r.status === 'accepted' ? 'badge-assigned' : 'badge-completed'}">${status}</span>
              </div>
              <span class="text-sm text-neutral-500">${formatDate(r.createdAt)}</span>
            </div>
          `;
        }).join('') : '<p class="text-neutral-500 py-6">You haven\'t sent any requests or offers.</p>'}
      </div>

      <div id="activity-offers" class="space-y-4 ${tab !== 'offers' ? 'hidden' : ''}">
        ${offersReceived.length ? offersReceived.map((r, i) => {
          const post = CampThread.getPost(r.postId);
          const fromUser = getAuthor(r.fromUserId);
          return `
            <div class="app-card p-4 fade-in-up bg-white dark:bg-neutral-800 border border-transparent dark:border-neutral-700" style="animation-delay: ${i * 50}ms;">
              <div class="flex flex-wrap items-center justify-between gap-3 mb-2">
                <span class="font-medium text-neutral-800 dark:text-white">${fromUser.displayName}</span>
                <span class="text-sm text-neutral-500">${formatDate(r.createdAt)}</span>
              </div>
              <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-3">${post ? (post.type === 'ride' ? 'Ride to ' + (post.destination || '—') : 'Task: ' + (post.description || '—').slice(0, 60)) : ''}</p>
              ${r.status === 'pending' ? `
                <div class="flex gap-2">
                  <button type="button" class="activity-accept px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-green-500 hover:bg-green-600" data-req-id="${r.id}" data-post-id="${r.postId}" data-type="${post?.type || 'ride'}">Accept</button>
                  <button type="button" class="activity-decline px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600" data-req-id="${r.id}">Decline</button>
                </div>
              ` : '<span class="text-sm ' + (r.status === 'accepted' ? 'text-green-600' : 'text-neutral-500') + '">' + (r.status === 'accepted' ? 'Accepted' : 'Declined') + '</span>'}
            </div>
          `;
        }).join('') : '<p class="text-neutral-500 py-6">No incoming requests or offers.</p>'}
      </div>
    `;

    container.querySelectorAll('.activity-tab').forEach((btn) => {
      btn.addEventListener('click', function () {
        const t = this.getAttribute('data-tab');
        container.setAttribute('data-activity-tab', t);
        container.querySelector('#activity-posts').classList.toggle('hidden', t !== 'posts');
        container.querySelector('#activity-requests').classList.toggle('hidden', t !== 'requests');
        container.querySelector('#activity-offers').classList.toggle('hidden', t !== 'offers');
        container.querySelectorAll('.activity-tab').forEach((b) => b.classList.remove('active'));
        this.classList.add('active');
      });
    });

    container.querySelectorAll('.activity-accept').forEach((btn) => {
      btn.addEventListener('click', function () {
        const reqId = this.getAttribute('data-req-id');
        const postId = this.getAttribute('data-post-id');
        const type = this.getAttribute('data-type');
        CampThread.updateRequest(reqId, { status: 'accepted' });
        if (type === 'ride') CampThread.updatePost(postId, { status: 'full' });
        if (type === 'task') CampThread.updatePost(postId, { status: 'assigned' });
        // Once one request/offer is accepted, close other pending ones for same post
        CampThread.getRequests()
          .filter((r) => r.postId === postId && r.id !== reqId && r.status === 'pending')
          .forEach((r) => CampThread.updateRequest(r.id, { status: 'declined' }));
        render();
      });
    });
    container.querySelectorAll('.activity-decline').forEach((btn) => {
      btn.addEventListener('click', function () {
        const reqId = this.getAttribute('data-req-id');
        CampThread.updateRequest(reqId, { status: 'declined' });
        render();
      });
    });
  }

  window.CampThreadActivity = { render };
})();
