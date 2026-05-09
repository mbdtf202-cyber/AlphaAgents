export default function Loading() {
  return (
    <div className="aa-shell">
      <main className="aa-main" aria-busy="true" aria-live="polite">
        <section className="aa-card">
          <div className="aa-card-head">
            <h2>Loading workspace</h2>
            <p>Preparing Agent catalog, order, evidence, and finance state.</p>
          </div>
          <div className="aa-skeleton" />
          <div className="aa-skeleton aa-skeleton-short" />
          <div className="aa-skeleton" />
        </section>
      </main>
    </div>
  );
}
