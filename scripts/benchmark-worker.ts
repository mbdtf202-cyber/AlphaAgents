import { startManagedBenchmarkWorker } from "../lib/server/benchmark-queue";

async function main() {
  const worker = await startManagedBenchmarkWorker();

  const shutdown = async () => {
    await worker.stop();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });

  await new Promise(() => undefined);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
