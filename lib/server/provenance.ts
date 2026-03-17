import type { ProvenanceInfo } from "@openclaw/alpha-agents-core";

export const sampleProvenance: ProvenanceInfo = {
  dataMode: "sample",
  sourceType: "internal-seed",
  label: {
    en: "Sample data",
    "zh-CN": "样例数据",
  },
};

export const liveProvenance: ProvenanceInfo = {
  dataMode: "live",
  sourceType: "user-event",
  label: {
    en: "Live data",
    "zh-CN": "实时数据",
  },
};
