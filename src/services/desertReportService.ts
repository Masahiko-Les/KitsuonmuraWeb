import { supabase } from '../supabase/client';

export const reportDesertStory = async (
  storyId: string,
  reporterUid: string,
  reason = '',
): Promise<void> => {
  const { error } = await supabase.rpc('report_desert_story', {
    p_story_id: storyId,
    p_reporter_uid: reporterUid,
    p_reason: reason,
  });
  if (error) {
    if (error.message?.includes('already_reported')) throw new Error('already_reported');
    if (error.message?.includes('story_not_found')) throw new Error('story_not_found');
    throw error;
  }
};
