import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { getAllVillagers } from '../services/villageProfileService';
import { VillageProfile } from '../types/villageProfile';
import '../styles/TownHall.css';

const TownHallPage = () => {
  const navigate = useNavigate();
  const [villagers, setVillagers] = useState<VillageProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllVillagers()
      .then(setVillagers)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <header className="townhall-header">
        <button className="desert-back-btn" onClick={() => navigate('/village')}>
          ← 村へ戻る
        </button>
        <h1 className="townhall-title">村役場</h1>
        <p className="townhall-subtitle">住民名簿</p>
      </header>

      <main className="townhall-main">
        {loading && <p className="loading-text">名簿を確認しています...</p>}
        {error && <p className="desert-error">読み込みに失敗しました</p>}

        {!loading && !error && villagers.length === 0 && (
          <div className="desert-empty">
            <p className="desert-empty__icon">📜</p>
            <p>まだ村人が登録されていません</p>
          </div>
        )}

        {!loading && !error && villagers.length > 0 && (
          <>
            <p className="townhall-count">
              現在 <strong>{villagers.length}</strong> 人の村人が暮らしています
            </p>
            <div className="townhall-list">
              {villagers.map((v) => (
                <div key={v.villagerNo} className="townhall-card">
                  {/* 将来アイコンが入る場所 */}
                  <div className="townhall-card__icon-slot" aria-hidden="true">
                    🌱
                  </div>
                  <div className="townhall-card__body">
                    <div className="townhall-card__top">
                      <span className="townhall-nickname">{v.nickname}</span>
                      <span className="townhall-no">{v.villagerNo}</span>
                    </div>
                    <div className="townhall-card__stutter">
                      {v.stutterType === 'その他' && v.stutterTypeOther
                        ? `吃音タイプ：その他（${v.stutterTypeOther}）`
                        : `吃音タイプ：${v.stutterType}`}
                    </div>
                    <div className="townhall-card__sounds">
                      <span className="townhall-sounds-label">発声しにくい音：</span>
                      {v.difficultSoundsTop3?.map((s, i) => (
                        <span key={i} className="townhall-sound-badge">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default TownHallPage;
