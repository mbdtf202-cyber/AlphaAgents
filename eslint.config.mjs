import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "tsconfig.tsbuildinfo"],
  },
  ...nextVitals,
];

export default config;
