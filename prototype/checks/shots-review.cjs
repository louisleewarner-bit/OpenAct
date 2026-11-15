// Screenshots for the overview page: the review panel on desktop (flawed fixture, Nicholl target) and on a phone.
const { chromium } = require('playwright');
const { openReview } = require('./lib.cjs');
const fs = require('fs');
let n = 0;
const e = (type, text, extra = {}) => ({ id: 'f' + n++, type, text, ...extra });
const script = {
  title: { title: 'Kettle', credit: 'Written by', authors: 'Jane Doe', source: '', draftDate: '3 March 2026', contact: 'jane@example.com' },
  profile: 'screenplay', paper: 'a4', cast: [], dismissed: [], review: { target: 'nicholl' },
  elements: [
    e('scene', 'INT. KITCHEN - NIGHT'),
    e('action', 'We see the kitchen. CLOSE ON a kettle as it starts to rattle. Nell (40s) wipes the counter for the third time.'),
    e('character', 'NELL'),
    e('dialogue', 'TK better line here.', { note: 'Funnier?' }),
    e('character', 'NEL'),
    e('dialogue', 'It was never going to boil while you watched it.'),
    e('transition', 'CUT TO:'),
    e('scene', 'EXT. GARDEN - DAY'),
    e('action', 'Nell carries the kettle to the shed and sets it on the workbench, among the jam jars.'),
  ],
};
(async () => {
  const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } : undefined });
  const shoot = async (vp, file, phone) => {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, locale: 'en-GB', colorScheme: 'light', isMobile: phone, hasTouch: phone });
    await ctx.addInitScript((s) => localStorage.setItem('openact-prototype-v1', s), JSON.stringify(script));
    const page = await ctx.newPage();
    await page.goto('file:///home/user/script-app-kit/prototype/artifact/harness.html');
    await page.waitForTimeout(1500);
    await openReview(page);
    await page.waitForTimeout(400);
    await page.locator('[data-check="placeholders"] summary').click();
    await page.waitForTimeout(300);
    if (phone) await page.locator('[data-check="placeholders"]').evaluate((d) => d.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: file, type: 'jpeg', quality: 74 });
    await ctx.close();
  };
  await shoot({ width: 1440, height: 900 }, process.env.SP + '/pack-review.jpg', false);
  await shoot({ width: 390, height: 780 }, process.env.SP + '/pack-review-phone.jpg', true);
  await browser.close();
})().catch((x) => { console.error(x); process.exit(1); });
