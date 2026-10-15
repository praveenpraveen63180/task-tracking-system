import { Filter, Plus } from 'lucide-react';
import TaskList from '../components/tasks/TaskList';

export default function TasksPage({
  user,
  tasks,
  status,
  setStatus,
  query,
  setQuery,
  onCreate,
  onUpdate,
  onDelete,
  onSelect
}) {
  const statuses = ['All', 'To Do', 'In Progress', 'Completed'];

  return (
    <section className="panel page-panel">
      <div className="filter-bar">
        <div className="filter-tabs" role="tablist" aria-label="Filter tasks by status">
          {statuses.map(value => (
            <button
              type="button"
              role="tab"
              aria-selected={status === value}
              className={status === value ? 'selected' : ''}
              key={value}
              onClick={() => setStatus(value)}
            >
              {value}
              <span>
                {value === 'All'
                  ? tasks.length
                  : tasks.filter(task => task.status === value).length}
              </span>
            </button>
          ))}
        </div>

        <div className="filter-right">
          <label className="task-search">
            <Filter size={15} />
            <input
              aria-label="Search tasks"
              placeholder="Search tasks"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          </label>
          {user.role === 'manager' && (
            <button className="btn btn-primary" onClick={onCreate}>
              <Plus size={16} /> New task
            </button>
          )}
        </div>
      </div>

      <TaskList
        tasks={tasks}
        isManager={user.role === 'manager'}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </section>
  );
}
