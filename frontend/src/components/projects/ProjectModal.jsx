import Modal from '../common/Modal';
import Field from '../common/Field';

export default function ProjectModal({
  form,
  setForm,
  busy,
  onSubmit,
  onClose
}) {
  return (
    <Modal
      title="Create a project"
      subtitle="Group related tasks and track progress in one place."
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={onSubmit}>
        <Field label="Project name">
          <input
            required
            minLength="2"
            placeholder="e.g. Website refresh"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Description">
          <textarea
            rows="4"
            placeholder="What is this project about?"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </Field>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
