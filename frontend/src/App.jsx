import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from './router';
import { apiCall } from './api/client';
import { navManager, navEmployee } from './utils/constants';

import AppLayout from './components/layout/AppLayout';
import Toast from './components/common/Toast';
import Modal from './components/common/Modal';
import TaskModal from './components/tasks/TaskModal';
import ProjectModal from './components/projects/ProjectModal';
import MemberModal from './components/team/MemberModal';
import TaskDetail from './components/tasks/TaskDetail';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import TeamPage from './pages/TeamPage';
import ActivityPage from './pages/ActivityPage';
import ReportsPage from './pages/ReportsPage';

function WorkspaceRoutes({
  token,
  user,
  loading,
  error,
  setError,
  dashboard,
  tasks,
  members,
  projects,
  activity,
  reports,
  statusFilter,
  setStatusFilter,
  query,
  setQuery,
  mobileNav,
  setMobileNav,
  onLogout,
  notify,
  onOpenModal,
  onUpdateTask,
  onDeleteTask,
  onSelectTask,
  onToggleMember,
  onEditSkills
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isManager = user?.role === 'manager';
  const nav = isManager ? navManager : navEmployee;

  // Filter tasks for TasksPage
  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        t =>
          (statusFilter === 'All' || t.status === statusFilter) &&
          `${t.title} ${t.description} ${t.assigned_to} ${t.project}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [tasks, statusFilter, query]
  );

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout
      user={user}
      isManager={isManager}
      nav={nav}
      tasks={tasks}
      mobileNav={mobileNav}
      setMobileNav={setMobileNav}
      error={error}
      setError={setError}
      loading={loading}
      onLogout={onLogout}
      onNotify={notify}
      onOpenModal={onOpenModal}
    >
      <Routes>
        <Route
          path="/overview"
          element={
            <OverviewPage
              user={user}
              data={dashboard}
              tasks={tasks}
              activity={activity}
              onCreateTask={() => onOpenModal('task')}
              onUpdateTask={onUpdateTask}
              onSelectTask={onSelectTask}
            />
          }
        />
        <Route
          path="/tasks"
          element={
            <TasksPage
              user={user}
              tasks={filteredTasks}
              status={statusFilter}
              setStatus={setStatusFilter}
              query={query}
              setQuery={setQuery}
              onCreate={() => onOpenModal('task')}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              onSelect={onSelectTask}
            />
          }
        />
        <Route
          path="/projects"
          element={
            <ProjectsPage
              projects={projects}
              tasks={tasks}
              isManager={isManager}
              onCreate={() => onOpenModal('project')}
            />
          }
        />
        <Route
          path="/team"
          element={
            isManager ? (
              <TeamPage
                members={members}
                tasks={tasks}
                onAdd={() => onOpenModal('member')}
                onToggle={onToggleMember}
                onEditSkills={onEditSkills}
              />
            ) : (
              <Navigate to="/overview" replace />
            )
          }
        />
        <Route path="/activity" element={<ActivityPage items={activity} />} />
        <Route
          path="/reports"
          element={
            isManager ? (
              <ReportsPage report={reports} tasks={tasks} />
            ) : (
              <Navigate to="/overview" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </AppLayout>
  );
}

function MainApp() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [reports, setReports] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modal, setModal] = useState('');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const [loginEmail, setLoginEmail] = useState('manager@taskflow.local');
  const [loginPassword, setLoginPassword] = useState('Manager@123');
  const [loginRole, setLoginRole] = useState('manager');

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigned_to_id: '',
    project_id: '',
    priority: 'Medium',
    due_date: ''
  });

  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Engineering',
    skills: ''
  });

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: ''
  });

  const call = useCallback(
    async (path, opts = {}) => {
      return apiCall(path, opts, token, () => {
        localStorage.removeItem('taskflow_token');
        setToken('');
        setUser(null);
        navigate('/login');
      });
    },
    [token, navigate]
  );

  const refresh = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const me = await call('/auth/me');
      setUser(me);

      const [d, t, p, a, r] = await Promise.all([
        call('/dashboard'),
        call('/tasks'),
        call('/projects'),
        call('/activity?limit=50'),
        call('/reports')
      ]);

      setDashboard(d);
      setTasks(t);
      setProjects(p);
      setActivity(a);
      setReports(r);

      if (me.role === 'manager') {
        setMembers(await call('/members'));
      } else {
        setMembers([]);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, call]);

  useEffect(() => {
    if (token) {
      refresh();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token, refresh]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const notify = s => {
    setToast(s);
    setError('');
  };

  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const data = await call('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      if (data.user.role !== loginRole) {
        throw new Error(
          `This account is a ${data.user.role} account. Select the matching login type.`
        );
      }

      localStorage.setItem('taskflow_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      notify(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate('/overview');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    try {
      await call('/auth/logout');
    } catch {}

    localStorage.removeItem('taskflow_token');
    setToken('');
    setUser(null);
    setLoginRole('manager');
    setLoginEmail('manager@taskflow.local');
    setLoginPassword('Manager@123');
    navigate('/login');
  }

  async function runAction(fn, success) {
    setBusy(true);
    setError('');

    try {
      await fn();
      await refresh();
      setModal('');
      setSelected(null);
      notify(success);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitTask(e) {
    e.preventDefault();
    await runAction(async () => {
      await call('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...taskForm,
          assigned_to_id: Number(taskForm.assigned_to_id),
          project_id: taskForm.project_id ? Number(taskForm.project_id) : null,
          due_date: taskForm.due_date || null
        })
      });
    }, 'Task assigned successfully');

    setTaskForm({
      title: '',
      description: '',
      assigned_to_id: '',
      project_id: '',
      priority: 'Medium',
      due_date: ''
    });
  }

  async function submitMember(e) {
    e.preventDefault();
    await runAction(async () => {
      await call('/members', {
        method: 'POST',
        body: JSON.stringify({
          ...memberForm,
          skills: memberForm.skills
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        })
      });
    }, 'Employee account created');

    setMemberForm({
      name: '',
      email: '',
      password: '',
      department: 'Engineering',
      skills: ''
    });
  }

  async function submitProject(e) {
    e.preventDefault();
    await runAction(async () => {
      await call('/projects', {
        method: 'POST',
        body: JSON.stringify(projectForm)
      });
    }, 'Project created');

    setProjectForm({ name: '', description: '' });
  }

  async function updateTask(t, changes) {
    await runAction(async () => {
      await call(`/tasks/${t.id}`, {
        method: 'PATCH',
        body: JSON.stringify(changes)
      });
    }, 'Task updated');
  }

  async function deleteTask(t) {
    if (!confirm(`Delete "${t.title}"? This cannot be undone.`)) return;
    await runAction(async () => {
      await call(`/tasks/${t.id}`, { method: 'DELETE' });
    }, 'Task deleted');
  }

  async function toggleMember(m) {
    await runAction(async () => {
      await call(`/members/${m.id}/active?active=${!m.active}`, {
        method: 'PATCH'
      });
    }, m.active ? 'Employee access disabled' : 'Employee access enabled');
  }

  async function editMemberSkills(member, skills) {
    await runAction(async () => {
      await call(`/members/${member.id}/skills`, {
        method: 'PUT',
        body: JSON.stringify({
          skills: (Array.isArray(skills) ? skills : skills.split(','))
            .map(s => s.trim())
            .filter(Boolean)
        })
      });
    }, 'Employee skills updated');
  }

  function handleDemoLogin(role) {
    const managerDemo = role === 'manager';
    setLoginRole(managerDemo ? 'manager' : 'employee');
    setLoginEmail(managerDemo ? 'manager@taskflow.local' : 'arun@taskflow.local');
    setLoginPassword(managerDemo ? 'Manager@123' : 'Employee@123');
    navigate('/login');
  }

  // Handle landing or login pages
  if (pathname === '/') {
    if (token) return <Navigate to="/overview" replace />;
    return <LandingPage onDemoLogin={handleDemoLogin} />;
  }

  if (pathname === '/login') {
    if (token) return <Navigate to="/overview" replace />;
    return (
      <LoginPage
        email={loginEmail}
        setEmail={setLoginEmail}
        password={loginPassword}
        setPassword={setLoginPassword}
        role={loginRole}
        setRole={setLoginRole}
        onSubmit={login}
        error={error}
        busy={busy}
      />
    );
  }

  return (
    <>
      <WorkspaceRoutes
        token={token}
        user={user}
        loading={loading}
        error={error}
        setError={setError}
        dashboard={dashboard}
        tasks={tasks}
        members={members}
        projects={projects}
        activity={activity}
        reports={reports}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        query={query}
        setQuery={setQuery}
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
        onLogout={logout}
        notify={notify}
        onOpenModal={setModal}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onSelectTask={setSelected}
        onToggleMember={toggleMember}
        onEditSkills={editMemberSkills}
      />

      {/* Task Modal */}
      {modal === 'task' && (
        <TaskModal
          form={taskForm}
          setForm={setTaskForm}
          members={members}
          projects={projects}
          busy={busy}
          onSubmit={submitTask}
          onClose={() => setModal('')}
        />
      )}

      {/* Member Modal */}
      {modal === 'member' && (
        <MemberModal
          form={memberForm}
          setForm={setMemberForm}
          busy={busy}
          onSubmit={submitMember}
          onClose={() => setModal('')}
        />
      )}

      {/* Project Modal */}
      {modal === 'project' && (
        <ProjectModal
          form={projectForm}
          setForm={setProjectForm}
          busy={busy}
          onSubmit={submitProject}
          onClose={() => setModal('')}
        />
      )}

      {/* Task Detail Modal */}
      {selected && (
        <Modal
          title={selected.title}
          subtitle={`${selected.project || 'General'} · assigned to ${
            selected.assigned_to || 'you'
          }`}
          onClose={() => setSelected(null)}
        >
          <TaskDetail
            task={selected}
            isManager={user?.role === 'manager'}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        </Modal>
      )}

      {/* Toast Notification */}
      <Toast message={toast} onDismiss={() => setToast('')} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}