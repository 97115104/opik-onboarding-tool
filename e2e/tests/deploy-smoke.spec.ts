import { test, expect } from "@playwright/test";

import {
  CHAT_DEMO_URL,
  ONBOARDING_UI_URL,
  OPIK_FRONTEND_URL,
} from "../helpers/constants";

test.describe("deploy smoke", () => {
  test("services respond with HTTP 200 and About you is visible", async ({
    page,
    request,
  }) => {
    for (const url of [ONBOARDING_UI_URL, CHAT_DEMO_URL, OPIK_FRONTEND_URL]) {
      const response = await request.get(url);
      expect(response.status(), `${url} should return 200`).toBe(200);
    }

    await page.goto("/");
    await expect(page.getByTestId("step-about")).toBeVisible();
  });
});
