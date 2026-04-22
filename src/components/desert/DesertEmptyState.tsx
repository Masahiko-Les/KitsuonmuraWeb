import '../../styles/Desert.css';

interface Props {
  icon?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const DesertEmptyState = ({ icon = '🌵', message, actionLabel, onAction }: Props) => (
  <div className="desert-empty">
    <p className="desert-empty__icon">{icon}</p>
    <p style={{ whiteSpace: 'pre-line' }}>{message}</p>
    {actionLabel && onAction && (
      <button className="btn-primary" style={{ marginTop: '16px' }} onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

export default DesertEmptyState;
