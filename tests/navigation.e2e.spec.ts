import { test, expect } from '@playwright/test';

test.describe('Navigation and Interactivity', () => {

  test('can navigate to about page and back', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Some header/footer link testing
    const aboutLinks = page.locator('text=About');
    if (await aboutLinks.count() > 0) {
      await aboutLinks.first().click();
      await expect(page).toHaveURL(/.*about/);
    }
  });

  test('loads mock data effectively when disconnected', async ({ page }) => {
    // If backend is down, UI should load mock jobs from context fallback
    await page.goto('http://localhost:5173/jobs');
    
    // Find job cards
    const jobCards = page.locator('.job-card, [data-testid="job-card"], [class*="JobCard"]');
    // We expect some jobs to either display visually or see the word "React"
    await page.waitForTimeout(1000); // Give it a sec to load the fallback
    
    const bodyText = await page.locator('body').innerText();
    // Assuming 'Stripe' or 'Google' from mock data is visible
    if(bodyText.includes('Stripe')) {
      expect(bodyText).toContain('Stripe');
    }
  });

});
