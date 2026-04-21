// 下部ナビゲーションバー
import { NavLink } from 'react-router-dom';
import '../styles/BottomNav.css';

const BottomNav = () => (
  <nav className="bottom-nav">
    <NavLink to="/village" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
      <span className="nav-icon">🏡</span>
      <span className="nav-label">吃音村</span>
    </NavLink>
    <NavLink to="/square" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
      <span className="nav-icon">💬</span>
      <span className="nav-label">広場</span>
    </NavLink>
    <NavLink to="/account" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
      <span className="nav-icon">👤</span>
      <span className="nav-label">アカウント</span>
    </NavLink>
  </nav>
);

export default BottomNav;
