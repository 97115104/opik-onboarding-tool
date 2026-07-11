export type ContributingSlide = {
  id: string
  title: string
  body: string
  bullets?: string[]
}

/**
 * Source of truth for the Contributing overview step walkthrough.
 * Keep content/contributing-overview.md in sync.
 * Content describes the upstream Opik repo (comet-ml/opik), not this onboarding tool.
 */
export const CONTRIBUTING_SLIDES: ContributingSlide[] = [
  {
    id: 'what-contributing-means',
    title: 'What contributing means',
    body: 'You improve Opik by picking a tracked GitHub issue, opening a focused pull request, and working with maintainers through review. Before your first PR, sign the Contributor License Agreement (CLA), the legal agreement that lets Opik accept your work. AI assistance is welcome, but a human author stays accountable for correctness, licensing, and security.',
  },
  {
    id: 'repo-layout',
    title: 'How the codebase is organized',
    body: 'The Opik repository (comet-ml/opik) groups work into a few top-level areas.',
    bullets: [
      'apps/: deployable services and product surfaces (backend, frontend, docs)',
      'sdks/: Python and TypeScript SDKs, agent optimizer, and code generation',
      'tests_end_to_end/: end-to-end suites and helpers',
      'deployment/: Docker images and Kubernetes (Helm) install assets',
    ],
  },
  {
    id: 'where-to-work',
    title: 'Component areas',
    body: 'Most contributions land in one of these areas. Each area has its own guide in Opik docs. Stay in the area your issue targets.',
    bullets: [
      'Backend: API and server-side services',
      'Frontend: Opik UI',
      'Python SDK and TypeScript SDK: client libraries',
      'Documentation: guides and reference',
      'Agent optimizer: optimization SDK and tooling',
    ],
  },
  {
    id: 'how-to-contribute',
    title: 'How to contribute',
    body: 'Follow the Opik fast path so maintainers can review quickly. This wizard prepares the work; you open the draft PR after Verify and PR help.',
    bullets: [
      'Link a tracked issue with Fixes #... or Resolves #...',
      'Branch as {username}/{ticket}-{summary} (ticket can be OPIK-####, issue-####, or NA)',
      'Keep the PR scoped to the requested area',
      'Run relevant formatters, linters, and tests before opening',
      'Later: open a draft PR and fill the PR template completely',
    ],
  },
  {
    id: 'github-actions',
    title: 'GitHub Actions and quality',
    body: 'Opik runs automated checks from workflow files under .github/workflows/. Area workflows cover Frontend, Backend, SDKs, and similar paths. A shared Code Quality workflow also runs on pull requests. Install the pre-commit tool once, then run make hooks so local checks match CI. The Verify step later names the workflows that matter for your chosen issue.',
  },
  {
    id: 'whats-next',
    title: 'What comes next in this wizard',
    body: 'Next you will choose a ranked issue, generate a Cursor prompt for the Opik checkout, run the Verify checklist (local checks and CI awareness), then use the PR help step before finishing.',
  },
]
