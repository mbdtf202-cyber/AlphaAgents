import { evidenceRecords, sampleOrders } from "./data.js";

export function runQuery(queryName, payload) {
  if (queryName === "reputation.show") {
    const events = sampleOrders
      .map((entry) => entry.reputation)
      .filter((event) => !payload.subjectId || event.subjectId === payload.subjectId);
    const ratingValues = events.flatMap((event) => Object.values(event.ratingBreakdown ?? {}).filter((value) => typeof value === "number"));
    const averageRating = ratingValues.length
      ? Number((ratingValues.reduce((total, value) => total + value, 0) / ratingValues.length).toFixed(2))
      : 0;

    return {
      subjectId: payload.subjectId,
      subjectType: events[0]?.subjectType ?? "agent",
      averageRating,
      reviewCount: events.length,
      disputeRate: events.length
        ? events.filter((event) => ["partially_released", "refunded"].includes(event.deliveryOutcome)).length / events.length
        : 0,
      onTimeRate: 0.91,
      version: events.length ? Math.max(...events.map((event) => event.version ?? 1)) : 1,
      provenanceEvents: events.map((event) => ({
        reputationEventId: event.id,
        sourceOrderId: event.sourceOrderId,
        subjectType: event.subjectType,
        subjectId: event.subjectId,
        agentVersion: event.agentVersion,
        categoryIds: event.categoryIds,
        categoryLabels: event.categoryLabels,
        deliveryOutcome: event.deliveryOutcome,
        eventStatus: event.eventStatus
      }))
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
