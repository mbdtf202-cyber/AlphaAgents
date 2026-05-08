export function SectionCard({ title, subtitle, children, tone = "default" }: { title: string; subtitle?: string; children: React.ReactNode; tone?: "default" | "trust" | "warning" | "danger"; }) {
  return (
    <section className={`aa-card aa-card-${tone}`}>
      <div className="aa-card-head">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function DataTable({
  columns,
  rows
}: {
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, React.ReactNode>>;
}) {
  return (
    <div className="aa-table-wrap">
      <table className="aa-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>{row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Chip({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "trust" | "warning" | "danger"; }) {
  return <span className={`aa-chip aa-chip-${tone}`}>{children}</span>;
}

export function CommandPreview({ command, mismatch = false }: { command: string; mismatch?: boolean }) {
  return <pre className={`aa-command${mismatch ? " is-mismatch" : ""}`}>{command}</pre>;
}

export function KpiStrip({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="aa-kpis">
      {items.map((item) => (
        <article key={item.label} className="aa-kpi">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </article>
      ))}
    </div>
  );
}
