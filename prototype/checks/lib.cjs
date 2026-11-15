// Shared helpers for the browser checks.
// Review lives in the side panel (D-039): its tab on wide screens, the side-panel button then the tab on
// medium screens, and the bottom bar's Review key on a phone.
exports.openReview = async (page) => {
  const tab = page.getByRole('tab', { name: 'Review' });
  if (await tab.isVisible().catch(() => false)) return tab.click();
  const nav = page.getByRole('navigation', { name: 'Sections' });
  if (await nav.count()) return nav.getByRole('button', { name: 'Review' }).click();
  await page.getByRole('button', { name: 'Side panel' }).click();
  await page.getByRole('tab', { name: 'Review' }).click();
};

// New, Open and Close ask "Save first?" when a script has changes no file holds (D-046). Checks that start a fresh script
// after typing say "continue without saving".
exports.discardIfAsked = async (page) => {
  const btn = page.locator('#leave-discard');
  await page.waitForTimeout(250);
  if (await btn.isVisible().catch(() => false)) { await btn.click(); await page.waitForTimeout(300); }
};
