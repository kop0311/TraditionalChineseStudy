import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

test.describe('Homepage Core Functionality', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display homepage with correct title and content', async () => {
    // Verify page title
    await homePage.verifyPageTitle('小小读书郎');
    
    // Verify hero section
    await homePage.verifyHeroSection();
    
    // Verify navigation buttons
    await homePage.verifyNavigationButtons();
  });

  test('should navigate to classics page from start learning button', async () => {
    await homePage.clickStartLearning();
    
    // Should be on classics page
    await expect(homePage.page).toHaveURL(/\/classics/);
  });

  test('should navigate to writing practice from hanzi practice button', async () => {
    await homePage.clickHanziPractice();
    
    // Should be on writing practice page
    await expect(homePage.page).toHaveURL(/\/writing-practice/);
  });

  test('should display all feature cards correctly', async () => {
    await homePage.verifyFeatureCards();
  });

  test('should navigate from feature cards', async () => {
    // Test classics card navigation
    await homePage.clickFeatureCard('classics');
    await homePage.page.goBack();
    await homePage.waitForPageLoad();
    
    // Test writing card navigation
    await homePage.clickFeatureCard('writing');
    await homePage.page.goBack();
    await homePage.waitForPageLoad();
    
    // Test pinyin card navigation
    await homePage.clickFeatureCard('pinyin');
    await homePage.page.goBack();
    await homePage.waitForPageLoad();
  });

  test('should display statistics section', async () => {
    await homePage.scrollToSection('statistics');
    await homePage.verifyStatistics();
  });

  test('should display and function call-to-action section', async () => {
    await homePage.scrollToSection('cta');
    await homePage.verifyCallToAction();
    
    // Test CTA navigation
    await homePage.clickCallToAction();
    await expect(homePage.page).toHaveURL(/\/classics/);
  });

  test('should be responsive on mobile devices', async ({ page, isMobile }) => {
    if (isMobile) {
      await homePage.verifyResponsiveLayout();
      
      // Test mobile navigation
      await homePage.scrollToSection('features');
      await homePage.scrollToSection('statistics');
      await homePage.scrollToSection('cta');
    }
  });

  test('should load within performance thresholds', async () => {
    const loadTime = await homePage.verifyPagePerformance();
    
    // Homepage should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have proper navigation structure', async () => {
    // Verify navbar is present
    await homePage.verifyElementVisible(homePage.navbar);
    
    // Test navigation links
    await homePage.clickNavLink('经典阅读');
    await expect(homePage.page).toHaveURL(/\/classics/);
    
    await homePage.page.goBack();
    await homePage.waitForPageLoad();
    
    await homePage.clickNavLink('汉字练习');
    await expect(homePage.page).toHaveURL(/\/writing-practice/);
    
    await homePage.page.goBack();
    await homePage.waitForPageLoad();
    
    await homePage.clickNavLink('拼音练习');
    await expect(homePage.page).toHaveURL(/\/pinyin-practice/);
  });

  test('should handle page interactions smoothly', async () => {
    // Test smooth scrolling
    await homePage.scrollToSection('features');
    await homePage.page.waitForTimeout(500);
    
    await homePage.scrollToSection('statistics');
    await homePage.page.waitForTimeout(500);
    
    await homePage.scrollToSection('cta');
    await homePage.page.waitForTimeout(500);
    
    // Test hover effects (if any)
    await homePage.featuresSection.hover();
    await homePage.page.waitForTimeout(200);
  });

  test('should display footer correctly', async () => {
    await homePage.verifyElementVisible(homePage.footer);
    await homePage.verifyElementText(homePage.footer, '传承中华文化，启蒙智慧人生');
  });

  test('should handle browser back/forward navigation', async () => {
    // Navigate to different pages
    await homePage.clickStartLearning();
    await expect(homePage.page).toHaveURL(/\/classics/);
    
    // Go back
    await homePage.page.goBack();
    await homePage.waitForPageLoad();
    await expect(homePage.page).toHaveURL(/\/$/);
    
    // Go forward
    await homePage.page.goForward();
    await homePage.waitForPageLoad();
    await expect(homePage.page).toHaveURL(/\/classics/);
  });

  test('should work with keyboard navigation', async () => {
    // Tab through interactive elements
    await homePage.page.keyboard.press('Tab');
    await homePage.page.keyboard.press('Tab');
    await homePage.page.keyboard.press('Tab');
    
    // Press Enter on focused element
    await homePage.page.keyboard.press('Enter');
    await homePage.waitForPageLoad();
    
    // Should navigate somewhere
    const currentUrl = homePage.page.url();
    expect(currentUrl).not.toBe('http://localhost/');
  });

  test('should handle page refresh correctly', async () => {
    // Refresh the page
    await homePage.page.reload();
    await homePage.waitForPageLoad();
    
    // Verify content is still there
    await homePage.verifyHeroSection();
    await homePage.verifyFeatureCards();
  });
});
