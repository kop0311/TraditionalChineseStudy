import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  
  test.describe('Homepage Accessibility', () => {
    test('should not have any automatically detectable accessibility issues', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper heading structure
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
      
      // Verify main heading
      await expect(page.locator('h1')).toContainText('小小读书郎');
      
      // Check for logical heading progression
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      expect(headings.length).toBeGreaterThan(1);
    });

    test('should have proper alt text for images', async ({ page }) => {
      await page.goto('/');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        
        // Images should have alt text or be decorative
        if (src && !src.includes('data:')) {
          expect(alt).toBeTruthy();
        }
      }
    });

    test('should have proper link accessibility', async ({ page }) => {
      await page.goto('/');
      
      const links = page.locator('a');
      const linkCount = await links.count();
      
      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        
        // Links should have accessible names
        if (href && href !== '#') {
          expect(text || ariaLabel).toBeTruthy();
        }
      }
    });
  });

  test.describe('Navigation Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
      
      // Continue tabbing through interactive elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        
        if (focusedElement) {
          expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focusedElement);
        }
      }
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');
      
      // Tab to first interactive element
      await page.keyboard.press('Tab');
      
      // Check if focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Verify focus styling
      const focusStyles = await focusedElement.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          boxShadow: styles.boxShadow
        };
      });
      
      // Should have some form of focus indication
      const hasFocusIndicator = focusStyles.outline !== 'none' || 
                               focusStyles.outlineWidth !== '0px' || 
                               focusStyles.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBeTruthy();
    });

    test('should support skip links', async ({ page }) => {
      await page.goto('/');
      
      // Check for skip link
      const skipLink = page.locator('a[href="#main"], a[href="#content"], a:has-text("跳转到主内容")');
      
      if (await skipLink.isVisible()) {
        await skipLink.click();
        
        // Verify focus moved to main content
        const mainContent = page.locator('#main, #content, main');
        if (await mainContent.isVisible()) {
          await expect(mainContent).toBeFocused();
        }
      }
    });
  });

  test.describe('Form Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      await page.goto('/pinyin-practice');
      await page.waitForLoadState('networkidle');
      
      const inputs = page.locator('input, select, textarea');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.isVisible();
          
          // Input should have label, aria-label, or aria-labelledby
          expect(hasLabel || ariaLabel || ariaLabelledby).toBeTruthy();
        }
      }
    });

    test('should have proper error handling', async ({ page }) => {
      await page.goto('/pinyin-practice');
      await page.waitForLoadState('networkidle');
      
      // Try to submit form with invalid data
      const submitButton = page.locator('button:has-text("检查答案")');
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Check for error messages
        const errorMessages = page.locator('.alert-danger, .error, [role="alert"]');
        
        if (await errorMessages.first().isVisible()) {
          // Error messages should be associated with form fields
          const ariaDescribedby = await page.locator('input[aria-describedby]').count();
          expect(ariaDescribedby).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Interactive Component Accessibility', () => {
    test('should have accessible HanziWriter component', async ({ page }) => {
      await page.goto('/writing-practice');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Check HanziWriter accessibility
      const hanziWriter = page.locator('.hanzi-writer-container');
      
      if (await hanziWriter.isVisible()) {
        // Check for proper ARIA labels
        const buttons = hanziWriter.locator('button');
        const buttonCount = await buttons.count();
        
        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i);
          const text = await button.textContent();
          const ariaLabel = await button.getAttribute('aria-label');
          
          expect(text || ariaLabel).toBeTruthy();
        }
        
        // Check SVG accessibility
        const svg = hanziWriter.locator('svg');
        if (await svg.isVisible()) {
          const title = await svg.locator('title').textContent();
          const ariaLabel = await svg.getAttribute('aria-label');
          
          // SVG should have accessible name
          expect(title || ariaLabel).toBeTruthy();
        }
      }
    });

    test('should have accessible practice components', async ({ page }) => {
      await page.goto('/pinyin-practice');
      await page.waitForLoadState('networkidle');
      
      const practiceComponent = page.locator('.pinyin-practice-container');
      
      if (await practiceComponent.isVisible()) {
        // Check for proper roles and labels
        const interactiveElements = practiceComponent.locator('button, input, select');
        const count = await interactiveElements.count();
        
        for (let i = 0; i < count; i++) {
          const element = interactiveElements.nth(i);
          const role = await element.getAttribute('role');
          const ariaLabel = await element.getAttribute('aria-label');
          const text = await element.textContent();
          
          // Interactive elements should have accessible names
          expect(role || ariaLabel || text).toBeTruthy();
        }
      }
    });
  });

  test.describe('Color and Contrast Accessibility', () => {
    test('should have sufficient color contrast', async ({ page }) => {
      await page.goto('/');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      // Filter for color contrast violations
      const contrastViolations = accessibilityScanResults.violations.filter(
        violation => violation.id === 'color-contrast'
      );
      
      expect(contrastViolations).toEqual([]);
    });

    test('should not rely solely on color for information', async ({ page }) => {
      await page.goto('/classics');
      
      // Check difficulty badges
      const badges = page.locator('.badge');
      const badgeCount = await badges.count();
      
      for (let i = 0; i < badgeCount; i++) {
        const badge = badges.nth(i);
        const text = await badge.textContent();
        
        // Badges should have text content, not just color
        expect(text?.trim()).toBeTruthy();
      }
    });
  });

  test.describe('Screen Reader Accessibility', () => {
    test('should have proper ARIA landmarks', async ({ page }) => {
      await page.goto('/');
      
      // Check for main landmarks
      const landmarks = await page.locator('[role="main"], main, [role="navigation"], nav, [role="banner"], header').count();
      expect(landmarks).toBeGreaterThan(0);
      
      // Check for proper heading structure
      const h1 = await page.locator('h1').count();
      expect(h1).toBe(1);
    });

    test('should have proper live regions for dynamic content', async ({ page }) => {
      await page.goto('/writing-practice');
      await page.waitForLoadState('networkidle');
      
      // Look for live regions
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
      
      if (await liveRegions.first().isVisible()) {
        const ariaLive = await liveRegions.first().getAttribute('aria-live');
        expect(['polite', 'assertive']).toContain(ariaLive);
      }
    });

    test('should announce important state changes', async ({ page }) => {
      await page.goto('/writing-practice');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Start practice mode
      const practiceButton = page.locator('button:has-text("开始练习")');
      
      if (await practiceButton.isVisible()) {
        await practiceButton.click();
        
        // Check for status announcements
        const statusElements = page.locator('[role="status"], [aria-live], .alert');
        
        if (await statusElements.first().isVisible()) {
          const statusText = await statusElements.first().textContent();
          expect(statusText?.trim()).toBeTruthy();
        }
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile devices', async ({ page, isMobile }) => {
      if (isMobile) {
        await page.goto('/');
        
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        expect(accessibilityScanResults.violations).toEqual([]);
        
        // Check touch target sizes
        const buttons = page.locator('button, a');
        const buttonCount = await buttons.count();
        
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = buttons.nth(i);
          const box = await button.boundingBox();
          
          if (box) {
            // Touch targets should be at least 44x44 pixels
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });
  });
});
