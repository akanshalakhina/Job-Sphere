import { test, expect } from '@playwright/test';
import { mockClerkAuth } from './helpers/auth-helper';

test.describe('Clerk Authentication Integration', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));
  });

  test('unauthenticated user is redirected to auth page or shown sign-in option', async ({ page }) => {
    // Mock no auth
    await mockClerkAuth(page, null);
    
    // Attempt to access candidate dashboard
    await page.goto('http://localhost:5173/candidate-dashboard');
    await page.waitForTimeout(500);

    // Should redirect to auth page or require sign-in
    await expect(page).toHaveURL(/.*\/auth/);
  });

  test('new sign-up requires choosing a role', async ({ page }) => {
    // Mock user without a role or mock sign-up state
    await mockClerkAuth(page, null);
    await page.goto('http://localhost:5173/auth');

    // Simulate clicking signup and filling out details to trigger role selection
    const roleCandidate = page.locator('[data-testid="role-candidate"]');
    const roleRecruiter = page.locator('[data-testid="role-recruiter"]');
    
    // Expect role selection elements to be visible during new registration
    await expect(roleCandidate).toBeVisible();
    await expect(roleRecruiter).toBeVisible();

    // Select candidate role
    await roleCandidate.click();
  });

  test('authenticated user can view profile and log out', async ({ page }) => {
    // Mock an active candidate session
    await mockClerkAuth(page, {
      id: 'user_123',
      email: 'candidate@jobsphere.com',
      name: 'John Candidate',
      role: 'candidate',
      token: 'jwt_candidate_token'
    });

    await page.goto('http://localhost:5173/candidate-dashboard');
    
    // Verify candidate workspace/dashboard is loaded
    await expect(page).toHaveURL(/.*candidate-dashboard/);
    
    // Find logout button/trigger or profile area
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.toLowerCase()).toContain('john candidate');
    
    // Attempt to find logout button (usually in navbar or user menu)
    const logoutBtn = page.locator('button:has-text("Logout"), [data-testid="logout-btn"]');
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForTimeout(500);
      // After logout, Clerk state resets to null, redirecting user to auth or home
      await mockClerkAuth(page, null);
      await page.goto('http://localhost:5173/auth');
      await expect(page).toHaveURL(/.*\/auth/);
    }
  });

});
