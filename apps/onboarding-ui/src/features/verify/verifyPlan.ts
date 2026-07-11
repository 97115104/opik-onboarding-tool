import type { RankedIssue } from "../issues/types";
import { BRANCH_NAME_PATTERN } from "../issues/types";

export type VerifyArea =
  | "frontend"
  | "backend"
  | "python-sdk"
  | "typescript-sdk"
  | "docs"
  | "guardrails"
  | "optimizer"
  | "unknown";

export interface WorkflowWatch {
  name: string;
  /** Filter URL on GitHub Actions when stable; otherwise the Actions home. */
  url: string;
}

export interface VerifyPlan {
  area: VerifyArea;
  rationale: string;
  localCommands: string[];
  workflows: WorkflowWatch[];
  contributingUrl: string;
}

const ACTIONS_HOME = "https://github.com/comet-ml/opik/actions";
const CONTRIBUTING_FAST =
  "https://github.com/comet-ml/opik/blob/main/CONTRIBUTING.md#fast-path";

const AREA_LABELS: Record<VerifyArea, string> = {
  frontend: "Frontend",
  backend: "Backend",
  "python-sdk": "Python SDK",
  "typescript-sdk": "TypeScript SDK",
  docs: "Documentation",
  guardrails: "Guardrails",
  optimizer: "Agent Optimizer",
  unknown: "General",
};

export function formatVerifyArea(area: VerifyArea): string {
  return AREA_LABELS[area];
}

function workflow(name: string, query?: string): WorkflowWatch {
  return {
    name,
    url: query
      ? `${ACTIONS_HOME}?query=${encodeURIComponent(query)}`
      : ACTIONS_HOME,
  };
}

const AREA_PLANS: Record<Exclude<VerifyArea, "unknown">, Omit<VerifyPlan, "area" | "rationale">> = {
  frontend: {
    localCommands: [
      "cd apps/opik-frontend && npm run lint && npm run typecheck && npm run test",
    ],
    workflows: [
      workflow("Frontend Unit Tests", 'workflow:"Frontend Unit Tests"'),
      workflow("🐙 Code Quality", 'workflow:"🐙 Code Quality"'),
    ],
    contributingUrl: CONTRIBUTING_FAST,
  },
  backend: {
    localCommands: [
      "cd apps/opik-backend && mvn spotless:check && mvn test",
    ],
    workflows: [
      workflow("Backend Tests", 'workflow:"Backend Tests"'),
      workflow("🐙 Code Quality", 'workflow:"🐙 Code Quality"'),
    ],
    contributingUrl: CONTRIBUTING_FAST,
  },
  "python-sdk": {
    localCommands: [
      "cd sdks/python && python -m pytest tests/unit -q",
    ],
    workflows: [
      workflow("Python SDK Unit Tests", 'workflow:"Python SDK Unit Tests"'),
    ],
    contributingUrl: CONTRIBUTING_FAST,
  },
  "typescript-sdk": {
    localCommands: [
      "cd sdks/typescript && npm run typecheck && npm test",
    ],
    workflows: [
      workflow("TypeScript SDK Unit Tests", 'workflow:"TypeScript SDK Unit Tests"'),
    ],
    contributingUrl: CONTRIBUTING_FAST,
  },
  docs: {
    localCommands: [
      "cd apps/opik-documentation/python-sdk-docs && make lint",
      "git status",
    ],
    workflows: [
      workflow("Docs - Preview link", 'workflow:"Docs - Preview link"'),
      workflow("🐙 Code Quality", 'workflow:"🐙 Code Quality"'),
    ],
    contributingUrl: CONTRIBUTING_FAST,
  },
  guardrails: {
    localCommands: [
      "cd apps/opik-guardrails-backend/tests && pytest unit -q",
    ],
    workflows: [
      workflow("Guardrails Backend Unit Tests", 'workflow:"Guardrails Backend Unit Tests"'),
      workflow("🐙 Code Quality", 'workflow:"🐙 Code Quality"'),
    ],
    contributingUrl: CONTRIBUTING_FAST,
  },
  optimizer: {
    localCommands: [
      "cd sdks/opik_optimizer && python -m pytest -q",
    ],
    workflows: [
      workflow("Opik Optimizer - Unit Tests", 'workflow:"Opik Optimizer - Unit Tests"'),
      workflow("🐙 Code Quality", 'workflow:"🐙 Code Quality"'),
    ],
    contributingUrl: CONTRIBUTING_FAST,
  },
};

const UNKNOWN_PLAN: Omit<VerifyPlan, "area" | "rationale"> = {
  localCommands: [
    "git status",
    "echo \"Run formatters, linters, and tests for the paths you touched (see CONTRIBUTING).\"",
  ],
  workflows: [
    workflow("🐙 Code Quality", 'workflow:"🐙 Code Quality"'),
    workflow("PR Linter", 'workflow:"PR Linter"'),
  ],
  contributingUrl: CONTRIBUTING_FAST,
};

function classifyFromPaths(paths: string[]): { area: VerifyArea; rationale: string } | null {
  if (paths.length === 0) return null;

  const hits: { area: Exclude<VerifyArea, "unknown">; match: string }[] = [];
  for (const p of paths) {
    const lower = p.toLowerCase();
    if (p.includes("apps/opik-frontend")) hits.push({ area: "frontend", match: p });
    else if (p.includes("apps/opik-backend")) hits.push({ area: "backend", match: p });
    else if (p.includes("sdks/python")) hits.push({ area: "python-sdk", match: p });
    else if (p.includes("sdks/typescript")) hits.push({ area: "typescript-sdk", match: p });
    else if (p.includes("apps/opik-documentation") || /(^|\/)docs\//.test(p))
      hits.push({ area: "docs", match: p });
    else if (lower.includes("guardrail")) hits.push({ area: "guardrails", match: p });
    else if (lower.includes("optimizer") || p.includes("agent_optimization") || p.includes("opik_optimizer"))
      hits.push({ area: "optimizer", match: p });
  }

  if (hits.length === 0) return null;

  const counts = new Map<Exclude<VerifyArea, "unknown">, number>();
  for (const h of hits) counts.set(h.area, (counts.get(h.area) ?? 0) + 1);

  let best: Exclude<VerifyArea, "unknown"> = hits[0]!.area;
  let bestCount = 0;
  for (const [area, count] of counts) {
    if (count > bestCount) {
      best = area;
      bestCount = count;
    }
  }

  return {
    area: best,
    rationale: `Detected from changed paths (e.g. ${hits.find((h) => h.area === best)?.match ?? "touched files"}).`,
  };
}

function hasWord(hay: string, word: string): boolean {
  return new RegExp(`(?:^|[^a-z0-9])${word}(?:[^a-z0-9]|$)`, "i").test(hay);
}

function classifyFromIssue(issue: RankedIssue): { area: VerifyArea; rationale: string } {
  const labels = issue.labels.map((l) => l.toLowerCase());
  const title = issue.title.toLowerCase();
  const hay = `${labels.join(" ")} ${title}`;

  // Prefer docs when documentation signals are present (before SDK/frontend).
  const checks: { area: Exclude<VerifyArea, "unknown">; test: () => boolean; why: string }[] = [
    {
      area: "docs",
      test: () =>
        labels.some((l) => l.includes("docs") || l.includes("documentation")) ||
        hasWord(hay, "docs") ||
        hasWord(hay, "documentation"),
      why: "Issue labels/title point at documentation.",
    },
    {
      area: "guardrails",
      test: () => /guardrail/.test(hay),
      why: "Issue labels/title point at guardrails.",
    },
    {
      area: "optimizer",
      test: () => /optimizer|agent.?optim/.test(hay),
      why: "Issue labels/title point at the agent optimizer.",
    },
    {
      area: "typescript-sdk",
      test: () =>
        /typescript|ts\s*sdk|sdks\/typescript|javascript\s*sdk/.test(hay) ||
        labels.some((l) => l.includes("typescript") || l === "javascript"),
      why: "Issue labels/title point at the TypeScript SDK.",
    },
    {
      area: "python-sdk",
      test: () =>
        (/python/.test(hay) && /sdk/.test(hay)) ||
        /sdks\/python/.test(hay) ||
        labels.some((l) => l.includes("python") && !l.includes("typescript")),
      why: "Issue labels/title point at the Python SDK.",
    },
    {
      area: "frontend",
      test: () =>
        labels.some((l) => l.includes("frontend") || l === "ui") ||
        hasWord(hay, "frontend") ||
        /opik-frontend|react\s*ui/.test(hay),
      why: "Issue labels/title point at the frontend.",
    },
    {
      area: "backend",
      // Avoid matching "javascript" via substring "java".
      test: () =>
        labels.some((l) => l.includes("backend") || l === "java" || l.includes("jvm")) ||
        hasWord(hay, "backend") ||
        hasWord(hay, "java") ||
        hasWord(hay, "maven") ||
        /opik-backend/.test(hay),
      why: "Issue labels/title point at the backend.",
    },
  ];

  for (const c of checks) {
    if (c.test()) return { area: c.area, rationale: c.why };
  }

  return {
    area: "unknown",
    rationale: "Could not map this issue to a specific area; use the general check list.",
  };
}

/**
 * Map a selected issue (and optional changed paths) to a focused verify plan.
 * Changed paths override label/title heuristics only when they match a known area
 * and (when provided) the checkout looks like a contribution branch
 * (Opik `{username}/{ticket}-{summary}` or legacy onboarding pattern).
 */
export function mapIssueToVerifyPlan(
  issue: RankedIssue,
  changedPaths: string[] = [],
  options: { branch?: string | null } = {},
): VerifyPlan {
  const branchOk =
    !options.branch ||
    options.branch === "HEAD" ||
    BRANCH_NAME_PATTERN.test(options.branch);

  const fromPaths = branchOk ? classifyFromPaths(changedPaths) : null;
  const classified = fromPaths ?? classifyFromIssue(issue);
  const base =
    classified.area === "unknown" ? UNKNOWN_PLAN : AREA_PLANS[classified.area];

  return {
    area: classified.area,
    rationale: classified.rationale,
    ...base,
  };
}
