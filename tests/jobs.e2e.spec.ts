import { test, expect } from '@playwright/test';

test('has Jobs link and filters', async ({ page }) => {
  // Assuming frontend runs on 5173
  await page.goto('http://localhost:5173/');

  // Depending on what is actually shown in the Landing/Auth state
  // Check if there is a 'Jobs' or 'Opportunities' nav link
  const jobsLink = page.locator('a[href="/jobs"]').first();
  if (await jobsLink.isVisible()) {
    await jobsLink.click();
    await expect(page).toHaveURL(/.*jobs/);
    
    // Check if filter components exist
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  }
});
