import { useState } from "react";
import { Markdown } from "@/components/Markdown";
import { Modal } from "@/components/Modal";
import { StepPanel } from "@/components/StepPanel";
import { useContribution, useSelectIssue } from "./ContributionContext";
import {
  estimateCursorTime,
  explainIssue,
  issueExcerpt,
  usefulLabels,
} from "./explainIssue";
import type { RankedIssue } from "./types";
import { useRankedIssues } from "./useRankedIssues";

function IssueCard({
  issue,
  selected,
  onOpen,
  badge,
  testId,
  explanation,
}: {
  issue: RankedIssue;
  selected: boolean;
  onOpen: () => void;
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
        onClick={onOpen}
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
  const [detailIssue, setDetailIssue] = useState<RankedIssue | null>(null);

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
            onOpen={() => setDetailIssue(recommended)}
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
            onOpen={() => setDetailIssue(issue)}
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

      <Modal
        open={detailIssue !== null}
        title={detailIssue ? `#${detailIssue.number} ${detailIssue.title}` : ""}
        onClose={() => setDetailIssue(null)}
        testId="issue-detail-modal"
      >
        {detailIssue ? (
          <div className="space-y-4">
            <div
              className="markdown-body text-sm leading-relaxed text-slate-600"
              data-testid="issue-excerpt"
            >
              <Markdown>{issueExcerpt(detailIssue)}</Markdown>
            </div>
            <p className="text-sm font-medium text-slate-900" data-testid="issue-time-estimate">
              {estimateCursorTime(detailIssue)}
            </p>
            {usefulLabels(detailIssue.labels).length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {usefulLabels(detailIssue.labels).map((label) => (
                  <span
                    key={label}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href={detailIssue.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="issue-github-link"
                className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-slate-800 hover:border-slate-400"
              >
                View on GitHub
              </a>
              <button
                type="button"
                data-testid="issue-confirm-select"
                onClick={() => {
                  void selectIssue(detailIssue);
                  setDetailIssue(null);
                }}
                className="btn-primary px-3 py-1.5"
              >
                Choose this issue
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </StepPanel>
  );
}

export default function IssuesStep() {
  return <IssuesStepContent />;
}

export { IssuesStepContent as IssueListStep };
