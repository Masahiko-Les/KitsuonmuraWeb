export type DesertStoryStatus = 'draft' | 'published' | 'hidden';

export type DesertGrowthStage = 'seed' | 'sprout' | 'bud' | 'flower';

export interface DesertStory {
  id: string;
  authorUid: string;
  authorNickname: string;
  title: string;
  hardshipText: string;
  facingText: string;
  overcomeText: string;
  status: DesertStoryStatus;
  createdAt: any;
  updatedAt: any;
  publishedAt?: any | null;
  waterCount: number;
  favoriteCount: number;
  reportCount: number;
  isDeleted: boolean;
  blockedByModeration: boolean;
}

export interface DesertStoryFormData {
  title: string;
  hardshipText: string;
  facingText: string;
  overcomeText: string;
}
