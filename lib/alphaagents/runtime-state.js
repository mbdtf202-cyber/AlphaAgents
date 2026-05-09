import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  agentApps,
  agents,
  categories,
  sellerProfiles,
  contract,
  evidenceRecords,
  listings,
  programWorkspaces
} from "./data.js";

const DEFAULT_STATE_FILE = path.join(process.cwd(), "output", "alphaagents-runtime-state.json");

function buildInitialState() {
  const timestamp = new Date().toISOString();

  return {
    metadata: {
      initializedAt: timestamp,
      lastUpdatedAt: timestamp
    },
    buyers: [
      {
        id: "org_demo_001",
        name: "NorthStar Beauty LLC",
        lifecycleStage: "org_setup",
        requesterUserId: "user_demo_buyer_owner",
        acceptanceOwnerUserId: "user_demo_acceptance_owner",
        financeContactUserId: "user_demo_finance_owner",
        authorizedPayerId: "payer_demo_001",
        signerIds: ["signer_demo_001"],
        invoiceReadiness: "ready",
        scopeAcknowledgement: "accepted",
        contractingEntity: "",
        collectionEntity: "",
        invoiceIssuer: "",
        refundRemitter: "",
        legalContactUserId: "",
        subprocessors: [],
        version: 1
      }
    ],
    sellers: sellerProfiles.map((seller) => ({
      ...seller,
      approved: seller.admissionStatus === "approved" && seller.admissionScore >= 80,
      version: 1
    })),
    categories: categories.map((category) => ({
      ...category,
      version: 1,
      auditEvents: []
    })),
    agentPassports: agents.map((agent) => ({
      id: agent.id,
      slug: agent.slug,
      name: agent.name,
      sellerId: agent.sellerId,
      supplyType: agent.supplyType,
      categoryIds: agent.categoryIds,
      proofStatus: agent.proofStatus,
      passportStatus: "active",
      version: 1,
      machineManifest: agent.machineManifest,
      commandExamples: agent.commandExamples,
      orderHistory: agent.orderHistory,
      scoreSummary: agent.scoreSummary,
      unsupportedScenarios: agent.unsupportedScenarios
    })),
    agentAppPassports: agentApps.map((app) => ({
      ...app,
      passportStatus: "active",
      version: 1
    })),
    listings: listings.map((listing) => ({
      ...listing,
      version: 1,
      auditEvents: []
    })),
    programWorkspaces: programWorkspaces.map((program) => ({
      ...structuredClone(program),
      version: program.version ?? 1
    })),
    evidenceRecords: structuredClone(evidenceRecords),
    appInstalls: [],
    appUsageRuns: [],
    customProjects: [],
    rfps: [],
    proposals: [],
    orders: [],
    grants: [],
    runs: [],
    deliveries: [],
    reviews: [],
    reputations: [],
    eventLog: [],
    idempotency: {}
  };
}

export function resolveStateFile(explicitStateFile) {
  return explicitStateFile ?? process.env.ALPHAAGENTS_STATE_FILE ?? DEFAULT_STATE_FILE;
}

export function ensureRuntimeState(stateFile) {
  const resolved = resolveStateFile(stateFile);
  const dir = path.dirname(resolved);
  fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(resolved)) {
    fs.writeFileSync(resolved, JSON.stringify(buildInitialState(), null, 2));
  }

  return resolved;
}

export function loadRuntimeState(stateFile) {
  const resolved = ensureRuntimeState(stateFile);
  return JSON.parse(fs.readFileSync(resolved, "utf8"));
}

export function saveRuntimeState(state, stateFile) {
  const resolved = ensureRuntimeState(stateFile);
  state.metadata.lastUpdatedAt = new Date().toISOString();
  fs.writeFileSync(resolved, JSON.stringify(state, null, 2));
  return resolved;
}

export function resetRuntimeState(stateFile) {
  const resolved = resolveStateFile(stateFile);
  const dir = path.dirname(resolved);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(resolved, JSON.stringify(buildInitialState(), null, 2));
  return resolved;
}

export function createTempStateFile(prefix = "alphaagents-state-") {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  return path.join(tempDir, "state.json");
}

export { DEFAULT_STATE_FILE, buildInitialState, contract };
