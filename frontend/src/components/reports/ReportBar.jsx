export default function ReportBar({ label, value, total, tone = '' }) {
  return (
    <div className="report-bar-row">
      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <span className={`report-track ${tone}`}>
        <i
          style={{
            width: `${total ? Math.min(100, (value / total) * 100) : 0}%`
          }}
        />
      </span>
    </div>
  );
}
