import { supabase } from '../supabase/client';
import { DesertStory } from '../types/desertStory';
import { mapStory } from './desertStoryService';

export const toggleDesertFavorite = async (storyId: string, userUid: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('toggle_desert_favorite', {
    p_story_id: storyId,
    p_user_uid: userUid,
  });
  if (error) throw error;
  return data as boolean;
};

export const checkFavorited = async (storyId: string, userUid: string): Promise<boolean> => {
  const { data } = await supabase
    .from('desert_story_favorites')
    .select('story_id')
    .eq('story_id', storyId)
    .eq('user_uid', userUid)
    .maybeSingle();
  return !!data;
};

export const getMyFavoriteStories = async (userUid: string): Promise<DesertStory[]> => {
  // desert_story_favorites と desert_stories を JOIN して一括取得
  const { data } = await supabase
    .from('desert_story_favorites')
    .select('story_id, desert_stories!inner(*)')
    .eq('user_uid', userUid);

  if (!data) return [];

  return (data as unknown[])
    .map((row: unknown) => mapStory((row as Record<string, unknown>).desert_stories as Record<string, unknown>))
    .filter((s) => !s.isDeleted && s.status === 'published' && !s.blockedByModeration);
};
