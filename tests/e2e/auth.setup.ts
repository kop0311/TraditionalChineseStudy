import { test as setup, expect } from '@playwright/test';

const authFile = 'tests/e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('/');
  
  // Wait for the page to load completely
  await page.waitForLoadState('networkidle');
  
  // Verify the page loaded correctly
  await expect(page.locator('h1')).toContainText('小小读书郎');
  
  // For now, we don't have authentication, so we just save the basic state
  // In a real app with login, you would:
  // await page.fill('[data-testid="username"]', 'test_user');
  // await page.fill('[data-testid="password"]', 'test123456');
  // await page.click('[data-testid="login-button"]');
  // await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  
  // Save signed-in state to 'authFile'
  await page.context().storageState({ path: authFile });
});
