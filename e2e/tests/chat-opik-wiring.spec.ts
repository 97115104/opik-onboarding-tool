import { test, expect, type Page } from "@playwright/test";

import { CHAT_DEMO_URL, OPIK_PROJECT_NAME } from "../helpers/constants";
import { getOpikTraceCount, waitForNewOpikTrace } from "../helpers/opik";

const CHAT_MESSAGE = "e2e wiring check: reply with one short word.";

async function chatInput(page: Page) {
  const byTestId = page.getByTestId("chat-input");
  if (await byTestId.count()) {
    return byTestId;
  }
  return page.locator("textarea, input[type='text']").first();
}

async function chatSendButton(page: Page) {
  const byTestId = page.getByTestId("chat-send");
  if (await byTestId.count()) {
    return byTestId;
  }
  return page.getByRole("button", { name: /send|submit/i });
}

test.describe("chat opik wiring", () => {
  test("chat message produces a response and Opik trace", async ({
    page,
    request,
  }) => {
    const baselineTraces = await getOpikTraceCount(request);

    await page.goto(CHAT_DEMO_URL);

    await expect(page.getByTestId("chat-status-project-link")).toHaveAttribute(
      "href",
      new RegExp(`/default/redirect/projects\\?name=${encodeURIComponent(OPIK_PROJECT_NAME)}$`),
    );

    const input = await chatInput(page);
    await expect(input).toBeVisible();
    await input.fill(CHAT_MESSAGE);

    const send = await chatSendButton(page);
    await expect(send).toBeEnabled();
    await send.click();

    const response = page.locator('[data-testid^="chat-response-"]').last();

    await expect(response).toBeVisible({ timeout: 90_000 });
    await expect(response).not.toHaveText(/Send a message to chat with Ollama/i);

    await waitForNewOpikTrace(request, baselineTraces);
  });
});
