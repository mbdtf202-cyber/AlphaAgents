import { NextResponse } from "next/server";

import { agents, submissionImportSchema, type AgentRecord } from "@openclaw/alpha-agents-core";

import { errorResponse, parseRequestWithSchema } from "../../../../lib/server/http";

function slugFromSourceUrl(sourceUrl: string): string {
  try {
    const url = new URL(sourceUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    const last = segments.at(-1) ?? "agent";
    return last.replace(/\.git$/i, "").replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
  } catch {
    return "agent";
  }
}

function recommendedTracks(agent: Partial<Pick<AgentRecord, "categories">> & { sourceUrl?: string; description?: string }): string[] {
  const text = [agent.description ?? "", agent.sourceUrl ?? "", ...(agent.categories ?? [])].join(" ").toLowerCase();
  const recommendations = new Set<string>();

  if (text.includes("coding") || text.includes("repo") || text.includes("test")) {
    recommendations.add("coding-command");
  }
  if (text.includes("research") || text.includes("evidence") || text.includes("brief")) {
    recommendations.add("research-evidence");
  }
  if (recommendations.size === 0) {
    recommendations.add("coding-command");
  }

  return [...recommendations];
}

async function importGitHubMetadata(sourceUrl: string) {
  const url = new URL(sourceUrl);
  const [, owner, repo] = url.pathname.split("/");
  if (!owner || !repo) {
    return null;
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo.replace(/\.git$/i, "")}`, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "alpha-agents-importer",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as {
    name?: string;
    description?: string | null;
    topics?: string[];
    html_url?: string;
    owner?: { login?: string };
  };

  return {
    repoName: json.name ?? repo,
    description: json.description ?? "",
    topics: json.topics ?? [],
    htmlUrl: json.html_url ?? sourceUrl,
    ownerHandle: json.owner?.login ?? owner,
  };
}

function importFromSampleAgent(match: AgentRecord, sourceKind: string, sourceUrl: string, builderHandle?: string) {
  return {
    agentName: match.name,
    agentSlug: match.slug,
    builderHandle: builderHandle || match.builderHandle,
    sourceKind,
    sourceUrl,
    installCommand: match.source.installCommand,
    summary: match.summary,
    permissionManifest: match.permissionManifest,
    dependencies: match.dependencies,
    knownLimits: match.knownLimits,
    supportedEnvironments: ["macOS", "Linux", "CI runner"],
    recommendedBenchmarks: recommendedTracks(match),
  };
}

export async function POST(request: Request) {
  try {
    const parsed = await parseRequestWithSchema(request, submissionImportSchema);
    const slug = slugFromSourceUrl(parsed.sourceUrl);
    const sampleMatch =
      agents.find((agent) => agent.slug === slug) ||
      agents.find((agent) => parsed.sourceUrl.toLowerCase().includes(agent.slug));

    if (sampleMatch) {
      return NextResponse.json({
        message: "Imported from matching sample agent profile.",
        imported: importFromSampleAgent(sampleMatch, parsed.sourceKind, parsed.sourceUrl, parsed.builderHandle),
      });
    }

    const githubMetadata = parsed.sourceKind === "github" ? await importGitHubMetadata(parsed.sourceUrl) : null;
    const name = githubMetadata?.repoName
      ?.replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) ?? slug.replace(/-/g, " ");
    const description = githubMetadata?.description || "Imported draft generated from source metadata. Review permissions and benchmark selection before submission.";
    const skills = githubMetadata?.topics?.slice(0, 4) ?? [];

    return NextResponse.json({
      message: "Imported source metadata into a draft submission.",
      imported: {
        agentName: name,
        agentSlug: slug,
        builderHandle: parsed.builderHandle || githubMetadata?.ownerHandle || "builder",
        sourceKind: parsed.sourceKind,
        sourceUrl: githubMetadata?.htmlUrl || parsed.sourceUrl,
        installCommand:
          parsed.sourceKind === "github"
            ? `git clone ${githubMetadata?.htmlUrl || parsed.sourceUrl}`
            : `openclaw install ${slug}`,
        summary: {
          en: description,
          "zh-CN": description,
        },
        permissionManifest: {
          summary: {
            en: "Imported draft permission manifest. Review shell, network, file scope, and secrets before publishing.",
            "zh-CN": "这是导入生成的权限草稿。发布前请复核 shell、网络、文件范围与 secrets。",
          },
          skills,
          secrets: [],
          networkAccess: parsed.sourceKind === "github" ? ["api.github.com"] : [],
          fileAccess: ["workspace read/write"],
          shellAccess: parsed.sourceKind !== "clawhub",
          automationHooks: false,
          riskLevel: parsed.sourceKind === "github" ? "medium" : "low",
        },
        dependencies: ["OpenClaw", parsed.sourceKind === "github" ? "GitHub repository access" : "Agent package source"],
        knownLimits: [
          {
            en: "Imported draft needs manual review before publication.",
            "zh-CN": "导入草稿在发布前需要人工复核。",
          },
        ],
        supportedEnvironments: ["macOS", "Linux"],
        recommendedBenchmarks: recommendedTracks({
          sourceUrl: parsed.sourceUrl,
          description,
          categories: githubMetadata?.topics ?? [],
        }),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
