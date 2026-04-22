import { DesertGrowthStage } from '../../types/desertStory';
import { getGrowthStage, GROWTH_LABELS, GROWTH_ICONS } from '../../utils/desertGrowth';
import '../../styles/Desert.css';

interface Props {
  waterCount: number;
}

const DesertGrowthBadge = ({ waterCount }: Props) => {
  const stage = getGrowthStage(waterCount);
  return (
    <span className={`desert-growth-badge desert-growth-badge--${stage}`}>
      {GROWTH_ICONS[stage]} {GROWTH_LABELS[stage]}
    </span>
  );
};

export default DesertGrowthBadge;
