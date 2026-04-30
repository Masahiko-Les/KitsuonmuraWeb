import { supabase } from '../supabase/client';
import { DesertStory, DesertStoryFormData, DesertStoryStatus } from '../types/desertStory';

const COL = 'desert_stories';

export const mapStory = (row: Record<string, unknown>): DesertStory => ({
  id: row.id as string,
  authorUid: row.author_uid as string,
  authorNickname: row.author_nickname as string,
  title: row.title as string,
  hardshipText: row.hardship_text as string,
  facingText: row.facing_text as string,
  overcomeText: row.overcome_text as string,
  status: row.status as DesertStoryStatus,
  waterCount: row.water_count as number,
  favoriteCount: row.favorite_count as number,
  reportCount: row.report_count as number,
  isDeleted: row.is_deleted as boolean,
  blockedByModeration: row.blocked_by_moderation as boolean,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  publishedAt: row.published_at ?? null,
});

interface CreateInput extends DesertStoryFormData {
  authorUid: string;
  authorNickname: string;
  status: DesertStoryStatus;
}

export const createDesertStory = async (data: CreateInput) => {
  const { error } = await supabase.from(COL).insert({
    author_uid: data.authorUid,
    author_nickname: data.authorNickname,
    title: data.title,
    hardship_text: data.hardshipText,
    facing_text: data.facingText,
    overcome_text: data.overcomeText,
    status: data.status,
    ...(data.status === 'published' && { published_at: new Date().toISOString() }),
  });
  if (error) throw error;
};

export const updateDesertStory = async (
  storyId: string,
  fields: Partial<DesertStoryFormData & { status: DesertStoryStatus }>,
) => {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (fields.title !== undefined) updates.title = fields.title;
  if (fields.hardshipText !== undefined) updates.hardship_text = fields.hardshipText;
  if (fields.facingText !== undefined) updates.facing_text = fields.facingText;
  if (fields.overcomeText !== undefined) updates.overcome_text = fields.overcomeText;
  if (fields.status !== undefined) {
    updates.status = fields.status;
    if (fields.status === 'published') updates.published_at = new Date().toISOString();
  }
  const { error } = await supabase.from(COL).update(updates).eq('id', storyId);
  if (error) throw error;
};

export const softDeleteDesertStory = async (storyId: string) => {
  const { error } = await supabase
    .from(COL)
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', storyId);
  if (error) throw error;
};

export const getStoryById = async (storyId: string): Promise<DesertStory | null> => {
  const { data } = await supabase.from(COL).select('*').eq('id', storyId).single();
  return data ? mapStory(data) : null;
};

export const getPublishedStories = async (): Promise<DesertStory[]> => {
  const { data } = await supabase
    .from(COL)
    .select('*')
    .eq('status', 'published')
    .eq('is_deleted', false)
    .eq('blocked_by_moderation', false)
    .order('published_at', { ascending: false });
  return (data || []).map(mapStory);
};

export const getMyStories = async (uid: string): Promise<DesertStory[]> => {
  const { data } = await supabase
    .from(COL)
    .select('*')
    .eq('author_uid', uid)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
  return (data || []).map(mapStory);
};
