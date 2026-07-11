import { test, expect, type Page } from "@playwright/test";

import { BRANCH_NAME_PATTERN } from "../helpers/constants";

/** correctIndex per question in content/quiz.json */
const QUIZ_CORRECT = [0, 1, 1, 1, 2];

async function clickNext(page: Page): Promise<void> {
  await page.getByTestId("wizard-next").click();
}

async function expectStep(page: Page, testId: string): Promise<void> {
  await expect(page.getByTestId(testId)).toBeVisible();
}

async function advancePastStep(page: Page, testId: string): Promise<void> {
  await expectStep(page, testId);
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

test.describe("onboarding wizard", () => {
  test("walks About you through dual prompts with contribution branch", async ({
    page,
  }) => {
    await page.goto("/");

    await expectStep(page, "step-about");
    await page.getByTestId("about-persona-engineer").click();
    await clickNext(page);

    await advancePastStep(page, "step-overview");
    await advancePastStep(page, "step-graph");

    const stack = page.getByTestId("step-stack");
    if (await stack.isVisible().catch(() => false)) {
      await clickNext(page);
    }

    await advancePastStep(page, "step-tour");

    await completeQuiz(page);
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
    await clickNext(page);

    await expect(page.getByTestId("open-cursor-command")).toBeVisible({
      timeout: 30_000,
    });
    const prompt = page.getByTestId("cursor-prompt");
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText(BRANCH_NAME_PATTERN);
    await clickNext(page);

    await expectStep(page, "step-pr-help");
    await expect(page.getByTestId("pr-help-prompt")).toBeVisible();
    await expect(page.getByTestId("pr-checklist")).toHaveCount(0);
  });
});
