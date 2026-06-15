import { test, expect } from '@playwright/test';
import { mockClerkAuth } from './helpers/auth-helper';

test.describe('Scrutinized Registration & Onboarding (MongoDB)', () => {

  test('candidate onboarding form submission and profile save', async ({ page }) => {
    // Mock user without profile registered yet
    await mockClerkAuth(page, {
      id: 'candidate_new_id',
      email: 'newcandidate@jobsphere.com',
      name: 'Jane Doe',
      role: 'candidate',
      token: 'jwt_new_candidate'
    });

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

    await page.request.delete('http://localhost:3000/api/test/reset-user/candidate_new_id');

    await page.goto('http://localhost:5173/auth');
    
    // Choose role candidate
    const roleCandidate = page.locator('[data-testid="role-candidate"]');
    if (await roleCandidate.isVisible()) {
      await roleCandidate.click({ force: true });
    }

    // Onboarding form should show up
    console.log('CURRENT URL:', page.url());
    const onboardingForm = page.locator('[data-testid="candidate-onboarding-form"]');
    await onboardingForm.waitFor({ state: 'visible', timeout: 10000 });
    await expect(onboardingForm).toBeVisible();

    // Fill onboarding inputs
    await page.fill('[data-testid="candidate-onboarding-form"] input[name="name"]', 'Jane Doe');
    await page.fill('[data-testid="candidate-onboarding-form"] input[name="email"]', 'newcandidate@jobsphere.com');
    await page.fill('[data-testid="candidate-onboarding-form"] input[name="graduationYear"]', '2026');
    await page.fill('[data-testid="candidate-onboarding-form"] input[name="college"]', 'Stanford University');
    await page.fill('[data-testid="candidate-onboarding-form"] input[name="degree"]', 'BS Computer Science');
    await page.fill('[data-testid="candidate-onboarding-form"] input[name="skills"]', 'React, TypeScript, Playwright');
    await page.fill('[data-testid="candidate-onboarding-form"] input[name="avatar"]', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');
    await page.fill('[data-testid="candidate-onboarding-form"] input[name="resume"]', 'https://example.com/jane_doe_resume.pdf');

    // Submit form
    const submitBtn = onboardingForm.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(1000);

    // Verify redirection to candidate dashboard
    await expect(page).toHaveURL(/.*candidate-dashboard/);
    
    // Validate profile details are displayed on dashboard
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toContain('Jane Doe');
    expect(bodyText).toContain('Stanford University');
  });

  test('recruiter onboarding form submission and profile save', async ({ page }) => {
    // Mock recruiter without profile
    await mockClerkAuth(page, {
      id: 'recruiter_new_id',
      email: 'newrecruiter@stripe.com',
      name: 'John Recruiter',
      role: 'recruiter',
      token: 'jwt_new_recruiter'
    });

    await page.request.delete('http://localhost:3000/api/test/reset-user/recruiter_new_id');

    await page.goto('http://localhost:5173/auth');

    // Choose role recruiter
    const roleRecruiter = page.locator('[data-testid="role-recruiter"]');
    if (await roleRecruiter.isVisible()) {
      await roleRecruiter.click({ force: true });
    }

    // Onboarding form should show up
    const onboardingForm = page.locator('[data-testid="recruiter-onboarding-form"]');
    await onboardingForm.waitFor({ state: 'visible', timeout: 10000 });
    await expect(onboardingForm).toBeVisible();

    // Fill onboarding inputs
    await page.fill('[data-testid="recruiter-onboarding-form"] input[name="name"]', 'John Recruiter');
    await page.fill('[data-testid="recruiter-onboarding-form"] input[name="email"]', 'newrecruiter@stripe.com');
    await page.fill('[data-testid="recruiter-onboarding-form"] input[name="companyName"]', 'Stripe');
    await page.fill('[data-testid="recruiter-onboarding-form"] input[name="industry"]', 'Fintech');
    await page.fill('[data-testid="recruiter-onboarding-form"] input[name="companySize"]', '5000');
    await page.fill('[data-testid="recruiter-onboarding-form"] input[name="logo"]', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
    await page.fill('[data-testid="recruiter-onboarding-form"] input[name="website"]', 'https://stripe.com');
    await page.fill('[data-testid="recruiter-onboarding-form"] textarea[name="description"]', 'Stripe builds financial infrastructure for the internet.');

    // Submit form
    const submitBtn = onboardingForm.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(1000);

    // Verify redirection to recruiter dashboard
    await expect(page).toHaveURL(/.*recruiter-dashboard/);

    // Validate company profile details on dashboard
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toContain('John Recruiter');
    expect(bodyText).toContain('Stripe');
  });

});
