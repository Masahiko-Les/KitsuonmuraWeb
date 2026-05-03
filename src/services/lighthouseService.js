import { supabase } from '../supabase/client';

export const getMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getPeriod = () => {
  const day = new Date().getDate();
  if (day <= 10) return 'early';
  if (day >= 21) return 'late';
  return 'mid';
};

const mapChallenge = (row) => ({
  id:         row.id,
  authorUid:  row.author_uid,
  authorName: row.author_name,
  month:      row.month,
  pledge:     row.pledge,
  result:     row.result,
  createdAt:  row.created_at,
  resultAt:   row.result_at,
});

export const subscribeThisMonthChallenges = (callback) => {
  const month = getMonthKey();
  const fetch = async () => {
    const { data } = await supabase
      .from('lighthouse_challenges')
      .select('*')
      .eq('month', month)
      .order('created_at', { ascending: false });
    callback((data || []).map(mapChallenge));
  };
  fetch();
  const channel = supabase
    .channel('lighthouse-challenges')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lighthouse_challenges' }, fetch)
    .subscribe();
  return () => supabase.removeChannel(channel);
};

export const createPledge = async ({ authorUid, authorName, pledge }) => {
  const { error } = await supabase
    .from('lighthouse_challenges')
    .insert({ author_uid: authorUid, author_name: authorName, month: getMonthKey(), pledge });
  if (error) {
    if (error.code === '23505') throw new Error('already_pledged');
    throw error;
  }
};

export const addResult = async (challengeId, result) => {
  const { error } = await supabase
    .from('lighthouse_challenges')
    .update({ result, result_at: new Date().toISOString() })
    .eq('id', challengeId);
  if (error) throw error;
};

export const subscribeLighthouseCropGifts = (callback) => {
  const fetch = async () => {
    const { data } = await supabase
      .from('lighthouse_crop_gifts')
      .select('challenge_id, crop');
    const counts = {};
    (data || []).forEach(({ challenge_id, crop }) => {
      if (!counts[challenge_id]) counts[challenge_id] = { carrot: 0, potato: 0, cabbage: 0 };
      counts[challenge_id][crop] = (counts[challenge_id][crop] || 0) + 1;
    });
    callback(counts);
  };
  fetch();
  const channel = supabase
    .channel('lighthouse-crop-gifts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lighthouse_crop_gifts' }, fetch)
    .subscribe();
  return () => supabase.removeChannel(channel);
};

export const giveCropToChallenge = async (challengeId, giverUid, crop) => {
  const { error } = await supabase.rpc('give_crop_to_challenge', {
    p_challenge_id: challengeId,
    p_giver_uid:    giverUid,
    p_crop:         crop,
  });
  if (error) {
    if (error.message?.includes('not_enough_crops')) throw new Error('not_enough_crops');
    throw error;
  }
};
