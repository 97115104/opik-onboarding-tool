import { OPIK_LLM_CONTEXT } from './opikAiContext'

export type ContributingSlideLink = {
  label: string
  href: string
}

export type ContributingSlideItem = {
  label: string
  href?: string
}

export type ContributingSlide = {
  id: string
  title: string
  paragraphs?: string[]
  /** @deprecated Prefer paragraphs */
  body?: string
  bullets?: string[]
  items?: ContributingSlideItem[]
  links?: ContributingSlideLink[]
  didYouKnow?: { title?: string; body: string }
  /** Embedded CLA reader on the first slide. */
  embedCla?: boolean
  /** Embedded CONTRIBUTING reader on the guidelines slide. */
  embedGuidelines?: boolean
}

const GITHUB_TREE = 'https://github.com/comet-ml/opik/tree/main'

/**
 * Source of truth for the Contributing overview step walkthrough.
 * Keep content/contributing-overview.md in sync.
 * Content describes the upstream Opik repo (comet-ml/opik), not this onboarding tool.
 */
export const CONTRIBUTING_SLIDES: ContributingSlide[] = [
  {
    id: 'what-contributing-means',
    title: 'What contributing means',
    paragraphs: [
      'Welcome. You contribute by picking a tracked GitHub issue, opening a focused pull request, and working with maintainers through review.',
      'Before your first PR, read and agree to the Contributor License Agreement below. AI help is welcome; you stay accountable for the result.',
    ],
    embedCla: true,
  },
  {
    id: 'contributing-guidelines',
    title: 'Contributing guidelines',
    paragraphs: [
      'The Opik repo CONTRIBUTING file covers setup, branch naming, checks, and PR conventions. Scroll through it here, then agree to continue.',
    ],
    embedGuidelines: true,
  },
  {
    id: 'repo-layout',
    title: 'How the codebase is organized',
    paragraphs: [
      'The Opik repository (comet-ml/opik) groups work by area. Open a folder on GitHub when you need to see what lives there.',
    ],
    items: [
      { label: 'apps/', href: `${GITHUB_TREE}/apps` },
      { label: 'sdks/', href: `${GITHUB_TREE}/sdks` },
      { label: 'tests_end_to_end/', href: `${GITHUB_TREE}/tests_end_to_end` },
      { label: 'deployment/', href: `${GITHUB_TREE}/deployment` },
    ],
    didYouKnow: {
      body: 'SDK folders hold client libraries. The deployment folder has Docker and Kubernetes assets for self-hosting.',
    },
  },
  {
    id: 'where-to-work',
    title: 'Component areas',
    paragraphs: [
      'Most contributions land in one component area. Stay in the area your issue targets, and open the matching guide when you need setup details.',
    ],
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
    paragraphs: ['Follow the Opik fast path for a smooth review.'],
    bullets: [
      'Link your PR to a tracked issue with Fixes #... or Resolves #...',
      'Use branch name {username}/{ticket}-{summary} where {username} is your GitHub handle (this wizard creates that branch for you)',
      'Keep the change scoped to the issue area',
      'Run local formatters, linters, and tests before you open the PR',
    ],
  },
  {
    id: 'github-actions',
    title: 'GitHub Actions and quality',
    paragraphs: [
      'GitHub Actions runs continuous integration on pull requests. Match CI locally so review stays focused on your change.',
    ],
    bullets: [
      'Workflows live under .github/workflows/',
      'Install pre-commit once, then run make hooks so local checks match CI',
      'The Verify step later names the workflows that matter for your issue',
    ],
    didYouKnow: {
      body: 'Pre-commit runs only the hooks that match your changed files, so you do not need every toolchain installed to get useful feedback.',
    },
  },
  {
    id: 'developer-tooling-ai',
    title: 'Developer tooling for AI assistants',
    paragraphs: [
      'Opik publishes AI-readable context so Cursor and other tools understand the monorepo layout and conventions.',
    ],
    items: [
      { label: 'General context (llms.txt)', href: OPIK_LLM_CONTEXT.llmsTxt },
      { label: 'Full context (llms-full.txt)', href: OPIK_LLM_CONTEXT.llmsFullTxt },
      { label: 'MCP server (live docs in Cursor)', href: OPIK_LLM_CONTEXT.mcpServer },
      { label: 'Contributing AI guidelines', href: OPIK_LLM_CONTEXT.contributingAiSection },
    ],
    didYouKnow: {
      body: 'Pointing your AI tool at these URLs reduces wrong assumptions about repo layout and contribution rules.',
    },
  },
  {
    id: 'community-feature-requests',
    title: 'Support the roadmap',
    paragraphs: [
      'Before picking an issue, check open feature requests for duplicates. Comment on popular requests to show maintainer support.',
    ],
    links: [
      { label: 'Open feature requests', href: OPIK_LLM_CONTEXT.featureRequests },
      {
        label: 'Contributing overview (issues)',
        href: 'https://www.comet.com/docs/opik/contributing/overview',
      },
    ],
  },
  {
    id: 'whats-next',
    title: 'What comes next in this wizard',
    paragraphs: [
      'This tool compresses the SDLC context you need before you contribute. Next is a short contributing quiz, then a ranked issue to work on.',
    ],
    didYouKnow: {
      title: 'Did you know?',
      body: 'SDLC means software development lifecycle: the path from an issue through design, implementation, testing, review, and release. This wizard gives you that context before your first pull request so each step has a clear purpose.',
    },
  },
]
