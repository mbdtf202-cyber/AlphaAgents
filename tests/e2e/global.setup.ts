import { closePostgresTestResources, createBuyerSession, createMagicLinkChallenge, migrateAndResetPostgres, POSTGRES_FIXTURE, seedLiveAgentFixture, setPostgresTestEnv } from "../support/postgres";

export default async function globalSetup() {
  if (!setPostgresTestEnv()) {
    throw new Error("DATABASE_URL is required for e2e setup.");
  }

  await migrateAndResetPostgres();
  await seedLiveAgentFixture();
  await createBuyerSession();
  await createMagicLinkChallenge(POSTGRES_FIXTURE.builderEmail, "builder", POSTGRES_FIXTURE.builderMagicToken);
  await createMagicLinkChallenge(POSTGRES_FIXTURE.buyerEmail, "buyer", POSTGRES_FIXTURE.buyerMagicToken);
  await closePostgresTestResources();
}
