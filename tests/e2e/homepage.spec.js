const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/小小读书郎/);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('小小读书郎');
    
    // Check navigation elements
    await expect(page.locator('nav')).toBeVisible();
    
    // Check that classics are displayed
    await expect(page.locator('.classic-card')).toHaveCount({ min: 1 });
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test classics navigation
    await page.click('text=经典选择');
    await expect(page.url()).toContain('/classics');
    
    // Go back to homepage
    await page.goto('/');
    
    // Test admin navigation (if visible)
    const adminLink = page.locator('text=管理后台');
    if (await adminLink.isVisible()) {
      await adminLink.click();
      await expect(page.url()).toContain('/admin');
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that page loads properly on mobile
    await expect(page.locator('h1')).toBeVisible();
    
    // Check mobile navigation
    const mobileMenu = page.locator('.navbar-toggler');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.locator('.navbar-collapse')).toBeVisible();
    }
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/');
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
    
    // Check meta keywords
    const metaKeywords = page.locator('meta[name="keywords"]');
    await expect(metaKeywords).toHaveAttribute('content', /.+/);
    
    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });

  test('should load external resources properly', async ({ page }) => {
    await page.goto('/');
    
    // Check that CSS is loaded
    const styles = await page.evaluate(() => {
      const link = document.querySelector('link[rel="stylesheet"]');
      return link ? getComputedStyle(document.body).fontFamily : null;
    });
    expect(styles).toBeTruthy();
    
    // Check that JavaScript is working
    const jsWorking = await page.evaluate(() => {
      return typeof window.App !== 'undefined';
    });
    expect(jsWorking).toBeTruthy();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');
    await expect(page.locator('text=页面未找到')).toBeVisible();
    
    // Test that error doesn't break the layout
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should have accessibility features', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check for proper form labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test('should have proper performance characteristics', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Check page load time
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    
    // Check for performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });
    
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);
    expect(performanceMetrics.loadComplete).toBeLessThan(3000);
  });
});
