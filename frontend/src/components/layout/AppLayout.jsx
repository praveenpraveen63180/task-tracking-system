import { CalendarDays, Plus, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { pageTitle, pageSubtitle } from '../../utils/helpers';
import { useLocation } from '../../router';

export default function AppLayout({
  user,
  isManager,
  nav,
  tasks,
  mobileNav,
  setMobileNav,
  error,
  setError,
  loading,
  onLogout,
  onNotify,
  onOpenModal,
  children
}) {
  const { pathname } = useLocation();
  const currentNav = nav.find(n => n[1] === pathname) || nav[0];
  const pageId = currentNav[3] || 'overview';

  return (
    <div className="app-shell">
      <Sidebar
        nav={nav}
        isManager={isManager}
        tasks={tasks}
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
        onNotify={onNotify}
      />

      <div className="main-area">
        <Topbar
          user={user}
          isManager={isManager}
          nav={nav}
          onLogout={onLogout}
          onToggleMobile={() => setMobileNav(true)}
        />

        <main className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="live-dot" />
                {isManager ? 'TEAM WORKSPACE' : 'PERSONAL WORKSPACE'}
              </div>
              <h1>{pageTitle(pageId, isManager, user.name)}</h1>
              <p>{pageSubtitle(pageId, isManager)}</p>
            </div>

            <div className="heading-actions">
              <span className="date-chip">
                <CalendarDays size={15} />
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </span>

              {isManager && (pageId === 'overview' || pageId === 'tasks') && (
                <button className="btn btn-primary" onClick={() => onOpenModal('task')}>
                  <Plus size={17} /> {pageId === 'overview' ? 'Create task' : 'New task'}
                </button>
              )}

              {isManager && pageId === 'team' && (
                <button className="btn btn-primary" onClick={() => onOpenModal('member')}>
                  <Plus size={17} /> Add member
                </button>
              )}

              {isManager && pageId === 'projects' && (
                <button className="btn btn-primary" onClick={() => onOpenModal('project')}>
                  <Plus size={17} /> New project
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="inline-error">
              <X size={16} /> {error}
              <button onClick={() => setError('')}>
                <X size={14} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-card">
              <div className="spinner" />
              Loading your workspace…
            </div>
          ) : (
            children
          )}
        </main>

        <footer className="footer">
          <span>© 2026 TaskFlow Workspace</span>
          <span>
            <span className="status-dot" /> All systems operational
          </span>
        </footer>
      </div>
    </div>
  );
}
