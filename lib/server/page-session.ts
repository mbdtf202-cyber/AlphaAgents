import { redirect } from "next/navigation";

import type { ActorRole, SessionActor } from "@openclaw/agent-ledger-core";

import { getServerSession } from "./auth";

export async function requirePageSession(allowedRoles?: ActorRole[]): Promise<SessionActor> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect("/login");
  }
  return session;
}
