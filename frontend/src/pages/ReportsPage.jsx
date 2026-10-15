import { CheckCheck, Clock3, ListTodo, Target } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import ReportBar from '../components/reports/ReportBar';

export default function ReportsPage({ report, tasks }) {
  const byStatus = report?.by_status || {};
  const byPriority = report?.by_priority || {};

  return (
    <>
      <div className="stats-grid report-stats">
        <StatCard
          icon={<ListTodo size={17} />}
          label="Total tasks"
          value={report?.total ?? tasks.length}
          tone="purple"
        />
        <StatCard
          icon={<CheckCheck size={17} />}
          label="Completed"
          value={report?.completed ?? 0}
          tone="green"
        />
        <StatCard
          icon={<Target size={17} />}
          label="Completion rate"
          value={`${report?.completion_rate ?? 0}%`}
          tone="blue"
        />
        <StatCard
          icon={<Clock3 size={17} />}
          label="Overdue"
          value={report?.overdue ?? 0}
          tone="orange"
        />
      </div>

      <div className="reports-grid">
        <section className="panel report-panel">
          <div className="section-head">
            <div>
              <h3>Tasks by status</h3>
              <p>Current delivery breakdown</p>
            </div>
          </div>
          {['To Do', 'In Progress', 'Completed'].map(status => (
            <ReportBar
              key={status}
              label={status}
              value={
                byStatus[status] ??
                tasks.filter(task => task.status === status).length
              }
              total={report?.total ?? tasks.length}
            />
          ))}
        </section>

        <section className="panel report-panel">
          <div className="section-head">
            <div>
              <h3>Tasks by priority</h3>
              <p>Where attention is focused</p>
            </div>
          </div>
          {['Urgent', 'High', 'Medium', 'Low'].map(priority => (
            <ReportBar
              key={priority}
              label={priority}
              value={
                byPriority[priority] ??
                tasks.filter(task => task.priority === priority).length
              }
              total={report?.total ?? tasks.length}
            />
          ))}
        </section>
      </div>
    </>
  );
}
