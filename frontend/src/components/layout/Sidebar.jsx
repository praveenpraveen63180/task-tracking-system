import {
  ArrowRight,
  CircleHelp,
  Command,
  Settings2,
  Sparkles,
  X
} from 'lucide-react';
import { useNavigate, useLocation } from '../../router';

export default function Sidebar({
  nav,
  isManager,
  tasks,
  mobileNav,
  setMobileNav,
  onNotify
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className={`sidebar ${mobileNav ? 'show-mobile' : ''}`}>
      <div className="brand">
        <div className="brand-mark">
          <Command size={22} />
        </div>
        <div>
          <b>
            taskflow<span>.</span>
          </b>
          <small>WORKSPACE</small>
        </div>
        <button
          className="icon-btn mobile-close"
          onClick={() => setMobileNav(false)}
        >
          <X />
        </button>
      </div>

      <div className="workspace-switch">
        <div className="workspace-logo">T</div>
        <div>
          <b>TaskFlow Workspace</b>
          <small>Team task tracking</small>
        </div>
      </div>

      <div className="nav-caption">WORKSPACE</div>
      <nav>
        {nav.map(([label, path, Icon, id]) => {
          const isActive = pathname === path || (pathname === '/' && path === '/overview');
          return (
            <button
              key={id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => {
                navigate(path);
                setMobileNav(false);
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === 'tasks' && (
                <span className="nav-count">
                  {isManager
                    ? tasks.filter(t => t.status !== 'Completed').length
                    : tasks.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="upgrade-card">
          <div className="upgrade-icon">
            <Sparkles size={17} />
          </div>
          <b>Make work flow</b>
          <p>Everything your team needs to stay on track.</p>
          <button
            onClick={() => {
              navigate('/reports');
              setMobileNav(false);
            }}
          >
            Explore insights <ArrowRight size={14} />
          </button>
        </div>

        <button
          className="nav-link"
          onClick={() => onNotify('Settings are managed by your workspace administrator.')}
        >
          <Settings2 size={18} />
          <span>Settings</span>
        </button>
        <button
          className="nav-link"
          onClick={() => onNotify('Help: contact your workspace manager for access support.')}
        >
          <CircleHelp size={18} />
          <span>Help & support</span>
        </button>
      </div>
    </aside>
  );
}
