const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  const shoot = async (vp, file, opts = {}) => {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, locale: 'en-GB', colorScheme: 'light' });
    const page = await ctx.newPage();
    await page.goto('file:///home/user/script-app-kit/prototype/artifact/harness.html');
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: /^Pantomime Jack/ }).click();
    await page.waitForTimeout(800);
    if (opts.scrollTo) {
      await page.locator('.frag').nth(opts.scrollTo).click();
      await page.locator('.frag').nth(opts.scrollTo).evaluate((n) => n.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: file, type: 'jpeg', quality: 72 });
    await ctx.close();
  };
  await shoot({ width: 1440, height: 860 }, process.env.SP + '/pack-desktop.jpg', { scrollTo: 12 });
  await shoot({ width: 390, height: 780 }, process.env.SP + '/pack-phone.jpg', { scrollTo: 8 });
  await browser.close();
})();
