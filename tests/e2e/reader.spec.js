const { test, expect } = require('@playwright/test');

test.describe('Reader Functionality', () => {
  test('should navigate to reader from classics page', async ({ page }) => {
    await page.goto('/');
    
    // Go to classics page
    await page.click('text=经典选择');
    await expect(page.url()).toContain('/classics');
    
    // Click on first classic
    await page.click('.classic-card:first-child a');
    
    // Should be on reader page
    await expect(page.url()).toMatch(/\/reader\/\w+\/\d+/);
    await expect(page.locator('.reader-container')).toBeVisible();
  });

  test('should display text content properly', async ({ page }) => {
    // Go directly to a known reader page
    await page.goto('/reader/sanzijing/1');
    
    // Check that text content is displayed
    await expect(page.locator('.text-content')).toBeVisible();
    await expect(page.locator('.sentence')).toHaveCount({ min: 1 });
    
    // Check that characters are clickable
    const firstCharacter = page.locator('.character').first();
    await expect(firstCharacter).toBeVisible();
    await firstCharacter.click();
    
    // Should show character details
    await expect(page.locator('.character-details')).toBeVisible();
  });

  test('should have working navigation controls', async ({ page }) => {
    await page.goto('/reader/sanzijing/1');
    
    // Check navigation buttons
    const nextButton = page.locator('button:has-text("下一章")');
    const prevButton = page.locator('button:has-text("上一章")');
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page.url()).toMatch(/\/reader\/sanzijing\/\d+/);
    }
    
    if (await prevButton.isVisible()) {
      await prevButton.click();
      await expect(page.url()).toMatch(/\/reader\/sanzijing\/\d+/);
    }
  });

  test('should support different reading modes', async ({ page }) => {
    await page.goto('/reader/sanzijing/1');
    
    // Check for reading mode controls
    const modeSelector = page.locator('.reading-mode-selector');
    if (await modeSelector.isVisible()) {
      // Test different modes
      await page.click('text=拼音模式');
      await expect(page.locator('.pinyin')).toBeVisible();
      
      await page.click('text=注释模式');
      await expect(page.locator('.annotation')).toBeVisible();
    }
  });

  test('should handle character interactions', async ({ page }) => {
    await page.goto('/reader/sanzijing/1');
    
    // Click on a character
    const character = page.locator('.character').first();
    await character.click();
    
    // Should show character popup or details
    await expect(page.locator('.character-popup, .character-details')).toBeVisible();
    
    // Check for stroke animation if available
    const strokeButton = page.locator('button:has-text("笔画演示")');
    if (await strokeButton.isVisible()) {
      await strokeButton.click();
      await expect(page.locator('.stroke-animation')).toBeVisible();
    }
  });

  test('should support audio playback', async ({ page }) => {
    await page.goto('/reader/sanzijing/1');
    
    // Look for audio controls
    const audioButton = page.locator('button:has-text("朗读"), .audio-control');
    if (await audioButton.isVisible()) {
      await audioButton.click();
      
      // Check that audio element is present
      const audio = page.locator('audio');
      await expect(audio).toBeVisible();
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/reader/sanzijing/1');
    
    // Check that reader is properly displayed on mobile
    await expect(page.locator('.reader-container')).toBeVisible();
    await expect(page.locator('.text-content')).toBeVisible();
    
    // Check mobile-specific controls
    const mobileMenu = page.locator('.mobile-menu, .reader-mobile-controls');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/reader/sanzijing/1');
    
    // Test keyboard shortcuts
    await page.keyboard.press('ArrowRight');
    // Should navigate to next page or highlight next character
    
    await page.keyboard.press('ArrowLeft');
    // Should navigate to previous page or highlight previous character
    
    await page.keyboard.press('Space');
    // Should play/pause audio or advance reading
  });

  test('should save reading progress', async ({ page }) => {
    await page.goto('/reader/sanzijing/1');
    
    // Simulate reading progress
    await page.click('.character:nth-child(5)');
    
    // Navigate away and back
    await page.goto('/');
    await page.goto('/reader/sanzijing/1');
    
    // Check if progress is maintained (this would depend on implementation)
    // This is a placeholder for progress tracking functionality
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test invalid chapter
    await page.goto('/reader/sanzijing/999');
    
    // Should show error message or redirect
    await expect(page.locator('text=章节不存在, text=页面未找到')).toBeVisible();
    
    // Test invalid classic
    await page.goto('/reader/invalid-classic/1');
    await expect(page.locator('text=经典不存在, text=页面未找到')).toBeVisible();
  });

  test('should have proper loading states', async ({ page }) => {
    // Intercept network requests to simulate slow loading
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 1000);
    });
    
    await page.goto('/reader/sanzijing/1');
    
    // Should show loading indicator
    await expect(page.locator('.loading, .spinner')).toBeVisible();
    
    // Should hide loading indicator when content loads
    await expect(page.locator('.text-content')).toBeVisible();
    await expect(page.locator('.loading, .spinner')).not.toBeVisible();
  });
});
