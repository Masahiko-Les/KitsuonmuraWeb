import { useNavigate } from 'react-router-dom';
import { DesertStory } from '../../types/desertStory';
import DesertGrowthBadge from './DesertGrowthBadge';
import '../../styles/Desert.css';

interface Props {
  story: DesertStory;
}

const formatDate = (ts: any) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
};

const DesertStoryCard = ({ story }: Props) => {
  const navigate = useNavigate();

  return (
    <div
      className="desert-story-card"
      onClick={() => navigate(`/desert/stories/${story.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/desert/stories/${story.id}`)}
    >
      <div className="desert-story-card__header">
        <DesertGrowthBadge waterCount={story.waterCount} />
        <span className="desert-story-card__date">{formatDate(story.publishedAt)}</span>
      </div>
      <h3 className="desert-story-card__title">{story.title}</h3>
      <p className="desert-story-card__preview">
        {story.hardshipText.slice(0, 80)}
        {story.hardshipText.length > 80 ? '...' : ''}
      </p>
      <div className="desert-story-card__footer">
        <span className="desert-story-card__author">{story.authorNickname}</span>
        <span className="desert-story-card__water">💧 {story.waterCount}</span>
      </div>
    </div>
  );
};

export default DesertStoryCard;
