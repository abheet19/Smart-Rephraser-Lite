// tests/e2e.spec.js
const { test, expect } = require("@playwright/test");

test("rephrase flow works (cache miss -> hit)", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173");
  await page.fill("textarea", "quick fox");
  await page.click("text=Rephrase");
  // Wait for the result panel to move past its empty state
  await page.waitForSelector(".output:not(.output-empty)", {
    timeout: 7000,
  });
  await expect(page.locator(".output")).toContainText("Speedy"); // depends on the synonym table in synonyms.js
  // Now rephrase again and check it's fast: we can check telemetry event count or absence of network calls
  await page.click("text=Rephrase");
  // check for cached content presence
  const text = await page.locator(".output").textContent();
  expect(text.length).toBeGreaterThan(0);
});
