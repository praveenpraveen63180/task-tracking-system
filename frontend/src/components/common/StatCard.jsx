export default function StatCard({ icon, label, value, tone }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span className="stat-icon">{icon}</span>
      <span className="stat-label">{label}</span>
      <small className="stat-value">{value}</small>
      <span className="stat-note">Workspace total</span>
    </div>
  );
}
