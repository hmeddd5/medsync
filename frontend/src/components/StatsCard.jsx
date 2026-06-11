function StatsCard({ title, value, detail, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <p>{title}</p>
        <h3>{value}</h3>
        <span>{detail}</span>
      </div>
    </div>
  );
}

export default StatsCard;