import Modal from '../common/Modal';
import Field from '../common/Field';

export default function MemberModal({
  form,
  setForm,
  busy,
  onSubmit,
  onClose
}) {
  return (
    <Modal
      title="Add team member"
      subtitle="Create an employee login and invite them to the workspace."
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={onSubmit}>
        <Field label="Full name">
          <input
            required
            minLength="2"
            autoComplete="name"
            placeholder="e.g. Alex Morgan"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Email address">
          <input
            required
            type="email"
            autoComplete="email"
            placeholder="alex@company.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Temporary password">
          <input
            required
            minLength="8"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <Field label="Department">
          <input
            value={form.department}
            onChange={e => setForm({ ...form, department: e.target.value })}
          />
        </Field>
        <Field label="Skills (comma-separated)">
          <input
            placeholder="e.g. React, Python, SQL"
            value={form.skills}
            onChange={e => setForm({ ...form, skills: e.target.value })}
          />
          <small className="field-help">
            Add skills to help the manager choose a suitable assignee.
          </small>
        </Field>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Add member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
