import { BriefcaseBusiness, ListTodo, Plus } from 'lucide-react';
import { initials } from '../utils/helpers';

export default function TeamPage({ members, tasks, onAdd, onToggle, onEditSkills }) {
  const active = members.filter(member => member.active).length;

  return (
    <>
      <div className="team-summary">
        <div>
          <span className="eyebrow">TEAM OVERVIEW</span>
          <h2>
            {members.length} team {members.length === 1 ? 'member' : 'members'}
          </h2>
          <p>
            {active} active · {members.length - active} inactive
          </p>
        </div>

        <div className="team-avatars">
          {members.slice(0, 5).map((member, index) => (
            <span
              className={`avatar avatar-overlap avatar-color-${(index % 4) + 1}`}
              title={member.name}
              key={member.id}
            >
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
                <span className={`avatar avatar-large avatar-color-${(index % 4) + 1}`}>
                  {initials(member.name)}
                </span>
                <span
                  className={`status-pill ${
                    member.active ? 'status-active' : 'status-inactive'
                  }`}
                >
                  {member.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3>{member.name}</h3>
              <p>{member.email}</p>

              <div className="member-meta">
                <span>
                  <BriefcaseBusiness size={13} />
                  {member.department || 'Team'}
                </span>
                <span>
                  <ListTodo size={13} />
                  {member.task_count ?? assigned.length} tasks
                </span>
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
                  {(Array.isArray(member.skills)
                    ? member.skills
                    : typeof member.skills === 'string'
                    ? member.skills.split(',')
                    : []
                  )
                    .map(skill => String(skill).trim())
                    .filter(Boolean)
                    .map(skill => (
                      <span className="skill-tag" key={skill}>
                        {skill}
                      </span>
                    ))}
                  {!(Array.isArray(member.skills)
                    ? member.skills
                    : typeof member.skills === 'string'
                    ? member.skills.split(',').filter(Boolean)
                    : []
                  ).length && <span className="skills-empty">No skills added yet</span>}
                </div>
              </div>

              <div className="member-card-foot">
                <span>
                  {member.completed_count ??
                    assigned.filter(task => task.status === 'Completed').length}{' '}
                  completed
                </span>
                <button className="text-button" onClick={() => onToggle(member)}>
                  {member.active ? 'Disable access' : 'Enable access'}
                </button>
              </div>
            </article>
          );
        })}

        <button className="new-member-card" onClick={onAdd}>
          <div>
            <Plus size={18} />
          </div>
          <b>Add a team member</b>
          <span>Create an employee workspace</span>
        </button>
      </div>
    </>
  );
}
