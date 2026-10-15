import { Check, FolderKanban, ListTodo, Plus } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export default function ProjectsPage({ projects, tasks, isManager, onCreate }) {
  if (!projects.length && !isManager) {
    return (
      <EmptyState
        icon={<FolderKanban size={19} />}
        title="No projects yet"
        message="Projects with tasks assigned to you will appear here."
      />
    );
  }

  return (
    <div className="projects-grid">
      {projects.map((project, index) => {
        const related = tasks.filter(task => task.project_id === project.id);
        return (
          <article className="project-card" key={project.id}>
            <div className="project-card-top">
              <span className="status-pill status-active">
                {project.status || 'Active'}
              </span>
            </div>
            <div className={`project-card-icon avatar-color-${(index % 4) + 1}`}>
              <FolderKanban size={19} />
            </div>
            <h3>{project.name}</h3>
            <p>{project.description || 'No description provided.'}</p>
            <div className="project-progress">
              <span>
                <i style={{ width: `${project.progress || 0}%` }} />
              </span>
              <b>{project.progress || 0}%</b>
            </div>
            <div className="project-card-foot">
              <span>
                <ListTodo size={13} />
                {project.task_count ?? related.length} tasks
              </span>
              <span>
                <Check size={13} />
                {project.completed_count ??
                  related.filter(task => task.status === 'Completed').length}{' '}
                done
              </span>
            </div>
          </article>
        );
      })}

      {isManager && (
        <button className="new-project-card" onClick={onCreate}>
          <div>
            <Plus size={18} />
          </div>
          <b>Create a project</b>
          <span>Group related work together</span>
        </button>
      )}
    </div>
  );
}
