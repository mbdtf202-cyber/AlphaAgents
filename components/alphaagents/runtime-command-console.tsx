"use client";

import { useEffect, useMemo, useState } from "react";

type RuntimeSnapshot = {
  categories: Array<{ categoryId: string; categoryStatus: string; version: number }>;
  listings: Array<{ listingId: string; listingStatus: string; version: number }>;
  programWorkspaces: Array<{ id: string; activeCreditMinor: number; backlogValueMinor: number; qbrStatus: string }>;
  appInstalls: Array<{ id: string; appId: string; installStatus: string; usageMode: string; version: number }>;
  appUsageRuns: Array<{ id: string; installId: string; appId: string; usageStatus: string; version: number }>;
  rfps: Array<{ id: string; rfpStatus: string; version: number }>;
  proposals: Array<{ id: string; proposalStatus: string; version: number; rfpId: string }>;
  orders: Array<{ id: string; orderStatus: string; ledgerStatus: string; acceptanceStatus: string; version: number }>;
  grants: Array<{ id: string; grantStatus: string; version: number }>;
  runs: Array<{ id: string; runStatus: string; version: number }>;
  deliveries: Array<{ id: string; deliveryStatus: string; version: number }>;
  reviews: Array<{ id: string; reviewStatus: string; version: number }>;
  reputations: Array<{ id: string; eventStatus: string; version: number }>;
  events: Array<{ id: string; eventName: string; recordedAt: string }>;
};

type Mode = "catalog-admin" | "quick-order" | "order-workspace" | "agent-app" | "program-ops" | "risk-finance";

type CommandResult = {
  ok: boolean;
  errorCode?: string;
  message?: string;
  aggregateId?: string;
  newVersion?: number;
  dto?: Record<string, unknown>;
  events?: Array<{ eventName: string }>;
};

type CommandDefinition = {
  label: string;
  commandName: string;
  actorRole: "buyer" | "seller" | "operator";
  payload: (snapshot: RuntimeSnapshot) => Record<string, unknown>;
  expectedVersion?: (snapshot: RuntimeSnapshot) => number;
  enabled?: (snapshot: RuntimeSnapshot) => boolean;
};

type WorkflowDefinition = {
  label: string;
  enabled?: (snapshot: RuntimeSnapshot) => boolean;
  steps: Array<{
    commandName: string;
    actorRole: "buyer" | "seller" | "operator";
    payload: (snapshot: RuntimeSnapshot) => Record<string, unknown>;
    expectedVersion?: (snapshot: RuntimeSnapshot) => number;
  }>;
};

export function RuntimeCommandConsole({
  mode,
  initialSnapshot = null
}: {
  mode: Mode;
  initialSnapshot?: RuntimeSnapshot | null;
}) {
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot | null>(initialSnapshot);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<CommandResult | null>(null);

  useEffect(() => {
    void refreshSnapshot();
  }, []);

  const commandDefs = useMemo(() => createCommandDefinitions(mode), [mode]);
  const workflowDefs = useMemo(() => createWorkflowDefinitions(mode), [mode]);

  async function refreshSnapshot() {
    const response = await fetch("/api/runtime-state", { cache: "no-store" });
    const data = (await response.json()) as RuntimeSnapshot;
    setSnapshot(data);
  }

  async function resetRuntime() {
    setBusy(true);
    try {
      const response = await fetch("/api/runtime-state", { method: "DELETE" });
      setLastResult(await response.json());
      await refreshSnapshot();
    } finally {
      setBusy(false);
    }
  }

  async function runCommand(definition: CommandDefinition) {
    if (!snapshot) return;
    setBusy(true);
    try {
      const result = await postCommand({
        commandName: definition.commandName,
        actorRole: definition.actorRole,
        expectedVersion: definition.expectedVersion?.(snapshot),
        payload: definition.payload(snapshot)
      });
      setLastResult(result);
      await refreshSnapshot();
    } finally {
      setBusy(false);
    }
  }

  async function runWorkflow(definition: WorkflowDefinition) {
    if (!snapshot) return;
    setBusy(true);
    try {
      let currentSnapshot = snapshot;
      let last: CommandResult | null = null;
      for (const step of definition.steps) {
        const result = await postCommand({
          commandName: step.commandName,
          actorRole: step.actorRole,
          expectedVersion: step.expectedVersion?.(currentSnapshot),
          payload: step.payload(currentSnapshot)
        });
        last = result;
        if (!result.ok) {
          setLastResult(result);
          await refreshSnapshot();
          return;
        }
        currentSnapshot = await fetchSnapshot();
      }
      setLastResult(last);
      await refreshSnapshot();
    } finally {
      setBusy(false);
    }
  }

  const latest = getLatestHandles(snapshot);

  return (
    <div className="aa-card aa-card-trust">
      <div className="aa-card-head">
        <h2>Runtime Control Plane</h2>
        <p>Shared mutable state via `/api/commands` and `/api/runtime-state`, not fixture replay.</p>
      </div>
      <div className="aa-button-row">
        <button className="aa-button" type="button" onClick={() => void resetRuntime()} disabled={busy}>
          Reset Runtime
        </button>
        <button className="aa-button" type="button" onClick={() => void refreshSnapshot()} disabled={busy}>
          Refresh Snapshot
        </button>
      </div>
      <div className="aa-meta" style={{ marginTop: 12 }}>
        Latest handles:
        {" "}
        RFP `{latest.rfpId ?? "-"}`,
        {" "}
        Proposal `{latest.proposalId ?? "-"}`,
        {" "}
        Order `{latest.orderId ?? "-"}`,
        {" "}
        Grant `{latest.grantId ?? "-"}`,
        {" "}
        Run `{latest.runId ?? "-"}`,
        {" "}
        Delivery `{latest.deliveryId ?? "-"}`.
      </div>
      <div className="aa-button-row" style={{ marginTop: 12 }}>
        {workflowDefs.map((definition) => {
          const enabled = snapshot ? definition.enabled?.(snapshot) ?? true : false;
          return (
            <button
              key={definition.label}
              className="aa-button"
              type="button"
              disabled={busy || !enabled}
              onClick={() => void runWorkflow(definition)}
            >
              {definition.label}
            </button>
          );
        })}
      </div>
      <div className="aa-button-row" style={{ marginTop: 12 }}>
        {commandDefs.map((definition) => {
          const enabled = snapshot ? definition.enabled?.(snapshot) ?? true : false;
          return (
            <button
              key={definition.label}
              className="aa-button"
              type="button"
              disabled={busy || !enabled}
              onClick={() => void runCommand(definition)}
            >
              {definition.label}
            </button>
          );
        })}
      </div>
      <div className="aa-meta" style={{ marginTop: 12 }}>
        Snapshot counts:
        {" "}
        categories {snapshot?.categories.length ?? 0},
        {" "}
        listings {snapshot?.listings.length ?? 0},
        {" "}
        installs {snapshot?.appInstalls.length ?? 0},
        {" "}
        app runs {snapshot?.appUsageRuns.length ?? 0},
        {" "}
        programs {snapshot?.programWorkspaces.length ?? 0},
        {" "}
        rfps {snapshot?.rfps.length ?? 0},
        {" "}
        proposals {snapshot?.proposals.length ?? 0},
        {" "}
        orders {snapshot?.orders.length ?? 0},
        {" "}
        events {snapshot?.events.length ?? 0}.
      </div>
      <pre className={`aa-command${lastResult?.ok === false ? " is-mismatch" : ""}`} style={{ marginTop: 12 }}>
        {JSON.stringify(lastResult ?? snapshot?.events.slice(-3) ?? { status: "loading" }, null, 2)}
      </pre>
    </div>
  );

  async function fetchSnapshot() {
    const response = await fetch("/api/runtime-state", { cache: "no-store" });
    return (await response.json()) as RuntimeSnapshot;
  }

  async function postCommand(input: {
    commandName: string;
    actorRole: "buyer" | "seller" | "operator";
    expectedVersion?: number;
    payload: Record<string, unknown>;
  }) {
    const response = await fetch("/api/commands", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input)
    });
    return (await response.json()) as CommandResult;
  }
}

function createCommandDefinitions(mode: Mode): CommandDefinition[] {
  const categoryId = "social_media_operations";

  if (mode === "catalog-admin") {
    return [
      {
        label: "Archive Social Category",
        commandName: "agent-category archive",
        actorRole: "operator",
        payload: () => ({ categoryId, archiveReason: "manual review" })
      },
      {
        label: "Restore Social Category",
        commandName: "agent-category restore",
        actorRole: "operator",
        payload: () => ({ categoryId, restoreReason: "re-enable" })
      }
    ];
  }

  if (mode === "quick-order") {
    return [
      {
        label: "Create Trial RFP",
        commandName: "rfp.create",
        actorRole: "buyer",
        payload: () => ({
          sku: "cross_border_competitor_topic_pack",
          packageTier: "trial",
          category: "US TikTok Shop sensitive-skin skincare",
          market: "US",
          channels: ["tiktok_shop_public"],
          language: "zh-CN analysis with English source labels",
          budgetAmountMinor: 198000,
          currency: "CNY",
          deliverableFormat: ["pdf", "csv"]
        }),
        expectedVersion: () => 0
      },
      {
        label: "Publish Latest RFP",
        commandName: "rfp.publish",
        actorRole: "buyer",
        payload: (snapshot) => ({
          rfpId: snapshot.rfps.at(-1)?.id,
          acceptanceTemplateId: "acceptance_template_trial_v1",
          competitorsOrDiscoveryRule: "Use 5 named competitors",
          prohibitedSources: ["production_account_login", "paid_account", "private_group", "ad_account", "fund_movement"],
          deadlineAt: "2026-05-10T18:00:00+08:00"
        }),
        expectedVersion: (snapshot) => snapshot.rfps.at(-1)?.version ?? 1,
        enabled: (snapshot) => Boolean(snapshot.rfps.at(-1))
      },
      {
        label: "Submit Proposal",
        commandName: "proposal.submit",
        actorRole: "seller",
        payload: (snapshot) => ({
          rfpId: snapshot.rfps.at(-1)?.id,
          sellerId: "seller_harbor_growth_sandbox",
          agentId: "agent_mira_competitor_intel_sandbox",
          priceAmountMinor: 198000,
          deliveryHours: 48,
          includedScope: ["5 competitors", "15 topic ideas"],
          evidenceStandard: "Every key claim maps to evidence",
          responsibleOwner: "project-owner@harbor-growth.example",
          capacityReservedUntil: "2026-05-10T18:00:00+08:00"
        }),
        enabled: (snapshot) => ["published", "quoting"].includes(snapshot.rfps.at(-1)?.rfpStatus ?? "")
      },
      {
        label: "Accept Proposal",
        commandName: "proposal.accept",
        actorRole: "buyer",
        payload: (snapshot) => ({
          proposalId: snapshot.proposals.at(-1)?.id,
          termsSnapshot: "trial_v1_terms"
        }),
        enabled: (snapshot) => Boolean(snapshot.proposals.at(-1))
      }
    ];
  }

  if (mode === "agent-app") {
    return [
      {
        label: "Install App",
        commandName: "agent-app.install",
        actorRole: "buyer",
        payload: () => ({
          appId: "agent_app_harbor_growth_workbench",
          buyerOrgId: "org_demo_001",
          authorizedBy: "user_demo_buyer_owner",
          usageMode: "subscription"
        }),
        expectedVersion: () => 0
      },
      {
        label: "Record Usage Proof",
        commandName: "agent-app.record-usage",
        actorRole: "buyer",
        payload: (snapshot) => ({
          installId: snapshot.appInstalls.at(-1)?.id,
          appId: "agent_app_harbor_growth_workbench",
          usageSummary: "weekly content sync completed with buyer-safe evidence",
          evidenceRefs: ["ev_sandbox_delivery_pdf_001"]
        }),
        enabled: (snapshot) => snapshot.appInstalls.at(-1)?.installStatus === "active"
      },
      {
        label: "Exit App",
        commandName: "agent-app.exit",
        actorRole: "buyer",
        payload: (snapshot) => ({
          installId: snapshot.appInstalls.at(-1)?.id,
          exitReason: "quarterly review complete"
        }),
        enabled: (snapshot) => Boolean(snapshot.appInstalls.at(-1))
      }
    ];
  }

  if (mode === "program-ops") {
    return [
      {
        label: "Allocate Credit",
        commandName: "program.allocate-credit",
        actorRole: "operator",
        payload: () => ({
          programId: "program_northstar_growth_001",
          creditAmountMinor: 320000,
          reason: "quarterly top-up"
        })
      },
      {
        label: "Record Drawdown",
        commandName: "program.record-drawdown",
        actorRole: "operator",
        payload: () => ({
          programId: "program_northstar_growth_001",
          drawdownMinor: 120000,
          reason: "managed delivery batch 01"
        })
      },
      {
        label: "Update QBR",
        commandName: "program.update-qbr",
        actorRole: "operator",
        payload: () => ({
          programId: "program_northstar_growth_001",
          qbrStatus: "ready_for_review"
        })
      }
    ];
  }

  if (mode === "risk-finance") {
    return [
      {
        label: "Approve Latest Grant",
        commandName: "permission.approve",
        actorRole: "operator",
        payload: (snapshot) => ({
          grantId: snapshot.grants.at(-1)?.id,
          toolAllowlist: ["read_public_url", "write_generated_artifact"],
          expiresAt: "2026-05-10T18:00:00+08:00",
          approvalReason: "risk review cleared"
        }),
        enabled: (snapshot) => Boolean(snapshot.grants.at(-1))
      },
      {
        label: "Partial Release Latest Order",
        commandName: "escrow.partial-release",
        actorRole: "operator",
        payload: (snapshot) => ({
          orderId: snapshot.orders.at(-1)?.id,
          releaseAmountMinor: 140000,
          refundAmountMinor: 58000,
          decisionRef: "decision_dispute_001"
        }),
        enabled: (snapshot) => ["resolved", "accepted", "disputed"].includes(snapshot.orders.at(-1)?.orderStatus ?? "")
      },
      {
        label: "Refund Latest Order",
        commandName: "escrow.refund",
        actorRole: "operator",
        payload: (snapshot) => ({
          orderId: snapshot.orders.at(-1)?.id,
          refundAmountMinor: 198000,
          refundReason: "critical breach",
          financeEvidenceRef: "ev_sandbox_dispute_001"
        }),
        enabled: (snapshot) => Boolean(snapshot.orders.at(-1))
      }
    ];
  }

  return [
    {
      label: "Fund Latest Order",
      commandName: "escrow.fund",
      actorRole: "buyer",
      payload: (snapshot) => ({
        orderId: snapshot.orders.at(-1)?.id,
        paymentRef: "sandbox_payment_ref_001",
        receivedAt: "2026-05-08T20:00:00+08:00",
        receivedBy: "user_finance_sandbox_001"
      }),
      enabled: (snapshot) => Boolean(snapshot.orders.at(-1))
    },
    {
      label: "Approve Permission",
      commandName: "permission.approve",
      actorRole: "operator",
      payload: (snapshot) => ({
        grantId: snapshot.grants.at(-1)?.id,
        toolAllowlist: ["read_public_url", "write_generated_artifact"],
        expiresAt: "2026-05-10T18:00:00+08:00",
        approvalReason: "trial lane"
      }),
      enabled: (snapshot) => Boolean(snapshot.grants.at(-1))
    },
    {
      label: "Start Run",
      commandName: "run.start",
      actorRole: "seller",
      payload: (snapshot) => ({
        orderId: snapshot.orders.at(-1)?.id,
        permissionGrantIds: [snapshot.grants.at(-1)?.id]
      }),
      enabled: (snapshot) => Boolean(snapshot.orders.at(-1) && snapshot.grants.at(-1)?.grantStatus === "approved")
    },
    {
      label: "Submit Delivery",
      commandName: "delivery.submit",
      actorRole: "seller",
      payload: (snapshot) => ({
        orderId: snapshot.orders.at(-1)?.id,
        executionRunIds: [snapshot.runs.at(-1)?.id],
        artifactRefs: ["ev_sandbox_delivery_pdf_001"],
        evidenceRefs: ["ev_sandbox_delivery_pdf_001"],
        criteriaMapping: ["competitor_coverage"],
        knownLimitations: ["sandbox only"]
      }),
      enabled: (snapshot) => Boolean(snapshot.runs.at(-1))
    },
    {
      label: "QA Pass Delivery",
      commandName: "delivery.qa_pass",
      actorRole: "operator",
      payload: (snapshot) => ({
        deliveryPackageId: snapshot.deliveries.at(-1)?.id,
        qaChecklistId: "qa_trial_001",
        sampledFacts: ["fact_01"]
      }),
      enabled: (snapshot) => Boolean(snapshot.deliveries.at(-1))
    },
    {
      label: "Buyer Accepts",
      commandName: "acceptance.accept",
      actorRole: "buyer",
      payload: (snapshot) => ({
        orderId: snapshot.orders.at(-1)?.id,
        deliveryPackageId: snapshot.deliveries.at(-1)?.id,
        criteriaConfirmations: ["competitor_coverage", "evidence_traceability", "topic_actionability"],
        criteriaScores: {
          competitor_coverage: 20,
          evidence_traceability: 25,
          topic_actionability: 20
        },
        decisionReason: "buyer accepted"
      }),
      enabled: (snapshot) => (snapshot.orders.at(-1)?.acceptanceStatus ?? "") === "ready"
    },
    {
      label: "Release Escrow",
      commandName: "escrow.release",
      actorRole: "operator",
      payload: (snapshot) => ({
        orderId: snapshot.orders.at(-1)?.id,
        releaseReason: "accepted",
        financeEvidenceRef: "ev_sandbox_delivery_pdf_001"
      }),
      enabled: (snapshot) => (snapshot.orders.at(-1)?.acceptanceStatus ?? "") === "accepted"
    },
    {
      label: "Submit Rating",
      commandName: "rating.submit",
      actorRole: "buyer",
      payload: (snapshot) => ({
        orderId: snapshot.orders.at(-1)?.id,
        subjectType: "agent",
        subjectId: "agent_mira_competitor_intel_sandbox",
        agentVersion: "1.0.0",
        ratingBreakdown: { outcome: 5, evidence: 5, speed: 4 },
        deliveryOutcome: "accepted"
      }),
      enabled: (snapshot) => ["released", "partially_released", "refunded"].includes(snapshot.orders.at(-1)?.orderStatus ?? "")
    }
  ];
}

function createWorkflowDefinitions(mode: Mode): WorkflowDefinition[] {
  if (mode === "quick-order") {
    return [
      {
        label: "Run Buyer Intake Flow",
        steps: [
          {
            commandName: "rfp.create",
            actorRole: "buyer",
            payload: () => ({
              sku: "cross_border_competitor_topic_pack",
              packageTier: "trial",
              category: "US TikTok Shop sensitive-skin skincare",
              market: "US",
              channels: ["tiktok_shop_public"],
              language: "zh-CN analysis with English source labels",
              budgetAmountMinor: 198000,
              currency: "CNY",
              deliverableFormat: ["pdf", "csv"]
            }),
            expectedVersion: () => 0
          },
          {
            commandName: "rfp.publish",
            actorRole: "buyer",
            payload: (snapshot) => ({
              rfpId: snapshot.rfps.at(-1)?.id,
              acceptanceTemplateId: "acceptance_template_trial_v1",
              competitorsOrDiscoveryRule: "Use 5 named competitors",
              prohibitedSources: ["production_account_login", "paid_account", "private_group", "ad_account", "fund_movement"],
              deadlineAt: "2026-05-10T18:00:00+08:00"
            }),
            expectedVersion: (snapshot) => snapshot.rfps.at(-1)?.version ?? 1
          },
          {
            commandName: "proposal.submit",
            actorRole: "seller",
            payload: (snapshot) => ({
              rfpId: snapshot.rfps.at(-1)?.id,
              sellerId: "seller_harbor_growth_sandbox",
              agentId: "agent_mira_competitor_intel_sandbox",
              priceAmountMinor: 198000,
              deliveryHours: 48,
              includedScope: ["5 competitors", "15 topic ideas"],
              evidenceStandard: "Every key claim maps to evidence",
              responsibleOwner: "project-owner@harbor-growth.example",
              capacityReservedUntil: "2026-05-10T18:00:00+08:00"
            })
          },
          {
            commandName: "proposal.accept",
            actorRole: "buyer",
            payload: (snapshot) => ({
              proposalId: snapshot.proposals.at(-1)?.id,
              termsSnapshot: "trial_v1_terms"
            })
          }
        ],
        enabled: (snapshot) => snapshot.orders.length === 0
      }
    ];
  }

  if (mode === "order-workspace") {
    return [
      {
        label: "Advance Order To Accepted",
        steps: [
          {
            commandName: "escrow.fund",
            actorRole: "buyer",
            payload: (snapshot) => ({
              orderId: snapshot.orders.at(-1)?.id,
              paymentRef: "sandbox_payment_ref_001",
              receivedAt: "2026-05-08T20:00:00+08:00",
              receivedBy: "user_finance_sandbox_001"
            })
          },
          {
            commandName: "permission.approve",
            actorRole: "operator",
            payload: (snapshot) => ({
              grantId: snapshot.grants.at(-1)?.id,
              toolAllowlist: ["read_public_url", "write_generated_artifact"],
              expiresAt: "2026-05-10T18:00:00+08:00",
              approvalReason: "trial lane"
            })
          },
          {
            commandName: "run.start",
            actorRole: "seller",
            payload: (snapshot) => ({
              orderId: snapshot.orders.at(-1)?.id,
              permissionGrantIds: [snapshot.grants.at(-1)?.id]
            })
          },
          {
            commandName: "delivery.submit",
            actorRole: "seller",
            payload: (snapshot) => ({
              orderId: snapshot.orders.at(-1)?.id,
              executionRunIds: [snapshot.runs.at(-1)?.id],
              artifactRefs: ["ev_sandbox_delivery_pdf_001"],
              evidenceRefs: ["ev_sandbox_delivery_pdf_001"],
              criteriaMapping: ["competitor_coverage"],
              knownLimitations: ["sandbox only"]
            })
          },
          {
            commandName: "delivery.qa_pass",
            actorRole: "operator",
            payload: (snapshot) => ({
              deliveryPackageId: snapshot.deliveries.at(-1)?.id,
              qaChecklistId: "qa_trial_001",
              sampledFacts: ["fact_01"]
            })
          },
          {
            commandName: "acceptance.accept",
            actorRole: "buyer",
            payload: (snapshot) => ({
              orderId: snapshot.orders.at(-1)?.id,
              deliveryPackageId: snapshot.deliveries.at(-1)?.id,
              criteriaConfirmations: ["competitor_coverage", "evidence_traceability", "topic_actionability"],
              criteriaScores: {
                competitor_coverage: 20,
                evidence_traceability: 25,
                topic_actionability: 20
              },
              decisionReason: "buyer accepted"
            })
          }
        ],
        enabled: (snapshot) => snapshot.orders.length > 0 && !["accepted", "released"].includes(snapshot.orders.at(-1)?.orderStatus ?? "")
      },
      {
        label: "Close Accepted Order",
        steps: [
          {
            commandName: "escrow.release",
            actorRole: "operator",
            payload: (snapshot) => ({
              orderId: snapshot.orders.at(-1)?.id,
              releaseReason: "accepted",
              financeEvidenceRef: "ev_sandbox_delivery_pdf_001"
            })
          },
          {
            commandName: "rating.submit",
            actorRole: "buyer",
            payload: (snapshot) => ({
              orderId: snapshot.orders.at(-1)?.id,
              subjectType: "agent",
              subjectId: "agent_mira_competitor_intel_sandbox",
              agentVersion: "1.0.0",
              ratingBreakdown: { outcome: 5, evidence: 5, speed: 4 },
              deliveryOutcome: "accepted"
            })
          }
        ],
        enabled: (snapshot) => (snapshot.orders.at(-1)?.acceptanceStatus ?? "") === "accepted"
      }
    ];
  }

  if (mode === "agent-app") {
    return [
      {
        label: "Run Agent App Proof Loop",
        steps: [
          {
            commandName: "agent-app.install",
            actorRole: "buyer",
            payload: () => ({
              appId: "agent_app_harbor_growth_workbench",
              buyerOrgId: "org_demo_001",
              authorizedBy: "user_demo_buyer_owner",
              usageMode: "subscription"
            }),
            expectedVersion: () => 0
          },
          {
            commandName: "agent-app.record-usage",
            actorRole: "buyer",
            payload: (snapshot) => ({
              installId: snapshot.appInstalls.at(-1)?.id,
              appId: "agent_app_harbor_growth_workbench",
              usageSummary: "weekly content sync completed with buyer-safe evidence",
              evidenceRefs: ["ev_sandbox_delivery_pdf_001"]
            })
          },
          {
            commandName: "agent-app.exit",
            actorRole: "buyer",
            payload: (snapshot) => ({
              installId: snapshot.appInstalls.at(-1)?.id,
              exitReason: "quarterly review complete"
            })
          }
        ],
        enabled: (snapshot) => snapshot.appUsageRuns.length === 0
      }
    ];
  }

  if (mode === "program-ops") {
    return [
      {
        label: "Run Program Credit Cycle",
        steps: [
          {
            commandName: "program.allocate-credit",
            actorRole: "operator",
            payload: () => ({
              programId: "program_northstar_growth_001",
              creditAmountMinor: 320000,
              reason: "quarterly top-up"
            })
          },
          {
            commandName: "program.record-drawdown",
            actorRole: "operator",
            payload: () => ({
              programId: "program_northstar_growth_001",
              drawdownMinor: 120000,
              reason: "managed delivery batch 01"
            })
          },
          {
            commandName: "program.update-qbr",
            actorRole: "operator",
            payload: () => ({
              programId: "program_northstar_growth_001",
              qbrStatus: "ready_for_review"
            })
          }
        ]
      }
    ];
  }

  return [];
}

function getLatestHandles(snapshot: RuntimeSnapshot | null) {
  if (!snapshot) {
    return {
      rfpId: null,
      proposalId: null,
      orderId: null,
      grantId: null,
      runId: null,
      deliveryId: null
    };
  }

  return {
    rfpId: snapshot.rfps.at(-1)?.id ?? null,
    proposalId: snapshot.proposals.at(-1)?.id ?? null,
    orderId: snapshot.orders.at(-1)?.id ?? null,
    grantId: snapshot.grants.at(-1)?.id ?? null,
    runId: snapshot.runs.at(-1)?.id ?? null,
    deliveryId: snapshot.deliveries.at(-1)?.id ?? null
  };
}
