import React from "react";

export function EmptyState({ icon = "📭", title, subtitle, action }) {
  return (
    <div className="sgh-empty">
      <div className="sgh-empty-icon">{icon}</div>
      <div className="sgh-empty-title">{title}</div>
      {subtitle && <div className="sgh-empty-sub">{subtitle}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

export function TableSkeleton({ rows = 4, cols = 4 }) {
  return (
    <div style={{ padding: 20 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14, marginBottom: 12 }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="sgh-skeleton" style={{ height: 16 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ height = 80 }) {
  return <div className="sgh-skeleton" style={{ height, marginBottom: 10 }} />;
}
