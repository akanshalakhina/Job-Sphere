import { test, expect } from '@playwright/test';
import { mockClerkAuth } from './helpers/auth-helper';

test.describe('AI Interview Coach Modal', () => {

  test('can open AI Coach modal, simulate chat exchange, and close modal', async ({ page }) => {
    // Mock candidate login
    await mockClerkAuth(page, {
      id: 'candidate_user_id',
      email: 'candidate@jobsphere.com',
      name: 'Sarah Jenkins',
      role: 'candidate',
      token: 'jwt_candidate'
    });

    await page.goto('http://localhost:5173/candidate-dashboard');

    // Click "Practice with AI Coach" button
    const coachBtn = page.locator('[data-testid="practice-ai-coach-btn"]');
    await expect(coachBtn).toBeVisible();
    await coachBtn.click();

    // Verify modal is displayed
    const modal = page.locator('[data-testid="ai-coach-modal"]');
    await expect(modal).toBeVisible();

    // Verify chat input is visible
    const chatInput = page.locator('[data-testid="ai-coach-chat-input"]');
    await expect(chatInput).toBeVisible();

    // Type a message in the chat
    await chatInput.fill('Hi, I want to practice coding questions.');

    // Click Send
    const sendBtn = page.locator('[data-testid="ai-coach-send-btn"]');
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();

    // Verify user message is added
    const userMsg = page.locator('[data-testid="chat-message-user"]').first();
    await expect(userMsg).toBeVisible();
    await expect(userMsg).toContainText('Hi, I want to practice coding questions.');

    // Wait for AI response message to be added
    const aiMsg = page.locator('[data-testid="chat-message-ai"]').first();
    await expect(aiMsg).toBeVisible();

    // Click Close Button
    const closeBtn = page.locator('[data-testid="close-modal-btn"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Verify modal is closed/hidden
    await expect(modal).not.toBeVisible();
  });

});
