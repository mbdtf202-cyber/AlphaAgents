import { evidenceRecords, sampleOrders } from "./data.js";

export function runQuery(queryName, payload) {
  if (queryName === "reputation.show") {
    return {
      subjectId: payload.subjectId,
      subjectType: "agent",
      averageRating: 4.7,
      reviewCount: 14,
      disputeRate: 0.04,
      onTimeRate: 0.91,
      version: 1
    };
  }

  if (queryName === "evidence.show") {
    return evidenceRecords.find((record) => record.id === payload.evidenceId);
  }

  throw new Error(`Unknown query ${queryName}`);
}

export function loadEvidencePackageSummaries() {
  return sampleOrders.map((entry) => ({
    packageId: entry.packageId,
    orderId: entry.snapshot.ui.orderDto.id,
    ledgerStatus: entry.snapshot.ui.orderDto.ledgerStatus,
    acceptanceStatus: entry.snapshot.ui.orderDto.acceptanceStatus,
    totalScore: entry.review.totalScore
  }));
}
