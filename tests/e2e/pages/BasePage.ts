import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly navbar: Locator;
  readonly footer: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navbar = page.locator('.navbar');
    this.footer = page.locator('footer');
    this.loadingSpinner = page.locator('.spinner, .loading');
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle');
    
    // Wait for any loading spinners to disappear
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      // Ignore if no loading spinner exists
    });
  }

  async clickNavLink(linkText: string) {
    await this.navbar.locator(`a:has-text("${linkText}")`).click();
    await this.waitForPageLoad();
  }

  async verifyNavigation(expectedPath: string) {
    await expect(this.page).toHaveURL(new RegExp(expectedPath));
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  async waitForElement(locator: Locator, timeout: number = 5000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async verifyPageTitle(expectedTitle: string) {
    await expect(this.page).toHaveTitle(new RegExp(expectedTitle));
  }

  async verifyElementVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  async verifyElementHidden(locator: Locator) {
    await expect(locator).toBeHidden();
  }

  async verifyElementText(locator: Locator, expectedText: string) {
    await expect(locator).toContainText(expectedText);
  }

  async clickButton(buttonText: string) {
    await this.page.locator(`button:has-text("${buttonText}")`).click();
  }

  async fillInput(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  async selectOption(selector: string, value: string) {
    await this.page.selectOption(selector, value);
  }

  // Accessibility helpers
  async checkAccessibility() {
    // This would integrate with axe-core
    // Implementation depends on axe-playwright setup
  }

  // Performance helpers
  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.waitForPageLoad();
    return Date.now() - startTime;
  }

  // Mobile helpers
  async isMobile(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width < 768 : false;
  }

  async swipe(direction: 'left' | 'right' | 'up' | 'down', element?: Locator) {
    const target = element || this.page.locator('body');
    const box = await target.boundingBox();
    
    if (!box) return;
    
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    
    let endX = startX;
    let endY = startY;
    
    switch (direction) {
      case 'left':
        endX = startX - 100;
        break;
      case 'right':
        endX = startX + 100;
        break;
      case 'up':
        endY = startY - 100;
        break;
      case 'down':
        endY = startY + 100;
        break;
    }
    
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY);
    await this.page.mouse.up();
  }
}
