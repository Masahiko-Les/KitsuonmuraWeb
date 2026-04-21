// 吃音村トップ画面（村マップ）
import { useState, useEffect } from 'react';
import VillageMap from '../components/VillageMap';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../hooks/useAuth';
import { getVillageStats } from '../firebase/firestore';
import '../styles/VillagePage.css';

const VillagePage = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getVillageStats()
      .then(setStats)
      .catch((err) => console.error('stats取得失敗', err));
  }, []);

  return (
    <div className="page-container">
      <header className="village-header">
        <h1>吃音村</h1>
        {userProfile && (
          <p className="welcome-text">ようこそ、{userProfile.nickname} さん</p>
        )}
      </header>

      <main className="village-main">
        <VillageMap />
        <p className="map-hint">行きたい場所をタップしてください</p>

        {/* 村人人数 */}
        {stats && (
          <p className="village-stats-text">
            吃音村の人口：{stats.totalVillagers}人、今週訪れた村人：{stats.recentVillagers}人
          </p>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default VillagePage;
