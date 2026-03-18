import { serviceHeartbeatsTable } from "@openclaw/alpha-agents-core/db/schema";
import { desc, eq } from "drizzle-orm";

import { getDb } from "./db";
import { getStorageMode } from "./env";

export interface ServiceHeartbeat {
  id: string;
  serviceName: string;
  instanceId: string;
  status: string;
  lastHeartbeatAt: string;
  metadata?: Record<string, unknown>;
}

declare global {
  var __alphaAgentsServiceHeartbeats: Map<string, ServiceHeartbeat> | undefined;
}

function getMemoryHeartbeats() {
  if (!globalThis.__alphaAgentsServiceHeartbeats) {
    globalThis.__alphaAgentsServiceHeartbeats = new Map();
  }
  return globalThis.__alphaAgentsServiceHeartbeats;
}

export async function upsertServiceHeartbeat(input: {
  serviceName: string;
  instanceId: string;
  status?: string;
  metadata?: Record<string, unknown>;
}) {
  const id = `${input.serviceName}:${input.instanceId}`;
  if (getStorageMode() !== "postgres") {
    const heartbeat: ServiceHeartbeat = {
      id,
      serviceName: input.serviceName,
      instanceId: input.instanceId,
      status: input.status ?? "ok",
      lastHeartbeatAt: new Date().toISOString(),
      metadata: input.metadata,
    };
    getMemoryHeartbeats().set(id, heartbeat);
    return heartbeat;
  }

  const [row] = await getDb()
    .insert(serviceHeartbeatsTable)
    .values({
      id,
      serviceName: input.serviceName,
      instanceId: input.instanceId,
      status: input.status ?? "ok",
      lastHeartbeatAt: new Date(),
      metadata: input.metadata ?? {},
    })
    .onConflictDoUpdate({
      target: serviceHeartbeatsTable.id,
      set: {
        status: input.status ?? "ok",
        lastHeartbeatAt: new Date(),
        metadata: input.metadata ?? {},
      },
    })
    .returning();

  return {
    id: row!.id,
    serviceName: row!.serviceName,
    instanceId: row!.instanceId,
    status: row!.status,
    lastHeartbeatAt: row!.lastHeartbeatAt.toISOString(),
    metadata: row!.metadata as Record<string, unknown>,
  } satisfies ServiceHeartbeat;
}

export async function getLatestServiceHeartbeat(serviceName: string): Promise<ServiceHeartbeat | null> {
  if (getStorageMode() !== "postgres") {
    const latest = [...getMemoryHeartbeats().values()]
      .filter((heartbeat) => heartbeat.serviceName === serviceName)
      .sort((left, right) => right.lastHeartbeatAt.localeCompare(left.lastHeartbeatAt))[0];
    return latest ?? null;
  }

  const [row] = await getDb()
    .select()
    .from(serviceHeartbeatsTable)
    .where(eq(serviceHeartbeatsTable.serviceName, serviceName))
    .orderBy(desc(serviceHeartbeatsTable.lastHeartbeatAt))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    serviceName: row.serviceName,
    instanceId: row.instanceId,
    status: row.status,
    lastHeartbeatAt: row.lastHeartbeatAt.toISOString(),
    metadata: row.metadata as Record<string, unknown>,
  };
}
