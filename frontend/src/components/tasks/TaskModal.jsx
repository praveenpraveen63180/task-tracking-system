import Modal from '../common/Modal';
import Field from '../common/Field';

export default function TaskModal({
  form,
  setForm,
  members,
  projects,
  busy,
  onSubmit,
  onClose
}) {
  return (
    <Modal
      title="Create a new task"
      subtitle="Give your teammate clarity on what needs to get done."
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={onSubmit}>
        <Field label="Task title">
          <input
            required
            minLength="2"
            placeholder="e.g. Design the new dashboard"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
        </Field>

        <Field label="Description">
          <textarea
            rows="3"
            placeholder="Add context, acceptance criteria or notes…"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </Field>

        <div className="form-grid">
          <Field label="Assignee">
            <select
              required
              value={form.assigned_to_id}
              onChange={e => setForm({ ...form, assigned_to_id: e.target.value })}
            >
              <option value="">Select employee</option>
              {members
                .filter(m => m.active)
                .map(m => {
                  const skills = Array.isArray(m.skills)
                    ? m.skills
                    : typeof m.skills === 'string'
                    ? m.skills.split(',').filter(Boolean)
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
              value={form.project_id}
              onChange={e => setForm({ ...form, project_id: e.target.value })}
            >
              <option value="">General</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Priority">
            <select
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
            >
              {['Low', 'Medium', 'High', 'Urgent'].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>

          <Field label="Deadline">
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={form.due_date}
              onChange={e => setForm({ ...form, due_date: e.target.value })}
            />
          </Field>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
