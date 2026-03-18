import { cookies } from "next/headers";

import type { ActorRole } from "@openclaw/alpha-agents-core";

import { WORKSPACE_HOME_COOKIE_NAME } from "../preferences";
import { isWorkspaceNavPathAllowed } from "../workspace-nav";

function parseCookieHeader(headerValue: string | null): Record<string, string> {
  if (!headerValue) {
    return {};
  }

  return Object.fromEntries(
    headerValue
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...rest] = part.split("=");
        return [key, rest.join("=")];
      }),
  );
}

export function normalizeWorkspaceHome(value: string | null | undefined, role: ActorRole) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/workspace";
  }

  return isWorkspaceNavPathAllowed(role, value) ? value : "/workspace";
}

export async function getPreferredWorkspacePath(role: ActorRole) {
  const cookieStore = await cookies();
  return normalizeWorkspaceHome(cookieStore.get(WORKSPACE_HOME_COOKIE_NAME)?.value, role);
}

export function getPreferredWorkspacePathFromRequest(request: Request, role: ActorRole) {
  const parsedCookies = parseCookieHeader(request.headers.get("cookie"));
  return normalizeWorkspaceHome(parsedCookies[WORKSPACE_HOME_COOKIE_NAME], role);
}
