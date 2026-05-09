"use client";

import { useState } from "react";

export function CopyCommandButton({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCommand() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      aria-label="Copy CLI command to clipboard"
      className="aa-command-copy"
      type="button"
      onClick={() => void copyCommand()}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
