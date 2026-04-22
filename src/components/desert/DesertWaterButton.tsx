import { useState } from 'react';
import '../../styles/Desert.css';

interface Props {
  isWatered: boolean;
  waterCount: number;
  onToggle: () => Promise<void>;
  disabled?: boolean;
}

const DesertWaterButton = ({ isWatered, waterCount, onToggle, disabled }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      await onToggle();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`desert-water-btn ${isWatered ? 'desert-water-btn--active' : ''}`}
      onClick={handleClick}
      disabled={loading || disabled}
    >
      <span className="desert-water-btn__icon">{isWatered ? '💧' : '🫧'}</span>
      <span className="desert-water-btn__label">
        {isWatered ? '水やり済み' : '水やりする'}
      </span>
      <span className="desert-water-count">{waterCount}</span>
    </button>
  );
};

export default DesertWaterButton;
