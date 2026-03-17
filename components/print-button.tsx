"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-ink-950 px-4 py-2 text-sm font-semibold text-parchment"
    >
      {label}
    </button>
  );
}
