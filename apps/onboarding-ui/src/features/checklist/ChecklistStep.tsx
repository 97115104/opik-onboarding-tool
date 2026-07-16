import { useCallback, useEffect, useMemo, useState } from "react";
import { StepPanel } from "@/components/StepPanel";
import { useContribution } from "../issues/ContributionContext";
import { DEFAULT_OPIK_PATH } from "../issues/types";
import { generatePrHelpPrompt } from "../prompt/generatePrompt";

function ChecklistStepContent() {
  const { selectedIssue, branchName } = useContribution();
  const [copied, setCopied] = useState(false);
  const [opikPath, setOpikPath] = useState(DEFAULT_OPIK_PATH);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/opik-path");
        if (!res.ok) return;
        const data = (await res.json()) as { path: string };
        if (!cancelled && data.path) setOpikPath(data.path);
      } catch {
        /* fall back */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const prompt = useMemo(
    () => generatePrHelpPrompt(selectedIssue, branchName, opikPath),
    [selectedIssue, branchName, opikPath],
  );

  const copyPrompt = useCallback(async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [prompt]);

  return (
    <StepPanel
      testId="step-pr-help"
      title="Open your draft PR"
      subtitle="A pull request is how you propose your change for review."
    >
      <div className="space-y-4">
        <div className="space-y-2 text-sm text-slate-700">
          <p className="font-medium text-slate-900">What is a PR?</p>
          <p>
            A pull request (PR) asks maintainers to review and merge your branch into the main
            project. You open it as a draft first so checks and review can happen before it is
            ready.
          </p>
          <p>
            Your PR should link the tracked issue, follow the Opik template, disclose AI help if
            used, and confirm you remain accountable for the change.
          </p>
        </div>

        {selectedIssue && (
          <p className="text-xs text-slate-500">
            Issue #{selectedIssue.number}
            {branchName ? ` · branch ${branchName}` : ""}
          </p>
        )}

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-900">PR help prompt for Cursor</p>
          <pre
            data-testid="pr-help-prompt"
            className="max-h-96 overflow-auto rounded-lg border border-[var(--color-border)] bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap"
          >
            {prompt}
          </pre>
          <button
            type="button"
            onClick={() => void copyPrompt()}
            className="btn-primary px-4 py-2 font-medium"
          >
            {copied ? "Copied!" : "Copy PR help prompt"}
          </button>
        </div>
      </div>
    </StepPanel>
  );
}

export default function ChecklistStep() {
  return <ChecklistStepContent />;
}

export { ChecklistStepContent as ChecklistStep };
export { ChecklistStepContent as PrHelpStep };
