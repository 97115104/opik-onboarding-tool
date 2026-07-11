import { StepPanel } from "@/components/StepPanel";
import { useContribution, useSelectIssue } from "./ContributionContext";
import { explainIssue, usefulLabels } from "./explainIssue";
import type { RankedIssue } from "./types";
import { useRankedIssues } from "./useRankedIssues";

function IssueCard({
  issue,
  selected,
  onSelect,
  badge,
  testId,
  explanation,
}: {
  issue: RankedIssue;
  selected: boolean;
  onSelect: () => void;
  badge: string;
  testId: string;
  explanation: string;
}) {
  const labels = usefulLabels(issue.labels);

  return (
    <li data-testid={testId}>
      <button
        type="button"
        data-testid={`issue-select-${issue.number}`}
        onClick={onSelect}
        className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
          selected
            ? "border-emerald-500/60 bg-emerald-50"
            : "border-[var(--color-border)] bg-white hover:border-slate-400"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{badge}</p>
            <span className="text-xs text-slate-500">#{issue.number}</span>
            <p className="text-sm font-medium text-slate-900">{issue.title}</p>
            <p className="mt-2 text-sm text-slate-500">{explanation}</p>
            {labels.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {labels.map((label) => (
                  <span
                    key={label}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

function IssuesStepContent() {
  const { persona, selectedIssue } = useContribution();
  const { selectIssue } = useSelectIssue();
  const { issues, loading, error } = useRankedIssues({ persona, limit: 8 });

  const recommended = issues[0] ?? null;
  const alternatives = issues.slice(1, 3);

  return (
    <StepPanel
      testId="step-issues"
      title="Choose an issue"
      subtitle="One recommended pick plus two alternatives, ranked for your role."
    >
      {loading && <p className="text-sm text-slate-500">Loading ranked issues…</p>}
      {error && (
        <p className="text-sm text-amber-700">
          {error} Wire <code className="text-slate-900">contributionApiPlugin</code> in vite.config.
        </p>
      )}

      <ul data-testid="issue-list" className="space-y-3">
        {recommended && (
          <IssueCard
            issue={recommended}
            selected={selectedIssue?.number === recommended.number}
            onSelect={() => void selectIssue(recommended)}
            badge="Recommended"
            testId="issue-recommended"
            explanation={explainIssue(recommended, persona)}
          />
        )}
        {alternatives.map((issue, index) => (
          <IssueCard
            key={issue.number}
            issue={issue}
            selected={selectedIssue?.number === issue.number}
            onSelect={() => void selectIssue(issue)}
            badge={`Alternative ${index + 1}`}
            testId={`issue-alternative-${index}`}
            explanation={explainIssue(issue, persona)}
          />
        ))}
      </ul>

      {!loading && !error && issues.length === 0 && (
        <p className="text-sm text-slate-500">No open issues matched the ranking.</p>
      )}

      {selectedIssue && (
        <p className="mt-4 text-sm text-emerald-700">
          Selected #{selectedIssue.number}. Continue to the Cursor prompt step.
        </p>
      )}
    </StepPanel>
  );
}

export default function IssuesStep() {
  return <IssuesStepContent />;
}

export { IssuesStepContent as IssueListStep };
