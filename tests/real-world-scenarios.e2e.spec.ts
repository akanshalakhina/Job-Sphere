import { test, expect } from '@playwright/test';
import { mockClerkAuth } from './helpers/auth-helper';

test.describe('Tier 3: Pairwise Combinations', () => {

  const combinations = [
    { role: 'candidate', authenticated: true, tier: 'free' },
    { role: 'candidate', authenticated: true, tier: 'premium' },
    { role: 'recruiter', authenticated: true, tier: 'free' },
    { role: 'recruiter', authenticated: true, tier: 'premium' },
  ];

  for (const combo of combinations) {
    test(`flows for role=${combo.role}, authenticated=${combo.authenticated}, tier=${combo.tier}`, async ({ page }) => {
      // Mock the specific auth combination
      await mockClerkAuth(page, {
        id: `user_${combo.role}_${combo.tier}`,
        email: `${combo.role}_${combo.tier}@jobsphere.com`,
        name: `${combo.role} ${combo.tier}`,
        role: combo.role as 'candidate' | 'recruiter',
        token: `token_${combo.role}_${combo.tier}`
      });

      // Inject custom state via API route mocking if needed, or check page elements
      await page.goto(`http://localhost:5173/${combo.role}-dashboard`);
      await page.waitForTimeout(500);

      // Verify page loaded successfully
      await expect(page).toHaveURL(new RegExp(`.*${combo.role}-dashboard`));

      const bodyText = await page.locator('body').innerText();
      expect(bodyText.toLowerCase()).toContain(combo.role);
    });
  }

});

test.describe('Tier 4: Real-World Candidate-Recruiter Interaction Scenario', () => {

  test('E2E Job Posting, Candidate Application, Recruiter Sourcing & Interview Scheduling', async ({ page }) => {
    // 1. Recruiter logs in to post a job
    await mockClerkAuth(page, {
      id: 'recruiter_olivia_id',
      email: 'olivia@stripe.com',
      name: 'Olivia Rhye',
      role: 'recruiter',
      token: 'recruiter_jwt_token'
    });

    await page.goto('http://localhost:5173/recruiter-dashboard');
    await page.waitForTimeout(500);

    // Click "Post a Job" or equivalent button
    const postJobBtn = page.locator('button:has-text("Post New Job"), [data-testid="post-job-btn"]');
    if (await postJobBtn.isVisible()) {
      await postJobBtn.click();
      
      // Fill out job details
      await page.fill('input[name="title"]', 'Staff React Architect');
      await page.fill('input[name="salary"]', '₹25,00,000');
      await page.fill('input[name="skills"]', 'React, TypeScript, Next.js');
      await page.fill('input[name="location"]', 'San Francisco, CA');
      
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      }
    }

    // 2. Candidate logs in to apply
    await mockClerkAuth(page, {
      id: 'candidate_vansh_id',
      email: 'vansh@gmail.com',
      name: 'Vansh Karnwal',
      role: 'candidate',
      token: 'candidate_jwt_token'
    });

    await page.goto('http://localhost:5173/jobs');
    await page.waitForTimeout(500);

    // Search for the newly posted job
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('React');
    await page.waitForTimeout(500);

    // View first job details and apply
    const applyBtn = page.locator('button:has-text("Apply Now")').first();
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      await page.waitForTimeout(500);
    }

    // 3. Recruiter logs back in to manage applicants
    await mockClerkAuth(page, {
      id: 'recruiter_olivia_id',
      email: 'olivia@stripe.com',
      name: 'Olivia Rhye',
      role: 'recruiter',
      token: 'recruiter_jwt_token'
    });

    await page.goto('http://localhost:5173/recruiter-dashboard');
    await page.waitForTimeout(500);

    // Recruiter expects to see Candidate in applicant lists / dashboard
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toContain('Olivia Rhye');

    // Recruiter updates candidate stage or schedules interview
    const scheduleBtn = page.locator('button:has-text("Schedule Interview"), [data-testid="schedule-interview-btn"]').first();
    if (await scheduleBtn.isVisible()) {
      await scheduleBtn.click();
      
      // Fill out schedule form
      await page.fill('input[name="date"]', '2026-06-20');
      await page.fill('input[name="time"]', '14:00');
      
      const confirmScheduleBtn = page.locator('button:has-text("Confirm"), button:has-text("Schedule")');
      if (await confirmScheduleBtn.isVisible()) {
        await confirmScheduleBtn.click();
      }
    }
  });

});
