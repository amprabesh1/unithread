/**
 * UniThread – Messages (DMs): conversation list, chat thread, add contacts
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
    var container = document.getElementById('view-messages');
    if (!container) return;
    var user = UniThread.getUser();
    var hash = (window.location.hash || '').replace('#', '');
    var openConvId = (hash.indexOf('messages/') === 0) ? hash.split('/')[1] : null;
    var convs = UniThread.getConversations();
    var contacts = UniThread.getContacts();
    var allUsers = [];
    try {
      var raw = localStorage.getItem('campthread_users');
      allUsers = raw ? JSON.parse(raw) : [];
    } catch (_) {}
    var otherUserIds = allUsers.filter(function (u) { return u.id !== user.id; }).map(function (u) { return u.id; });

    container.innerHTML = '<div class="flex flex-col h-[calc(100vh-8rem)] md:flex-row gap-4">' +
      '<div class="w-full md:w-80 flex-shrink-0 bg-white dark:bg-neutral-800 rounded-xl shadow card overflow-hidden flex flex-col">' +
        '<div class="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">' +
          '<h2 class="text-lg font-bold text-neutral-800 dark:text-white">Messages</h2>' +
          '<button type="button" id="msg-new-btn" class="text-sm text-blue-500 hover:underline">New chat</button>' +
        '</div>' +
        '<div class="overflow-y-auto flex-1" id="msg-list">' +
          (convs.length ? convs.map(function (c) {
            var otherId = c.participants[0] === user.id ? c.participants[1] : c.participants[0];
            var other = getUser(otherId);
            var lastMsg = UniThread.getMessages(c.id).slice(-1)[0];
            var lastText = lastMsg ? (lastMsg.text || '').slice(0, 30) + (lastMsg.text && lastMsg.text.length > 30 ? '…' : '') : 'No messages yet';
            return '<a href="#messages/' + c.id + '" class="msg-conv flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700 ' + (openConvId === c.id ? 'bg-neutral-100 dark:bg-neutral-700' : '') + '">' +
              '<div class="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">' + getInitials(other.displayName) + '</div>' +
              '<div class="min-w-0 flex-1"><p class="font-medium text-neutral-800 dark:text-white truncate">' + (other.displayName || 'Unknown').replace(/</g, '&lt;') + '</p><p class="text-xs text-neutral-500 truncate">' + lastText.replace(/</g, '&lt;') + '</p></div></a>';
          }).join('') : '<p class="p-4 text-neutral-500 text-sm">No conversations yet. Start a new chat or add contacts from Profile.</p>') +
        '</div>' +
      '</div>' +
      '<div class="flex-1 flex flex-col bg-white dark:bg-neutral-800 rounded-xl shadow card overflow-hidden min-h-0" id="msg-thread-wrap">' +
        (openConvId ? renderThread(openConvId) : '<div class="flex-1 flex items-center justify-center text-neutral-500 dark:text-neutral-400 p-8">Select a conversation or start a new chat.</div>') +
      '</div>' +
    '</div>';

    if (openConvId) {
      var form = container.querySelector('#msg-send-form');
      var input = container.querySelector('#msg-input');
      if (form && input) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var t = (input.value || '').trim();
          if (!t) return;
          UniThread.sendMessage(openConvId, t);
          input.value = '';
          var wrap = document.getElementById('msg-thread-wrap');
          if (wrap) wrap.innerHTML = renderThread(openConvId);
          var msgsEl = document.getElementById('msg-messages');
          if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
          if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
        });
      }
      var msgsEl = container.querySelector('#msg-messages');
      if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    container.querySelector('#msg-new-btn').addEventListener('click', function () {
      var list = otherUserIds.filter(function (id) { return contacts.indexOf(id) >= 0 || convs.some(function (c) { return c.participants.indexOf(id) >= 0; }); });
      if (list.length === 0) list = otherUserIds;
      var html = '<div class="p-4"><p class="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Start a chat with:</p><div class="space-y-1 max-h-60 overflow-y-auto">' +
        list.slice(0, 20).map(function (uid) {
          var u = getUser(uid);
          return '<button type="button" class="msg-pick-user w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2" data-user-id="' + uid + '">' +
            '<span class="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center text-xs">' + getInitials(u.displayName) + '</span>' + (u.displayName || 'User').replace(/</g, '&lt;') + '</button>';
        }).join('') + '</div></div>';
      var div = document.createElement('div');
      div.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50';
      div.innerHTML = '<div class="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-sm w-full mx-4">' + html + '</div>';
      div.querySelector('.rounded-xl').onclick = function (e) { e.stopPropagation(); };
      div.onclick = function () { div.remove(); };
      document.body.appendChild(div);
      div.querySelectorAll('.msg-pick-user').forEach(function (btn) {
        btn.onclick = function () {
          var otherId = this.getAttribute('data-user-id');
          UniThread.addContact(otherId);
          var conv = UniThread.getOrCreateConversation(otherId);
          div.remove();
          window.location.hash = 'messages/' + conv.id;
          render();
        };
      });
    });
  }

  function renderThread(conversationId) {
    var user = UniThread.getUser();
    var conv = UniThread.getConversations().find(function (c) { return c.id === conversationId; });
    if (!conv) return '<div class="p-4 text-neutral-500">Conversation not found.</div>';
    var otherId = conv.participants[0] === user.id ? conv.participants[1] : conv.participants[0];
    var other = getUser(otherId);
    var msgs = UniThread.getMessages(conversationId);
    return '<div class="flex flex-col h-full">' +
      '<div class="p-3 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-2">' +
        '<div class="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center text-xs font-semibold">' + getInitials(other.displayName) + '</div>' +
        '<span class="font-medium text-neutral-800 dark:text-white">' + (other.displayName || 'Unknown').replace(/</g, '&lt;') + '</span>' +
      '</div>' +
      '<div class="flex-1 overflow-y-auto p-4 space-y-2" id="msg-messages">' +
        msgs.map(function (m) {
          var isMe = m.fromUserId === user.id;
          return '<div class="flex ' + (isMe ? 'justify-end' : 'justify-start') + '">' +
            '<div class="max-w-[80%] px-3 py-2 rounded-2xl ' + (isMe ? 'bg-blue-500 text-white' : 'bg-neutral-200 dark:bg-neutral-600 text-neutral-800 dark:text-white') + '">' +
              '<p class="text-sm">' + (m.text || '').replace(/</g, '&lt;').replace(/\n/g, '<br/>') + '</p>' +
              '<p class="text-xs opacity-75 mt-0.5">' + formatTime(m.createdAt) + '</p>' +
            '</div></div>';
        }).join('') +
      '</div>' +
      '<form id="msg-send-form" class="p-3 border-t border-neutral-200 dark:border-neutral-700 flex gap-2">' +
        '<input type="text" id="msg-input" placeholder="Type a message..." class="flex-1 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-white placeholder-neutral-400" />' +
        '<button type="submit" class="px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-medium">Send</button>' +
      '</form>' +
    '</div>';
  }

  window.UniThreadMessages = { render: function () { render(); } };
})();
