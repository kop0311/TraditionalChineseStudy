import { test, expect } from '@playwright/test';
import { ClassicsPage } from '../../pages/ClassicsPage';
import { HomePage } from '../../pages/HomePage';

test.describe('Classics Reading Flow', () => {
  let classicsPage: ClassicsPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    classicsPage = new ClassicsPage(page);
    homePage = new HomePage(page);
  });

  test('should navigate to classics page from homepage', async () => {
    await homePage.goto();
    await homePage.clickStartLearning();
    
    // Verify we're on classics page
    await expect(classicsPage.page).toHaveURL(/\/classics/);
    await classicsPage.verifyPageHeader();
  });

  test('should display all classic texts with correct information', async () => {
    await classicsPage.goto();
    
    // Verify page elements
    await classicsPage.verifyPageHeader();
    await classicsPage.verifyClassicsCards();
    
    // Verify each classic card
    await classicsPage.verifyClassicCard('sanzijing');
    await classicsPage.verifyClassicCard('dizigui');
    await classicsPage.verifyClassicCard('daodejing');
  });

  test('should show correct difficulty levels', async () => {
    await classicsPage.goto();
    await classicsPage.verifyDifficultyBadges();
  });

  test('should navigate to individual classic reading', async () => {
    await classicsPage.goto();
    
    // Test navigation to 三字经
    await classicsPage.clickReadClassic('sanzijing');
    await expect(classicsPage.page).toHaveURL(/\/classics\/sanzijing/);
    
    // Go back and test 弟子规
    await classicsPage.page.goBack();
    await classicsPage.waitForPageLoad();
    
    await classicsPage.clickReadClassic('dizigui');
    await expect(classicsPage.page).toHaveURL(/\/classics\/dizigui/);
    
    // Go back and test 道德经
    await classicsPage.page.goBack();
    await classicsPage.waitForPageLoad();
    
    await classicsPage.clickReadClassic('daodejing');
    await expect(classicsPage.page).toHaveURL(/\/classics\/daodejing/);
  });

  test('should navigate to writing practice from classics', async () => {
    await classicsPage.goto();
    
    // Click practice writing for 三字经
    await classicsPage.clickPracticeWriting('sanzijing');
    await expect(classicsPage.page).toHaveURL(/\/writing-practice/);
    
    // Verify URL contains classic parameter
    const url = classicsPage.page.url();
    expect(url).toContain('classic=sanzijing');
  });

  test('should navigate to pinyin practice from classics', async () => {
    await classicsPage.goto();
    
    // Click pinyin practice for 弟子规
    await classicsPage.clickPinyinPractice('dizigui');
    await expect(classicsPage.page).toHaveURL(/\/pinyin-practice/);
    
    // Verify URL contains classic parameter
    const url = classicsPage.page.url();
    expect(url).toContain('classic=dizigui');
  });

  test('should display learning tips section', async () => {
    await classicsPage.goto();
    await classicsPage.verifyLearningTips();
  });

  test('should display progress overview', async () => {
    await classicsPage.goto();
    await classicsPage.verifyProgressOverview();
  });

  test('should be responsive on different screen sizes', async ({ page, isMobile }) => {
    await classicsPage.goto();
    
    if (isMobile) {
      await classicsPage.verifyResponsiveGrid();
      
      // Test mobile interactions
      await classicsPage.scrollToElement(classicsPage.sanzijingCard);
      await classicsPage.scrollToElement(classicsPage.diziguiCard);
      await classicsPage.scrollToElement(classicsPage.daodejingCard);
    } else {
      // Test desktop layout
      await classicsPage.verifyClassicsCards();
    }
  });

  test('should handle card interactions properly', async () => {
    await classicsPage.goto();
    
    // Test hover effects on cards
    await classicsPage.sanzijingCard.hover();
    await classicsPage.page.waitForTimeout(200);
    
    await classicsPage.diziguiCard.hover();
    await classicsPage.page.waitForTimeout(200);
    
    await classicsPage.daodejingCard.hover();
    await classicsPage.page.waitForTimeout(200);
  });

  test('should maintain state when navigating back', async () => {
    await classicsPage.goto();
    
    // Scroll to a specific section
    await classicsPage.scrollToElement(classicsPage.learningTips);
    
    // Navigate away
    await classicsPage.clickReadClassic('sanzijing');
    
    // Navigate back
    await classicsPage.page.goBack();
    await classicsPage.waitForPageLoad();
    
    // Verify we're back on classics page
    await expect(classicsPage.page).toHaveURL(/\/classics$/);
    await classicsPage.verifyPageHeader();
  });

  test('should load classic cards within performance thresholds', async () => {
    const startTime = Date.now();
    await classicsPage.goto();
    
    // Wait for all cards to be visible
    await classicsPage.verifyClassicsCards();
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle keyboard navigation', async () => {
    await classicsPage.goto();
    
    // Tab through the cards
    await classicsPage.page.keyboard.press('Tab');
    await classicsPage.page.keyboard.press('Tab');
    await classicsPage.page.keyboard.press('Tab');
    
    // Press Enter on a focused button
    await classicsPage.page.keyboard.press('Enter');
    await classicsPage.waitForPageLoad();
    
    // Should navigate somewhere
    const currentUrl = classicsPage.page.url();
    expect(currentUrl).not.toBe('http://localhost/classics');
  });

  test('should display correct chapter counts', async () => {
    await classicsPage.goto();
    
    // Verify chapter counts in cards
    await classicsPage.verifyElementText(classicsPage.sanzijingCard, '12');
    await classicsPage.verifyElementText(classicsPage.diziguiCard, '8');
    await classicsPage.verifyElementText(classicsPage.daodejingCard, '81');
  });

  test('should show progress indicators if available', async () => {
    await classicsPage.goto();
    
    // Check if progress indicators are shown
    const progressElements = classicsPage.page.locator('.progress, .progress-bar');
    
    if (await progressElements.first().isVisible()) {
      await classicsPage.verifyElementVisible(progressElements.first());
    }
  });

  test('should handle page refresh correctly', async () => {
    await classicsPage.goto();
    
    // Refresh the page
    await classicsPage.page.reload();
    await classicsPage.waitForPageLoad();
    
    // Verify content is still there
    await classicsPage.verifyPageHeader();
    await classicsPage.verifyClassicsCards();
  });

  test('should work with browser navigation', async () => {
    await classicsPage.goto();
    
    // Navigate to a classic
    await classicsPage.clickReadClassic('sanzijing');
    await expect(classicsPage.page).toHaveURL(/\/classics\/sanzijing/);
    
    // Use browser back button
    await classicsPage.page.goBack();
    await classicsPage.waitForPageLoad();
    await expect(classicsPage.page).toHaveURL(/\/classics$/);
    
    // Use browser forward button
    await classicsPage.page.goForward();
    await classicsPage.waitForPageLoad();
    await expect(classicsPage.page).toHaveURL(/\/classics\/sanzijing/);
  });
});
