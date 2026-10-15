import { ListTodo, X } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import { dateText } from '../../utils/helpers';

export default function TaskList({
  tasks,
  isManager,
  onSelect,
  onUpdate,
  onDelete,
  compact = false
}) {
  if (!tasks.length) {
    return (
      <EmptyState
        icon={<ListTodo size={19} />}
        title="No tasks to show"
        message="Tasks assigned to this workspace will appear here."
      />
    );
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <article className="task-row" key={task.id}>
          <button className="task-row-main task-open" onClick={() => onSelect?.(task)}>
            <span className={`priority-dot priority-${task.priority?.toLowerCase()}`} />
            <span className="task-copy">
              <strong>{task.title}</strong>
              <small>
                {task.project || 'General'}
                {isManager ? ` · ${task.assigned_to}` : ''}
              </small>
              <span className="task-progress">
                <span>
                  <i style={{ width: `${task.progress || 0}%` }} />
                </span>
                <small>{task.progress || 0}%</small>
              </span>
            </span>
          </button>

          <div className="task-row-end">
            <span
              className={`status-pill status-${task.status
                ?.toLowerCase()
                .replaceAll(' ', '-')}`}
            >
              {task.status}
            </span>
            <span className={task.overdue ? 'deadline overdue' : 'deadline'}>
              {task.overdue ? 'Overdue' : dateText(task.due_date)}
            </span>
            {!compact && (
              <div className="task-row-actions">
                {!isManager && (
                  <select
                    aria-label={`Update ${task.title} status`}
                    value={task.status}
                    onChange={event => onUpdate(task, { status: event.target.value })}
                  >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                )}
                {isManager && (
                  <button
                    className="icon-btn"
                    aria-label={`Delete ${task.title}`}
                    onClick={() => onDelete(task)}
                  >
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
