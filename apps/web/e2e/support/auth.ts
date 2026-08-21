import { expect, type Page } from "@playwright/test";

export async function signUp(page: Page) {
  await page.addInitScript(() => {
    const hideDevtools = () => {
      for (const el of document.querySelectorAll('[aria-label="Open TanStack Devtools"]')) {
        (el as HTMLElement).style.setProperty("display", "none", "important");
      }
    };
    const observer = new MutationObserver(hideDevtools);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    hideDevtools();
  });

  const uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const email = `e2e-${uniqueId}@example.com`;
  const password = "test-password-123";

  const signupResponse = await page.request.post("/api/auth/sign-up/email", {
    data: {
      email,
      password,
      name: `E2E User ${uniqueId}`,
    },
  });
  expect(signupResponse.ok()).toBeTruthy();

  return { email, password, uniqueId };
}
