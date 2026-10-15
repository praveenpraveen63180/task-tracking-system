import { LogOut, Menu } from 'lucide-react';
import { initials } from '../../utils/helpers';
import { useLocation } from '../../router';

export default function Topbar({ user, isManager, nav, onLogout, onToggleMobile }) {
  const { pathname } = useLocation();
  const currentNav = nav.find(n => n[1] === pathname) || nav[0];

  return (
    <header className="topbar">
      <div className="top-left">
        <button className="icon-btn menu-toggle" onClick={onToggleMobile}>
          <Menu />
        </button>
        <span className="crumb">Workspace</span>
        <span className="crumb-slash">/</span>
        <b>{currentNav[0]}</b>
      </div>

      <div className="top-actions">
        <div className="top-divider" />
        <button className="user-chip" onClick={onLogout}>
          <div className={`avatar ${isManager ? 'avatar-purple' : ''}`}>
            {initials(user.name)}
          </div>
          <div className="user-chip-copy">
            <b>{user.name}</b>
            <small>{isManager ? 'Workspace manager' : 'Team member'}</small>
          </div>
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
