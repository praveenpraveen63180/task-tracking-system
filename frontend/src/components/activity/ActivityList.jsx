import { Activity } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import { initials, timeAgo } from '../../utils/helpers';

export default function ActivityList({ items }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={<Activity size={19} />}
        title="No recent activity"
        message="Workspace updates will appear here."
      />
    );
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
