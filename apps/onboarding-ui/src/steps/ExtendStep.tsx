import { StepPanel } from '../components/StepPanel'

export function ExtendStep() {
  return (
    <StepPanel
      testId="step-extend"
      title="Extend this tool"
      subtitle="Help others onboard faster: add content, steps, or automation."
    >
      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <p>
          The onboarding tool is designed to grow with the Opik project. You can add audience-specific
          guides, new wizard steps, or scripts that automate more of the contributor path.
        </p>
        <p>
          See{' '}
          <a
            href="https://github.com/97115104/opik-onboarding-tool/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noreferrer"
            className="text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
          >
            CONTRIBUTING.md
          </a>{' '}
          in this repository for how to propose changes, and Opik&apos;s own CONTRIBUTING.md for
          contribution norms on the main project.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-slate-500">
          <li>
            Add or refine content under <code>content/</code>
          </li>
          <li>
            Extend Playwright coverage in <code>e2e/</code>
          </li>
          <li>Improve issue ranking heuristics or Cursor prompt templates</li>
        </ul>
      </div>
    </StepPanel>
  )
}
