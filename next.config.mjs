import createMDX from "@next/mdx";

const withMDX = createMDX();

/** @type {import("next").NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["@openclaw/agent-ledger-core", "@openclaw/agent-ledger-runner"],
};

export default withMDX(nextConfig);
