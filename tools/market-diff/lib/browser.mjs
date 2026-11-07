/* eslint-disable max-len -- dev tooling */
// market-diff browser start for md-fetch.mjs and md-render-check.mjs: a persistent Chrome or Chromium profile, on macOS,
// Linux or in a cloud workspace without a display.
//
// Which browser: --chrome <path> (or the env variable MD_CHROME), else Playwright's own Chromium (installed with
// `npx playwright install chromium`; playwright-core does not download it by itself).
// Headless: --headless, or by itself on Linux when there is no display (no DISPLAY or WAYLAND_DISPLAY). Headless runs use
// the full Chromium in its new headless mode (channel chromium), not the stripped headless shell, and send the same
// user agent as a window would (no "HeadlessChrome").
import fs from 'node:fs';
import { chromium } from 'playwright-core';

/**
 * Launches a persistent context. opts: profile (dir), chrome (path or ''), headless (bool or undefined = auto),
 * viewport {width, height}, windowArgs (extra args for a headful window), userAgent (set by the second start).
 * Returns { ctx, headless, executable }.
 */
export async function launch({
  profile, chrome, headless, viewport, windowArgs = [], userAgent,
}) {
  const exe = chrome || process.env.MD_CHROME || '';
  if (exe && !fs.existsSync(exe)) throw new Error(`--chrome ${exe}: no such file`);
  const noDisplay = process.platform === 'linux' && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY;
  const hl = headless === undefined ? noDisplay : headless;
  const options = {
    headless: hl,
    viewport,
    locale: 'en-GB',
    args: ['--disable-blink-features=AutomationControlled', ...(hl ? [] : windowArgs)],
    ignoreDefaultArgs: ['--enable-automation'],
  };
  if (exe) options.executablePath = exe;
  else if (hl) options.channel = 'chromium';
  if (userAgent) options.userAgent = userAgent;
  const ctx = await chromium.launchPersistentContext(profile, options);
  if (hl && !userAgent) {
    // the headless user agent names itself HeadlessChrome; send what the same browser sends with a window
    const probe = ctx.pages()[0] || await ctx.newPage();
    const ua = await probe.evaluate(() => navigator.userAgent);
    if (/HeadlessChrome/.test(ua)) {
      await ctx.close();
      return launch({
        profile, chrome, headless, viewport, windowArgs, userAgent: ua.replace('HeadlessChrome', 'Chrome'),
      });
    }
  }
  return { ctx, headless: hl, executable: exe || chromium.executablePath() };
}

export default launch;
