import { test, expect, type Page } from "@playwright/test";

import { BRANCH_NAME_PATTERN } from "../helpers/constants";

/** correctIndex per question in content/quiz.json */
const QUIZ_CORRECT = [0, 1, 1, 1, 2];

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

async function clickNext(page: Page): Promise<void> {
  await page.getByTestId("wizard-next").click();
}

async function expectStep(page: Page, testId: string): Promise<void> {
  await expect(page.getByTestId(testId)).toBeVisible({ timeout: 30_000 });
}

async function completeOverviewSlides(page: Page): Promise<void> {
  await expectStep(page, "step-overview");
  await expect(page.getByTestId("overview-slides")).toBeVisible();
  await expect(page.getByTestId("wizard-next")).toHaveCount(0);

  for (let i = 0; i < OVERVIEW_SLIDE_COUNT - 1; i++) {
    await page.getByTestId("overview-slide-next").click();
  }

  // Last slide: no overview-slide-next; wizard Next unlocks via reachedLast.
  await expect(page.getByTestId("overview-slide-next")).toHaveCount(0);
  await expect(page.getByTestId("wizard-next")).toBeVisible();
  await clickNext(page);
}

async function completeGraphUnlock(page: Page): Promise<void> {
  await expectStep(page, "step-graph");
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
  await expect(page.getByTestId("tour-checklist")).toBeVisible();
  await expect(page.getByTestId("wizard-next")).toHaveCount(0);

  // Progressive reveal: only the first CTA is present initially.
  await expect(page.getByTestId("tour-open-opik")).toBeVisible();
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

async function completeVerify(page: Page): Promise<void> {
  await expectStep(page, "step-verify");
  await expect(page.getByTestId("wizard-next")).toHaveCount(0);
  await expect(page.getByTestId("verify-area")).toBeVisible();
  await expect(page.getByTestId("verify-area-name")).toBeVisible();
  await expect(page.getByTestId("verify-area-rationale")).toBeVisible();
  await expect(page.getByTestId("verify-commands")).toBeVisible();
  await expect(page.getByTestId("verify-workflows")).toBeVisible();
  await expect(page.getByTestId("verify-prompt")).toBeVisible();
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
    await page.getByTestId("about-persona-engineer").click();
    await clickNext(page);

    await completeOverviewSlides(page);
    await completeGraphUnlock(page);

    const stack = page.getByTestId("step-stack");
    await expect(stack).toBeVisible();
    await expect(page.getByTestId("stack-url-opik-ui")).toBeVisible();
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
    const prompt = page.getByTestId("cursor-prompt");
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText(BRANCH_NAME_PATTERN);
    await expect(prompt).toContainText("Do not open a PR yet");
    await expect(prompt).not.toContainText("gh pr create --draft");
    await expect(page.getByTestId("open-cursor-prompt")).toBeVisible();
    const deeplink = page.getByTestId("open-cursor-prompt");
    await expect(deeplink).toHaveAttribute(
      "href",
      /^cursor:\/\/anysphere\.cursor-deeplink\/prompt\?text=/,
    );
    await clickNext(page);

    await completeVerify(page);

    await expectStep(page, "step-pr-help");
    await expect(page.getByTestId("pr-help-prompt")).toBeVisible();
    await expect(page.getByTestId("pr-checklist")).toHaveCount(0);
    await clickNext(page);

    await expectStep(page, "step-extend");
    await expect(page.getByTestId("wizard-next")).toHaveText("Finish");
    await clickNext(page);

    await expectStep(page, "step-finish");
    await expect(page.getByText("Complete")).toBeVisible();
    await expect(page.getByText("Well done")).toBeVisible();
    await expect(page.getByTestId("finish-fireworks")).toBeVisible();
    await expect(page.getByTestId("finish-opik-github")).toHaveAttribute(
      "href",
      "https://github.com/comet-ml/opik",
    );
    await expect(page.getByTestId("finish-support-email")).toHaveAttribute(
      "href",
      "mailto:support@97115104.com",
    );
    await expect(page.getByTestId("wizard-next")).toHaveCount(0);

    await page.getByTestId("wizard-back").click();
    await expectStep(page, "step-extend");
  });
});
