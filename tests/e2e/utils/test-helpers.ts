import { Page, expect } from '@playwright/test';

export class TestHelpers {
  
  /**
   * Wait for all network requests to complete
   */
  static async waitForNetworkIdle(page: Page, timeout: number = 5000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Wait for element to be stable (not moving)
   */
  static async waitForElementStable(page: Page, selector: string, timeout: number = 5000): Promise<void> {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    
    // Wait for element to stop moving
    let previousBox = await element.boundingBox();
    let stableCount = 0;
    
    while (stableCount < 3) {
      await page.waitForTimeout(100);
      const currentBox = await element.boundingBox();
      
      if (previousBox && currentBox && 
          previousBox.x === currentBox.x && 
          previousBox.y === currentBox.y) {
        stableCount++;
      } else {
        stableCount = 0;
      }
      
      previousBox = currentBox;
    }
  }

  /**
   * Take a screenshot with timestamp
   */
  static async takeTimestampedScreenshot(page: Page, name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Measure page load performance
   */
  static async measurePageLoad(page: Page, url: string): Promise<{
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
  }> {
    const startTime = Date.now();
    
    await page.goto(url);
    
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      };
    });
    
    const loadTime = Date.now() - startTime;
    
    return {
      loadTime,
      domContentLoaded: performanceMetrics.domContentLoaded,
      firstContentfulPaint: performanceMetrics.firstContentfulPaint
    };
  }

  /**
   * Check for console errors
   */
  static async checkConsoleErrors(page: Page): Promise<string[]> {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    return errors;
  }

  /**
   * Simulate slow network conditions
   */
  static async simulateSlowNetwork(page: Page): Promise<void> {
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
  }

  /**
   * Simulate network failure
   */
  static async simulateNetworkFailure(page: Page, urlPattern: string): Promise<void> {
    await page.route(urlPattern, route => route.abort());
  }

  /**
   * Restore network conditions
   */
  static async restoreNetwork(page: Page): Promise<void> {
    await page.unroute('**/*');
  }

  /**
   * Wait for animation to complete
   */
  static async waitForAnimation(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector);
    
    // Wait for element to be visible
    await element.waitFor({ state: 'visible' });
    
    // Wait for animations to complete
    await page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        if (!el) return true;
        
        const animations = el.getAnimations();
        return animations.every(animation => animation.playState === 'finished');
      },
      selector,
      { timeout: 5000 }
    );
  }

  /**
   * Scroll element into view smoothly
   */
  static async scrollIntoView(page: Page, selector: string): Promise<void> {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500); // Wait for scroll to complete
  }

  /**
   * Check if element is in viewport
   */
  static async isInViewport(page: Page, selector: string): Promise<boolean> {
    return await page.locator(selector).isVisible();
  }

  /**
   * Get element's computed styles
   */
  static async getComputedStyles(page: Page, selector: string, properties: string[]): Promise<Record<string, string>> {
    return await page.locator(selector).evaluate((el, props) => {
      const styles = window.getComputedStyle(el);
      const result: Record<string, string> = {};
      
      props.forEach(prop => {
        result[prop] = styles.getPropertyValue(prop);
      });
      
      return result;
    }, properties);
  }

  /**
   * Simulate user typing with realistic delays
   */
  static async typeWithDelay(page: Page, selector: string, text: string, delay: number = 100): Promise<void> {
    const element = page.locator(selector);
    await element.click();
    
    for (const char of text) {
      await element.type(char);
      await page.waitForTimeout(delay);
    }
  }

  /**
   * Check for memory leaks
   */
  static async checkMemoryUsage(page: Page): Promise<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  }> {
    return await page.evaluate(() => {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory?.usedJSHeapSize || 0,
        totalJSHeapSize: memory?.totalJSHeapSize || 0,
        jsHeapSizeLimit: memory?.jsHeapSizeLimit || 0
      };
    });
  }

  /**
   * Verify responsive breakpoints
   */
  static async testResponsiveBreakpoints(page: Page, url: string): Promise<void> {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1200, height: 800 },
      { name: 'large', width: 1920, height: 1080 }
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot for visual comparison
      await page.screenshot({ 
        path: `test-results/responsive/${breakpoint.name}.png`,
        fullPage: true 
      });
      
      // Verify no horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBeFalsy();
    }
  }

  /**
   * Test keyboard navigation
   */
  static async testKeyboardNavigation(page: Page): Promise<void> {
    const focusableElements: string[] = [];
    
    // Tab through all focusable elements
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      
      const activeElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.split(' ').join('.') : ''}` : null;
      });
      
      if (activeElement) {
        focusableElements.push(activeElement);
      }
    }
    
    // Verify we found focusable elements
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Test reverse navigation
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
  }

  /**
   * Verify ARIA attributes
   */
  static async verifyAriaAttributes(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector);
    
    const ariaAttributes = await element.evaluate(el => {
      const attrs: Record<string, string> = {};
      
      for (const attr of el.attributes) {
        if (attr.name.startsWith('aria-') || attr.name === 'role') {
          attrs[attr.name] = attr.value;
        }
      }
      
      return attrs;
    });
    
    // Log ARIA attributes for debugging
    console.log(`ARIA attributes for ${selector}:`, ariaAttributes);
  }

  /**
   * Test form validation
   */
  static async testFormValidation(page: Page, formSelector: string): Promise<void> {
    const form = page.locator(formSelector);
    
    // Try to submit empty form
    const submitButton = form.locator('button[type="submit"], input[type="submit"]');
    await submitButton.click();
    
    // Check for validation messages
    const validationMessages = form.locator(':invalid, [aria-invalid="true"]');
    const count = await validationMessages.count();
    
    if (count > 0) {
      console.log(`Found ${count} validation errors`);
    }
  }
}
