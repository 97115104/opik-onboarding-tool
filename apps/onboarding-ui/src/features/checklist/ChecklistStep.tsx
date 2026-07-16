import { useCallback, useEffect, useMemo, useState } from "react";
import { OpenOpikInCursorModal } from "@/components/OpenOpikInCursorModal";
import { StepPanel } from "@/components/StepPanel";
import { useContribution } from "../issues/ContributionContext";
import { DEFAULT_OPIK_PATH } from "../issues/types";
import {
  buildCursorPromptDeeplink,
  generatePrHelpPrompt,
} from "../prompt/generatePrompt";

function fireDeeplink(href: string) {
  const opener = window.open(href, "_blank", "noopener,noreferrer");
  if (!opener) {
    window.location.assign(href);
  }
}

function ChecklistStepContent() {
  const { selectedIssue, branchName } = useContribution();
  const [copied, setCopied] = useState(false);
  const [opikPath, setOpikPath] = useState(DEFAULT_OPIK_PATH);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeeplink, setPendingDeeplink] = useState<string | null>(null);

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

  const deeplink = useMemo(
    () => (prompt ? buildCursorPromptDeeplink(prompt) : null),
    [prompt],
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
            used, and confirm you remain accountable for the change. If AI helped, the prompt below
            asks Cursor to create a signed{" "}
            <a
              href="https://attest.97115104.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] underline"
            >
              attest
            </a>{" "}
            link for your PR description. That is separate from the wizard footer attestation,
            which covers this onboarding tool itself.
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

          {deeplink?.truncated ? (
            <p className="text-xs text-amber-700" data-testid="open-pr-help-prompt-truncated">
              The deeplink uses a shortened prompt. Copy the full prompt below if needed.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {deeplink ? (
              <a
                href={deeplink.href}
                data-testid="open-pr-help-prompt"
                onClick={(event) => {
                  event.preventDefault();
                  setPendingDeeplink(deeplink.href);
                  setConfirmOpen(true);
                }}
                className="btn-primary px-4 py-2 font-medium"
              >
                Open PR help prompt in Cursor
              </a>
            ) : null}
            <button
              type="button"
              data-testid="copy-pr-help-prompt"
              onClick={() => void copyPrompt()}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-slate-800"
            >
              {copied ? "Copied!" : "Copy prompt"}
            </button>
          </div>
        </div>

        <OpenOpikInCursorModal
          open={confirmOpen}
          opikPath={opikPath}
          onClose={() => {
            setConfirmOpen(false);
            setPendingDeeplink(null);
          }}
          onOpened={() => {
            if (pendingDeeplink) fireDeeplink(pendingDeeplink);
          }}
        />
      </div>
    </StepPanel>
  );
}

export default function ChecklistStep() {
  return <ChecklistStepContent />;
}

export { ChecklistStepContent as ChecklistStep };
export { ChecklistStepContent as PrHelpStep };
