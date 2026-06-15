import { test, expect } from '@playwright/test';

test.describe('Job Listing and Sourcing E2E Flow', () => {

  test('can load and filter mock job listings', async ({ page }) => {
    // Navigate to job listings page
    await page.goto('http://localhost:5173/jobs');
    
    // Expect the header or title page text to contain "Positions" or similar
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toContain('positions');

    // Verify search matches mock jobs
    const searchInput = page.locator('input[placeholder*="Search by job title"]');
    await expect(searchInput).toBeVisible();

    // Type "Stripe" in the search input
    await searchInput.fill('Stripe');
    await page.waitForTimeout(500); // Debounce delay
    
    // Verify we see Stripe in the listings
    const stripeText = await page.locator('body').innerText();
    expect(stripeText).toContain('Stripe');
    expect(stripeText).toContain('Senior Frontend Engineer');

    // Type a tech skill like "Figma" to filter for Linear
    await searchInput.fill('Figma');
    await page.waitForTimeout(500);
    
    const figmaText = await page.locator('body').innerText();
    expect(figmaText).toContain('Linear');
    expect(figmaText).toContain('Product Designer');
  });

  test('can filter by department and navigate to details', async ({ page }) => {
    await page.goto('http://localhost:5173/jobs');

    // Click on "Design" department filter button
    const designFilter = page.locator('button:has-text("Design")');
    if (await designFilter.isVisible()) {
      await designFilter.click();
      await page.waitForTimeout(500);

      // Verify page content shows designer positions
      const bodyText = await page.locator('body').innerText();
      expect(bodyText).toContain('Product Designer');
      expect(bodyText).not.toContain('Backend Core Architect');
    }

    // Click on a job listing to navigate to its details
    const firstJobCard = page.locator('.group:has-text("Product Designer")').first();
    if (await firstJobCard.isVisible()) {
      await firstJobCard.click();
      await page.waitForTimeout(800);

      // Check if details page loaded
      await expect(page).toHaveURL(/.*\/jobs\/(job-2|[a-f0-9]{24})/);
      const detailsBody = await page.locator('body').innerText();
      expect(detailsBody).toContain('Linear');
      expect(detailsBody.toLowerCase()).toContain('responsibilities');
    }
  });

});
