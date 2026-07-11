import { useEffect, useState } from "react";
import type { RankedIssue } from "./types";

const RANKED_ISSUES_API = "/api/ranked-issues";

interface UseRankedIssuesOptions {
  isEngineer?: boolean;
  limit?: number;
}

export function useRankedIssues({ isEngineer = false, limit = 10 }: UseRankedIssuesOptions = {}) {
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
        if (isEngineer) params.set("engineer", "1");
        const res = await fetch(`${RANKED_ISSUES_API}?${params}`);
        if (!res.ok) throw new Error(`Failed to load issues (${res.status})`);
        const data = (await res.json()) as RankedIssue[];
        if (!cancelled) setIssues(data);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Could not load ranked issues — ensure rank-issues.sh API is wired",
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
  }, [isEngineer, limit]);

  return { issues, loading, error };
}
