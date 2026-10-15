import {
  Activity,
  ArrowRight,
  Check,
  Clock3,
  Gauge,
  ListTodo,
  Plus,
  Target,
  Zap
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import TaskList from '../components/tasks/TaskList';
import ActivityList from '../components/activity/ActivityList';
import { useNavigate } from '../router';

export default function OverviewPage({
  user,
  data,
  tasks,
  activity,
  onCreateTask,
  onUpdateTask,
  onSelectTask
}) {
  const navigate = useNavigate();
  const stats = data?.stats || {};
  const isManager = user?.role === 'manager';

  return (
    <>
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="promo-pill">
            <Activity size={13} /> WORKSPACE PULSE
          </span>
          <h2>
            {isManager
              ? 'A focused team makes progress.'
              : 'Small steps add up to great work.'}
          </h2>
          <p>
            {stats.overdue
              ? `${stats.overdue} overdue ${
                  stats.overdue === 1 ? 'task needs' : 'tasks need'
                } attention. `
              : 'Your workspace is up to date. '}
            Check what is moving and what needs a hand.
          </p>
          <button
            className="btn btn-light"
            onClick={isManager ? onCreateTask : () => navigate('/tasks')}
          >
            {isManager ? (
              <>
                <Plus size={15} /> Assign a task
              </>
            ) : (
              <>
                View my tasks <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>

        <div className="banner-art" aria-hidden="true">
          <div className="banner-ring">
            <div className="banner-ring-inner">
              <Gauge size={44} />
            </div>
          </div>
          <span className="banner-spark">
            <Zap size={18} />
          </span>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard
          icon={<ListTodo size={17} />}
          label="Total tasks"
          value={stats.total ?? 0}
          tone="purple"
        />
        <StatCard
          icon={<Check size={17} />}
          label="Completed"
          value={stats.completed ?? 0}
          tone="green"
        />
        <StatCard
          icon={<Clock3 size={17} />}
          label="In progress"
          value={stats.in_progress ?? 0}
          tone="blue"
        />
        <StatCard
          icon={<Target size={17} />}
          label={isManager ? 'Overdue' : 'To do'}
          value={isManager ? stats.overdue ?? 0 : stats.to_do ?? 0}
          tone="orange"
        />
      </div>

      <div className="dashboard-columns">
        <section className="panel task-panel">
          <div className="panel-heading">
            <div>
              <h3>Priority tasks</h3>
              <p>Your next work, at a glance</p>
            </div>
            <button className="text-button" onClick={() => navigate('/tasks')}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          <TaskList
            tasks={tasks.slice(0, 6)}
            isManager={isManager}
            onSelect={onSelectTask}
            onUpdate={onUpdateTask}
            compact
          />
        </section>

        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Recent activity</h3>
              <p>Latest workspace updates</p>
            </div>
            <button className="text-button" onClick={() => navigate('/activity')}>
              View activity <ArrowRight size={14} />
            </button>
          </div>
          <ActivityList items={activity.slice(0, 6)} />
        </section>
      </div>
    </>
  );
}
