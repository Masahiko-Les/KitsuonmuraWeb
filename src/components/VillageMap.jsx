// 村マップコンポーネント：画像の上にボタンを absolute で重ねる構造
import { useNavigate } from 'react-router-dom';
import villageMap from '../assets/map.jpg';
import '../styles/VillageMap.css';

// 施設を追加するときはこの配列に追記するだけ
// position は画像に対する % 指定（実際の見た目に合わせて調整）
const FACILITIES = [
  {
    id: 'square',
    label: '広場',
    path: '/square',
    enabled: true,
    spotClass: 'square-button',
    position: { top: '63%', left: '50%' },
  },

  {
    id: 'library',
    label: '図書館',
    path: '/library',
    enabled: true,
    spotClass: 'library-button',
    position: { top: '60%', left: '85%' },
  },
  {
    id: 'cinema',
    label: '映画館',
    path: '/cinema',
    enabled: true,
    spotClass: 'cinema-button',
    position: { top: '40%', left: '42%' },
  },
  {
    id: 'desert',
    label: '砂漠の開拓',
    path: '/desert',
    enabled: true,
    spotClass: 'desert-button',
    // マップ右上の砂漠エリア
    position: { top: '25%', left: '80%' },
  },
  {
    id: 'my-home',
    label: '自分の家',
    path: '/home',
    enabled: true,
    spotClass: 'my-home-button',
    // 広場の右のオレンジの家
    position: { top: '73%', left: '78%' },
  },
  {
    id: 'town-hall',
    label: '村役場',
    path: '/town-hall',
    enabled: true,
    spotClass: 'town-hall-button',
    position: { top: '40%', left: '63%' },
  },
  {
    id: 'lighthouse',
    label: '灯台',
    path: null,
    enabled: false,
    spotClass: 'lighthouse-button',
    position: { top: '50%', left: '10%' },
  },
];

const VillageMap = () => {
  const navigate = useNavigate();

  return (
    <div className="village-map-wrapper">
      <img
        src={villageMap}
        alt="吃音村の村マップ"
        className="village-map-image"
        draggable={false}
      />

      {FACILITIES.map((facility) => (
        <button
          key={facility.id}
          className={`map-spot-button ${facility.spotClass} ${facility.enabled ? 'spot-enabled' : 'spot-disabled'}`}
          style={facility.position}
          onClick={() => facility.enabled && navigate(facility.path)}
          disabled={!facility.enabled}
          aria-label={facility.enabled ? facility.label : `${facility.label}（準備中）`}
        >
          <span className="spot-label">{facility.label}</span>
          {!facility.enabled && <span className="spot-coming-soon">準備中</span>}
        </button>
      ))}
    </div>
  );
};

export default VillageMap;
