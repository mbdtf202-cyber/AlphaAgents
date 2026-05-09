import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

const requiredPanels = [
  {
    file: "app/catalog/page.tsx",
    id: "A-19-CATALOG",
    commands: ["alphaagents agent-listing search --json"],
    apiRoutes: ["/api/catalog"],
    events: ["AgentListingPublished", "AgentListingUpdated", "AgentListingArchived"]
  },
  {
    file: "app/agents/[slug]/page.tsx",
    id: "A-19-AGENT-DETAIL",
    commands: ["alphaagents evidence show --json", "alphaagents reputation show --json"],
    apiRoutes: ["/api/evidence", "/api/reputation", "/api/catalog"],
    events: ["DeliverySubmitted", "ReputationEventCreated", "ReputationPublished"]
  },
  {
    file: "app/agent-apps/[slug]/page.tsx",
    id: "A-19-AGENT-APP-DETAIL",
    commands: [
      "alphaagents agent-app install --json",
      "alphaagents agent-app record-usage --json",
      "alphaagents agent-app exit --json"
    ],
    apiRoutes: ["/api/commands", "/api/runtime-state"],
    events: ["AgentAppInstalled", "AgentAppUsageRecorded", "AgentAppExited"]
  },
  {
    file: "app/evidence-room/page.tsx",
    id: "A-19-EVIDENCE-ROOM",
    commands: ["alphaagents evidence show --json", "alphaagents evidence export --json"],
    apiRoutes: ["/api/evidence", "/api/commands"],
    events: ["EvidenceExportRequested", "EvidenceExported", "EvidenceDeletionRequested", "EvidenceDeleted"]
  },
  {
    file: "app/reputation/page.tsx",
    id: "A-19-REPUTATION",
    commands: ["alphaagents reputation show --json", "alphaagents rating submit --json"],
    apiRoutes: ["/api/reputation", "/api/commands"],
    events: ["ReputationEventCreated", "ReputationPublished"]
  },
  {
    file: "app/provider-proof/page.tsx",
    id: "A-19-PROVIDER-PROOF",
    commands: ["alphaagents agent-passport update --json", "alphaagents agent-listing search --json"],
    apiRoutes: ["/api/catalog", "/api/contract"],
    events: ["AgentPassportCreated", "AgentPassportUpdated", "AgentPassportSuspended", "AgentListingPublished"]
  },
  {
    file: "app/risk-finance/page.tsx",
    id: "A-19-RISK-FINANCE",
    commands: ["alphaagents permission approve --json", "alphaagents dispute resolve --json"],
    apiRoutes: ["/api/commands", "/api/runtime-state"],
    events: ["PermissionApproved", "PermissionDenied", "PermissionRevoked", "DisputeResolved"]
  }
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("A-19 shared panel renders the CLI / API / Events contract as a collapsed disclosure", () => {
  const source = read("components/alphaagents/blocks.tsx");

  assert.match(source, /type CliApiEventsPanelProps = \{/);
  assert.match(source, /data-a19=\{a19Id\}/);
  assert.match(source, /<details className="aa-a19-panel"/);
  assert.match(source, /CLI \/ API \/ Events/);
  assert.match(source, /<CommandPreview key=\{command\} command=\{command\}/);
});

test("A-19 required pages mount exact CLI, API, and event contracts", () => {
  for (const panel of requiredPanels) {
    const source = read(panel.file);

    assert.match(source, /CliApiEventsPanel/, `${panel.file} must import and render CliApiEventsPanel`);
    assert.ok(source.includes(`a19Id="${panel.id}"`), `${panel.file} missing ${panel.id}`);

    for (const command of panel.commands) {
      assert.ok(source.includes(command), `${panel.file} missing command ${command}`);
    }

    for (const apiRoute of panel.apiRoutes) {
      assert.ok(source.includes(apiRoute), `${panel.file} missing API route ${apiRoute}`);
    }

    for (const eventName of panel.events) {
      assert.ok(source.includes(eventName), `${panel.file} missing event ${eventName}`);
    }
  }
});
