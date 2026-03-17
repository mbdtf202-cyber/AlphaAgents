import createMDX from "@next/mdx";

const withMDX = createMDX();

/** @type {import("next").NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: ["@openclaw/alpha-agents-core", "@openclaw/alpha-agents-runner"],
};

export default withMDX(nextConfig);
