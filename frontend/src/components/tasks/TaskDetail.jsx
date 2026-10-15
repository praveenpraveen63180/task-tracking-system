import { X } from 'lucide-react';
import Field from '../common/Field';
import { dateText } from '../../utils/helpers';

export default function TaskDetail({ task, isManager, onUpdate, onDelete }) {
  return (
    <div className="task-detail">
      <p>{task.description || 'No additional description.'}</p>

      <div className="detail-grid">
        <div>
          <small>Assignee</small>
          <b>{task.assigned_to}</b>
        </div>
        <div>
          <small>Project</small>
          <b>{task.project || 'General'}</b>
        </div>
        <div>
          <small>Priority</small>
          <b>{task.priority}</b>
        </div>
        <div>
          <small>Deadline</small>
          <b className={task.overdue ? 'overdue' : ''}>
            {task.overdue ? 'Overdue' : dateText(task.due_date)}
          </b>
        </div>
      </div>

      <div className="detail-progress">
        <div>
          <span>Progress</span>
          <b>{task.progress || 0}%</b>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={task.progress || 0}
          aria-label="Task progress"
          onChange={event => onUpdate(task, { progress: Number(event.target.value) })}
        />
      </div>

      <Field label="Status">
        <select
          value={task.status}
          onChange={event => onUpdate(task, { status: event.target.value })}
        >
          <option>To Do</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </Field>

      {isManager && (
        <button className="btn btn-danger" onClick={() => onDelete(task)}>
          <X size={15} /> Delete task
        </button>
      )}
    </div>
  );
}
