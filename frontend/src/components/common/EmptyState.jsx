export default function EmptyState({ icon, title, message }) {
  return (
    <div className="empty-state">
      <div>{icon}</div>
      <b>{title}</b>
      <p>{message}</p>
    </div>
  );
}
