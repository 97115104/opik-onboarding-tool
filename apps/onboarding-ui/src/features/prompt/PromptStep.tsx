import { useCallback, useEffect, useMemo, useState } from "react";
import { StepPanel } from "@/components/StepPanel";
import { useContribution } from "../issues/ContributionContext";
import { DEFAULT_OPIK_PATH } from "../issues/types";
import {
  buildCursorPromptDeeplink,
  generateCursorPrompt,
  openCursorCommands,
} from "./generatePrompt";

function PromptStepContent() {
  const { selectedIssue, branchName, persona } = useContribution();
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
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
        /* fall back to DEFAULT_OPIK_PATH */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openCommand = useMemo(() => openCursorCommands(opikPath), [opikPath]);

  const prompt = useMemo(() => {
    if (!selectedIssue || !branchName) return "";
    return generateCursorPrompt(selectedIssue, branchName, opikPath, persona);
  }, [selectedIssue, branchName, opikPath, persona]);

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

  const copyCommand = useCallback(async () => {
    await navigator.clipboard.writeText(openCommand);
    setCopiedCmd(true);
    window.setTimeout(() => setCopiedCmd(false), 2000);
  }, [openCommand]);

  if (!selectedIssue) {
    return (
      <StepPanel testId="step-prompt" title="Cursor prompt" subtitle="Select an issue first.">
        <p className="text-sm text-slate-500">Go back to Issues and pick a ranked issue.</p>
      </StepPanel>
    );
  }

  return (
    <StepPanel
      testId="step-prompt"
      title="Cursor prompt"
      subtitle={`Open the Opik repo, then paste this prompt into Cursor on branch ${branchName ?? "…"}.`}
    >
      <div className="mt-6 space-y-3">
        <p className="text-sm font-medium text-slate-900">Contribution prompt</p>
        <pre
          data-testid="cursor-prompt"
          className="max-h-96 overflow-auto rounded-lg border border-[var(--color-border)] bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap"
        >
          {prompt || "Generating prompt…"}
        </pre>

        <p className="text-xs leading-relaxed text-slate-500">
          Confirm the prompt in Cursor after it opens. Open the Opik folder first if that workspace
          is not already open.
        </p>

        {deeplink?.truncated ? (
          <p className="text-xs text-amber-700" data-testid="open-cursor-prompt-truncated">
            The deeplink uses a shortened prompt. Copy the full prompt below if needed.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {deeplink ? (
            <a
              href={deeplink.href}
              data-testid="open-cursor-prompt"
              onClick={(event) => {
                event.preventDefault();
                // Prefer a new browsing context so a failed protocol handler does not replace the wizard.
                const opener = window.open(deeplink.href, "_blank", "noopener,noreferrer");
                if (!opener) {
                  window.location.assign(deeplink.href);
                }
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Open prompt in Cursor
            </a>
          ) : null}
          <button
            type="button"
            data-testid="copy-prompt"
            disabled={!prompt}
            onClick={() => void copyPrompt()}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-slate-800 disabled:opacity-40"
          >
            {copied ? "Copied!" : "Copy prompt"}
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-3 border-t border-[var(--color-border)] pt-6">
        <p className="text-sm font-medium text-slate-900">Open the Opik repo in Cursor</p>
        <pre
          data-testid="open-cursor-command"
          className="overflow-auto rounded-lg border border-[var(--color-border)] bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap"
        >
          {openCommand}
        </pre>
        <button
          type="button"
          onClick={() => void copyCommand()}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-slate-800"
        >
          {copiedCmd ? "Copied command" : "Copy command"}
        </button>
      </div>
    </StepPanel>
  );
}

export default function PromptStep() {
  return <PromptStepContent />;
}

export { PromptStepContent as CursorPromptStep };
