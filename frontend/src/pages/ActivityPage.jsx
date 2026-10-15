import { Activity } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import { initials, timeAgo } from '../utils/helpers';

export default function ActivityPage({ items }) {
  return (
    <section className="panel page-panel">
      <div className="section-head">
        <div>
          <h3>Workspace timeline</h3>
          <p>Recent actions and task changes</p>
        </div>
      </div>

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
                {new Date(item.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short'
                })}
                <small>{timeAgo(item.created_at)}</small>
              </time>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Activity size={19} />}
          title="No activity yet"
          message="Actions from your workspace will appear here."
        />
      )}
    </section>
  );
}
