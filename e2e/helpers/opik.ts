import type { APIRequestContext } from "@playwright/test";

import { OPIK_API_URL } from "./constants";

interface TracePage {
  total?: number;
  content?: unknown[];
}

export async function getOpikTraceCount(
  request: APIRequestContext,
): Promise<number> {
  const response = await request.get(`${OPIK_API_URL}/v1/private/traces`, {
    params: { size: 1 },
  });

  if (!response.ok()) {
    return 0;
  }

  const body = (await response.json()) as TracePage;
  if (typeof body.total === "number") {
    return body.total;
  }

  return body.content?.length ?? 0;
}

export async function waitForNewOpikTrace(
  request: APIRequestContext,
  baselineCount: number,
  timeoutMs = 60_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const count = await getOpikTraceCount(request);
    if (count > baselineCount) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  throw new Error(
    `Timed out after ${timeoutMs}ms waiting for a new Opik trace (baseline=${baselineCount})`,
  );
}
