import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BottomNav from '../components/BottomNav';
import '../styles/MyHomePage.css';

const MyHomePage = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const v = userProfile;

  return (
    <div className="page-container">
      <header className="myhome-header">
        <button className="myhome-back-btn" onClick={() => navigate('/village')}>
          ← 村へ戻る
        </button>
        <h1 className="myhome-title">自分の家</h1>
      </header>

      <main className="myhome-main">
        {v?.villageProfileCompleted ? (
          <div className="villager-card">
            <div className="villager-card__header">
              <div className="villager-card__icon">🌱</div>
              <div className="villager-card__name-block">
                <span className="villager-card__nickname">{v.nickname}</span>
                <span className="villager-card__no">{v.villagerNo}</span>
              </div>
            </div>
            <hr className="villager-card__divider" />
            <div className="villager-card__row">
              <span className="villager-card__label">吃音タイプ</span>
              <span className="villager-card__value">
                {v.stutterType === 'その他' && v.stutterTypeOther
                  ? `その他（${v.stutterTypeOther}）`
                  : v.stutterType}
              </span>
            </div>
            <div className="villager-card__row">
              <span className="villager-card__label">発声しにくい音</span>
              <div className="villager-card__sounds">
                {v.difficultSoundsTop3?.map((s, i) => (
                  <span key={i} className="villager-card__sound-badge">{s}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="myhome-no-profile">
            <p className="myhome-no-profile__icon">📜</p>
            <p className="myhome-no-profile__text">村人登録がまだ完了していません</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/village-registration')}
            >
              村人登録へ
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default MyHomePage;
