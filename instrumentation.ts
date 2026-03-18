import { validateRuntimeConfig } from "./lib/server/env";
import { initializeMonitoring } from "./lib/server/monitoring";

export async function register() {
  validateRuntimeConfig("web");
  initializeMonitoring("alpha-agents-web");
}
