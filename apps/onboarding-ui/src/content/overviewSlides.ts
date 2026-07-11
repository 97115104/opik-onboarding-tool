export type OverviewSlide = {
  id: string
  title: string
  body: string
  bullets?: string[]
}

/** Source of truth for the Overview step walkthrough. Keep content/overview.md in sync. */
export const OVERVIEW_SLIDES: OverviewSlide[] = [
  {
    id: 'what-is-opik',
    title: 'What Opik is',
    body: 'Opik is an open-source platform from Comet for building, evaluating, and operating generative AI applications.',
  },
  {
    id: 'problem',
    title: 'The problem it solves',
    body: 'LLM apps are hard to debug. One user message can trigger retrieval, tools, multiple model calls, and post-processing. Opik captures the full trace so you can see what happened, measure quality, and improve over time.',
  },
  {
    id: 'capabilities',
    title: 'Core capabilities',
    body: 'Opik covers the generative AI lifecycle in one place.',
    bullets: [
      'Observability: traces, spans, timing, and errors',
      'Evaluation: datasets, experiments, and automated quality checks',
      'Production monitoring and online evaluation rules',
      'Prompt playground, agent optimizer, and guardrails',
    ],
  },
  {
    id: 'who-for',
    title: 'Who Opik is for',
    body: 'Opik helps individuals and teams ship better AI products.',
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
    body: 'Choose the path that fits your environment.',
    bullets: [
      'Self-hosted (./opik.sh): local dev, air-gapped, full control. This wizard uses this option.',
      'Comet Cloud: fastest start with managed infrastructure',
      'Enterprise: scale, compliance, and org-wide rollout',
    ],
  },
  {
    id: 'wizard-uses',
    title: 'How this wizard uses Opik',
    body: 'You will run the self-hosted stack, send a chat demo trace, learn the product (Opik Features and Try Opik), take the product quiz, review how Opik contributions work, take a short contributing quiz, pick a GitHub issue, copy the Cursor prompt, verify your checks, open a draft PR with Cursor (PR help), optionally extend this tool, then Finish.',
  },
]
