(function () {
  const cfg = (window.__SUPABASE_CONFIG || {});
  const SUPABASE_URL = cfg.url || 'https://nppupauculwqoawgiytm.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = cfg.publishableKey || 'sb_publishable_F3NXH9ilx7idA_WncwMgxQ_j_SGs7yk';

  function hasSupabase() {
    return !!(window.supabase && window.supabase.createClient);
  }

  const client = hasSupabase()
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    : null;

  async function getSessionUser() {
    if (!client) return null;
    const { data } = await client.auth.getUser();
    return data && data.user ? data.user : null;
  }

  async function signUp(email, password, displayName) {
    if (!client) return { error: new Error('Supabase client unavailable') };
    return client.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || '' },
        emailRedirectTo: window.location.origin + window.location.pathname + '#login'
      }
    });
  }

  async function signIn(email, password) {
    if (!client) return { error: new Error('Supabase client unavailable') };
    return client.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    if (!client) return { error: new Error('Supabase client unavailable') };
    return client.auth.signOut();
  }

  async function sendReset(email) {
    if (!client) return { error: new Error('Supabase client unavailable') };
    return client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname + '#login'
    });
  }

  async function updatePassword(password) {
    if (!client) return { error: new Error('Supabase client unavailable') };
    return client.auth.updateUser({ password: password });
  }

  async function ensureProfile(user, displayName) {
    if (!client || !user) return null;
    const fallbackName = (displayName || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Student');
    const payload = {
      id: user.id,
      email: user.email || null,
      display_name: fallbackName,
      verified: !!user.email_confirmed_at
    };
    await client.from('profiles').upsert(payload, { onConflict: 'id' });
    return payload;
  }

  async function getProfilesMapByIds(ids) {
    if (!client || !ids || !ids.length) return {};
    const unique = Array.from(new Set(ids));
    const { data } = await client.from('profiles').select('*').in('id', unique);
    const map = {};
    (data || []).forEach((p) => { map[p.id] = p; });
    return map;
  }

  async function listPosts() {
    if (!client) return [];
    const { data, error } = await client
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function createPost(payload, userId) {
    if (!client) throw new Error('Supabase client unavailable');
    const row = {
      author_id: userId,
      type: payload.type,
      status: payload.status,
      title: payload.title || null,
      content: payload.content || null,
      image_url: payload.imageUrl || payload.photoUrl || null,
      destination: payload.destination || null,
      date_time: payload.dateTime || null,
      seats: payload.seats != null ? payload.seats : null,
      price_split: payload.priceSplit != null ? payload.priceSplit : null,
      description: payload.description || null,
      category: payload.category || null,
      estimated_effort: payload.estimatedEffort || null,
      compensation: payload.compensation || null,
      location: payload.location || null,
      issue_description: payload.issueDescription || null,
      urgency: payload.urgency || null
    };
    const { data, error } = await client.from('posts').insert(row).select().single();
    if (error) throw error;
    return data;
  }

  async function updatePost(postId, updates) {
    if (!client) throw new Error('Supabase client unavailable');
    const mapped = {};
    if (Object.prototype.hasOwnProperty.call(updates, 'status')) mapped.status = updates.status;
    const { data, error } = await client.from('posts').update(mapped).eq('id', postId).select().single();
    if (error) throw error;
    return data;
  }

  async function listRequests() {
    if (!client) return [];
    const { data, error } = await client.from('requests').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function createRequest(payload, userId) {
    if (!client) throw new Error('Supabase client unavailable');
    const { data, error } = await client
      .from('requests')
      .insert({
        post_id: payload.postId,
        from_user_id: userId,
        type: payload.type,
        status: 'pending'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateRequest(requestId, updates) {
    if (!client) throw new Error('Supabase client unavailable');
    const { data, error } = await client.from('requests').update(updates).eq('id', requestId).select().single();
    if (error) throw error;
    return data;
  }

  async function listVotes() {
    if (!client) return [];
    const { data, error } = await client.from('post_votes').select('*');
    if (error) throw error;
    return data || [];
  }

  async function setVote(postId, userId, voteType) {
    if (!client) throw new Error('Supabase client unavailable');
    const existing = await client.from('post_votes').select('*').eq('post_id', postId).eq('user_id', userId).maybeSingle();
    if (existing.error && existing.error.code !== 'PGRST116') throw existing.error;
    if (!voteType) {
      if (existing.data) await client.from('post_votes').delete().eq('id', existing.data.id);
      return null;
    }
    if (existing.data) {
      const { data, error } = await client.from('post_votes').update({ vote_type: voteType }).eq('id', existing.data.id).select().single();
      if (error) throw error;
      return data;
    }
    const { data, error } = await client.from('post_votes').insert({ post_id: postId, user_id: userId, vote_type: voteType }).select().single();
    if (error) throw error;
    return data;
  }

  async function listComments(postId) {
    if (!client) return [];
    const q = client.from('post_comments').select('*').order('created_at', { ascending: true });
    const { data, error } = postId ? await q.eq('post_id', postId) : await q;
    if (error) throw error;
    return data || [];
  }

  async function addComment(postId, userId, content) {
    if (!client) throw new Error('Supabase client unavailable');
    const { data, error } = await client
      .from('post_comments')
      .insert({ post_id: postId, user_id: userId, content: content })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function uploadPostImage(file, userId) {
    if (!client || !file) return null;
    const ext = (file.name && file.name.split('.').pop()) || 'jpg';
    const path = userId + '/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext;
    const { error } = await client.storage.from('post-images').upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = client.storage.from('post-images').getPublicUrl(path);
    return data && data.publicUrl ? data.publicUrl : null;
  }

  window.SupaClient = {
    client,
    hasSupabase,
    getSessionUser,
    signUp,
    signIn,
    signOut,
    sendReset,
    updatePassword,
    ensureProfile,
    getProfilesMapByIds,
    listPosts,
    createPost,
    updatePost,
    listRequests,
    createRequest,
    updateRequest,
    listVotes,
    setVote,
    listComments,
    addComment,
    uploadPostImage
  };
})();
