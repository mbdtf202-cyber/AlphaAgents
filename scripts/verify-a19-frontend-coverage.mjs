import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function fail(message) {
  throw new Error(`[a19] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const component = read("components/alphaagents/blocks.tsx");
assert(component.includes("type CliApiEventsPanelProps"), "CliApiEventsPanelProps is missing");
assert(component.includes('className="aa-a19-panel"'), "CliApiEventsPanel disclosure class is missing");
assert(component.includes("data-a19={a19Id}"), "CliApiEventsPanel must expose data-a19 for static QA");
assert(component.includes("CLI / API / Events"), "CliApiEventsPanel must use the canonical panel title");

const pages = [
  ["app/catalog/page.tsx", "A-19-CATALOG"],
  ["app/agents/[slug]/page.tsx", "A-19-AGENT-DETAIL"],
  ["app/agent-apps/[slug]/page.tsx", "A-19-AGENT-APP-DETAIL"],
  ["app/evidence-room/page.tsx", "A-19-EVIDENCE-ROOM"],
  ["app/reputation/page.tsx", "A-19-REPUTATION"],
  ["app/provider-proof/page.tsx", "A-19-PROVIDER-PROOF"],
  ["app/risk-finance/page.tsx", "A-19-RISK-FINANCE"]
];

for (const [file, panelId] of pages) {
  const source = read(file);
  assert(source.includes("CliApiEventsPanel"), `${file} must render CliApiEventsPanel`);
  assert(source.includes(`a19Id="${panelId}"`), `${file} must expose ${panelId}`);
}

const acceptance = read("docs/acceptance.md");
for (const token of ["CLI", "API"]) {
  assert(acceptance.includes(token), `acceptance must preserve ${token} alignment requirement`);
}
assert(
  acceptance.includes("事件") || acceptance.includes("event") || acceptance.includes("Event"),
  "acceptance must preserve event alignment requirement"
);

console.log("A-19 frontend coverage verification passed");
