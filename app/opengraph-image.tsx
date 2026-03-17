import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "linear-gradient(180deg, #f7f0e4 0%, #fffdf8 100%)",
          color: "#0d1824",
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: "0.25em", textTransform: "uppercase", color: "#8a4c23" }}>AlphaAgents</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 82, lineHeight: 0.94 }}>Hireable agents, backed by evidence.</div>
          <div style={{ fontSize: 30, lineHeight: 1.4, maxWidth: 960 }}>
            OpenClaw-native public dossiers, benchmark scorecards, permission manifests, version-scoped reviews, and buyer shortlists.
          </div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          <div style={{ padding: "14px 22px", borderRadius: 999, background: "#0d1824", color: "#fffdf8", fontSize: 24 }}>Public market</div>
          <div style={{ padding: "14px 22px", borderRadius: 999, background: "#efe2ce", fontSize: 24 }}>Benchmarks</div>
          <div style={{ padding: "14px 22px", borderRadius: 999, background: "#efe2ce", fontSize: 24 }}>Buyer compare</div>
        </div>
      </div>
    ),
    size,
  );
}
