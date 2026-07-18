import { useEffect, useState } from "react";
import type { Persona, RankedIssue } from "./types";

const RANKED_ISSUES_API = "/api/ranked-issues";

interface UseRankedIssuesOptions {
  persona?: Persona | null;
  limit?: number;
}

export function useRankedIssues({ persona = null, limit = 8 }: UseRankedIssuesOptions = {}) {
  const [issues, setIssues] = useState<RankedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (persona) params.set("persona", persona);
        const res = await fetch(`${RANKED_ISSUES_API}?${params}`);
        if (!res.ok) {
          // Plugin puts script stderr in `{ error }`; prefer that over a bare status.
          let detail = `Failed to load issues (${res.status})`;
          try {
            const body = (await res.json()) as { error?: string };
            if (body.error?.trim()) detail = body.error.trim();
          } catch {
            /* non-JSON body — keep status message */
          }
          throw new Error(detail);
        }
        const data = (await res.json()) as RankedIssue[];
        if (!cancelled) setIssues(data);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Could not load ranked issues.",
          );
          setIssues([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [persona, limit]);

  return { issues, loading, error };
}
