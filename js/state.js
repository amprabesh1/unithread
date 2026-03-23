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
    theme: 'unithread_theme',
    backendSeeded: 'unithread_backend_demo_seeded'
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
    { id: '11', authorId: 'demo-1', type: 'post', status: 'posted', title: 'Anyone else hyped for the game this weekend?', content: 'Tailgate at 2pm. Let\'s go!', createdAt: pastDate(10) },
    { id: '12', authorId: 'demo-3', type: 'post', status: 'posted', title: 'I set 14 alarms for my 8:00 class and still woke up at 8:17', content: 'At this point my phone alarm and I are in a toxic relationship. It screams, I snooze, we repeat. If anyone saw a person speed-walking across campus with one shoe untied and a granola bar in hand, that was me trying to make attendance before the professor\'s dramatic door close.', createdAt: pastDate(14) },
    { id: '13', authorId: 'demo-4', type: 'post', status: 'posted', title: 'Group project update: we have a logo, a playlist, and absolutely no slides', content: 'Our team meeting started as \"quick planning\" and somehow became 40 minutes debating whether Comic Sans is ironic enough. We now have snacks, vibes, and one person who keeps saying \"we cookin\" while not opening the document. Presentation is tomorrow, confidence is high, productivity is medium, and caffeine is carrying the whole GPA.', createdAt: pastDate(18) },
    { id: '14', authorId: 'demo-2', type: 'post', status: 'posted', title: 'Dining hall mystery pasta defeated me, but my confidence remains undefeated', content: 'I walked in saying \"today I will eat balanced and responsible.\" Fifteen minutes later I had three garlic breads, mystery pasta, two cookies, and a lemonade that definitely has enough sugar to power a small city. If anyone sees me speed-waddling to class while pretending I am late (I am not), please mind your business and wish my stomach luck.', imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=80', createdAt: pastDate(22) },
    { id: '15', authorId: 'demo-1', type: 'post', status: 'posted', title: 'Library floor 3 is not a floor, it is a survival game with Wi-Fi', content: 'I went up there to \"focus for one hour\" and somehow entered a side quest where my laptop battery hit 7%, my charger vanished, and the one outlet near me was already occupied by someone charging a laptop, a tablet, a phone, and probably a toaster. If you hear someone whispering \"just one more chapter\" at midnight, that is me bargaining with the universe.', imageUrl: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=1400&q=80', createdAt: pastDate(28) },
    { id: '16', authorId: 'demo-3', type: 'post', status: 'posted', title: 'My roommate said \"let’s do laundry early\" and now it is a campus documentary', content: 'We started at 8:30 with high hopes and matching hampers, and now it is 11:45 and we are in episode four of \"Why is every dryer occupied by exactly one sock and a hoodie\". We have made alliances, lost quarters, and learned that folding clothes immediately is apparently a myth. If anyone has elite laundry timing strategy, please coach us before finals week.', imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80', createdAt: pastDate(34) }
  ];

  function mergeMissingDemoPosts() {
    const existing = new Set(posts.map((p) => String(p.id)));
    let changed = false;
    DEMO_POSTS.forEach((p) => {
      if (!existing.has(String(p.id))) {
        posts.push({ ...p });
        changed = true;
      }
    });
    if (changed) save(STORAGE_KEYS.posts, posts);
  }

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
  mergeMissingDemoPosts();
  var savedTheme = load(STORAGE_KEYS.theme, 'light');
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }

  function getNextId(arr) {
    const max = arr.length ? Math.max(...arr.map((x) => (x.id ? parseInt(x.id, 10) : 0))) : 0;
    return String(max + 1);
  }

  function hasBackend() {
    return !!(window.SupaClient && window.SupaClient.client);
  }

  function toUiPost(row) {
    return {
      id: row.id,
      authorId: row.author_id,
      type: row.type,
      status: row.status,
      title: row.title || '',
      content: row.content || '',
      imageUrl: row.image_url || null,
      destination: row.destination || '',
      dateTime: row.date_time || '',
      seats: row.seats,
      priceSplit: row.price_split,
      description: row.description || '',
      category: row.category || '',
      estimatedEffort: row.estimated_effort || '',
      compensation: row.compensation || '',
      location: row.location || '',
      issueDescription: row.issue_description || '',
      urgency: row.urgency || '',
      createdAt: row.created_at
    };
  }

  function toUiRequest(row) {
    return {
      id: row.id,
      postId: row.post_id,
      fromUserId: row.from_user_id,
      type: row.type,
      status: row.status,
      createdAt: row.created_at
    };
  }

  function buildBackendDemoPosts() {
    return [
      { type: 'post', status: 'posted', title: 'Campus starter thread: introduce yourself', content: 'Drop your major, year, and one thing you wish you knew before semester started. New students keep finding this thread helpful.', createdAt: pastDate(1), imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80' },
      { type: 'ride', status: 'open', destination: 'Nashville Airport', dateTime: '2026-03-29T15:30', seats: 3, priceSplit: 8, title: 'Airport ride this Sunday', createdAt: pastDate(2) },
      { type: 'task', status: 'open', description: 'Need help carrying mini-fridge + two boxes from parking lot to dorm. Should take around 25 minutes.', category: 'Moving', estimatedEffort: '30 mins', compensation: '$15 + coffee', title: 'Quick dorm move-in help needed', createdAt: pastDate(3) },
      { type: 'maintenance', status: 'reported', location: 'Library 2nd floor', issueDescription: 'Study room AC is blowing warm air and gets stuffy fast during evening hours.', urgency: 'High', title: 'AC issue in library study room', createdAt: pastDate(4) },
      { type: 'post', status: 'posted', title: 'Confession: I opened Canvas for motivation and accidentally took a 2-hour nap', content: 'Sat down to plan my week, saw five due dates, closed laptop \"for a mental reset,\" woke up at 6:40pm with one sock on and zero progress. If anyone has a real study schedule that actually works, please share before my GPA files a missing person report.', createdAt: pastDate(6), imageUrl: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=1400&q=80' },
      { type: 'ride', status: 'open', destination: 'Walmart + Target run', dateTime: '2026-03-27T18:00', seats: 2, priceSplit: 5, title: 'Evening grocery run', createdAt: pastDate(8) },
      { type: 'task', status: 'open', description: 'Looking for someone strong in Calculus II for a 1-hour review before quiz. I have notes and snacks.', category: 'Tutoring', estimatedEffort: '1 hour', compensation: '$20', title: 'Calc II review partner needed', createdAt: pastDate(10) },
      { type: 'maintenance', status: 'reported', location: 'Student Center, east entrance', issueDescription: 'Water fountain bottle filler is not working. Screen is on but no water flow.', urgency: 'Medium', title: 'Water fountain not dispensing', createdAt: pastDate(14) }
    ];
  }

  async function seedBackendIfEmpty() {
    if (!hasBackend() || !user?.id) return false;
    const seeded = load(STORAGE_KEYS.backendSeeded, false);
    if (seeded) return false;
    const existing = await window.SupaClient.listPosts();
    if ((existing || []).length) {
      save(STORAGE_KEYS.backendSeeded, true);
      return false;
    }
    const demo = buildBackendDemoPosts();
    for (const p of demo) {
      await window.SupaClient.createPost(p, user.id);
    }
    save(STORAGE_KEYS.backendSeeded, true);
    return true;
  }

  async function syncProfilesForPostsAndRequests() {
    if (!hasBackend()) return;
    const ids = []
      .concat(posts.map((p) => p.authorId))
      .concat(requests.map((r) => r.fromUserId))
      .filter(Boolean);
    if (!ids.length) return;
    const map = await window.SupaClient.getProfilesMapByIds(ids);
    const users = Object.values(map).map((p) => ({
      id: p.id,
      email: p.email,
      displayName: p.display_name || 'Student',
      photoUrl: p.photo_url || null,
      verified: !!p.verified
    }));
    if (users.length) save('campthread_users', users);
  }

  async function syncFromBackend() {
    if (!hasBackend()) return;
    const seeded = await seedBackendIfEmpty();
    const rows = await window.SupaClient.listPosts();
    posts = rows.map(toUiPost);
    if (seeded && !posts.length) {
      const secondRead = await window.SupaClient.listPosts();
      posts = secondRead.map(toUiPost);
    }
    save(STORAGE_KEYS.posts, posts);
    const reqRows = await window.SupaClient.listRequests();
    requests = reqRows.map(toUiRequest);
    save(STORAGE_KEYS.requests, requests);
    const voteRows = await window.SupaClient.listVotes();
    upvotes = voteRows
      .filter((v) => v.vote_type === 1)
      .map((v) => ({ postId: v.post_id, userId: v.user_id }));
    save(STORAGE_KEYS.upvotes, upvotes);
    await syncProfilesForPostsAndRequests();
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
    async syncFromBackend() {
      await syncFromBackend();
      return { posts, requests, upvotes };
    },
    async addPost(post) {
      if (hasBackend() && user?.id) {
        const created = await window.SupaClient.createPost(post, user.id);
        const uiPost = toUiPost(created);
        posts.unshift(uiPost);
        save(STORAGE_KEYS.posts, posts);
        await syncProfilesForPostsAndRequests();
        return uiPost;
      }
      const newPost = { id: getNextId(posts), authorId: user.id, createdAt: new Date().toISOString(), ...post };
      posts.push(newPost);
      save(STORAGE_KEYS.posts, posts);
      return newPost;
    },
    async updatePost(postId, updates) {
      if (hasBackend()) {
        const updated = await window.SupaClient.updatePost(postId, updates);
        const ui = toUiPost(updated);
        const ix = posts.findIndex((p) => p.id === postId);
        if (ix >= 0) posts[ix] = ui;
        save(STORAGE_KEYS.posts, posts);
        return ui;
      }
      const i = posts.findIndex((p) => p.id === postId);
      if (i === -1) return null;
      posts[i] = { ...posts[i], ...updates };
      save(STORAGE_KEYS.posts, posts);
      return posts[i];
    },
    getPost(postId) { return posts.find((p) => p.id === postId) || null; },
    getRequests() { return requests; },
    async addRequest(req) {
      const uid = user?.id;
      if (!uid) return null;
      const post = posts.find((p) => p.id === req.postId);
      if (!post || post.authorId === uid) return null;
      const existing = requests.find((r) =>
        r.postId === req.postId &&
        r.fromUserId === uid &&
        (r.status === 'pending' || r.status === 'accepted')
      );
      if (existing) return existing;
      if (hasBackend()) {
        try {
          const created = await window.SupaClient.createRequest({ postId: req.postId, type: req.type }, uid);
          const uiReq = toUiRequest(created);
          requests.unshift(uiReq);
          save(STORAGE_KEYS.requests, requests);
          return uiReq;
        } catch (_) {
          return existing || null;
        }
      }
      const newReq = { id: getNextId(requests), status: 'pending', createdAt: new Date().toISOString(), ...req };
      requests.push(newReq);
      save(STORAGE_KEYS.requests, requests);
      return newReq;
    },
    async updateRequest(reqId, updates) {
      if (hasBackend()) {
        const updated = await window.SupaClient.updateRequest(reqId, updates);
        const ui = toUiRequest(updated);
        const ix = requests.findIndex((r) => r.id === reqId);
        if (ix >= 0) requests[ix] = ui;
        save(STORAGE_KEYS.requests, requests);
        return ui;
      }
      const i = requests.findIndex((r) => r.id === reqId);
      if (i === -1) return null;
      requests[i] = { ...requests[i], ...updates };
      save(STORAGE_KEYS.requests, requests);
      return requests[i];
    },
    getUpvotes() { return upvotes; },
    async toggleUpvote(postId) {
      const userId = user?.id;
      if (!userId) return false;
      if (hasBackend()) {
        const existing = await window.SupaClient.listVotes();
        const mine = existing.find((v) => v.post_id === postId && v.user_id === userId && v.vote_type === 1);
        await window.SupaClient.setVote(postId, userId, mine ? null : 1);
        await syncFromBackend();
        return true;
      }
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
