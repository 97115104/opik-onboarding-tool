import { test, expect, type Page } from "@playwright/test";

import { BRANCH_NAME_PATTERN } from "../helpers/constants";

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

  await page.getByTestId("quiz-option-1").click();
  await page.getByTestId("quiz-submit").click();

  const showAnswer = page.getByTestId("quiz-show-answer");
  if (await showAnswer.isVisible().catch(() => false)) {
    await showAnswer.click();
  }

  await page.getByTestId("quiz-option-0").click();
  await page.getByTestId("quiz-submit").click();
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
    await clickNext(page);

    const engineerFlag = page.getByTestId("engineer-flag");
    if (await engineerFlag.isVisible().catch(() => false)) {
      await engineerFlag.click();
    }
    await clickNext(page);

    await expectStep(page, "issue-list");
    const issueOption = page.locator('[data-testid^="issue-select-"]').first();
    await expect(issueOption).toBeVisible();
    await issueOption.click();
    await clickNext(page);

    const prompt = page.getByTestId("cursor-prompt");
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText(BRANCH_NAME_PATTERN);
  });
});
