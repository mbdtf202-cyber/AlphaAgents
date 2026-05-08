"use client";

import { useState } from "react";

type BuyerProfile = {
  id: string;
  requesterUserId?: string;
  acceptanceOwnerUserId?: string;
  financeContactUserId?: string;
  legalContactUserId?: string;
  authorizedPayerId?: string;
  signerIds: string[];
  invoiceReadiness: "missing" | "partial" | "ready";
  scopeAcknowledgement: "missing" | "accepted";
  contractingEntity?: string;
  collectionEntity?: string;
  invoiceIssuer?: string;
  refundRemitter?: string;
  subprocessors?: string[];
  version: number;
};

export function BuyerOrgSetupForm({ initialProfile }: { initialProfile: BuyerProfile }) {
  const [form, setForm] = useState({
    requesterUserId: initialProfile.requesterUserId ?? "",
    acceptanceOwnerUserId: initialProfile.acceptanceOwnerUserId ?? "",
    financeContactUserId: initialProfile.financeContactUserId ?? "",
    legalContactUserId: initialProfile.legalContactUserId ?? "",
    authorizedPayerId: initialProfile.authorizedPayerId ?? "",
    signerId: initialProfile.signerIds[0] ?? "",
    invoiceReadiness: initialProfile.invoiceReadiness,
    scopeAcknowledgement: initialProfile.scopeAcknowledgement,
    contractingEntity: initialProfile.contractingEntity ?? "",
    collectionEntity: initialProfile.collectionEntity ?? "",
    invoiceIssuer: initialProfile.invoiceIssuer ?? "",
    refundRemitter: initialProfile.refundRemitter ?? "",
    subprocessors: (initialProfile.subprocessors ?? []).join(", ")
  });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>("Ready to update buyer org setup.");

  async function submit() {
    setBusy(true);
    try {
      const response = await fetch("/api/commands", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          commandName: "buyer-org.setup",
          actorRole: "buyer",
          payload: {
            buyerOrgId: initialProfile.id,
            requesterUserId: form.requesterUserId,
            acceptanceOwnerUserId: form.acceptanceOwnerUserId,
            financeContactUserId: form.financeContactUserId,
            legalContactUserId: form.legalContactUserId,
            authorizedPayerId: form.authorizedPayerId,
            signerIds: [form.signerId],
            invoiceReadiness: form.invoiceReadiness,
            scopeAcknowledgement: form.scopeAcknowledgement,
            contractingEntity: form.contractingEntity,
            collectionEntity: form.collectionEntity,
            invoiceIssuer: form.invoiceIssuer,
            refundRemitter: form.refundRemitter,
            subprocessors: form.subprocessors
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          }
        })
      });
      const body = await response.json();
      setResult(JSON.stringify(body, null, 2));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="aa-card aa-card-trust">
      <div className="aa-card-head">
        <h2>Buyer Org Runtime Setup</h2>
        <p>Persist buyer requester, acceptance owner, finance contact, payer, signer, invoice, and scope acknowledgment.</p>
        <p>Enterprise procurement readiness also requires signable entity, refund path, legal contact, and subprocessor disclosure.</p>
      </div>
      <div className="aa-form-grid">
        <label className="aa-field">
          <span>Requester</span>
          <input value={form.requesterUserId} onChange={(event) => setForm((current) => ({ ...current, requesterUserId: event.target.value }))} />
        </label>
        <label className="aa-field">
          <span>Acceptance owner</span>
          <input value={form.acceptanceOwnerUserId} onChange={(event) => setForm((current) => ({ ...current, acceptanceOwnerUserId: event.target.value }))} />
        </label>
        <label className="aa-field">
          <span>Finance contact</span>
          <input value={form.financeContactUserId} onChange={(event) => setForm((current) => ({ ...current, financeContactUserId: event.target.value }))} />
        </label>
        <label className="aa-field">
          <span>Legal contact</span>
          <input value={form.legalContactUserId} onChange={(event) => setForm((current) => ({ ...current, legalContactUserId: event.target.value }))} />
        </label>
        <label className="aa-field">
          <span>Authorized payer</span>
          <input value={form.authorizedPayerId} onChange={(event) => setForm((current) => ({ ...current, authorizedPayerId: event.target.value }))} />
        </label>
        <label className="aa-field">
          <span>Signer</span>
          <input value={form.signerId} onChange={(event) => setForm((current) => ({ ...current, signerId: event.target.value }))} />
        </label>
        <label className="aa-field">
          <span>Invoice readiness</span>
          <select value={form.invoiceReadiness} onChange={(event) => setForm((current) => ({ ...current, invoiceReadiness: event.target.value as BuyerProfile["invoiceReadiness"] }))}>
            <option value="missing">missing</option>
            <option value="partial">partial</option>
            <option value="ready">ready</option>
          </select>
        </label>
        <label className="aa-field">
          <span>Scope acknowledgement</span>
          <select value={form.scopeAcknowledgement} onChange={(event) => setForm((current) => ({ ...current, scopeAcknowledgement: event.target.value as BuyerProfile["scopeAcknowledgement"] }))}>
            <option value="missing">missing</option>
            <option value="accepted">accepted</option>
          </select>
        </label>
        <label className="aa-field">
          <span>Contracting entity</span>
          <input value={form.contractingEntity} onChange={(event) => setForm((current) => ({ ...current, contractingEntity: event.target.value }))} />
        </label>
        <label className="aa-field">
          <span>Collection entity</span>
          <input value={form.collectionEntity} onChange={(event) => setForm((current) => ({ ...current, collectionEntity: event.target.value }))} />
        </label>
        <label className="aa-field">
          <span>Invoice issuer</span>
          <input value={form.invoiceIssuer} onChange={(event) => setForm((current) => ({ ...current, invoiceIssuer: event.target.value }))} />
        </label>
        <label className="aa-field">
          <span>Refund remitter</span>
          <input value={form.refundRemitter} onChange={(event) => setForm((current) => ({ ...current, refundRemitter: event.target.value }))} />
        </label>
        <label className="aa-field">
          <span>Subprocessors</span>
          <input value={form.subprocessors} onChange={(event) => setForm((current) => ({ ...current, subprocessors: event.target.value }))} />
        </label>
      </div>
      <div className="aa-button-row" style={{ marginTop: 12 }}>
        <button className="aa-button" type="button" disabled={busy} onClick={() => void submit()}>
          Save Buyer Setup
        </button>
      </div>
      <pre className="aa-command" style={{ marginTop: 12 }}>{result}</pre>
    </div>
  );
}
