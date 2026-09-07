// tools/record-demo.mjs
//
// Records the hero demo GIF used at the top of the README.
//
// It drives the REAL app in a real Chromium via Playwright and saves one PNG
// per frame; tools/build-demo-gif.py then assembles those frames into
// docs/demo/hero.gif. Nothing here is staged -- the rephrased text you see in
// the GIF is whatever the client-side pipeline actually produces.
//
//   npm run build && npm run preview      # or point DEMO_URL at the live site
//   node tools/record-demo.mjs
//   python tools/build-demo-gif.py
//
// Env:
//   DEMO_URL    page to record (default: the deployed GitHub Pages build)
//   FRAMES_DIR  where PNG frames are written (default: tools/.demo-frames)

import { chromium } from "@playwright/test";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const URL = process.env.DEMO_URL ?? "https://abheet19.github.io/Smart-Rephraser-Lite/";
const FRAMES_DIR = process.env.FRAMES_DIR ?? path.join("tools", ".demo-frames");

const SENTENCE = "I don't think this is a good idea, but I will try it anyway.";

// Capture at 1280 wide and downscale later, so README text stays crisp.
const VIEWPORT = { width: 1280, height: 760 };

let frameNo = 0;

async function main() {
  await rm(FRAMES_DIR, { recursive: true, force: true });
  await mkdir(FRAMES_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();

  // `shot(n)` writes the same frame n times -- that is how we hold on a
  // moment. At 8 fps, shot(8) is a one-second hold.
  const shot = async (times = 1) => {
    for (let i = 0; i < times; i++) {
      await page.screenshot({
        path: path.join(FRAMES_DIR, `f${String(frameNo++).padStart(4, "0")}.png`),
      });
    }
  };

  await page.goto(URL, { waitUntil: "networkidle" });
  const textarea = page.locator("textarea");
  await textarea.waitFor();
  // Make sure the lazy "Rich Visualization" chunk is loaded before we record,
  // so the demo never spends frames on a Suspense fallback.
  await page.getByText("Rich Visualization").waitFor();

  // 1. Land on the empty app.
  await shot(5);

  // 2. Type the sentence at a readable pace: a few characters per frame, so a
  //    viewer can actually follow the words appearing.
  await textarea.click();
  const CHARS_PER_FRAME = 3;
  for (let i = 0; i < SENTENCE.length; i += CHARS_PER_FRAME) {
    await page.keyboard.insertText(SENTENCE.slice(i, i + CHARS_PER_FRAME));
    await shot(1);
  }

  // 3. Beat on the filled-in editor + live counter.
  await shot(8);

  // 4. Hover the Rephrase button so its violet glow reads, then click.
  const rephrase = page.getByRole("button", { name: "Rephrase" });
  await rephrase.hover();
  await shot(4);
  await rephrase.click();

  // 5. The reveal: real rephrase + the token panel. Hold here, this is the point.
  await page.waitForFunction(
    () => !document.querySelector(".output")?.classList.contains("output-empty"),
  );
  await shot(20);

  // 6. Copy button -> "Copied ✓" confirmation.
  const copy = page.getByRole("button", { name: "Copy" });
  await copy.hover();
  await shot(3);
  await copy.click();
  await page.getByRole("button", { name: /Copied/ }).waitFor();
  await shot(12);

  // 7. Settle back on the result so the loop restart is not jarring.
  await page.mouse.move(VIEWPORT.width / 2, 40);
  await shot(10);

  await browser.close();
  console.log(`Wrote ${frameNo} frames to ${FRAMES_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
