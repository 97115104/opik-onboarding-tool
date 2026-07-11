import { useCallback, useMemo, useState } from "react";
import { StepPanel } from "@/components/StepPanel";
import { useContribution } from "../issues/ContributionContext";
import { generateCursorPrompt } from "./generatePrompt";

function PromptStepContent() {
  const { selectedIssue, branchName } = useContribution();
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => {
    if (!selectedIssue || !branchName) return "";
    return generateCursorPrompt(selectedIssue, branchName);
  }, [selectedIssue, branchName]);

  const copyPrompt = useCallback(async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [prompt]);

  if (!selectedIssue) {
    return (
      <StepPanel testId="step-prompt" title="Cursor prompt" subtitle="Select an issue first.">
        <p className="text-sm text-slate-400">Go back to Issues and pick a ranked issue.</p>
      </StepPanel>
    );
  }

  return (
    <StepPanel
      testId="step-prompt"
      title="Cursor prompt"
      subtitle={`Copy into Cursor to start on branch ${branchName ?? "…"}.`}
    >
      <pre
        data-testid="cursor-prompt"
        className="max-h-96 overflow-auto rounded-lg border border-[var(--color-border)] bg-slate-950/80 p-4 text-xs leading-relaxed text-slate-300 whitespace-pre-wrap"
      >
        {prompt || "Generating prompt…"}
      </pre>

      <button
        type="button"
        data-testid="copy-prompt"
        disabled={!prompt}
        onClick={() => void copyPrompt()}
        className="mt-4 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-40"
      >
        {copied ? "Copied!" : "Copy prompt"}
      </button>
    </StepPanel>
  );
}

export default function PromptStep() {
  return <PromptStepContent />;
}

export { PromptStepContent as CursorPromptStep };
