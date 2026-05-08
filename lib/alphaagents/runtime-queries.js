import { loadRuntimeState } from "./runtime-state.js";

export function listRuntimeCategories(options = {}) {
  return loadRuntimeState(options.stateFile).categories;
}

export function listRuntimeListings(options = {}) {
  return loadRuntimeState(options.stateFile).listings;
}

export function listRuntimeOrders(options = {}) {
  return loadRuntimeState(options.stateFile).orders;
}

export function listRuntimeRfps(options = {}) {
  return loadRuntimeState(options.stateFile).rfps;
}

export function listRuntimeProposals(options = {}) {
  return loadRuntimeState(options.stateFile).proposals;
}

export function listRuntimeEvents(options = {}) {
  return loadRuntimeState(options.stateFile).eventLog;
}

export function getRuntimeEvidence(options = {}) {
  return loadRuntimeState(options.stateFile).evidenceRecords;
}

export function getRuntimeReputations(options = {}) {
  return loadRuntimeState(options.stateFile).reputations;
}

export function getRuntimeSnapshot(options = {}) {
  const state = loadRuntimeState(options.stateFile);

  return {
    buyers: state.buyers,
    categories: state.categories,
    listings: state.listings,
    rfps: state.rfps,
    proposals: state.proposals,
    orders: state.orders,
    grants: state.grants,
    runs: state.runs,
    deliveries: state.deliveries,
    reviews: state.reviews,
    reputations: state.reputations,
    events: state.eventLog.slice(-50)
  };
}

export function getBuyerProfiles(options = {}) {
  return loadRuntimeState(options.stateFile).buyers;
}
