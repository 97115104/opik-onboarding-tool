export type ContributingSlideLink = {
  label: string
  href: string
}

export type ContributingSlideCta = {
  label: string
  href: string
  testId: string
}

export type ContributingSlide = {
  id: string
  title: string
  body: string
  bullets?: string[]
  cta?: ContributingSlideCta
  links?: ContributingSlideLink[]
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
    body: 'Welcome. You contribute by picking a tracked GitHub issue, opening a focused pull request, and working with maintainers through review. Before your first PR, open and sign the Contributor License Agreement (CLA). AI help is welcome; you stay accountable for the result.',
    cta: {
      label: 'View the CLA',
      href: 'https://github.com/comet-ml/opik/blob/main/CLA.md',
      testId: 'contributing-open-cla',
    },
  },
  {
    id: 'repo-layout',
    title: 'How the codebase is organized',
    body: 'The Opik repository (comet-ml/opik) groups work under apps/ (services and product surfaces), sdks/ (client libraries and related tooling), tests_end_to_end/ (end-to-end suites), and deployment/ (Docker and Kubernetes assets).',
  },
  {
    id: 'where-to-work',
    title: 'Component areas',
    body: 'Most contributions land in one component area. Stay in the area your issue targets, and open the matching guide when you need setup details.',
    links: [
      {
        label: 'Backend guide',
        href: 'https://www.comet.com/docs/opik/contributing/guides/backend',
      },
      {
        label: 'Frontend guide',
        href: 'https://www.comet.com/docs/opik/contributing/guides/frontend',
      },
      {
        label: 'Python SDK guide',
        href: 'https://www.comet.com/docs/opik/contributing/guides/python-sdk',
      },
      {
        label: 'TypeScript SDK guide',
        href: 'https://www.comet.com/docs/opik/contributing/guides/typescript-sdk',
      },
      {
        label: 'Documentation guide',
        href: 'https://www.comet.com/docs/opik/contributing/guides/documentation',
      },
      {
        label: 'Agent optimizer SDK guide',
        href: 'https://www.comet.com/docs/opik/contributing/guides/agent-optimizer-sdk',
      },
    ],
  },
  {
    id: 'how-to-contribute',
    title: 'How to contribute',
    body: 'Link your PR to a tracked issue with Fixes #..., name your branch {username}/{ticket}-{summary}, keep the change scoped to that area, and run local formatters, linters, and tests before you open the PR.',
  },
  {
    id: 'github-actions',
    title: 'GitHub Actions and quality',
    body: "GitHub Actions is Opik's continuous integration in the software development lifecycle. Workflows under .github/workflows/ run checks on pull requests. Install pre-commit once, then run make hooks so local checks match CI. The Verify step later names the workflows that matter for your issue.",
  },
  {
    id: 'whats-next',
    title: 'What comes next in this wizard',
    body: 'This tool compresses the SDLC context you need before you contribute. Next is a short contributing quiz, then a ranked issue to work on.',
  },
]
