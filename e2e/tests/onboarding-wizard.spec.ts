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

async function answerQuestion(
  page: Page,
  optionIndex: number,
): Promise<void> {
  await page.getByTestId(`quiz-option-${optionIndex}`).click();
  await page.getByTestId("quiz-submit").click();
}

async function completeQuiz(page: Page): Promise<void> {
  await expectStep(page, "step-quiz");

  // Q1: wrong → show answer → next (covers wrong/show-answer path)
  await answerQuestion(page, 1);
  const showAnswer = page.getByTestId("quiz-show-answer");
  if (await showAnswer.isVisible().catch(() => false)) {
    await showAnswer.click();
  }
  await page.getByRole("button", { name: "Next question" }).click();

  // Q2–Q5: correct answers
  for (let q = 1; q < QUIZ_CORRECT.length; q++) {
    await answerQuestion(page, QUIZ_CORRECT[q]!);
    if (q < QUIZ_CORRECT.length - 1) {
      await page.getByRole("button", { name: "Next question" }).click();
    }
  }
}

test.describe("onboarding wizard", () => {
  test("walks through prompt with contribution branch name", async ({
    page,
  }) => {
    await page.goto("/");

    await expectStep(page, "step-overview");
    await clickNext(page);

    await advancePastStep(page, "step-graph");

    const stack = page.getByTestId("step-stack");
    if (await stack.isVisible().catch(() => false)) {
      await clickNext(page);
    }

    await advancePastStep(page, "step-tour");

    await completeQuiz(page);

    const engineerFlag = page.getByTestId("engineer-flag");
    if (await engineerFlag.isVisible().catch(() => false)) {
      await engineerFlag.click();
    }
    await clickNext(page);

    await expectStep(page, "step-issues");
    const issueOption = page.locator('[data-testid^="issue-select-"]').first();
    await expect(issueOption).toBeVisible({ timeout: 60_000 });
    await issueOption.click();
    await clickNext(page);

    const prompt = page.getByTestId("cursor-prompt");
    await expect(prompt).toBeVisible({ timeout: 30_000 });
    await expect(prompt).toContainText(BRANCH_NAME_PATTERN);
  });
});
