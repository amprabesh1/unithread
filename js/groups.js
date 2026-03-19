/**
 * UniThread – Groups: list, create group, group chat
 */
(function () {
  function getUser(id) { return window.CampThreadViews.getUserById(id) || { displayName: 'Unknown' }; }
  function getInitials(name) { return (name || '?').trim().split(/\s+/).map(function (p) { return p[0]; }).slice(0, 2).join('').toUpperCase() || '?'; }
  function formatTime(iso) {
    var d = new Date(iso);
    var now = new Date();
    if (now - d < 86400000) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function render() {
    var container = document.getElementById('view-groups');
    if (!container) return;
    var user = UniThread.getUser();
    var hash = (window.location.hash || '').replace('#', '');
    var openGroupId = (hash.indexOf('groups/') === 0) ? hash.split('/')[1] : null;
    var groupsList = UniThread.getGroups();
    var contacts = UniThread.getContacts();
    var allUsers = [];
    try { allUsers = JSON.parse(localStorage.getItem('campthread_users') || '[]'); } catch (_) {}
    var otherUserIds = allUsers.filter(function (u) { return u.id !== user.id; }).map(function (u) { return u.id; });

    container.innerHTML = '<div class="flex flex-col h-[calc(100vh-8rem)] md:flex-row gap-4">' +
      '<div class="w-full md:w-80 flex-shrink-0 bg-white dark:bg-neutral-800 rounded-xl shadow overflow-hidden flex flex-col">' +
        '<div class="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">' +
          '<h2 class="text-lg font-bold text-neutral-800 dark:text-white">Groups</h2>' +
          '<button type="button" id="group-create-btn" class="text-sm text-blue-500 hover:underline">Create group</button>' +
        '</div>' +
        '<div class="overflow-y-auto flex-1" id="group-list">' +
          (groupsList.length ? groupsList.map(function (g) {
            return '<a href="#groups/' + g.id + '" class="group-item flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700 ' + (openGroupId === g.id ? 'bg-neutral-100 dark:bg-neutral-700' : '') + '">' +
              '<div class="w-10 h-10 rounded-full bg-sidebar-activeBg flex items-center justify-center text-sidebar-activeText font-semibold flex-shrink-0">' + (g.name || 'G').charAt(0).toUpperCase() + '</div>' +
              '<div class="min-w-0 flex-1"><p class="font-medium text-neutral-800 dark:text-white truncate">' + (g.name || 'Group').replace(/</g, '&lt;') + '</p><p class="text-xs text-neutral-500">' + UniThread.getGroupMembers(g.id).length + ' members</p></div></a>';
          }).join('') : '<p class="p-4 text-neutral-500 text-sm">No groups yet. Create one and add friends.</p>') +
        '</div>' +
      '</div>' +
      '<div class="flex-1 flex flex-col bg-white dark:bg-neutral-800 rounded-xl shadow overflow-hidden min-h-0" id="group-thread-wrap">' +
        (openGroupId ? renderGroupThread(openGroupId) : '<div class="flex-1 flex items-center justify-center text-neutral-500 dark:text-neutral-400 p-8">Select a group or create one.</div>') +
      '</div>' +
    '</div>';

    if (openGroupId) {
      var form = container.querySelector('#group-send-form');
      var input = container.querySelector('#group-msg-input');
      if (form && input) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var t = (input.value || '').trim();
          if (!t) return;
          UniThread.sendGroupMessage(openGroupId, t);
          input.value = '';
          var wrap = document.getElementById('group-thread-wrap');
          if (wrap) wrap.innerHTML = renderGroupThread(openGroupId);
          var msgsEl = document.getElementById('group-messages');
          if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
        });
      }
      var msgsEl = container.querySelector('#group-messages');
      if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    container.querySelector('#group-create-btn').addEventListener('click', function () {
      var list = otherUserIds.length ? otherUserIds : [];
      var html = '<div class="p-4"><label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Group name</label><input type="text" id="new-group-name" placeholder="e.g. Study squad" class="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white mb-4" />' +
        '<p class="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Add members:</p><div class="space-y-1 max-h-48 overflow-y-auto">' +
        list.slice(0, 30).map(function (uid) {
          var u = getUser(uid);
          return '<label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">' +
            '<input type="checkbox" class="new-group-member" value="' + uid + '" />' +
            '<span class="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center text-xs">' + getInitials(u.displayName) + '</span>' + (u.displayName || 'User').replace(/</g, '&lt;') + '</label>';
        }).join('') + '</div><div class="mt-4 flex gap-2"><button type="button" id="group-create-submit" class="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm">Create</button><button type="button" class="group-modal-cancel px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-600 text-sm">Cancel</button></div></div>';
      var div = document.createElement('div');
      div.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50';
      div.innerHTML = '<div class="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-sm w-full mx-4">' + html + '</div>';
      div.querySelector('.rounded-xl').onclick = function (e) { e.stopPropagation(); };
      div.onclick = function () { div.remove(); };
      document.body.appendChild(div);
      div.querySelector('.group-modal-cancel').onclick = function () { div.remove(); };
      div.querySelector('#group-create-submit').onclick = function () {
        var name = (div.querySelector('#new-group-name').value || '').trim();
        if (!name) return;
        var memberIds = [].map.call(div.querySelectorAll('.new-group-member:checked'), function (cb) { return cb.value; });
        var g = UniThread.createGroup(name, memberIds);
        div.remove();
        window.location.hash = 'groups/' + g.id;
        render();
      };
    });
  }

  function renderGroupThread(groupId) {
    var user = UniThread.getUser();
    var group = UniThread.getGroups().find(function (g) { return g.id === groupId; });
    if (!group) return '<div class="p-4 text-neutral-500">Group not found.</div>';
    var msgs = UniThread.getGroupMessages(groupId);
    return '<div class="flex flex-col h-full">' +
      '<div class="p-3 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-2">' +
        '<div class="w-8 h-8 rounded-full bg-sidebar-activeBg flex items-center justify-center text-sidebar-activeText font-semibold text-sm">' + (group.name || 'G').charAt(0).toUpperCase() + '</div>' +
        '<span class="font-medium text-neutral-800 dark:text-white">' + (group.name || 'Group').replace(/</g, '&lt;') + '</span>' +
      '</div>' +
      '<div class="flex-1 overflow-y-auto p-4 space-y-2" id="group-messages">' +
        msgs.map(function (m) {
          var isMe = m.fromUserId === user.id;
          var author = getUser(m.fromUserId);
          return '<div class="flex ' + (isMe ? 'justify-end' : 'justify-start') + '">' +
            '<div class="max-w-[80%]"><p class="text-xs text-neutral-500 dark:text-neutral-400 ' + (isMe ? 'text-right' : '') + '">' + (isMe ? 'You' : (author.displayName || 'Unknown').replace(/</g, '&lt;')) + '</p>' +
            '<div class="px-3 py-2 rounded-2xl ' + (isMe ? 'bg-blue-500 text-white' : 'bg-neutral-200 dark:bg-neutral-600 text-neutral-800 dark:text-white') + '">' +
              '<p class="text-sm">' + (m.text || '').replace(/</g, '&lt;').replace(/\n/g, '<br/>') + '</p>' +
              '<p class="text-xs opacity-75 mt-0.5">' + formatTime(m.createdAt) + '</p>' +
            '</div></div></div>';
        }).join('') +
      '</div>' +
      '<form id="group-send-form" class="p-3 border-t border-neutral-200 dark:border-neutral-700 flex gap-2">' +
        '<input type="text" id="group-msg-input" placeholder="Message the group..." class="flex-1 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-white placeholder-neutral-400" />' +
        '<button type="submit" class="px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-medium">Send</button>' +
      '</form>' +
    '</div>';
  }

  window.UniThreadGroups = { render: function () { render(); } };
})();
