import { StepPanel } from "@/components/StepPanel";
import { useContribution, useSelectIssue } from "./ContributionContext";
import { useRankedIssues } from "./useRankedIssues";

function IssuesStepContent() {
  const { isEngineer, selectedIssue } = useContribution();
  const { selectIssue } = useSelectIssue();
  const { issues, loading, error } = useRankedIssues({ isEngineer });

  return (
    <StepPanel
      testId="step-issues"
      title="Choose an issue"
      subtitle="Ranked from comet-ml/opik — preferring good first issue and help wanted labels."
    >
      {loading && <p className="text-sm text-slate-400">Loading ranked issues…</p>}
      {error && (
        <p className="text-sm text-amber-400">
          {error} Wire <code className="text-sky-300">contributionApiPlugin</code> in vite.config.
        </p>
      )}

      <ul data-testid="issue-list" className="space-y-2">
        {issues.map((issue) => {
          const selected = selectedIssue?.number === issue.number;
          return (
            <li key={issue.number}>
              <button
                type="button"
                data-testid={`issue-select-${issue.number}`}
                onClick={() => void selectIssue(issue)}
                className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                  selected
                    ? "border-emerald-500/60 bg-emerald-500/10"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-slate-600"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500">#{issue.number}</span>
                    <p className="text-sm font-medium text-slate-100">{issue.title}</p>
                    {issue.labels.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {issue.labels.map((label) => (
                          <span
                            key={label}
                            className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">
                    score {issue.score.toFixed(2)}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {selectedIssue && (
        <p className="text-sm text-emerald-400">
          Selected #{selectedIssue.number} — continue to the Cursor prompt step.
        </p>
      )}
    </StepPanel>
  );
}

export default function IssuesStep() {
  return <IssuesStepContent />;
}

export { IssuesStepContent as IssueListStep };
