import { useCallback, useState } from "react";
import { StepPanel } from "@/components/StepPanel";
import { useContribution } from "../issues/ContributionContext";
import { PR_CHECKLIST_ITEMS } from "./checklistItems";

function ChecklistStepContent() {
  const { selectedIssue, branchName } = useContribution();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = useCallback((id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const allChecked = PR_CHECKLIST_ITEMS.every((item) => checked[item.id]);

  return (
    <StepPanel
      testId="step-checklist"
      title="PR checklist"
      subtitle="Aligned with Opik CONTRIBUTING.md — complete before opening your draft PR."
    >
      {selectedIssue && (
        <p className="text-xs text-slate-500">
          Issue #{selectedIssue.number} · branch {branchName ?? "not set"}
        </p>
      )}

      <ul data-testid="pr-checklist" className="mt-4 space-y-3">
        {PR_CHECKLIST_ITEMS.map((item) => (
          <li key={item.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
              <input
                type="checkbox"
                checked={Boolean(checked[item.id])}
                onChange={() => toggle(item.id)}
                className="mt-0.5 h-4 w-4 rounded border-slate-600 accent-sky-500"
              />
              <span>
                <span className="block text-sm text-slate-100">{item.label}</span>
                {item.detail && (
                  <span className="mt-1 block text-xs text-slate-500">{item.detail}</span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>

      {allChecked && (
        <p className="mt-4 text-sm font-medium text-emerald-400">
          Checklist complete — ready to open your draft PR.
        </p>
      )}
    </StepPanel>
  );
}

export default function ChecklistStep() {
  return <ChecklistStepContent />;
}

export { ChecklistStepContent as ChecklistStep };
