import { supabase } from '../supabase/client';

export const toggleDesertWater = async (storyId: string, userUid: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('toggle_desert_water', {
    p_story_id: storyId,
    p_user_uid: userUid,
  });
  if (error) throw error;
  return data as boolean;
};

export const checkWatered = async (storyId: string, userUid: string): Promise<boolean> => {
  const { data } = await supabase
    .from('desert_story_waters')
    .select('story_id')
    .eq('story_id', storyId)
    .eq('user_uid', userUid)
    .maybeSingle();
  return !!data;
};
