import { DesertGrowthStage } from '../types/desertStory';

export const getGrowthStage = (waterCount: number): DesertGrowthStage => {
  if (waterCount >= 30) return 'flower';
  if (waterCount >= 15) return 'bud';
  if (waterCount >= 5) return 'sprout';
  return 'seed';
};

export const GROWTH_LABELS: Record<DesertGrowthStage, string> = {
  seed: '種',
  sprout: '芽',
  bud: 'つぼみ',
  flower: '花',
};

export const GROWTH_ICONS: Record<DesertGrowthStage, string> = {
  seed: '🌰',
  sprout: '🌱',
  bud: '🌿',
  flower: '🌸',
};

export const GROWTH_NEXT_THRESHOLD: Record<DesertGrowthStage, number | null> = {
  seed: 5,
  sprout: 15,
  bud: 30,
  flower: null,
};
