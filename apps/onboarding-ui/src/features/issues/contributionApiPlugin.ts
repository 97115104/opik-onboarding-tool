import { spawnSync } from "node:child_process";
import path from "node:path";
import type { Plugin } from "vite";

/**
 * Vite dev-server middleware for workstream C scripts.
 * B shell: add to vite.config.ts plugins:
 *   import { contributionApiPlugin } from '@/features/issues/contributionApiPlugin'
 */
export function contributionApiPlugin(toolRoot?: string): Plugin {
  const root = toolRoot ?? path.resolve(__dirname, "../../../../..");

  const runScript = (script: string, args: string[] = []) => {
    const result = spawnSync("bash", [path.join(root, "scripts", script), ...args], {
      encoding: "utf-8",
      env: process.env,
    });
    if (result.status !== 0) {
      throw new Error(result.stderr || result.stdout || `${script} failed`);
    }
    return result.stdout.trim();
  };

  return {
    name: "contribution-api",
    configureServer(server) {
      server.middlewares.use("/api/ranked-issues", (req, res) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }
        try {
          const url = new URL(req.url ?? "", "http://localhost");
          const limit = url.searchParams.get("limit") ?? "10";
          const label = url.searchParams.get("label");
          const args = ["--limit", limit];
          if (label) args.push("--label", label);
          const body = runScript("rank-issues.sh", args);
          res.setHeader("Content-Type", "application/json");
          res.end(body);
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : "rank failed" }));
        }
      });

      server.middlewares.use("/api/contribution-branch", (req, res) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }
        try {
          const url = new URL(req.url ?? "", "http://localhost");
          const issue = url.searchParams.get("issue");
          const args = issue ? ["--issue", issue] : [];
          const branch = runScript("create-contribution-branch.sh", args);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ branch }));
        } catch (err) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({ error: err instanceof Error ? err.message : "branch failed" }),
          );
        }
      });
    },
  };
}
