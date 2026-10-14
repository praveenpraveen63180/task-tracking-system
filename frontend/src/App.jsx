import { useCallback, useEffect, useMemo, useState } from 'react';

import {

  Activity, ArrowDownRight, ArrowRight, ArrowUpRight,

  BriefcaseBusiness, CalendarDays, Check, CheckCheck,

  CircleHelp, Clock3, Command, FileChartColumn, Filter,

  FolderKanban, Gauge, LayoutDashboard, ListTodo, LogOut,

  Menu, MoreHorizontal, Plus, Settings2, ShieldCheck,

  Sparkles, Target, Users, X, Zap

} from 'lucide-react';

import './App.css';

const API = 'http://127.0.0.1:8000/api';

const navManager = [

  ['Overview', 'overview', LayoutDashboard],

  ['All tasks', 'tasks', ListTodo],

  ['Projects', 'projects', FolderKanban],

  ['Team members', 'team', Users],

  ['Reports', 'reports', FileChartColumn]

];

const navEmployee = [

  ['My workspace', 'overview', LayoutDashboard],

  ['My tasks', 'tasks', ListTodo],

  ['Projects', 'projects', FolderKanban]

];

const initials = (s = '') =>

  s.split(/\s+/).map(v => v[0]).join('').slice(0, 2).toUpperCase();

const dateText = v =>

  v

    ? new Date(v.length === 10 ? v + 'T00:00:00' : v)

        .toLocaleDateString('en-IN', {

          day: 'numeric',

          month: 'short',

          year: v.length > 10 ? 'numeric' : undefined

        })

    : 'No deadline';

const timeAgo = v => {

  if (!v) return 'Just now';

  const m = Math.max(0, Math.floor((Date.now() - new Date(v).getTime()) / 60000));

  return m < 1 ? 'Just now'

    : m < 60 ? `${m}m ago`

    : m < 1440 ? `${Math.floor(m / 60)}h ago`

    : dateText(v);

};

function LandingPage({ onLogin, onRegister, onLearnMore, onDemoLogin }) {

  return (

    <div className="landing-page">

      <header className="landing-header">

        
     <div className="landing-logo">
     <span>in</span><b>gage</b>
    </div>


        <nav className="landing-nav">

          <button onClick={onLogin}>Login</button>

          <button className="register-btn" onClick={onRegister}>

            Register

          </button>

        </nav>

      </header>

      <section className="landing-hero">

        
<h1>
  Welcome to <span>Ingage</span>
</h1>


        <h2>Project Management Software</h2>

        <h2>built for</h2>

        <div className="hero-highlight">productive teams</div>

        <div className="hero-buttons">

          <button className="hero-primary" onClick={onLogin}>

            Get Started

          </button>

          <button className="hero-secondary" onClick={onLearnMore}>

            Learn More

          </button>

        </div>

      </section>

      <section className="landing-features" id="features">

        <h2>Everything you need to manage your team</h2>

        <p>Simple tools for task tracking, teamwork, and productivity.</p>

        <div className="feature-grid">

          <article>

            <div className="feature-icon">◷</div>

            <h3>Smart Task Tracking</h3>

            <p>Track task status, deadlines, and work progress in one place.</p>

          </article>

          <article>

            <div className="feature-icon">♧</div>

            <h3>Team Management</h3>

            <p>Assign tasks and manage employee responsibilities.</p>

          </article>

          <article>

            <div className="feature-icon">▤</div>

            <h3>Project Management</h3>

            <p>Organize projects and monitor team performance.</p>

          </article>

        </div>

      </section>

      <section className="try-taskflow" aria-labelledby="try-taskflow-title">
        <div className="try-taskflow-heading">
          <span className="eyebrow">TRY TASKFLOW</span>
          <h2 id="try-taskflow-title">Explore the workspace</h2>
          <p>Use the demo accounts to explore manager and employee views.</p>
        </div>
        <div className="demo-account-grid">
          <article className="demo-account-card">
            <div className="demo-role-icon"><Users size={20} /></div><h3>Manager demo</h3>
            <p>Assign tasks, manage projects, and review team progress.</p>
            <div className="demo-credential"><span>Email</span><code>manager@taskflow.local</code><button type="button" onClick={() => copyDemo("manager@taskflow.local")}>Copy</button></div>
            <div className="demo-credential"><span>Password</span><code>Manager@123</code><button type="button" onClick={() => copyDemo("Manager@123")}>Copy</button></div>
            <button className="demo-use-button" onClick={() => onDemoLogin("manager")}>Use manager login</button>
          </article>
          <article className="demo-account-card">
            <div className="demo-role-icon"><BriefcaseBusiness size={20} /></div><h3>Employee demo</h3>
            <p>View assigned tasks and update your work progress.</p>
            <div className="demo-credential"><span>Email</span><code>arun@taskflow.local</code><button type="button" onClick={() => copyDemo("arun@taskflow.local")}>Copy</button></div>
            <div className="demo-credential"><span>Password</span><code>Employee@123</code><button type="button" onClick={() => copyDemo("Employee@123")}>Copy</button></div>
            <button className="demo-use-button" onClick={() => onDemoLogin("employee")}>Use employee login</button>
          </article>
        </div>
        <p className="demo-note">Demo credentials work only if these accounts exist in your backend database.</p>
      </section>
      <footer className="landing-footer">TaskFlow · Make teamwork flow.</footer>
    </div>

  );

}

function copyDemo(value) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(value).then(() => window.alert("Copied to clipboard"), () => window.prompt("Copy this value:", value));
  } else { window.prompt("Copy this value:", value); }
}

function App() {

    const [showLanding, setShowLanding] = useState(

  !localStorage.getItem('taskflow_token')

);

  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token') || '');

  const [user, setUser] = useState(null);

  const [page, setPage] = useState('overview');

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

  const call = useCallback(async (path, opts = {}) => {

    const res = await fetch(API + path, {

      ...opts,

      headers: {

        'Content-Type': 'application/json',

        ...(token ? { Authorization: `Bearer ${token}` } : {}),

        ...(opts.headers || {})

      }

    });

    let data = {};

    try {

      data = await res.json();

    } catch {}

    if (!res.ok) {

      if (res.status === 401 && path !== '/auth/login') {

        localStorage.removeItem('taskflow_token');

        setToken('');

        setUser(null);

      }

      throw new Error(data.detail || 'Something went wrong');

    }

    return data;

  }, [token]);

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

      const r = await fetch(API + '/auth/login', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          email: loginEmail,

          password: loginPassword

        })

      });

      const data = await r.json();

      if (!r.ok) throw new Error(data.detail || 'Login failed');

      if (data.user.role !== loginRole) {

        throw new Error(

          `This account is a ${data.user.role} account. Select the matching login type.`

        );

      }

      localStorage.setItem('taskflow_token', data.access_token);

      setToken(data.access_token);

      setUser(data.user);

      setPage('overview');

      notify(`Welcome back, ${data.user.name.split(' ')[0]}!`);

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

    setPage('overview');

    setLoginRole('manager');

    setLoginEmail('manager@taskflow.local');

    setLoginPassword('Manager@123');

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

        body: JSON.stringify({ ...memberForm, skills: memberForm.skills.split(",").map(s => s.trim()).filter(Boolean) })

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

  const filtered = useMemo(

    () => tasks.filter(t =>

      (statusFilter === 'All' || t.status === statusFilter) &&

      `${t.title} ${t.description} ${t.assigned_to} ${t.project}`

        .toLowerCase()

        .includes(query.toLowerCase())

    ),

    [tasks, statusFilter, query]

  );

if (showLanding && !token) {

  return (

    <LandingPage

      onLogin={() => setShowLanding(false)}

      onRegister={() => setShowLanding(false)}

      onDemoLogin={(role) => {
        const managerDemo = role === 'manager';
        setLoginRole(managerDemo ? 'manager' : 'employee');
        setLoginEmail(managerDemo ? 'manager@taskflow.local' : 'arun@taskflow.local');
        setLoginPassword(managerDemo ? 'Manager@123' : 'Employee@123');
        setShowLanding(false);
      }}
      onLearnMore={() => {

        document.getElementById('features')?.scrollIntoView({

          behavior: 'smooth'

        });

      }}

    />

  );

}

  if (!token || (!user && loading)) {

    return (

      <Login

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

  if (!user) {

    return (

      <Login

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

  const isManager = user.role === 'manager';

  const nav = isManager ? navManager : navEmployee;

  return (

    <div className="app-shell">

      <aside className={`sidebar ${mobileNav ? 'show-mobile' : ''}`}>

        <div className="brand">

          <div className="brand-mark"><Command size={22} /></div>

          <div><b>taskflow<span>.</span></b><small>WORKSPACE</small></div>

          <button className="icon-btn mobile-close" onClick={() => setMobileNav(false)}>

            <X />

          </button>

        </div>

        <div className="workspace-switch">

          <div className="workspace-logo">T</div>

          <div><b>TaskFlow Workspace</b><small>Team task tracking</small></div>

        </div>

        <div className="nav-caption">WORKSPACE</div>

        <nav>

          {nav.map(([label, id, Icon]) => (

            <button

              key={id}

              className={`nav-link ${page === id ? 'active' : ''}`}

              onClick={() => {

                setPage(id);

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

          ))}

        </nav>

        <div className="sidebar-bottom">

          <div className="upgrade-card">

            <div className="upgrade-icon"><Sparkles size={17} /></div>

            <b>Make work flow</b>

            <p>Everything your team needs to stay on track.</p>

            <button onClick={() => setPage('reports')}>

              Explore insights <ArrowRight size={14} />

            </button>

          </div>

          <button className="nav-link" onClick={() => notify('Settings are managed by your workspace administrator.')}>

            <Settings2 size={18} /><span>Settings</span>

          </button>

          <button className="nav-link" onClick={() => notify('Help: contact your workspace manager for access support.')}>

            <CircleHelp size={18} /><span>Help & support</span>

          </button>

        </div>

      </aside>

      <div className="main-area">

        <header className="topbar">

          <div className="top-left">

            <button className="icon-btn menu-toggle" onClick={() => setMobileNav(true)}>

              <Menu />

            </button>

            <span className="crumb">Workspace</span>

            <span className="crumb-slash">/</span>

            <b>{nav.find(n => n[1] === page)?.[0] || 'Overview'}</b>

          </div>

          <div className="top-actions">

            <div className="top-divider" />

            <button className="user-chip" onClick={logout}>

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

        <main className="content">

          <div className="page-heading">

            <div>

              <div className="eyebrow">

                <span className="live-dot" />

                {isManager ? 'TEAM WORKSPACE' : 'PERSONAL WORKSPACE'}

              </div>

              <h1>{pageTitle(page, isManager, user.name)}</h1>

              <p>{pageSubtitle(page, isManager)}</p>

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

              {isManager && page === 'overview' && (

                <button className="btn btn-primary" onClick={() => setModal('task')}>

                  <Plus size={17} /> Create task

                </button>

              )}

              {isManager && page === 'tasks' && (

                <button className="btn btn-primary" onClick={() => setModal('task')}>

                  <Plus size={17} /> New task

                </button>

              )}

              {isManager && page === 'team' && (

                <button className="btn btn-primary" onClick={() => setModal('member')}>

                  <Plus size={17} /> Add member

                </button>

              )}

              {isManager && page === 'projects' && (

                <button className="btn btn-primary" onClick={() => setModal('project')}>

                  <Plus size={17} /> New project

                </button>

              )}

            </div>

          </div>

          {error && (

            <div className="inline-error">

              <X size={16} /> {error}

              <button onClick={() => setError('')}><X size={14} /></button>

            </div>

          )}

          {loading ? (

            <div className="loading-card"><div className="spinner" />Loading your workspace…</div>

          ) : (

            <>

              {page === 'overview' && (

                <Dashboard

                  user={user}

                  data={dashboard}

                  tasks={tasks}

                  activity={activity}

                  onPage={setPage}

                  onCreate={() => setModal('task')}

                  onUpdate={updateTask}

                />

              )}

              {page === 'tasks' && (

                <TasksPage

                  user={user}

                  tasks={filtered}

                  status={statusFilter}

                  setStatus={setStatusFilter}

                  query={query}

                  setQuery={setQuery}

                  onCreate={() => setModal('task')}

                  onUpdate={updateTask}

                  onDelete={deleteTask}

                  onSelect={setSelected}

                />

              )}

              {page === 'projects' && (

                <ProjectsPage

                  projects={projects}

                  tasks={tasks}

                  isManager={isManager}

                  onCreate={() => setModal('project')}

                />

              )}

              {page === 'team' && (

                <TeamPage

                  members={members}

                  tasks={tasks}

                  onAdd={() => setModal('member')}

                  onToggle={async m => runAction(async () => {

                    await call(`/members/${m.id}/active?active=${!m.active}`, {

                      method: 'PATCH'

                    });

                  }, m.active ? 'Employee access disabled' : 'Employee access enabled')}
     onEditSkills={(member, skills) =>
  runAction(async () => {
    await call(`/members/${member.id}/skills`, {
      method: 'PUT',
      body: JSON.stringify({
        skills: (Array.isArray(skills) ? skills : skills.split(','))
          .map(s => s.trim())
          .filter(Boolean)
      })
    });
  }, 'Employee skills updated')
}

                />

              )}

              {page === 'activity' && <ActivityPage items={activity} />}

              {page === 'reports' && <ReportsPage report={reports} tasks={tasks} />}

            </>

          )}

        </main>

        <footer className="footer">

          <span>© 2026 TaskFlow Workspace</span>

          <span><span className="status-dot" /> All systems operational</span>

        </footer>

      </div>

      {modal && (

        <Modal

          title={modal === 'task' ? 'Create a new task' : modal === 'member' ? 'Add team member' : 'Create a project'}

          subtitle={

            modal === 'task'

              ? 'Give your teammate clarity on what needs to get done.'

              : modal === 'member'

                ? 'Create an employee login and invite them to the workspace.'

                : 'Group related tasks and track progress in one place.'

          }

          onClose={() => setModal('')}

        >

          <form

            className="form-stack"

            onSubmit={modal === 'task' ? submitTask : modal === 'member' ? submitMember : submitProject}

          >

            {modal === 'task' && (

              <>

                <Field label="Task title">

                  <input

                    required

                    minLength="2"

                    placeholder="e.g. Design the new dashboard"

                    value={taskForm.title}

                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}

                  />

                </Field>

                <Field label="Description">

                  <textarea

                    rows="3"

                    placeholder="Add context, acceptance criteria or notes…"

                    value={taskForm.description}

                    onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}

                  />

                </Field>

                <div className="form-grid">

                  <Field label="Assignee">

                    <select

                      required

                      value={taskForm.assigned_to_id}

                      onChange={e => setTaskForm({ ...taskForm, assigned_to_id: e.target.value })}

                    >

                      <option value="">Select employee</option>

                  {members.filter(m => m.active).map(m => {
  const skills = Array.isArray(m.skills)
    ? m.skills
    : typeof m.skills === 'string'
      ? m.skills.split(',')
      : [];

  return (
    <option key={m.id} value={m.id}>
      {m.name}
      {skills.length ? ` — Skills: ${skills.join(', ')}` : ''}
    </option>
  );
})}

                    </select>

                  </Field>

                  <Field label="Project">

                    <select

                      value={taskForm.project_id}

                      onChange={e => setTaskForm({ ...taskForm, project_id: e.target.value })}

                    >

                      <option value="">General</option>

                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}

                    </select>

                  </Field>

                  <Field label="Priority">

                    <select

                      value={taskForm.priority}

                      onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}

                    >

                      {['Low', 'Medium', 'High', 'Urgent'].map(v => <option key={v}>{v}</option>)}

                    </select>

                  </Field>

                  <Field label="Deadline">

                    <input

                      type="date"

                      min={new Date().toISOString().slice(0, 10)}

                      value={taskForm.due_date}

                      onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}

                    />

                  </Field>

                </div>

              </>

            )}

            {modal === 'member' && (

              <>

                <Field label="Full name">

                  <input required minLength="2" autoComplete="name" placeholder="e.g. Alex Morgan"

                    value={memberForm.name}

                    onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />

                </Field>

                <Field label="Email address">

                  <input required type="email" autoComplete="email" placeholder="alex@company.com"

                    value={memberForm.email}

                    onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} />

                </Field>

                <Field label="Temporary password">

                  <input required minLength="8" type="password" autoComplete="new-password"

                    value={memberForm.password}

                    onChange={e => setMemberForm({ ...memberForm, password: e.target.value })} />

                </Field>

                <Field label="Department">

                  <input value={memberForm.department}

                    onChange={e => setMemberForm({ ...memberForm, department: e.target.value })} />

                </Field>

                <Field label="Skills (comma-separated)">
                  <input placeholder="e.g. React, Python, SQL" value={memberForm.skills}
                    onChange={e => setMemberForm({ ...memberForm, skills: e.target.value })} />
                  <small className="field-help">Add skills to help the manager choose a suitable assignee.</small>
                </Field>

              </>

            )}

            {modal === 'project' && (

              <>

                <Field label="Project name">

                  <input required minLength="2" placeholder="e.g. Website refresh"

                    value={projectForm.name}

                    onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} />

                </Field>

                <Field label="Description">

                  <textarea rows="4" placeholder="What is this project about?"

                    value={projectForm.description}

                    onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} />

                </Field>

              </>

            )}

            <div className="modal-actions">

              <button type="button" className="btn btn-secondary" onClick={() => setModal('')}>Cancel</button>

              <button className="btn btn-primary" disabled={busy}>

                {busy ? 'Saving…' : modal === 'task' ? 'Create task' : modal === 'member' ? 'Add member' : 'Create project'}

              </button>

            </div>

          </form>

        </Modal>

      )}

      {selected && (

        <Modal

          title={selected.title}

          subtitle={`${selected.project || 'General'} · assigned to ${selected.assigned_to || 'you'}`}

          onClose={() => setSelected(null)}

        >

          <TaskDetail task={selected} isManager={isManager} onUpdate={updateTask} onDelete={deleteTask} />

        </Modal>

      )}

      {toast && (

        <div className="toast" role="status">

          <span className="toast-check"><Check size={15} /></span>

          {toast}

          <button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15} /></button>

        </div>

      )}

    </div>

  );

}

function pageTitle(page, isManager, name) {

  const titles = {

    overview: isManager ? 'Good to see you again' : `Your workspace, ${name.split(' ')[0]}`,

    tasks: isManager ? 'All tasks' : 'My tasks',

    projects: 'Projects',

    team: 'Team members',

    activity: 'Activity',

    reports: 'Reports'

  };

  return titles[page] || 'Overview';

}

function pageSubtitle(page, isManager) {

  const subtitles = {

    overview: isManager ? 'Here is what is happening across your workspace.' : 'A clear view of your work and what needs attention.',

    tasks: isManager ? 'Track assignments, priorities, and deadlines.' : 'Review and update the work assigned to you.',

    projects: 'See progress across your active work.',

    team: 'Manage access and keep an eye on team workload.',

    activity: 'A running record of work across your workspace.',

    reports: 'A snapshot of delivery, priorities, and upcoming work.'

  };

  return subtitles[page] || '';

}

function Login({ email, setEmail, password, setPassword, role, setRole, onSubmit, error, busy }) {

  return (

    <div className="login-screen">

      <section className="login-left">

        <div className="login-brand">

          <div className="brand-mark"><Command size={22} /></div>

          <b>taskflow<span>.</span></b>

        </div>

        <div className="login-promo">

          <span className="promo-pill"><Zap size={13} /> WORK, IN GOOD FLOW</span>

          <h1>Make every day <span>count.</span></h1>

          <p>Bring your team, projects, and priorities into one clear workspace. Less chasing, more meaningful progress.</p>

          <div className="promo-stats">

            <div><b>One view</b><span>for every priority</span></div>

            <div><b>Clear owners</b><span>for every task</span></div>

          </div>

        </div>

        <div className="floating-task">

          <span className="floating-check"><Check size={16} /></span>

          <span><b>Work moving forward</b><small>Progress, made visible</small></span>

          <span className="tiny-avatar">TF</span>

        </div>

      </section>

      <section className="login-right">

        <div className="login-card">

          <div className="mobile-login-brand">

            <div className="brand-mark"><Command size={20} /></div>

            <b>taskflow<span>.</span></b>

          </div>

          <div className="login-heading">

            <span className="eyebrow">WELCOME BACK</span>

            <h2>Sign in to your workspace</h2>

            <p>Choose your account type to continue.</p>

          </div>

          <div className="role-switch" role="group" aria-label="Account type">

            <button type="button" className={role === 'manager' ? 'selected' : ''}

              onClick={() => {

                setRole('manager');

                setEmail('manager@taskflow.local');

                setPassword('Manager@123');

              }}>

              <BriefcaseBusiness size={16} />Manager

            </button>

            <button type="button" className={role === 'employee' ? 'selected' : ''}

              onClick={() => {

                setRole('employee');

                setEmail('arun@taskflow.local');

                setPassword('Employee@123');

              }}>

              <Users size={16} />Team member

            </button>

          </div>

          <form onSubmit={onSubmit}>

            <Field label="Email address">

              <input required type="email" autoComplete="username" value={email}

                onChange={e => setEmail(e.target.value)} />

            </Field>

            <Field label="Password">

              <input required type="password" autoComplete="current-password" value={password}

                onChange={e => setPassword(e.target.value)} />

            </Field>

            {error && <div className="inline-error" role="alert"><X size={15} />{error}</div>}

            <button className="btn btn-primary login-submit" disabled={busy}>

              {busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={16} />

            </button>

          </form>

          <div className="login-footnote">

            <ShieldCheck size={14} /> Role-based access keeps each workspace private.

          </div>

        </div>

      </section>

    </div>

  );

}

function Dashboard({ user, data, tasks, activity, onPage, onCreate, onUpdate }) {

  const stats = data?.stats || {};

  return (

    <>

      <section className="welcome-banner">

        <div className="welcome-copy">

          <span className="promo-pill"><Activity size={13} /> WORKSPACE PULSE</span>

          <h2>{user.role === 'manager' ? 'A focused team makes progress.' : 'Small steps add up to great work.'}</h2>

          <p>{stats.overdue ? `${stats.overdue} overdue ${stats.overdue === 1 ? 'task needs' : 'tasks need'} attention. ` : 'Your workspace is up to date. '}Check what is moving and what needs a hand.</p>

          <button className="btn btn-light" onClick={user.role === 'manager' ? onCreate : () => onPage('tasks')}>

            {user.role === 'manager' ? <><Plus size={15} /> Assign a task</> : <>View my tasks <ArrowRight size={15} /></>}

          </button>

        </div>

        <div className="banner-art" aria-hidden="true">

          <div className="banner-ring"><div className="banner-ring-inner"><Gauge size={44} /></div></div>

          <span className="banner-spark"><Zap size={18} /></span>

        </div>

      </section>

      <div className="stats-grid">

        <StatCard icon={<ListTodo size={17} />} label="Total tasks" value={stats.total ?? 0} tone="purple" />

        <StatCard icon={<Check size={17} />} label="Completed" value={stats.completed ?? 0} tone="green" />

        <StatCard icon={<Clock3 size={17} />} label="In progress" value={stats.in_progress ?? 0} tone="blue" />

        <StatCard icon={<Target size={17} />} label={user.role === 'manager' ? 'Overdue' : 'To do'} value={user.role === 'manager' ? (stats.overdue ?? 0) : (stats.to_do ?? 0)} tone="orange" />

      </div>

      <div className="dashboard-columns">

        <section className="panel task-panel">

          <div className="panel-heading">

            <div><h3>Priority tasks</h3><p>Your next work, at a glance</p></div>

            <button className="text-button" onClick={() => onPage('tasks')}>View all <ArrowRight size={14} /></button>

          </div>

          <TaskList tasks={tasks.slice(0, 6)} isManager={user.role === 'manager'} onSelect={() => {}} onUpdate={onUpdate} compact />

        </section>

        <section className="panel activity-panel">

          <div className="panel-heading">

            <div><h3>Recent activity</h3><p>Latest workspace updates</p></div>

            <button className="text-button" onClick={() => onPage('activity')}>View activity <ArrowRight size={14} /></button>

          </div>

          <ActivityList items={activity.slice(0, 6)} />

        </section>

      </div>

    </>

  );

}

function StatCard({ icon, label, value, tone }) {

  return (

    <div className={`stat-card stat-${tone}`}>

      <span className="stat-icon">{icon}</span>

      <span className="stat-label">{label}</span>

      <small className="stat-value">{value}</small>

      <span className="stat-note">Workspace total</span>

    </div>

  );

}

function TasksPage({ user, tasks, status, setStatus, query, setQuery, onCreate, onUpdate, onDelete, onSelect }) {

  const statuses = ['All', 'To Do', 'In Progress', 'Completed'];

  return (

    <section className="panel page-panel">

      <div className="filter-bar">

        <div className="filter-tabs" role="tablist" aria-label="Filter tasks by status">

          {statuses.map(value => (

            <button type="button" role="tab" aria-selected={status === value}

              className={status === value ? 'selected' : ''} key={value}

              onClick={() => setStatus(value)}>

              {value}<span>{value === 'All' ? tasks.length : tasks.filter(task => task.status === value).length}</span>

            </button>

          ))}

        </div>

        <div className="filter-right">

          <label className="task-search">

            <Filter size={15} />

            <input aria-label="Search tasks" placeholder="Search tasks" value={query}

              onChange={event => setQuery(event.target.value)} />

          </label>

          {user.role === 'manager' && (

            <button className="btn btn-primary" onClick={onCreate}><Plus size={16} /> New task</button>

          )}

        </div>

      </div>

      <TaskList tasks={tasks} isManager={user.role === 'manager'} onSelect={onSelect} onUpdate={onUpdate} onDelete={onDelete} />

    </section>

  );

}

function TaskList({ tasks, isManager, onSelect, onUpdate, onDelete, compact = false }) {

  if (!tasks.length) {

    return <EmptyState icon={<ListTodo size={19} />} title="No tasks to show" message="Tasks assigned to this workspace will appear here." />;

  }

  return (

    <div className="task-list">

      {tasks.map(task => (

        <article className="task-row" key={task.id}>

          <button className="task-row-main task-open" onClick={() => onSelect?.(task)}>

            <span className={`priority-dot priority-${task.priority?.toLowerCase()}`} />

            <span className="task-copy">

              <strong>{task.title}</strong>

              <small>{task.project || 'General'}{isManager ? ` · ${task.assigned_to}` : ''}</small>

              <span className="task-progress">

                <span><i style={{ width: `${task.progress || 0}%` }} /></span>

                <small>{task.progress || 0}%</small>

              </span>

            </span>

          </button>

          <div className="task-row-end">

            <span className={`status-pill status-${task.status?.toLowerCase().replaceAll(' ', '-')}`}>{task.status}</span>

            <span className={task.overdue ? 'deadline overdue' : 'deadline'}>{task.overdue ? 'Overdue' : dateText(task.due_date)}</span>

            {!compact && (

              <div className="task-row-actions">

                {!isManager && (

                  <select aria-label={`Update ${task.title} status`} value={task.status}

                    onChange={event => onUpdate(task, { status: event.target.value })}>

                    <option>To Do</option><option>In Progress</option><option>Completed</option>

                  </select>

                )}

                {isManager && (

                  <button className="icon-btn" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)}>

                    <X size={15} />

                  </button>

                )}

              </div>

            )}

          </div>

        </article>

      ))}

    </div>

  );

}

function ProjectsPage({ projects, tasks, isManager, onCreate }) {

  if (!projects.length && !isManager) {

    return <EmptyState icon={<FolderKanban size={19} />} title="No projects yet" message="Projects with tasks assigned to you will appear here." />;

  }

  return (

    <div className="projects-grid">

      {projects.map((project, index) => {

        const related = tasks.filter(task => task.project_id === project.id);

        return (

          <article className="project-card" key={project.id}>

            <div className="project-card-top"><span className="status-pill status-active">{project.status || 'Active'}</span></div>

            <div className={`project-card-icon avatar-color-${index % 4 + 1}`}><FolderKanban size={19} /></div>

            <h3>{project.name}</h3>

            <p>{project.description || 'No description provided.'}</p>

            <div className="project-progress">

              <span><i style={{ width: `${project.progress || 0}%` }} /></span>

              <b>{project.progress || 0}%</b>

            </div>

            <div className="project-card-foot">

              <span><ListTodo size={13} />{project.task_count ?? related.length} tasks</span>

              <span><Check size={13} />{project.completed_count ?? related.filter(task => task.status === 'Completed').length} done</span>

            </div>

          </article>

        );

      })}

      {isManager && (

        <button className="new-project-card" onClick={onCreate}>

          <div><Plus size={18} /></div><b>Create a project</b><span>Group related work together</span>

        </button>

      )}

    </div>

  );

}

function TeamPage({ members, tasks, onAdd, onToggle, onEditSkills }) {

  const active = members.filter(member => member.active).length;

  return (

    <>

      <div className="team-summary">

        <div>

          <span className="eyebrow">TEAM OVERVIEW</span>

          <h2>{members.length} team {members.length === 1 ? 'member' : 'members'}</h2>

          <p>{active} active · {members.length - active} inactive</p>

        </div>

        <div className="team-avatars">

          {members.slice(0, 5).map((member, index) => (

            <span className={`avatar avatar-overlap avatar-color-${index % 4 + 1}`} title={member.name} key={member.id}>

              {initials(member.name)}

            </span>

          ))}

        </div>

      </div>

      <div className="members-grid">

        {members.map((member, index) => {

          const assigned = tasks.filter(task => task.assigned_to_id === member.id);

          return (

            <article className="member-card" key={member.id}>

              <div className="member-card-top">

                <span className={`avatar avatar-large avatar-color-${index % 4 + 1}`}>{initials(member.name)}</span>

                <span className={`status-pill ${member.active ? 'status-active' : 'status-inactive'}`}>{member.active ? 'Active' : 'Inactive'}</span>

              </div>

              <h3>{member.name}</h3><p>{member.email}</p>

              <div className="member-meta">

                <span><BriefcaseBusiness size={13} />{member.department || 'Team'}</span>

                <span><ListTodo size={13} />{member.task_count ?? assigned.length} tasks</span>

              </div>

              <div className="member-skills">
                <span className="member-skills-label">Skills</span>
                <button
  className="text-button"
  onClick={() => {
    const currentSkills = Array.isArray(member.skills)
      ? member.skills.join(', ')
      : member.skills || '';

    const updatedSkills = window.prompt(
      `Enter skills for ${member.name} (comma-separated):`,
      currentSkills
    );

    if (updatedSkills !== null) {
      onEditSkills(member, updatedSkills);
    }
  }}
>
  Edit skills
</button>
                <div className="skill-tags">
                  {(Array.isArray(member.skills) ? member.skills : typeof member.skills === 'string' ? member.skills.split(',') : [])
                    .map(skill => String(skill).trim()).filter(Boolean).map(skill => <span className="skill-tag" key={skill}>{skill}</span>)}
                  {!(Array.isArray(member.skills) ? member.skills : typeof member.skills === 'string' ? member.skills.split(',').filter(Boolean) : []).length && <span className="skills-empty">No skills added yet</span>}
                </div>
              </div>

              <div className="member-card-foot">

                <span>{member.completed_count ?? assigned.filter(task => task.status === 'Completed').length} completed</span>

                <button className="text-button" onClick={() => onToggle(member)}>{member.active ? 'Disable access' : 'Enable access'}</button>

              </div>

            </article>

          );

        })}

        <button className="new-member-card" onClick={onAdd}>

          <div><Plus size={18} /></div><b>Add a team member</b><span>Create an employee workspace</span>

        </button>

      </div>

    </>

  );

}

function ActivityList({ items }) {

  if (!items.length) {

    return <EmptyState icon={<Activity size={19} />} title="No recent activity" message="Workspace updates will appear here." />;

  }

  return (

    <div className="activity-list">

      {items.map(item => (

        <div className="activity-item" key={item.id}>

          <span className="activity-avatar">{initials(item.actor || 'System')}</span>

          <div>

            <strong>{item.actor || 'System'}</strong>

            <span> {item.action?.toLowerCase()}</span>

            <p>{item.details || item.task_title || 'Workspace updated'}</p>

            <small>{timeAgo(item.created_at)}</small>

          </div>

        </div>

      ))}

    </div>

  );

}

function ActivityPage({ items }) {

  return (

    <section className="panel page-panel">

      <div className="section-head"><div><h3>Workspace timeline</h3><p>Recent actions and task changes</p></div></div>

      {items.length ? (

        <div className="timeline">

          {items.map(item => (

            <div className="timeline-row" key={item.id}>

              <span className="activity-avatar">{initials(item.actor || 'System')}</span>

              <div className="timeline-copy">

                <strong>{item.actor || 'System'}</strong>

                <span> {item.action?.toLowerCase()}</span>

                <p>{item.details || item.task_title || 'Workspace updated'}</p>

              </div>

              <time dateTime={item.created_at}>

                {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}

                <small>{timeAgo(item.created_at)}</small>

              </time>

            </div>

          ))}

        </div>

      ) : (

        <EmptyState icon={<Activity size={19} />} title="No activity yet" message="Actions from your workspace will appear here." />

      )}

    </section>

  );

}

function ReportsPage({ report, tasks }) {

  const byStatus = report?.by_status || {};

  const byPriority = report?.by_priority || {};

  return (

    <>

      <div className="stats-grid report-stats">

        <StatCard icon={<ListTodo size={17} />} label="Total tasks" value={report?.total ?? tasks.length} tone="purple" />

        <StatCard icon={<CheckCheck size={17} />} label="Completed" value={report?.completed ?? 0} tone="green" />

        <StatCard icon={<Target size={17} />} label="Completion rate" value={`${report?.completion_rate ?? 0}%`} tone="blue" />

        <StatCard icon={<Clock3 size={17} />} label="Overdue" value={report?.overdue ?? 0} tone="orange" />

      </div>

      <div className="reports-grid">

        <section className="panel report-panel">

          <div className="section-head"><div><h3>Tasks by status</h3><p>Current delivery breakdown</p></div></div>

          {['To Do', 'In Progress', 'Completed'].map(status => (

            <ReportBar key={status} label={status}

              value={byStatus[status] ?? tasks.filter(task => task.status === status).length}

              total={report?.total ?? tasks.length} />

          ))}

        </section>

        <section className="panel report-panel">

          <div className="section-head"><div><h3>Tasks by priority</h3><p>Where attention is focused</p></div></div>

          {['Urgent', 'High', 'Medium', 'Low'].map(priority => (

            <ReportBar key={priority} label={priority}

              value={byPriority[priority] ?? tasks.filter(task => task.priority === priority).length}

              total={report?.total ?? tasks.length} />

          ))}

        </section>

      </div>

    </>

  );

}

function ReportBar({ label, value, total, tone = '' }) {

  return (

    <div className="report-bar-row">

      <div><span>{label}</span><b>{value}</b></div>

      <span className={`report-track ${tone}`}>

       <i
  style={{
    width: `${total ? Math.min(100, (value / total) * 100) : 0}%`
  }}
/>

      </span>

    </div>

  );

}

function TaskDetail({ task, isManager, onUpdate, onDelete }) {

  return (

    <div className="task-detail">

      <p>{task.description || 'No additional description.'}</p>

      <div className="detail-grid">

        <div><small>Assignee</small><b>{task.assigned_to}</b></div>

        <div><small>Project</small><b>{task.project || 'General'}</b></div>

        <div><small>Priority</small><b>{task.priority}</b></div>

        <div><small>Deadline</small><b className={task.overdue ? 'overdue' : ''}>{task.overdue ? 'Overdue' : dateText(task.due_date)}</b></div>

      </div>

      <div className="detail-progress">

        <div><span>Progress</span><b>{task.progress || 0}%</b></div>

        <input type="range" min="0" max="100" step="5" value={task.progress || 0}

          aria-label="Task progress"

          onChange={event => onUpdate(task, { progress: Number(event.target.value) })} />

      </div>

      <Field label="Status">

        <select value={task.status} onChange={event => onUpdate(task, { status: event.target.value })}>

          <option>To Do</option><option>In Progress</option><option>Completed</option>

        </select>

      </Field>

      {isManager && <button className="btn btn-danger" onClick={() => onDelete(task)}><X size={15} /> Delete task</button>}

    </div>

  );

}

function Field({ label, children }) {

  return <label className="field"><span>{label}</span>{children}</label>;

}

function Modal({ title, subtitle, onClose, children }) {

  return (

    <div className="modal-overlay" role="presentation"

      onMouseDown={event => {

        if (event.target === event.currentTarget) onClose();

      }}>

      <section className="modal-card" role="dialog" aria-modal="true" aria-label={title}>

        <div className="modal-heading">

          <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>

          <button type="button" className="icon-btn" aria-label="Close dialog" onClick={onClose}>

            <X size={18} />

          </button>

        </div>

        {children}

      </section>

    </div>

  );

}

function EmptyState({ icon, title, message }) {

  return <div className="empty-state"><div>{icon}</div><b>{title}</b><p>{message}</p></div>;

}

export default App;