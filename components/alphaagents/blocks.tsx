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

type CliApiEventsPanelProps = {
  a19Id: string;
  subject: string;
  commands: string[];
  apiRoutes: Array<{ method: "GET" | "POST" | "DELETE"; path: string; purpose: string }>;
  events: string[];
  dtoRefs?: string[];
  defaultOpen?: boolean;
  mismatch?: boolean;
};

export function CliApiEventsPanel({
  a19Id,
  subject,
  commands,
  apiRoutes,
  events,
  dtoRefs = [],
  defaultOpen = false,
  mismatch = false
}: CliApiEventsPanelProps) {
  return (
    <details className="aa-a19-panel" data-a19={a19Id} open={defaultOpen}>
      <summary>
        CLI / API / Events <span className="aa-meta">{subject}</span>
      </summary>
      <SectionCard
        title="CLI / API / Events"
        subtitle={`${subject} must expose the same command, route, DTO, and event contract to buyers and operators.`}
        tone={mismatch ? "warning" : "default"}
      >
        <div>
          <Chip tone={mismatch ? "warning" : "trust"}>{a19Id}</Chip>
          {dtoRefs.map((dtoRef) => (
            <Chip key={dtoRef}>{dtoRef}</Chip>
          ))}
        </div>
        <div className="aa-grid aa-grid-2" style={{ marginTop: 12 }}>
          <div>
            {commands.map((command) => (
              <CommandPreview key={command} command={command} mismatch={mismatch} />
            ))}
          </div>
          <DataTable
            columns={[
              { key: "method", label: "Method" },
              { key: "path", label: "API route" },
              { key: "purpose", label: "Purpose" }
            ]}
            rows={apiRoutes.map((route) => ({
              method: <Chip tone={route.method === "GET" ? "default" : "trust"}>{route.method}</Chip>,
              path: route.path,
              purpose: route.purpose
            }))}
          />
        </div>
        <DataTable
          columns={[
            { key: "event", label: "Event" },
            { key: "subject", label: "Subject" }
          ]}
          rows={events.map((event) => ({
            event,
            subject
          }))}
        />
      </SectionCard>
    </details>
  );
}
