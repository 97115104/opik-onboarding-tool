import { test, expect, type Page } from "@playwright/test";

import { CHAT_DEMO_URL } from "../helpers/constants";
import { getOpikTraceCount, waitForNewOpikTrace } from "../helpers/opik";

const CHAT_MESSAGE = "e2e wiring check — reply with one short word.";

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

    const input = await chatInput(page);
    await expect(input).toBeVisible();
    await input.fill(CHAT_MESSAGE);

    const send = await chatSendButton(page);
    await expect(send).toBeEnabled();
    await send.click();

    const response = page
      .getByTestId("chat-response")
      .or(page.locator("[data-testid^='chat-message-']").last())
      .or(page.locator("[data-role='assistant'], .assistant-message").last());

    await expect(response).toBeVisible({ timeout: 90_000 });
    await expect(response).not.toHaveText("");

    await waitForNewOpikTrace(request, baselineTraces);
  });
});
