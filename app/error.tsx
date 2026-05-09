"use client";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="aa-shell">
      <main className="aa-main" role="alert">
        <section className="aa-card aa-card-danger">
          <div className="aa-card-head">
            <h2>Workspace state could not load</h2>
            <p>
              The current page could not read the Agent commerce state. No order, payment, permission, evidence, or
              acceptance action was executed.
            </p>
          </div>
          <p className="aa-meta">Failure reason: {error.message || error.digest || "unknown runtime error"}</p>
          <button aria-label="Retry loading AlphaAgents workspace" className="aa-button" type="button" onClick={reset}>
            Retry
          </button>
        </section>
      </main>
    </div>
  );
}
