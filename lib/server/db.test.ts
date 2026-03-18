import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockEnd = vi.fn();
const mockExecute = vi.fn();
const mockMigrate = vi.fn();
const mockDrizzle = vi.fn(() => ({ execute: mockExecute }));
const mockPostgres = vi.fn(() => ({ end: mockEnd }));

vi.mock("postgres", () => ({
  default: mockPostgres,
}));

vi.mock("drizzle-orm/postgres-js", () => ({
  drizzle: mockDrizzle,
}));

vi.mock("drizzle-orm/postgres-js/migrator", () => ({
  migrate: mockMigrate,
}));

vi.mock("./env", () => ({
  getDatabaseUrl: () => "postgresql://postgres:postgres@127.0.0.1:55433/alpha_agents",
}));

describe("lib/server/db", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    const dbModule = await import("./db");
    await dbModule.closeDb();
  });

  it("initializes the shared drizzle client lazily and reuses it", async () => {
    const dbModule = await import("./db");

    const first = dbModule.getDb();
    const second = dbModule.getDb();

    expect(first).toBe(second);
    expect(mockPostgres).toHaveBeenCalledTimes(1);
    expect(mockDrizzle).toHaveBeenCalledTimes(1);
  });

  it("runs migrations and health queries through the shared client", async () => {
    const dbModule = await import("./db");

    await dbModule.runMigrations();
    await dbModule.checkDbConnection();

    expect(mockMigrate).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it("closes and resets the cached client", async () => {
    const dbModule = await import("./db");

    dbModule.getDb();
    await dbModule.closeDb();
    dbModule.getDb();

    expect(mockEnd).toHaveBeenCalledTimes(1);
    expect(mockPostgres).toHaveBeenCalledTimes(2);
  });
});
