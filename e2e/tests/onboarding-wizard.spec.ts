import { test, expect, type Page } from "@playwright/test";

import { BRANCH_NAME_PATTERN, OPIK_PROJECT_NAME } from "../helpers/constants";

/** correctIndex per question in content/quiz.json */
const QUIZ_CORRECT = [0, 1, 1, 1, 2];

/** correctIndex per question in content/contributing-quiz.json */
const CONTRIBUTING_QUIZ_CORRECT = [0, 1, 1, 1, 2];

/** Node order from content/knowledge-graph.json */
const GRAPH_NODE_IDS = [
  "opik-platform",
  "tracing",
  "spans-feedback",
  "evaluation",
  "llm-judge",
  "datasets-experiments",
  "production",
  "prompt-playground",
  "integrations",
  "agent-optimizer",
  "guardrails",
  "self-hosted",
];

const OVERVIEW_SLIDE_COUNT = 6;
const CONTRIBUTING_SLIDE_IDS = [
  "what-contributing-means",
  "contributing-guidelines",
  "repo-layout",
  "where-to-work",
  "how-to-contribute",
  "github-actions",
  "developer-tooling-ai",
  "community-feature-requests",
  "whats-next",
] as const;

async function clickNext(page: Page): Promise<void> {
  await page.getByTestId("wizard-next").click();
}

async function expectStep(page: Page, testId: string): Promise<void> {
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 30_000 });
}

async function scrollAgreeDocument(page: Page, prefix: string): Promise<void> {
  const doc = page.getByTestId(`${prefix}-document`);
  await doc.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
    el.dispatchEvent(new Event("scroll"));
  });
}

async function completeOverviewSlides(page: Page): Promise<void> {
  await expectStep(page, "step-overview");
  await expect(page.getByTestId("opik-brand-logo")).toBeVisible();
  await expect(page.getByTestId("overview-slides")).toBeVisible();
  await expect(page.getByTestId("overview-slide-dot-0")).toBeEnabled();
  await expect(page.getByTestId("overview-slide-dot-1")).toBeDisabled();
  await expect(page.getByTestId("slide-did-you-know")).toBeVisible();
  await expect(page.getByTestId("wizard-next")).toBeVisible();
  await expect(page.getByTestId("wizard-next")).toBeEnabled();
  await expect(
    page.getByTestId("overview-slide-what-is-opik").getByRole("link", { name: "Comet" }),
  ).toHaveAttribute("href", "https://www.comet.com");
  await expect(
    page.getByTestId("overview-slide-what-is-opik").getByRole("link", { name: "Comet" }),
  ).toHaveAttribute("target", "_blank");
  await expect(
    page.getByTestId("overview-slide-what-is-opik").getByRole("link", { name: "Comet" }),
  ).toHaveAttribute("rel", "noopener noreferrer");

  for (let i = 0; i < OVERVIEW_SLIDE_COUNT - 1; i++) {
    await clickNext(page);
    if (i === 2) {
      await expect(page.getByTestId("overview-slide-who-for")).toContainText("Opik is for everyone");
      await page.getByTestId("overview-role-businesses").click();
      await expect(page.getByTestId("overview-role-detail")).toBeVisible();
      const cloudLink = page
        .getByTestId("overview-role-detail")
        .getByRole("link", { name: "Comet Cloud" });
      await expect(cloudLink).toHaveAttribute("href", "https://www.comet.com/opik");
      await expect(cloudLink).toHaveAttribute("target", "_blank");
      await expect(cloudLink).toHaveAttribute("rel", "noopener noreferrer");
      await page.getByTestId("overview-role-businesses").click();
      await expect(page.getByTestId("overview-role-detail")).toHaveCount(0);
    }
  }

  await expect(page.getByTestId("overview-slide-what-you-learn")).toBeVisible();
  await expect(page.getByTestId("overview-slide-dot-0")).toBeEnabled();
  await page.getByTestId("overview-slide-dot-0").click();
  await expect(page.getByTestId("overview-slide-what-is-opik")).toBeVisible();
  await page.getByTestId("overview-slide-dot-5").click();
  await expect(page.getByTestId("overview-slide-what-you-learn")).toBeVisible();
  await expect(page.getByTestId("wizard-next")).toBeVisible();
  await expect(page.getByTestId("wizard-next")).toBeEnabled();
  await clickNext(page);
}

async function completeGraphUnlock(page: Page): Promise<void> {
  await expectStep(page, "step-graph");
  await expect(
    page.getByRole("link", { name: "Explore Opik University →" }),
  ).toHaveAttribute("href", "https://www.comet.com/docs/opik/v1/opik-university/overview");
  await expect(page.getByTestId("graph-empty-hint")).toBeVisible();
  await expect(page.getByTestId("wizard-next")).toHaveCount(0);

  // Second node starts locked.
  await expect(page.getByTestId("graph-node-tracing")).toBeDisabled();

  for (const id of GRAPH_NODE_IDS) {
    const node = page.getByTestId(`graph-node-${id}`);
    await expect(node).toBeEnabled();
    await node.click();
    await expect(page.getByTestId("graph-detail-modal")).toBeVisible();
    await page.getByTestId("graph-detail-modal-close").click();
    await expect(page.getByTestId("graph-detail-modal")).toHaveCount(0);
  }

  await expect(page.getByTestId("wizard-next")).toBeVisible();
  await clickNext(page);
}

async function completeTour(page: Page): Promise<void> {
  await expectStep(page, "step-tour");
  await expect(page.getByRole("link", { name: "Read the Opik quickstart →" })).toHaveAttribute(
    "href",
    "https://www.comet.com/docs/opik/quickstart",
  );
  await expect(page.getByTestId("tour-checklist")).toBeVisible();
  await expect(page.getByTestId("wizard-next")).toHaveCount(0);

  // Progressive reveal: only the first CTA is present initially.
  await expect(page.getByTestId("tour-open-opik")).toBeVisible();
  await expect(page.getByTestId("tour-open-opik")).toHaveAttribute(
    "href",
    new RegExp(
      `/default/redirect/projects\\?name=${OPIK_PROJECT_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    ),
  );
  await expect(page.getByTestId("tour-open-chat")).toHaveCount(0);
  await expect(page.getByTestId("tour-open-traces")).toHaveCount(0);
  await expect(page.getByTestId("tour-open-spans")).toHaveCount(0);
  await expect(page.getByTestId("graph-got-it")).toHaveCount(0);

  // Close external tabs opened by tour CTAs.
  page.on("popup", (popup) => {
    void popup.close();
  });

  // CTA click auto-completes and reveals the next step.
  await page.getByTestId("tour-open-opik").click();
  await expect(page.getByTestId("tour-check-open-opik")).toBeChecked();
  await expect(page.getByTestId("tour-open-chat")).toBeVisible();

  await page.getByTestId("tour-open-chat").click();
  await expect(page.getByTestId("tour-check-send-chat")).toBeChecked();
  await expect(page.getByTestId("tour-open-traces")).toBeVisible();
  const tracesHrefPattern = new RegExp(
    `/default/(?:projects/[^/]+/logs\\?logsType=traces|redirect/projects\\?name=${OPIK_PROJECT_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})$`,
  );
  await expect
    .poll(async () => page.getByTestId("tour-open-traces").getAttribute("href"))
    .toMatch(tracesHrefPattern);

  await expect(page.getByTestId("tour-item-find-trace")).toContainText("Metadata");
  await expect(page.getByTestId("tour-item-find-trace")).toContainText("Token usage");

  await page.getByTestId("tour-open-traces").click();
  await expect(page.getByTestId("tour-check-find-trace")).toBeChecked();
  await expect(page.getByTestId("tour-open-spans")).toHaveCount(0);
  await expect(page.getByTestId("tour-check-inspect-spans")).toHaveCount(0);
  await expect(page.getByTestId("tour-progress")).toContainText("3 of 3");

  await expect(page.getByTestId("wizard-next")).toBeVisible();
  await clickNext(page);
}

async function completeQuiz(page: Page): Promise<void> {
  await expectStep(page, "step-quiz");

  // Q1: wrong answer auto-grades (no submit)
  await page.getByTestId("quiz-option-1").click();
  await expect(page.getByTestId("quiz-next-question")).toBeVisible();
  await expect(page.getByTestId("quiz-submit")).toHaveCount(0);
  await expect(page.getByTestId("engineer-flag")).toHaveCount(0);
  await page.getByTestId("quiz-next-question").click();

  // Q2–Q5: correct answers
  for (let q = 1; q < QUIZ_CORRECT.length; q++) {
    await page.getByTestId(`quiz-option-${QUIZ_CORRECT[q]!}`).click();
    await expect(page.getByTestId("quiz-next-question")).toBeVisible();
    await page.getByTestId("quiz-next-question").click();
  }

  await expect(page.getByTestId("quiz-results")).toBeVisible();
}

async function completeContributingOverviewSlides(page: Page): Promise<void> {
  await expectStep(page, "step-contributing-overview");
  await expect(page.getByTestId("contributing-slides")).toBeVisible();
  await expect(page.getByTestId("wizard-next")).toBeVisible();

  // Slide 1: CLA scroll + agree required before wizard Next advances.
  await expect(page.getByTestId("contributing-slide-what-contributing-means")).toBeVisible();
  await expect(page.getByTestId("contributing-cla-document")).toBeVisible();
  await expect(page.getByTestId("contributing-cla-agree")).toBeDisabled();
  await expect(page.getByTestId("wizard-next")).toBeDisabled();
  await expect(page.getByTestId("contributing-slide-dot-1")).toBeDisabled();

  await scrollAgreeDocument(page, "contributing-cla");
  await expect(page.getByTestId("contributing-cla-agree")).toBeEnabled();
  await page.getByTestId("contributing-cla-agree").check();
  await expect(page.getByTestId("wizard-next")).toBeEnabled();
  await page.getByTestId("contributing-cla-agree").uncheck();
  await expect(page.getByTestId("wizard-next")).toBeDisabled();
  await scrollAgreeDocument(page, "contributing-cla");
  await page.getByTestId("contributing-cla-agree").check();
  await clickNext(page);

  // Slide 2: CONTRIBUTING scroll + agree.
  await expect(page.getByTestId("contributing-slide-contributing-guidelines")).toBeVisible();
  await expect(page.getByTestId("contributing-guidelines-document")).toBeVisible();
  await expect(page.getByTestId("contributing-guidelines-agree")).toBeDisabled();
  await expect(page.getByTestId("wizard-next")).toBeDisabled();

  await scrollAgreeDocument(page, "contributing-guidelines");
  await page.getByTestId("contributing-guidelines-agree").check();
  await expect(page.getByTestId("wizard-next")).toBeEnabled();
  await clickNext(page);

  for (let i = 2; i < CONTRIBUTING_SLIDE_IDS.length; i++) {
    await expect(
      page.getByTestId(`contributing-slide-${CONTRIBUTING_SLIDE_IDS[i]}`),
    ).toBeVisible();
    if (CONTRIBUTING_SLIDE_IDS[i] === "developer-tooling-ai") {
      await expect(
        page.getByTestId("contributing-slide-developer-tooling-ai"),
      ).toContainText("llms.txt");
    }
    if (CONTRIBUTING_SLIDE_IDS[i] === "community-feature-requests") {
      await expect(
        page.getByTestId("contributing-slide-community-feature-requests"),
      ).toContainText("feature request");
    }
    if (i < CONTRIBUTING_SLIDE_IDS.length - 1) {
      await expect(page.getByTestId("wizard-next")).toBeEnabled();
      await clickNext(page);
    }
  }

  await expect(page.getByTestId("contributing-slide-dot-0")).toBeEnabled();
  await page.getByTestId("contributing-slide-dot-0").click();
  await expect(page.getByTestId("contributing-slide-what-contributing-means")).toBeVisible();
  await page
    .getByTestId(`contributing-slide-dot-${CONTRIBUTING_SLIDE_IDS.length - 1}`)
    .click();
  await expect(
    page.getByTestId(`contributing-slide-${CONTRIBUTING_SLIDE_IDS[CONTRIBUTING_SLIDE_IDS.length - 1]}`),
  ).toBeVisible();

  // Last slide: wizard Next unlocks via reachedLast + both agrees.
  await expect(page.getByTestId("wizard-next")).toBeVisible();
  await expect(page.getByTestId("wizard-next")).toBeEnabled();
  await clickNext(page);
}

async function completeContributingQuiz(page: Page): Promise<void> {
  await expectStep(page, "step-contributing-quiz");
  await expect(page.getByTestId("wizard-next")).toHaveCount(0);

  // Intentionally score below passThreshold (4); finish must still unlock Next.
  for (let q = 0; q < CONTRIBUTING_QUIZ_CORRECT.length; q++) {
    const wrong = (CONTRIBUTING_QUIZ_CORRECT[q]! + 1) % 4;
    await page.getByTestId(`contributing-quiz-option-${wrong}`).click();
    await expect(page.getByTestId("contributing-quiz-next-question")).toBeVisible();
    await expect(page.getByTestId("contributing-quiz-submit")).toHaveCount(0);
    await page.getByTestId("contributing-quiz-next-question").click();
  }

  await expect(page.getByTestId("contributing-quiz-results")).toBeVisible();
  await expect(page.getByTestId("contributing-quiz-results")).toContainText(
    "did not reach the pass threshold",
  );
}

async function completeVerify(page: Page): Promise<void> {
  await expectStep(page, "step-verify");
  await expect(page.getByTestId("wizard-next")).toHaveCount(0);
  await expect(page.getByTestId("verify-area")).toBeVisible();
  await expect(page.getByTestId("verify-area-name")).toBeVisible();
  await expect(page.getByTestId("verify-area-rationale")).toBeVisible();
  await expect(page.getByTestId("verify-commands")).toBeVisible();
  await expect(page.getByTestId("verify-workflows")).toBeVisible();
  await expect(page.getByTestId("verify-all-actions-link")).toHaveAttribute(
    "href",
    "https://github.com/comet-ml/opik/actions",
  );
  await expect(page.getByTestId("verify-prompt")).toBeVisible();
  await expect(page.getByTestId("verify-prompt")).toContainText("git fetch origin");
  await expect(page.getByTestId("verify-prompt")).toContainText("origin/main");
  await expect(page.getByTestId("verify-prompt")).toContainText("llms.txt");
  await expect(page.getByTestId("verify-prompt")).toContainText("_mcp/server");
  await expect(page.getByTestId("verify-prompt")).toContainText(
    "Verify AI-generated code",
  );
  await expect(page.getByTestId("verify-checklist")).toBeVisible();
  await expect(page.getByTestId("open-verify-prompt")).toBeVisible();
  await expect(page.getByTestId("copy-verify-prompt")).toBeVisible();

  // Both checklist items required before Next unlocks.
  await page.getByTestId("verify-check-ran-local").check();
  await expect(page.getByTestId("wizard-next")).toHaveCount(0);
  await page.getByTestId("verify-check-matches-issue").check();
  await expect(page.getByTestId("wizard-next")).toBeVisible();
  await clickNext(page);
}

test.describe("onboarding wizard", () => {
  test("walks About you through Finish celebration with contribution branch", async ({
    page,
  }) => {
    await page.goto("/");

    await expectStep(page, "step-about");
    await expect(page.getByTestId("wizard-step-nav")).toBeVisible();
    await expect(page.getByTestId("wizard-step-about")).toBeEnabled();
    await expect(page.getByTestId("wizard-step-overview")).toBeDisabled();
    const poweredBy = page.getByTestId("footer-powered-by");
    await expect(poweredBy).toBeVisible();
    await expect(poweredBy).toContainText("Inference by");
    await expect(poweredBy).toContainText("via local");
    await expect(poweredBy.getByRole("link", { name: "Llama 3.1 8B" })).toHaveAttribute(
      "href",
      "https://ollama.com/library/llama3.1:8b",
    );
    await expect(poweredBy.getByRole("link", { name: "Ollama" })).toHaveAttribute(
      "href",
      "https://github.com/ollama/ollama",
    );
    await page.getByTestId("about-persona-engineer").click();
    await clickNext(page);

    await expectStep(page, "step-overview");
    await expect(page.getByTestId("wizard-step-about")).toBeEnabled();
    await expect(page.getByTestId("wizard-step-overview")).toBeEnabled();
    await expect(page.getByTestId("wizard-step-graph")).toBeDisabled();
    await page.getByTestId("wizard-step-about").click();
    await expectStep(page, "step-about");
    await page.getByTestId("wizard-step-overview").click();
    await expectStep(page, "step-overview");

    await completeOverviewSlides(page);
    await expectStep(page, "step-video");
    await expect(page.getByTestId("opik-intro-video")).toBeVisible();
    await expect(page.getByRole("link", { name: "Explore Opik University →" })).toHaveAttribute(
      "href",
      "https://www.comet.com/docs/opik/v1/opik-university/overview",
    );
    await clickNext(page);
    await completeGraphUnlock(page);

    const stack = page.getByTestId("step-stack");
    await expect(stack).toBeVisible();
    await expect(page.getByTestId("stack-url-opik-ui")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Read the local deployment guide →" }),
    ).toHaveAttribute("href", "https://www.comet.com/docs/opik/self-host/local_deployment");
    await clickNext(page);
    await expectStep(page, "step-adding-opik");
    await expect(page.getByRole("link", { name: "Explore Opik integrations →" })).toHaveAttribute(
      "href",
      "https://www.comet.com/docs/opik/integrations/overview",
    );
    await expect(page.getByTestId("copy-sdk-snippet")).toBeVisible();
    await expect(page.getByTestId("lifecycle-explanation")).toBeVisible();
    await clickNext(page);

    await completeTour(page);

    // Tour → Quiz must keep the app alive (no blank connection-refused page).
    await expect(page.getByTestId("step-error-boundary")).toHaveCount(0);
    await expectStep(page, "step-quiz");
    // Quiz hides wizard-next until finished (CONTRACTS); assert absence, not visibility.
    await expect(page.getByTestId("wizard-next")).toHaveCount(0);

    await completeQuiz(page);
    await expect(page.getByTestId("wizard-next")).toBeVisible();
    await clickNext(page);

    await completeContributingOverviewSlides(page);

    await completeContributingQuiz(page);
    await expect(page.getByTestId("wizard-next")).toBeVisible();
    await clickNext(page);

    await expectStep(page, "step-issues");
    await expect(page.getByTestId("issue-recommended")).toBeVisible({
      timeout: 60_000,
    });
    const alt0 = page.getByTestId("issue-alternative-0");
    const alt1 = page.getByTestId("issue-alternative-1");
    // Ranking may return fewer than 3 issues; require alternatives only when present.
    const alt0Count = await alt0.count();
    if (alt0Count > 0) {
      await expect(alt0).toBeVisible();
    }
    if ((await alt1.count()) > 0) {
      await expect(alt1).toBeVisible();
    }

    const issueOption = page.locator('[data-testid^="issue-select-"]').first();
    await expect(issueOption).toBeVisible();
    await issueOption.click();
    await expect(page.getByTestId("issue-detail-modal")).toBeVisible();
    await expect(page.getByTestId("issue-excerpt")).toBeVisible();
    await expect(page.getByTestId("issue-time-estimate")).toBeVisible();
    await page.getByTestId("issue-confirm-select").click();
    await clickNext(page);

    await expect(page.getByTestId("open-cursor-command")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole("link", { name: "Read the Opik AI guidance →" })).toHaveAttribute(
      "href",
      "https://www.comet.com/docs/opik/latest/contributing/overview#developer-tooling--ai-assistance",
    );
    const prompt = page.getByTestId("cursor-prompt");
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText(BRANCH_NAME_PATTERN);
    await expect(prompt).toContainText("Do not open a PR yet");
    await expect(prompt).toContainText("git fetch origin");
    await expect(prompt).toContainText("origin/main");
    await expect(prompt).toContainText("llms.txt");
    await expect(prompt).toContainText("_mcp/server");
    await expect(prompt).not.toContainText("gh pr create --draft");
    await expect(page.getByTestId("open-cursor-prompt")).toBeVisible();
    await expect(page.getByTestId("open-opik-in-cursor")).toBeVisible();
    const deeplink = page.getByTestId("open-cursor-prompt");
    await expect(deeplink).toHaveAttribute(
      "href",
      /^cursor:\/\/anysphere\.cursor-deeplink\/prompt\?text=/,
    );

    await page.route("**/api/open-opik-in-cursor", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, path: "/tmp/mock-opik" }),
      });
    });

    // Primary prompt CTA: confirm modal → open API (deeplink fired after success).
    await page.getByTestId("open-cursor-prompt").click();
    await expect(page.getByTestId("open-opik-confirm-modal")).toBeVisible();
    await expect(page.getByTestId("open-opik-path")).toBeVisible();
    await expect(page.getByTestId("open-opik-path")).not.toHaveText("Loading path…");
    await expect(page.getByTestId("open-opik-path")).toHaveText(/^\//);
    const promptOpenRequest = page.waitForRequest(
      (req) =>
        req.url().includes("/api/open-opik-in-cursor") && req.method() === "POST",
    );
    await page.getByTestId("open-opik-confirm").click();
    await promptOpenRequest;
    await expect(page.getByTestId("open-opik-confirm-modal")).toHaveCount(0);

    // Repo CTA uses the same confirm + API path.
    await page.getByTestId("open-opik-in-cursor").click();
    await expect(page.getByTestId("open-opik-confirm-modal")).toBeVisible();
    await expect(page.getByTestId("open-opik-path")).toHaveText(/^\//);
    const repoOpenRequest = page.waitForRequest(
      (req) =>
        req.url().includes("/api/open-opik-in-cursor") && req.method() === "POST",
    );
    await page.getByTestId("open-opik-confirm").click();
    await repoOpenRequest;
    await expect(page.getByTestId("open-opik-confirm-modal")).toHaveCount(0);

    await clickNext(page);

    await completeVerify(page);

    await expectStep(page, "step-pr-help");
    await expect(page.getByTestId("pr-help-prompt")).toBeVisible();
    await expect(page.getByTestId("pr-help-prompt")).toContainText("git fetch origin");
    await expect(page.getByTestId("pr-help-prompt")).toContainText("origin/main");
    await expect(page.getByTestId("pr-help-prompt")).toContainText("## AI Assistance");
    await expect(page.getByTestId("pr-help-prompt")).toContainText("Tool/model:");
    await expect(page.getByTestId("pr-help-prompt")).toContainText("Human verification:");
    await expect(page.getByTestId("pr-help-prompt")).toContainText("npx attest-client");
    await expect(page.getByTestId("pr-help-prompt")).toContainText("shortUrl/verifyUrl");
    await expect(page.getByTestId("open-pr-help-prompt")).toBeVisible();
    await expect(page.getByTestId("copy-pr-help-prompt")).toBeVisible();
    await expect(page.getByTestId("open-pr-help-prompt")).toHaveAttribute(
      "href",
      /^cursor:\/\/anysphere\.cursor-deeplink\/prompt\?text=/,
    );

    // PR-help Open CTA: confirm modal → open API (same path as cursor/verify prompts).
    await page.getByTestId("open-pr-help-prompt").click();
    await expect(page.getByTestId("open-opik-confirm-modal")).toBeVisible();
    await expect(page.getByTestId("open-opik-path")).toHaveText(/^\//);
    const prHelpOpenRequest = page.waitForRequest(
      (req) =>
        req.url().includes("/api/open-opik-in-cursor") && req.method() === "POST",
    );
    await page.getByTestId("open-opik-confirm").click();
    await prHelpOpenRequest;
    await expect(page.getByTestId("open-opik-confirm-modal")).toHaveCount(0);

    await expect(page.getByTestId("pr-checklist")).toHaveCount(0);
    await clickNext(page);

    await expectStep(page, "step-extend");
    await expect(page.getByTestId("wizard-next")).toHaveText("Finish");
    await clickNext(page);

    await expectStep(page, "step-finish");
    await expect(page.getByText("Complete")).toBeVisible();
    await expect(page.getByText("Well done")).toBeVisible();
    await expect(page.getByText("✓ Finish")).toBeVisible();
    await expect(page.getByTestId("finish-fireworks")).toBeVisible();
    await expect(page.getByTestId("finish-opik-github")).toHaveAttribute(
      "href",
      "https://github.com/comet-ml/opik",
    );
    await expect(page.getByTestId("finish-support-email")).toHaveAttribute(
      "href",
      "mailto:support@97115104.com",
    );
    await expect(
      page.getByRole("link", { name: "Keep learning with Opik University →" }),
    ).toHaveAttribute("href", "https://www.comet.com/docs/opik/v1/opik-university/overview");
    await expect(page.getByTestId("wizard-next")).toHaveCount(0);

    await page.getByTestId("wizard-back").click();
    await expectStep(page, "step-extend");
  });
});
