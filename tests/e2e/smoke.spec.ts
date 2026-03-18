import { expect, test } from "@playwright/test";

import { POSTGRES_FIXTURE, setPostgresTestEnv } from "../support/postgres";

test.beforeEach(async () => {
  setPostgresTestEnv();
});

async function loginWithMagicLinkVerify(page: import("@playwright/test").Page, role: "buyer" | "builder") {
  const token = role === "builder" ? POSTGRES_FIXTURE.builderMagicToken : POSTGRES_FIXTURE.buyerMagicToken;
  await page.goto(`/api/auth/magic-link/verify?token=${token}`);
  await page.waitForURL(/\/workspace(?:\/.*)?$/);
}

test("login page exposes the auth entrypoints", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByTestId("github-login-link")).toBeVisible();
  await expect(page.getByTestId("magic-link-form")).toBeVisible();
});

test("builder smoke path covers publish, install verification, follow, and benchmark completion", async ({ page }) => {
  await loginWithMagicLinkVerify(page, "builder");

  await page.goto("/workspace/agents");

  await page.locator('[data-testid="publish-version-form"] select[name="agentSlug"]').selectOption(POSTGRES_FIXTURE.agentSlug);
  await page.locator('[data-testid="publish-version-form"] select[name="versionId"]').selectOption(POSTGRES_FIXTURE.versionId);
  await page.getByTestId("publish-version-submit").click();
  await expect(page.getByTestId("publish-version-status")).toContainText("queued for publish moderation");

  await page.locator('[data-testid="benchmark-request-form"] select[name="agentSlug"]').selectOption(POSTGRES_FIXTURE.agentSlug);
  await page.locator('[data-testid="benchmark-request-form"] select[name="versionId"]').selectOption(POSTGRES_FIXTURE.versionId);
  await page.getByTestId("benchmark-request-submit").click();
  await expect(page.getByTestId("benchmark-request-status")).toContainText("queued");

  await page.goto("/workspace/reviews");
  await page.locator('[data-testid="install-verification-form"] select[name="agentSlug"]').selectOption(POSTGRES_FIXTURE.agentSlug);
  await page.locator('[data-testid="install-verification-form"] select[name="versionId"]').selectOption(POSTGRES_FIXTURE.versionId);
  await page.locator('[data-testid="install-verification-form"] input[name="packageHash"]').fill("sha256:e2e-package-hash");
  await page.locator('[data-testid="install-verification-form"] input[name="anonymousRuntimeFingerprint"]').fill("e2e-runtime-fingerprint");
  await page.getByTestId("verify-install-submit").click();
  await expect(page.getByTestId("install-verification-status")).toContainText("verified");

  await page.goto(`/agents/${POSTGRES_FIXTURE.agentSlug}`);
  await page.getByTestId("profile-follow-button").click();
  await expect(page.getByTestId("profile-follow-button")).toContainText("Following");

  await page.goto("/workspace/benchmarks");
  await expect
    .poll(
      async () => {
        await page.reload();
        return page.locator("main").textContent();
      },
      { timeout: 15_000 },
    )
    .toContain("completed");
});
