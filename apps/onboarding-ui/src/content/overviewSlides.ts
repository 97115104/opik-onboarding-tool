export type OverviewBullet =
  | string
  | {
      text: string
      href?: string
    }

export type OverviewRole = {
  id: string
  label: string
  summary: string
  detail: string
  href?: string
  hrefLabel?: string
}

export type OverviewSlide = {
  id: string
  title: string
  /** Primary paragraphs shown under the title. */
  paragraphs: string[]
  bullets?: OverviewBullet[]
  roles?: OverviewRole[]
  didYouKnow?: { title?: string; body: string }
}

/** Source of truth for the Overview step walkthrough. Keep content/overview.md in sync. */
export const OVERVIEW_SLIDES: OverviewSlide[] = [
  {
    id: 'what-is-opik',
    title: 'What Opik is',
    paragraphs: [
      'Opik is an open-source platform for building, evaluating, and operating generative AI applications.',
      'Comet is the company that builds and maintains Opik, along with tools for tracking machine learning experiments.',
    ],
    didYouKnow: {
      body: 'Open source means the code is public: anyone can read it, use it, and help improve it under an open license. Opik is free to self-host and contribute to.',
    },
  },
  {
    id: 'problem',
    title: 'The problem Opik solves',
    paragraphs: [
      'LLM apps are hard to debug. One user message can trigger retrieval, tools, multiple model calls, and post-processing. Opik captures the full trace so you can see what happened, measure quality, and improve over time.',
    ],
    didYouKnow: {
      body: 'LLM means large language model: the AI that reads and writes text (for example ChatGPT-style models). A trace is a full record of every step the app took for one request.',
    },
  },
  {
    id: 'capabilities',
    title: 'Core capabilities',
    paragraphs: ['Opik covers the generative AI lifecycle in one place.'],
    bullets: [
      'Observability: traces, spans, timing, and errors',
      'Evaluation: datasets, experiments, and automated quality checks',
      'Production monitoring and online evaluation rules',
      'Prompt playground, agent optimizer, and guardrails',
    ],
    didYouKnow: {
      body: 'Observability means you can see inside a running system: what it did, how long it took, and where it failed, instead of guessing from the final answer alone.',
    },
  },
  {
    id: 'who-for',
    title: 'Who Opik is for',
    paragraphs: ['Tap a role to see how Opik helps. Opik supports individuals and teams shipping AI products.'],
    roles: [
      {
        id: 'builders',
        label: 'Builders',
        summary: 'Debug agents and pipelines',
        detail:
          'See full traces for retrieval, tools, and model calls. Find failures fast and ship fixes with evidence.',
      },
      {
        id: 'pms',
        label: 'PMs',
        summary: 'Track quality and cost',
        detail:
          'Watch quality scores, latency, and spend without digging through raw logs. Spot regressions before users do.',
      },
      {
        id: 'support',
        label: 'Support',
        summary: 'Reproduce user issues',
        detail:
          'Pull the exact trace for a report, share it with engineering, and point contributors at clear reproduction steps.',
      },
      {
        id: 'businesses',
        label: 'Businesses',
        summary: 'Scale with control',
        detail:
          'Self-host for full control or use Comet Cloud for managed observability at scale.',
        href: 'https://www.comet.com/opik',
        hrefLabel: 'Comet Cloud',
      },
    ],
  },
  {
    id: 'deployment',
    title: 'Deployment options',
    paragraphs: ['Choose the path that fits your environment.'],
    bullets: [
      {
        text: 'Self-hosted (./opik.sh): local dev, air-gapped, full control. This wizard uses this option.',
        href: 'https://www.comet.com/docs/opik/self-host/local_deployment',
      },
      {
        text: 'Comet Cloud: fastest start with managed infrastructure',
        href: 'https://www.comet.com/opik',
      },
      {
        text: 'Enterprise: scale, compliance, and org-wide rollout',
        href: 'https://www.comet.com/site/about-us/contact-us',
      },
    ],
    didYouKnow: {
      body: 'Self-hosted means you run Opik on your own machine or servers. Cloud means Comet runs it for you so you can start without installing the stack.',
    },
  },
  {
    id: 'what-you-learn',
    title: 'What you will learn in this onboarding',
    paragraphs: [
      'This wizard is hands-on. You will run real tools, not just read slides. Take your time on each step and use Back if you want to review.',
    ],
    bullets: [
      'Run the self-hosted Opik stack locally and send a chat demo trace',
      'Explore Opik Features and Try Opik to read a trace end to end',
      'Review how Opik contributions work, agree to the CLA and guidelines, and pick a GitHub issue',
      'Copy a Cursor prompt, verify your checks, and get help opening a draft pull request',
    ],
  },
]
