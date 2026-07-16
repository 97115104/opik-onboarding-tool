export type OverviewSlide = {
  id: string
  title: string
  /** Primary paragraphs shown under the title. */
  paragraphs: string[]
  bullets?: string[]
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
    paragraphs: ['Opik helps individuals and teams ship better AI products.'],
    bullets: [
      'Builders: debug agents and retrieval pipelines with full traces',
      'PMs: see quality, cost, and regressions without digging through logs',
      'Support: reproduce issues and point contributors at clear evidence',
      'Businesses: self-host or use Comet Cloud for observability at scale',
    ],
  },
  {
    id: 'deployment',
    title: 'Deployment options',
    paragraphs: ['Choose the path that fits your environment.'],
    bullets: [
      'Self-hosted (./opik.sh): local dev, air-gapped, full control. This wizard uses this option.',
      'Comet Cloud: fastest start with managed infrastructure',
      'Enterprise: scale, compliance, and org-wide rollout',
    ],
    didYouKnow: {
      body: 'Self-hosted means you run Opik on your own machine or servers. Cloud means Comet runs it for you so you can start without installing the stack.',
    },
  },
  {
    id: 'wizard-uses',
    title: 'How this wizard uses Opik',
    paragraphs: [
      'You will run the self-hosted stack, send a chat demo trace, learn the product (Opik Features and Try Opik), take the product quiz, review how Opik contributions work, take a short contributing quiz, pick a GitHub issue, copy the Cursor prompt, verify your checks, open a draft PR with Cursor (PR help), optionally extend this tool, then Finish.',
    ],
  },
]
