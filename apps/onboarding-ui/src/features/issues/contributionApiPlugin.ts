import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

/**
 * Vite dev-server middleware for workstream C scripts.
 * B shell: add to vite.config.ts plugins:
 *   import { contributionApiPlugin } from '@/features/issues/contributionApiPlugin'
 */
export function contributionApiPlugin(toolRoot?: string): Plugin {
  const root = toolRoot ?? path.resolve(__dirname, "../../../../..");

  const resolveOpikPath = () => {
    if (process.env.OPIK_PATH) return process.env.OPIK_PATH;
    return path.resolve(root, "..", "opik");
  };

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

  const resolveContributorUsername = () => {
    if (process.env.CONTRIBUTOR_ID?.trim()) {
      return process.env.CONTRIBUTOR_ID.trim();
    }
    const result = spawnSync("gh", ["api", "user", "--jq", ".login"], {
      encoding: "utf-8",
      env: process.env,
    });
    if (result.status === 0 && result.stdout.trim()) {
      return result.stdout.trim();
    }
    throw new Error(result.stderr || "Unable to resolve GitHub username");
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
          const persona = url.searchParams.get("persona");
          const args = ["--limit", limit];
          if (label) args.push("--label", label);
          if (persona) args.push("--persona", persona);
          const body = runScript("rank-issues.sh", args);
          res.setHeader("Content-Type", "application/json");
          res.end(body);
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : "rank failed" }));
        }
      });

      server.middlewares.use("/api/contributor", (req, res) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }
        try {
          const username = resolveContributorUsername();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ username }));
        } catch (err) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : "contributor failed",
            }),
          );
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
          const summary = url.searchParams.get("summary");
          const args: string[] = [];
          if (issue) args.push("--issue", issue);
          if (summary) args.push("--summary", summary);
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

      server.middlewares.use("/api/opik-path", (req, res) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ path: resolveOpikPath() }));
      });

      // Always use server OPIK_PATH; never trust a client-supplied folder.
      server.middlewares.use("/api/open-opik-in-cursor", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }
        res.setHeader("Content-Type", "application/json");
        const opikPath = resolveOpikPath();
        if (!fs.existsSync(opikPath) || !fs.statSync(opikPath).isDirectory()) {
          res.statusCode = 404;
          res.end(
            JSON.stringify({
              ok: false,
              path: opikPath,
              error: `Opik folder not found at ${opikPath}`,
            }),
          );
          return;
        }

        // Fail fast if `cursor` is missing so we never claim success then lose a late spawn error.
        const which = spawnSync("bash", ["-lc", "command -v cursor"], {
          encoding: "utf-8",
          env: process.env,
        });
        if (which.status !== 0 || !which.stdout.trim()) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              ok: false,
              path: opikPath,
              error: "Could not start Cursor. Is the cursor command on your PATH?",
            }),
          );
          return;
        }

        let settled = false;
        const finish = (payload: { ok: boolean; path: string; error?: string }, status = 200) => {
          if (settled) return;
          settled = true;
          res.statusCode = status;
          res.end(JSON.stringify(payload));
        };

        const child = spawn("cursor", [opikPath], {
          detached: true,
          stdio: "ignore",
          env: process.env,
        });
        child.on("error", (error) => {
          finish(
            {
              ok: false,
              path: opikPath,
              error:
                error.message ||
                "Could not start Cursor. Is the cursor command on your PATH?",
            },
            500,
          );
        });
        // Detached spawn: claim success briefly after start so the HTTP handler does not wait on Cursor.
        setTimeout(() => {
          finish({ ok: true, path: opikPath });
        }, 150);
        child.unref();
      });

      server.middlewares.use("/api/contribution-diff", (req, res) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }
        try {
          const opikPath = resolveOpikPath();
          const branchResult = spawnSync("git", ["-C", opikPath, "rev-parse", "--abbrev-ref", "HEAD"], {
            encoding: "utf-8",
          });
          const branch =
            branchResult.status === 0 ? branchResult.stdout.trim() : "";

          const pathSet = new Set<string>();

          const diffResult = spawnSync(
            "git",
            ["-C", opikPath, "diff", "--name-only", "origin/main...HEAD"],
            { encoding: "utf-8" },
          );
          if (diffResult.status === 0 && diffResult.stdout.trim()) {
            for (const line of diffResult.stdout.split("\n")) {
              const p = line.trim();
              if (p) pathSet.add(p);
            }
          }

          const statusResult = spawnSync(
            "git",
            ["-C", opikPath, "status", "--porcelain"],
            { encoding: "utf-8" },
          );
          if (statusResult.status === 0 && statusResult.stdout.trim()) {
            for (const line of statusResult.stdout.split("\n")) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              // porcelain: XY PATH or XY ORIG -> PATH
              const renamed = trimmed.match(/^.?\s?.?\s(.+?)\s->\s(.+)$/);
              const path = renamed ? renamed[2]! : trimmed.replace(/^[^\s]+\s+/, "");
              if (path) pathSet.add(path);
            }
          }

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ paths: [...pathSet], branch }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : "diff failed",
              paths: [],
              branch: "",
            }),
          );
        }
      });
    },
  };
}
