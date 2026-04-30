// Supabase でデータベース操作を実装（Firestore からの移行）
// エクスポートする関数名は変えていないので他ファイルのインポートは変更不要
import { supabase } from '../supabase/client';

// ============================================================
// ユーザープロフィール
// ============================================================

const mapUser = (row) => ({
  uid: row.uid,
  email: row.email,
  nickname: row.nickname,
  agreedToTerms: row.agreed_to_terms,
  villageProfileCompleted: row.village_profile_completed,
  stutterType: row.stutter_type,
  stutterTypeOther: row.stutter_type_other,
  difficultSoundsTop3: row.difficult_sounds_top3,
  villagerNoNumeric: row.villager_no_numeric,
  villagerNo: row.villager_no,
  lastLoginAt: row.last_login_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createOrMergeUserProfile = async (uid, data) => {
  const row = { uid };
  if (data.nickname !== undefined) row.nickname = data.nickname;
  if (data.agreedToTerms !== undefined) row.agreed_to_terms = data.agreedToTerms;
  if (data.email !== undefined) row.email = data.email;
  const { error } = await supabase.from('users').upsert(row, { onConflict: 'uid' });
  if (error) throw error;
};

export const updateLastLoginAt = async (uid) => {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({ uid, last_login_at: new Date().toISOString() }, { onConflict: 'uid' });
    if (error) throw error;
  } catch {
    // onboarding 前はレコード未作成の場合があるため無視
  }
};

export const getUserProfile = async (uid) => {
  const { data } = await supabase.from('users').select('*').eq('uid', uid).single();
  return data ? mapUser(data) : null;
};

// ============================================================
// 村人統計
// ============================================================

export const getVillageStats = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [totalRes, recentRes] = await Promise.all([
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('agreed_to_terms', true)
      .not('nickname', 'is', null)
      .neq('nickname', ''),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('agreed_to_terms', true)
      .gte('last_login_at', sevenDaysAgo),
  ]);
  return {
    totalVillagers: totalRes.count ?? 0,
    recentVillagers: recentRes.count ?? 0,
  };
};

// ============================================================
// 広場：投稿
// ============================================================

const mapPost = (row) => ({
  id: row.id,
  text: row.text,
  authorUid: row.author_uid,
  authorName: row.author_name,
  likeCount: row.like_count,
  reportCount: row.report_count,
  isHidden: row.is_hidden,
  createdAt: row.created_at,
});

export const createPost = async ({ text, authorUid, authorName }) => {
  const { error } = await supabase
    .from('posts')
    .insert({ text, author_uid: authorUid, author_name: authorName });
  if (error) throw error;
};

export const subscribeVisiblePosts = (callback) => {
  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });
    callback((data || []).map(mapPost));
  };
  fetchPosts();
  const channel = supabase
    .channel('visible-posts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
    .subscribe();
  return () => supabase.removeChannel(channel);
};

export const deleteOwnPost = async (postId) => {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
};

export const toggleLike = async (postId, uid) => {
  const { data, error } = await supabase.rpc('toggle_post_like', {
    p_post_id: postId,
    p_user_uid: uid,
  });
  if (error) throw error;
  return data;
};

export const checkLiked = async (postId, uid) => {
  const { data } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_uid', uid)
    .maybeSingle();
  return !!data;
};

export const reportPost = async (postId, uid) => {
  const { error } = await supabase.rpc('report_post', {
    p_post_id: postId,
    p_user_uid: uid,
  });
  if (error) {
    if (error.message?.includes('already_reported')) throw new Error('already_reported');
    if (error.message?.includes('post_not_found')) throw new Error('post_not_found');
    throw error;
  }
};

// ============================================================
// 図書館：書評
// ============================================================

const mapReview = (row) => ({
  id: row.id,
  bookId: row.book_id,
  quote: row.quote,
  feeling: row.feeling,
  authorUid: row.author_uid,
  authorName: row.author_name,
  createdAt: row.created_at,
});

export const createBookReview = async ({ bookId, quote, feeling, authorUid, authorName }) => {
  const { error } = await supabase.from('book_reviews').insert({
    book_id: bookId,
    quote,
    feeling,
    author_uid: authorUid,
    author_name: authorName,
  });
  if (error) throw error;
};

export const subscribeBookReviews = (bookId, callback) => {
  const fetchReviews = async () => {
    const { data } = await supabase
      .from('book_reviews')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });
    callback((data || []).map(mapReview));
  };
  fetchReviews();
  const channel = supabase
    .channel(`book-reviews-${bookId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'book_reviews', filter: `book_id=eq.${bookId}` },
      fetchReviews,
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
};

export const deleteOwnBookReview = async (reviewId) => {
  const { error } = await supabase.from('book_reviews').delete().eq('id', reviewId);
  if (error) throw error;
};

export const getMyBookReviews = async (uid) => {
  const { data } = await supabase
    .from('book_reviews')
    .select('*')
    .eq('author_uid', uid)
    .order('created_at', { ascending: false });
  return (data || []).map(mapReview);
};

// ============================================================
// 映画館：映画レビュー
// ============================================================

const mapMovieReview = (row) => ({
  id: row.id,
  movieId: row.movie_id,
  scene: row.scene,
  feeling: row.feeling,
  authorUid: row.author_uid,
  authorName: row.author_name,
  createdAt: row.created_at,
});

export const createMovieReview = async ({ movieId, scene, feeling, authorUid, authorName }) => {
  const { error } = await supabase.from('movie_reviews').insert({
    movie_id: movieId,
    scene,
    feeling,
    author_uid: authorUid,
    author_name: authorName,
  });
  if (error) throw error;
};

export const subscribeMovieReviews = (movieId, callback) => {
  const fetchReviews = async () => {
    const { data } = await supabase
      .from('movie_reviews')
      .select('*')
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false });
    callback((data || []).map(mapMovieReview));
  };
  fetchReviews();
  const channel = supabase
    .channel(`movie-reviews-${movieId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'movie_reviews', filter: `movie_id=eq.${movieId}` },
      fetchReviews,
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
};

export const deleteOwnMovieReview = async (reviewId) => {
  const { error } = await supabase.from('movie_reviews').delete().eq('id', reviewId);
  if (error) throw error;
};

export const getMyMovieReviews = async (uid) => {
  const { data } = await supabase
    .from('movie_reviews')
    .select('*')
    .eq('author_uid', uid)
    .order('created_at', { ascending: false });
  return (data || []).map(mapMovieReview);
};

// ============================================================
// 自分の家：できたことストック
// ============================================================

const CROP_TYPES = ['carrot', 'potato', 'cabbage'];

const mapStock = (row) => ({
  id: row.id,
  text: row.text,
  crop: row.crop ?? 'carrot',
  authorUid: row.author_uid,
  createdAt: row.created_at,
});

export const createSelfEsteemStock = async ({ text, authorUid }) => {
  const crop = CROP_TYPES[Math.floor(Math.random() * CROP_TYPES.length)];
  const { error } = await supabase
    .from('self_esteem_stocks')
    .insert({ text, author_uid: authorUid, crop });
  if (error) throw error;
  await supabase.rpc('add_crop_to_inventory', { p_user_uid: authorUid, p_crop: crop });
};

export const subscribeMySelfEsteemStocks = (uid, callback) => {
  const fetchStocks = async () => {
    const { data } = await supabase
      .from('self_esteem_stocks')
      .select('*')
      .eq('author_uid', uid)
      .order('created_at', { ascending: false });
    callback((data || []).map(mapStock));
  };
  fetchStocks();
  const channel = supabase
    .channel(`stocks-${uid}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'self_esteem_stocks',
        filter: `author_uid=eq.${uid}`,
      },
      fetchStocks,
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
};

export const deleteMySelfEsteemStock = async (stockId) => {
  const { error } = await supabase.from('self_esteem_stocks').delete().eq('id', stockId);
  if (error) throw error;
};

// ============================================================
// 農作物インベントリ
// ============================================================

export const subscribeCropInventory = (uid, callback) => {
  const fetch = async () => {
    const { data } = await supabase
      .from('crop_inventory')
      .select('*')
      .eq('user_uid', uid)
      .maybeSingle();
    callback({
      carrot:  data?.carrot_count  ?? 0,
      potato:  data?.potato_count  ?? 0,
      cabbage: data?.cabbage_count ?? 0,
    });
  };
  fetch();
  const channel = supabase
    .channel(`inventory-${uid}`)
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'crop_inventory',
      filter: `user_uid=eq.${uid}`,
    }, fetch)
    .subscribe();
  return () => supabase.removeChannel(channel);
};

// ============================================================
// 広場：農作物ギフト
// ============================================================

export const subscribePostCropGifts = (callback) => {
  const fetch = async () => {
    const { data } = await supabase
      .from('post_crop_gifts')
      .select('post_id, crop');
    const counts = {};
    (data || []).forEach(({ post_id, crop }) => {
      if (!counts[post_id]) counts[post_id] = { carrot: 0, potato: 0, cabbage: 0 };
      counts[post_id][crop] = (counts[post_id][crop] || 0) + 1;
    });
    callback(counts);
  };
  fetch();
  const channel = supabase
    .channel('post-crop-gifts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'post_crop_gifts' }, fetch)
    .subscribe();
  return () => supabase.removeChannel(channel);
};

export const giveCropToPost = async (postId, giverUid, crop) => {
  const { error } = await supabase.rpc('give_crop_to_post', {
    p_post_id:   postId,
    p_giver_uid: giverUid,
    p_crop:      crop,
  });
  if (error) {
    if (error.message?.includes('not_enough_crops')) throw new Error('not_enough_crops');
    throw error;
  }
};
