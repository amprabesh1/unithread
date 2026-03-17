/**
 * UniThread – global state with localStorage persistence
 * (CampThread renamed; supports Messages, Groups, Contacts, Post type)
 */
const UniThread = (function () {
  const STORAGE_KEYS = {
    user: 'campthread_user',
    posts: 'campthread_posts',
    requests: 'campthread_requests',
    upvotes: 'campthread_upvotes',
    contacts: 'unithread_contacts',
    conversations: 'unithread_conversations',
    messages: 'unithread_messages',
    groups: 'unithread_groups',
    groupMembers: 'unithread_group_members',
    groupMessages: 'unithread_group_messages',
    theme: 'unithread_theme'
  };

  function load(key, defaultValue) {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : defaultValue;
    } catch (_) {
      return defaultValue;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  }

  const DEMO_USERS = [
    { id: 'demo-1', email: 'jordan@university.edu', password: '—', displayName: 'Jordan Lee', photoUrl: null, verified: true },
    { id: 'demo-2', email: 'sam@university.edu', password: '—', displayName: 'Sam Chen', photoUrl: null, verified: true },
    { id: 'demo-3', email: 'alex@university.edu', password: '—', displayName: 'Alex Rivera', photoUrl: null, verified: true },
    { id: 'demo-4', email: 'morgan@university.edu', password: '—', displayName: 'Morgan Taylor', photoUrl: null, verified: true }
  ];

  function pastDate(hrsAgo) {
    const d = new Date();
    d.setHours(d.getHours() - hrsAgo);
    return d.toISOString();
  }

  const DEMO_POSTS = [
    { id: '1', authorId: 'demo-1', type: 'ride', status: 'open', destination: 'Nashville Airport', dateTime: '2025-03-21T15:00', seats: 3, priceSplit: 5, createdAt: pastDate(2), title: 'Driving to Nashville Airport — Friday 3 PM' },
    { id: '2', authorId: 'demo-2', type: 'ride', status: 'full', destination: 'Chattanooga', dateTime: '2025-03-22T09:00', seats: 2, priceSplit: 10, createdAt: pastDate(5), title: 'Weekend trip to Chattanooga' },
    { id: '3', authorId: 'demo-3', type: 'task', status: 'open', description: 'Need help moving furniture to my new dorm room. Can provide pizza + $20!', category: 'Moving', estimatedEffort: '2–3 hours', compensation: 'Pizza + $20', createdAt: pastDate(8), title: 'Need help moving furniture to new dorm' },
    { id: '4', authorId: 'demo-1', type: 'task', status: 'assigned', description: 'Looking for a study partner for Calc II final. Library or student center.', category: 'Tutoring', estimatedEffort: 'Ongoing', compensation: '', createdAt: pastDate(12), title: 'Looking for a study partner for Calc II final' },
    { id: '5', authorId: 'demo-4', type: 'maintenance', status: 'reported', location: 'Johnson Hall, 2nd floor bathroom', issueDescription: 'Water leaking from pipe under the sink. Floor is getting wet.', urgency: 'High', createdAt: pastDate(1), title: 'Water leak in Johnson Hall 2nd floor bathroom' },
    { id: '6', authorId: 'demo-2', type: 'maintenance', status: 'inProgress', location: 'Student Center', issueDescription: 'Vending machine takes money but doesn\'t dispense. Machine #4.', urgency: 'Low', createdAt: pastDate(20), title: 'Broken vending machine in Student Center' },
    { id: '7', authorId: 'demo-3', type: 'task', status: 'open', description: 'Need someone to proofread my 5-page essay for English 101. Due Friday.', category: 'Other', estimatedEffort: '1 hour', compensation: '$15', createdAt: pastDate(24), title: 'Need someone to proofread my essay — 5 pages' },
    { id: '8', authorId: 'demo-1', type: 'ride', status: 'completed', destination: 'Walmart', dateTime: '2025-03-15T14:00', seats: 2, priceSplit: 0, createdAt: pastDate(48), title: 'Going to Walmart, can take 2 people' },
    { id: '9', authorId: 'demo-2', type: 'post', status: 'posted', title: 'Campus coffee shop reopened with new seating!', content: 'The one by the library finally has those comfy couches. Perfect for group study.', createdAt: pastDate(3) },
    { id: '10', authorId: 'demo-4', type: 'post', status: 'posted', title: 'Free pizza in the dorm lounge tonight 7pm', content: 'Leftover from an event — first come first served. Bring your own drinks!', createdAt: pastDate(6) },
    { id: '11', authorId: 'demo-1', type: 'post', status: 'posted', title: 'Anyone else hyped for the game this weekend?', content: 'Tailgate at 2pm. Let\'s go!', createdAt: pastDate(10) }
  ];

  function seedIfEmpty() {
    if (posts.length > 0) return;
    const existingUsers = load('campthread_users', []);
    const demoIds = new Set(DEMO_USERS.map((u) => u.id));
    const merged = [...existingUsers.filter((u) => !demoIds.has(u.id)), ...DEMO_USERS];
    save('campthread_users', merged);
    posts = DEMO_POSTS.slice();
    save(STORAGE_KEYS.posts, posts);
    upvotes = [
      { postId: '5', userId: 'demo-1' }, { postId: '5', userId: 'demo-2' }, { postId: '5', userId: 'demo-3' },
      { postId: '6', userId: 'demo-1' }, { postId: '6', userId: 'demo-4' }
    ];
    save(STORAGE_KEYS.upvotes, upvotes);
  }

  let user = load(STORAGE_KEYS.user, null);
  let posts = load(STORAGE_KEYS.posts, []);
  let requests = load(STORAGE_KEYS.requests, []);
  let upvotes = load(STORAGE_KEYS.upvotes, []);
  let contacts = load(STORAGE_KEYS.contacts, []);
  let conversations = load(STORAGE_KEYS.conversations, []);
  let messages = load(STORAGE_KEYS.messages, []);
  let groups = load(STORAGE_KEYS.groups, []);
  let groupMembers = load(STORAGE_KEYS.groupMembers, []);
  let groupMessages = load(STORAGE_KEYS.groupMessages, []);
  seedIfEmpty();
  var savedTheme = load(STORAGE_KEYS.theme, 'light');
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }

  function getNextId(arr) {
    const max = arr.length ? Math.max(...arr.map((x) => (x.id ? parseInt(x.id, 10) : 0))) : 0;
    return String(max + 1);
  }

  return {
    getUser() { return user; },
    setUser(u) {
      user = u;
      save(STORAGE_KEYS.user, user);
      return user;
    },
    logout() {
      user = null;
      save(STORAGE_KEYS.user, null);
    },
    getTheme() { return load(STORAGE_KEYS.theme, 'light'); },
    setTheme(t) {
      save(STORAGE_KEYS.theme, t);
      document.documentElement.classList.toggle('dark', t === 'dark');
      return t;
    },
    getPosts() { return posts; },
    addPost(post) {
      const newPost = { id: getNextId(posts), authorId: user.id, createdAt: new Date().toISOString(), ...post };
      posts.push(newPost);
      save(STORAGE_KEYS.posts, posts);
      return newPost;
    },
    updatePost(postId, updates) {
      const i = posts.findIndex((p) => p.id === postId);
      if (i === -1) return null;
      posts[i] = { ...posts[i], ...updates };
      save(STORAGE_KEYS.posts, posts);
      return posts[i];
    },
    getPost(postId) { return posts.find((p) => p.id === postId) || null; },
    getRequests() { return requests; },
    addRequest(req) {
      const newReq = { id: getNextId(requests), status: 'pending', createdAt: new Date().toISOString(), ...req };
      requests.push(newReq);
      save(STORAGE_KEYS.requests, requests);
      return newReq;
    },
    updateRequest(reqId, updates) {
      const i = requests.findIndex((r) => r.id === reqId);
      if (i === -1) return null;
      requests[i] = { ...requests[i], ...updates };
      save(STORAGE_KEYS.requests, requests);
      return requests[i];
    },
    getUpvotes() { return upvotes; },
    toggleUpvote(postId) {
      const userId = user?.id;
      if (!userId) return false;
      const i = upvotes.findIndex((u) => u.postId === postId && u.userId === userId);
      if (i >= 0) upvotes.splice(i, 1);
      else upvotes.push({ postId, userId });
      save(STORAGE_KEYS.upvotes, upvotes);
      return true;
    },
    getUpvoteCount(postId) { return upvotes.filter((u) => u.postId === postId).length; },
    hasUserUpvoted(postId) { return user && upvotes.some((u) => u.postId === postId && u.userId === user.id); },
    getContacts() { return contacts.filter((c) => c.ownerId === user?.id).map((c) => c.contactId); },
    addContact(contactId) {
      if (!user || contacts.some((c) => c.ownerId === user.id && c.contactId === contactId)) return;
      contacts.push({ ownerId: user.id, contactId });
      save(STORAGE_KEYS.contacts, contacts);
    },
    getConversations() {
      const uid = user?.id;
      if (!uid) return [];
      return conversations.filter((c) => c.participants.indexOf(uid) >= 0).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    },
    getOrCreateConversation(otherUserId) {
      const uid = user?.id;
      if (!uid || uid === otherUserId) return null;
      const participants = [uid, otherUserId].sort();
      let conv = conversations.find((c) => c.participants[0] === participants[0] && c.participants[1] === participants[1]);
      if (!conv) {
        conv = { id: getNextId(conversations), participants, updatedAt: new Date().toISOString() };
        conversations.push(conv);
        save(STORAGE_KEYS.conversations, conversations);
      }
      return conv;
    },
    getMessages(conversationId) {
      return messages.filter((m) => m.conversationId === conversationId).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    },
    sendMessage(conversationId, text) {
      const conv = conversations.find((c) => c.id === conversationId);
      if (!conv || !user) return null;
      const msg = { id: getNextId(messages), conversationId, fromUserId: user.id, text, createdAt: new Date().toISOString() };
      messages.push(msg);
      conv.updatedAt = msg.createdAt;
      save(STORAGE_KEYS.messages, messages);
      save(STORAGE_KEYS.conversations, conversations);
      return msg;
    },
    getGroups() {
      const uid = user?.id;
      if (!uid) return [];
      const myGroupIds = groupMembers.filter((m) => m.userId === uid).map((m) => m.groupId);
      return groups.filter((g) => myGroupIds.indexOf(g.id) >= 0).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    },
    createGroup(name, memberIds) {
      if (!user) return null;
      const id = getNextId(groups);
      groups.push({ id, name, createdBy: user.id, createdAt: new Date().toISOString() });
      groupMembers.push({ groupId: id, userId: user.id });
      memberIds.forEach((uid) => { if (uid !== user.id) groupMembers.push({ groupId: id, userId: uid }); });
      save(STORAGE_KEYS.groups, groups);
      save(STORAGE_KEYS.groupMembers, groupMembers);
      return groups.find((g) => g.id === id);
    },
    getGroupMembers(groupId) {
      return groupMembers.filter((m) => m.groupId === groupId).map((m) => m.userId);
    },
    addGroupMember(groupId, userId) {
      if (groupMembers.some((m) => m.groupId === groupId && m.userId === userId)) return;
      groupMembers.push({ groupId, userId });
      save(STORAGE_KEYS.groupMembers, groupMembers);
    },
    getGroupMessages(groupId) {
      return groupMessages.filter((m) => m.groupId === groupId).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    },
    sendGroupMessage(groupId, text) {
      if (!user) return null;
      const msg = { id: getNextId(groupMessages), groupId, fromUserId: user.id, text, createdAt: new Date().toISOString() };
      groupMessages.push(msg);
      save(STORAGE_KEYS.groupMessages, groupMessages);
      return msg;
    }
  };
})();

var CampThread = UniThread;
