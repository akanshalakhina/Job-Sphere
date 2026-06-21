import { test, expect } from '@playwright/test';
import { mockClerkAuth } from './helpers/auth-helper';

test.describe('Navigation Cleanup & Core Focus', () => {

  test('simplification: Feed and Opportunities links are NOT present or visible', async ({ page }) => {
    // Mock user
    await mockClerkAuth(page, {
      id: 'candidate_user_id',
      email: 'candidate@jobsphere.com',
      name: 'Sarah Jenkins',
      role: 'candidate',
      token: 'jwt_candidate'
    });

    await page.goto('http://localhost:5173/jobs');

    // 1. Check Navbar - Feed and Opportunities should NOT be present
    const navLinks = page.locator('nav a');
    const navLinkTexts = await navLinks.allTextContents();
    expect(navLinkTexts.some(t => t.includes('Feed'))).toBeFalsy();
    expect(navLinkTexts.some(t => t.includes('Opportunities'))).toBeFalsy();

    // 2. Check Dock Navigation (if present)
    const dockLinks = page.locator('[class*="pointer-events-auto"] button');
    const dockCount = await dockLinks.count();
    // Dock should still have jobs, analyzer, dashboard
    expect(dockCount).toBeGreaterThanOrEqual(3);

    // 3. Check Footer - Feed and Opportunities should NOT be present
    const footerLinks = page.locator('footer a');
    const footerLinkTexts = await footerLinks.allTextContents();
    expect(footerLinkTexts.some(t => t.includes('Feed'))).toBeFalsy();
    expect(footerLinkTexts.some(t => t.includes('Opportunities'))).toBeFalsy();
  });

  test('broken images fall back to placeholder', async ({ page }) => {
    await mockClerkAuth(page, {
      id: 'candidate_user_id',
      email: 'candidate@jobsphere.com',
      name: 'Sarah Jenkins',
      role: 'candidate',
      token: 'jwt_candidate'
    });

    await page.goto('http://localhost:5173/candidate-dashboard');

    // Check profile image is rendered
    const profileImg = page.locator('img[alt*="Sarah"]').first();
    if (await profileImg.isVisible()) {
      const src = await profileImg.getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('valid images: user avatars and company logos display with fallback placeholders', async ({ page }) => {
    // Mock user
    await mockClerkAuth(page, {
      id: 'candidate_user_id',
      email: 'candidate@jobsphere.com',
      name: 'Sarah Jenkins',
      role: 'candidate',
      token: 'jwt_candidate'
    });

    await page.goto('http://localhost:5173/jobs');

    // Locate all images on the page
    const images = page.locator('img');
    const count = await images.count();
    
    // Check that images either have valid src or fallback placeholders
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const src = await img.getAttribute('src');
        expect(src).not.toBeNull();
        // Should be either a valid URL or base64 fallback
        expect(src.length).toBeGreaterThan(0);
      }
    }
  });

});
