import Link from "next/link";

export function AppShell({ shell, currentPath, children }: { shell: ReturnType<typeof import("../../lib/alphaagents/view-models.js").getShellModel>; currentPath: string; children: React.ReactNode }) {
  return (
    <div className="aa-shell">
      <aside className="aa-sidebar">
        <div className="aa-brand">
          <div className="aa-brand-mark">LP</div>
          <div>
            <div className="aa-brand-title">{shell.title}</div>
            <div className="aa-brand-subtitle">{shell.strapline}</div>
          </div>
        </div>
        <nav className="aa-nav">
          {shell.navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`aa-nav-item${currentPath === item.href ? " is-active" : ""}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="aa-sidecard">
          <div className="aa-sidecard-label">Default first purchase</div>
          <div className="aa-sidecard-title">{shell.trialListing.title}</div>
          <div className="aa-sidecard-copy">
            ¥{(shell.trialListing.startingPriceMinor / 100).toLocaleString("en-US")} / {shell.trialListing.deliveryHours}h / conditional release
          </div>
        </div>
      </aside>
      <main className="aa-main">
        <header className="aa-topbar">
          <div>
            <div className="aa-page-eyebrow">Agent Native</div>
            <h1 className="aa-page-title">{shell.title}</h1>
          </div>
          <div className="aa-topbar-right">
            <div className="aa-stat">
              <span>Active orders</span>
              <strong>{shell.orderCounts.active}</strong>
            </div>
            <div className="aa-stat">
              <span>Review ready</span>
              <strong>{shell.orderCounts.reviewReady}</strong>
            </div>
            <div className="aa-stat">
              <span>Disputed</span>
              <strong>{shell.orderCounts.disputed}</strong>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
