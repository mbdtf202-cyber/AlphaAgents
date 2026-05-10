import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));

function fail(message) {
  throw new Error(`[frontend-implementation] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertIncludes(source, token, label) {
  assert(source.includes(token), `${label} must include ${token}`);
}

const visual = read("docs/frontend-visual-design.md");
for (const token of [
  "CLI 命令块必须可键盘复制",
  "支持 prefers-reduced-motion",
  "所有点击目标不小于 44px",
  "Loading：表格和详情页使用 skeleton",
  "Error：说明失败原因",
  "Focus 状态必须可见",
  "禁止移动端出现横向滚动",
  "命令内容可复制"
]) {
  assertIncludes(visual, token, "frontend visual design");
}

assert(exists("components/alphaagents/copy-command-button.tsx"), "copy command button component is missing");
assert(exists("app/loading.tsx"), "route-level loading skeleton is missing");
assert(exists("app/error.tsx"), "route-level error boundary is missing");

const blocks = read("components/alphaagents/blocks.tsx");
assertIncludes(blocks, "CopyCommandButton", "CommandPreview implementation");
assertIncludes(blocks, 'aria-label="CLI command preview"', "CommandPreview implementation");
assertIncludes(blocks, "tabIndex={0}", "CommandPreview implementation");
assertIncludes(blocks, 'data-component="CommandPreview"', "CommandPreview implementation");
assertIncludes(blocks, 'data-state={mismatch ? "mismatch" : "ready"}', "CommandPreview implementation");

const copyButton = read("components/alphaagents/copy-command-button.tsx");
assertIncludes(copyButton, '"use client"', "copy command button");
assertIncludes(copyButton, "navigator.clipboard.writeText(command)", "copy command button");
assertIncludes(copyButton, 'aria-label="Copy CLI command to clipboard"', "copy command button");
assertIncludes(copyButton, "Copied", "copy command button");

const css = read("app/globals.css");
for (const token of [
  "overflow-x: clip",
  ":where(a, button, summary, input, select, textarea, pre):focus-visible",
  "min-height: 44px",
  ".aa-command-copy",
  ".aa-skeleton",
  "@media (prefers-reduced-motion: reduce)",
  "@media (max-width: 768px)"
]) {
  assertIncludes(css, token, "global CSS");
}

const loading = read("app/loading.tsx");
assertIncludes(loading, 'aria-busy="true"', "loading route");
assertIncludes(loading, 'aria-live="polite"', "loading route");
assertIncludes(loading, "aa-skeleton", "loading route");

const error = read("app/error.tsx");
assertIncludes(error, '"use client"', "error route");
assertIncludes(error, 'role="alert"', "error route");
assertIncludes(error, "Failure reason:", "error route");
assertIncludes(error, 'aria-label="Retry loading AlphaAgents workspace"', "error route");

const buyerForm = read("components/alphaagents/buyer-org-setup-form.tsx");
const inputCount = (buyerForm.match(/<input/g) ?? []).length + (buyerForm.match(/<select/g) ?? []).length;
const labelCount = (buyerForm.match(/<label className="aa-field"/g) ?? []).length;
assert(inputCount > 0, "buyer org form should include fields");
assert(labelCount >= inputCount, "buyer org form controls must use visible labels");
assert(!buyerForm.includes("placeholder="), "buyer org form must not rely on placeholders");

const runtimeConsole = read("components/alphaagents/runtime-command-console.tsx");
assertIncludes(runtimeConsole, "disabled={busy", "runtime command console must disable async buttons");
assertIncludes(runtimeConsole, "lastResult", "runtime command console must persist command result on page");
for (const token of [
  "role=\"dialog\"",
  "aria-modal=\"true\"",
  "aria-labelledby=\"runtime-confirmation-title\"",
  "Escape",
  "confirmationTriggerRef.current?.focus()",
  "dangerousCommands",
  "Danger confirmation required.",
  "I understand the risk",
  "Confirm and run",
  "requestCommandConfirmation",
  "requestWorkflowConfirmation"
]) {
  assertIncludes(runtimeConsole, token, "runtime command confirmation");
}

for (const token of [".aa-confirmation-backdrop", ".aa-confirmation-dialog", ".aa-confirmation-danger", ".aa-button-danger"]) {
  assertIncludes(css, token, "global CSS confirmation styles");
}

console.log("frontend implementation verification passed");
