import { useCallback, useEffect, useMemo, useState } from "react";
import { StepPanel } from "@/components/StepPanel";
import { useContribution } from "../issues/ContributionContext";
import { DEFAULT_OPIK_PATH } from "../issues/types";
import {
  buildCursorPromptDeeplink,
  generateVerifyPrompt,
} from "../prompt/generatePrompt";
import { getVerifyProgress, setVerifyProgress } from "@/lib/wizardGates";
import { formatVerifyArea, mapIssueToVerifyPlan } from "./verifyPlan";

const VERIFY_CHECK_IDS = ["verify-check-ran-local", "verify-check-matches-issue"] as const;

function VerifyStepContent() {
  const { selectedIssue, branchName } = useContribution();
  const saved = getVerifyProgress();
  const [checks, setChecks] = useState<Record<string, boolean>>(() => saved.done);
  const [opikPath, setOpikPath] = useState(DEFAULT_OPIK_PATH);
  const [changedPaths, setChangedPaths] = useState<string[]>([]);
  const [branchFromDiff, setBranchFromDiff] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    setVerifyProgress(checks, [...VERIFY_CHECK_IDS]);
  }, [checks]);

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/contribution-diff");
        if (!res.ok) return;
        const data = (await res.json()) as { paths?: string[]; branch?: string };
        if (cancelled) return;
        if (Array.isArray(data.paths)) setChangedPaths(data.paths);
        if (data.branch) setBranchFromDiff(data.branch);
      } catch {
        /* optional API */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const plan = useMemo(() => {
    if (!selectedIssue) return null;
    return mapIssueToVerifyPlan(selectedIssue, changedPaths, {
      branch: branchFromDiff ?? branchName,
    });
  }, [selectedIssue, changedPaths, branchFromDiff, branchName]);

  const prompt = useMemo(() => {
    if (!selectedIssue || !branchName || !plan) return "";
    return generateVerifyPrompt(selectedIssue, branchName, plan, opikPath);
  }, [selectedIssue, branchName, plan, opikPath]);

  const deeplink = useMemo(
    () => (prompt ? buildCursorPromptDeeplink(prompt) : null),
    [prompt],
  );

  const copyPrompt = useCallback(async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [prompt]);

  const copyCommand = useCallback(async (command: string) => {
    await navigator.clipboard.writeText(command);
    setCopiedCmd(command);
    window.setTimeout(() => setCopiedCmd(null), 2000);
  }, []);

  function toggleCheck(id: string, checked: boolean) {
    setChecks((prev) => ({ ...prev, [id]: checked }));
  }

  if (!selectedIssue || !plan) {
    return (
      <StepPanel testId="step-verify" title="Check your work" subtitle="Select an issue first.">
        <p className="text-sm text-slate-500">Go back to Issues and pick a ranked issue.</p>
      </StepPanel>
    );
  }

  return (
    <StepPanel
      testId="step-verify"
      title="Check your work"
      subtitle="Run a focused local check before you open a draft PR."
    >
      <div className="mt-4 space-y-6">
        <div data-testid="verify-area" className="space-y-1">
          <p className="text-sm font-medium text-slate-900">
            Detected area: <span data-testid="verify-area-name">{formatVerifyArea(plan.area)}</span>
          </p>
          <p className="text-sm text-slate-600" data-testid="verify-area-rationale">
            {plan.rationale}
          </p>
          {branchFromDiff ? (
            <p className="text-xs text-slate-500">Branch at OPIK_PATH: {branchFromDiff}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-900">Local commands</p>
          <ul className="space-y-2" data-testid="verify-commands">
            {plan.localCommands.map((command) => (
              <li key={command} className="flex flex-wrap items-start gap-2">
                <pre className="min-w-0 flex-1 overflow-auto rounded-lg border border-[var(--color-border)] bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {command}
                </pre>
                <button
                  type="button"
                  data-testid="verify-copy-command"
                  onClick={() => void copyCommand(command)}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-slate-800"
                >
                  {copiedCmd === command ? "Copied" : "Copy"}
                </button>
              </li>
            ))}
          </ul>
          <a
            href={plan.contributingUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="verify-contributing-link"
            className="inline-block text-sm text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
          >
            Opik CONTRIBUTING fast path
          </a>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-900">Watch on GitHub Actions</p>
          <ul className="space-y-1" data-testid="verify-workflows">
            {plan.workflows.map((wf) => (
              <li key={wf.name}>
                <a
                  href={wf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="verify-workflow-link"
                  className="text-sm text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                >
                  {wf.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 border-t border-[var(--color-border)] pt-6">
          <p className="text-sm font-medium text-slate-900">Verify prompt for Cursor</p>
          <pre
            data-testid="verify-prompt"
            className="max-h-72 overflow-auto rounded-lg border border-[var(--color-border)] bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap"
          >
            {prompt || "Generating prompt…"}
          </pre>

          {deeplink?.truncated ? (
            <p className="text-xs text-amber-700" data-testid="open-verify-prompt-truncated">
              The deeplink uses a shortened prompt. Copy the full prompt below if needed.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {deeplink ? (
              <a
                href={deeplink.href}
                data-testid="open-verify-prompt"
                onClick={(event) => {
                  event.preventDefault();
                  const opener = window.open(deeplink.href, "_blank", "noopener,noreferrer");
                  if (!opener) {
                    window.location.assign(deeplink.href);
                  }
                }}
                className="btn-primary px-4 py-2 font-medium"
              >
                Open verify prompt in Cursor
              </a>
            ) : null}
            <button
              type="button"
              data-testid="copy-verify-prompt"
              disabled={!prompt}
              onClick={() => void copyPrompt()}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-slate-800 disabled:opacity-40"
            >
              {copied ? "Copied!" : "Copy prompt"}
            </button>
          </div>
        </div>

        <div className="space-y-3 border-t border-[var(--color-border)] pt-6">
          <p className="text-sm font-medium text-slate-900">Before you continue</p>
          <ul className="space-y-3" data-testid="verify-checklist">
            <li className="flex items-start gap-3">
              <input
                id="verify-check-ran-local"
                type="checkbox"
                data-testid="verify-check-ran-local"
                checked={Boolean(checks["verify-check-ran-local"])}
                onChange={(event) => toggleCheck("verify-check-ran-local", event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="verify-check-ran-local" className="text-sm text-slate-700">
                I ran the local checks for this area (or asked Cursor to run them).
              </label>
            </li>
            <li className="flex items-start gap-3">
              <input
                id="verify-check-matches-issue"
                type="checkbox"
                data-testid="verify-check-matches-issue"
                checked={Boolean(checks["verify-check-matches-issue"])}
                onChange={(event) =>
                  toggleCheck("verify-check-matches-issue", event.target.checked)
                }
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="verify-check-matches-issue" className="text-sm text-slate-700">
                The change matches the selected issue and looks ready for a draft PR.
              </label>
            </li>
          </ul>
        </div>
      </div>
    </StepPanel>
  );
}

export default function VerifyStep() {
  return <VerifyStepContent />;
}
