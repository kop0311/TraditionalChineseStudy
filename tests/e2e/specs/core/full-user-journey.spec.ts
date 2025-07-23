import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { ClassicsPage } from '../../pages/ClassicsPage';
import { WritingPracticePage } from '../../pages/WritingPracticePage';
import { TestHelpers } from '../../utils/test-helpers';
import testData from '../../fixtures/test-data';

test.describe('Full User Journey', () => {
  let homePage: HomePage;
  let classicsPage: ClassicsPage;
  let writingPage: WritingPracticePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    classicsPage = new ClassicsPage(page);
    writingPage = new WritingPracticePage(page);
    
    // Start monitoring console errors
    await TestHelpers.checkConsoleErrors(page);
  });

  test('complete learning journey from homepage to practice completion', async ({ page }) => {
    // Step 1: Start at homepage
    await test.step('Navigate to homepage and verify content', async () => {
      await homePage.goto();
      await homePage.verifyHeroSection();
      await homePage.verifyFeatureCards();
      
      // Take screenshot for visual regression
      await TestHelpers.takeTimestampedScreenshot(page, 'homepage-initial');
    });

    // Step 2: Explore classics
    await test.step('Navigate to classics page and explore content', async () => {
      await homePage.clickStartLearning();
      
      await classicsPage.verifyPageHeader();
      await classicsPage.verifyClassicsCards();
      await classicsPage.verifyClassicCard('sanzijing');
      
      // Take screenshot
      await TestHelpers.takeTimestampedScreenshot(page, 'classics-page');
    });

    // Step 3: Start writing practice
    await test.step('Navigate to writing practice from classics', async () => {
      await classicsPage.clickPracticeWriting('sanzijing');
      
      await writingPage.verifyPageElements();
      await writingPage.verifyCharacterInfo('人'); // Assuming first character
      
      // Take screenshot
      await TestHelpers.takeTimestampedScreenshot(page, 'writing-practice-initial');
    });

    // Step 4: Complete a practice session
    await test.step('Complete a full writing practice session', async () => {
      // Verify HanziWriter component loads
      await writingPage.verifyHanziWriterComponent();
      
      // Watch stroke animation
      await writingPage.startStrokeAnimation();
      await page.waitForTimeout(2000);
      
      // Start practice mode
      await writingPage.startWritingPractice();
      
      // Simulate drawing strokes
      await writingPage.simulateStrokeDrawing();
      
      // Complete the session
      await writingPage.completePracticeSession();
      
      // Verify stats updated
      await writingPage.verifyPracticeStats();
      
      // Take screenshot
      await TestHelpers.takeTimestampedScreenshot(page, 'practice-completed');
    });

    // Step 5: Navigate to different character
    await test.step('Practice with different characters', async () => {
      await writingPage.navigateToNextCharacter();
      await page.waitForTimeout(1000);
      
      // Verify new character loaded
      await writingPage.verifyHanziWriterComponent();
      
      // Quick practice session
      await writingPage.startStrokeAnimation();
      await page.waitForTimeout(1000);
    });

    // Step 6: Test difficulty levels
    await test.step('Test different difficulty levels', async () => {
      await writingPage.selectDifficulty('easy');
      await page.waitForTimeout(500);
      
      await writingPage.selectDifficulty('medium');
      await page.waitForTimeout(500);
      
      await writingPage.selectDifficulty('hard');
      await page.waitForTimeout(500);
      
      // Verify component still works
      await writingPage.verifyHanziWriterComponent();
    });

    // Step 7: Navigate to pinyin practice
    await test.step('Navigate to pinyin practice', async () => {
      await page.goto('/pinyin-practice');
      await page.waitForLoadState('networkidle');
      
      // Verify pinyin practice page loads
      await expect(page.locator('h1')).toContainText('拼音练习');
      
      // Take screenshot
      await TestHelpers.takeTimestampedScreenshot(page, 'pinyin-practice');
    });

    // Step 8: Return to homepage
    await test.step('Return to homepage and verify navigation', async () => {
      await page.goto('/');
      await homePage.waitForPageLoad();
      
      await homePage.verifyHeroSection();
      
      // Verify browser history works
      await page.goBack();
      await expect(page).toHaveURL(/pinyin-practice/);
      
      await page.goForward();
      await expect(page).toHaveURL(/\/$/);
    });
  });

  test('responsive journey across different devices', async ({ page, isMobile }) => {
    if (isMobile) {
      await test.step('Test mobile user journey', async () => {
        // Start at homepage
        await homePage.goto();
        await homePage.verifyResponsiveLayout();
        
        // Navigate through features
        await homePage.scrollToSection('features');
        await homePage.scrollToSection('statistics');
        
        // Test mobile navigation
        await homePage.clickFeatureCard('writing');
        
        // Verify mobile writing practice
        await writingPage.verifyResponsiveLayout();
        
        // Test touch interactions
        await writingPage.verifyHanziWriterComponent();
        
        // Take mobile screenshots
        await TestHelpers.takeTimestampedScreenshot(page, 'mobile-journey');
      });
    } else {
      await test.step('Test desktop user journey', async () => {
        // Test desktop-specific features
        await homePage.goto();
        
        // Test hover effects
        await homePage.featuresSection.hover();
        await page.waitForTimeout(200);
        
        // Test keyboard navigation
        await TestHelpers.testKeyboardNavigation(page);
        
        // Navigate to writing practice
        await homePage.clickFeatureCard('writing');
        
        // Test desktop interactions
        await writingPage.verifyHanziWriterComponent();
        await writingPage.startStrokeAnimation();
        
        // Take desktop screenshots
        await TestHelpers.takeTimestampedScreenshot(page, 'desktop-journey');
      });
    }
  });

  test('performance throughout user journey', async ({ page }) => {
    const performanceMetrics: Array<{ page: string; loadTime: number }> = [];
    
    await test.step('Measure homepage performance', async () => {
      const metrics = await TestHelpers.measurePageLoad(page, '/');
      performanceMetrics.push({ page: 'homepage', loadTime: metrics.loadTime });
      
      expect(metrics.loadTime).toBeLessThan(testData.performanceThresholds.pageLoad.homepage);
    });

    await test.step('Measure classics page performance', async () => {
      const metrics = await TestHelpers.measurePageLoad(page, '/classics');
      performanceMetrics.push({ page: 'classics', loadTime: metrics.loadTime });
      
      expect(metrics.loadTime).toBeLessThan(testData.performanceThresholds.pageLoad.classics);
    });

    await test.step('Measure writing practice performance', async () => {
      const metrics = await TestHelpers.measurePageLoad(page, '/writing-practice');
      performanceMetrics.push({ page: 'writing-practice', loadTime: metrics.loadTime });
      
      expect(metrics.loadTime).toBeLessThan(testData.performanceThresholds.pageLoad.writingPractice);
    });

    await test.step('Measure pinyin practice performance', async () => {
      const metrics = await TestHelpers.measurePageLoad(page, '/pinyin-practice');
      performanceMetrics.push({ page: 'pinyin-practice', loadTime: metrics.loadTime });
      
      expect(metrics.loadTime).toBeLessThan(testData.performanceThresholds.pageLoad.pinyinPractice);
    });

    // Log performance summary
    console.log('Performance Summary:', performanceMetrics);
  });

  test('error handling throughout journey', async ({ page }) => {
    await test.step('Test with network interruptions', async () => {
      await homePage.goto();
      
      // Simulate network failure
      await TestHelpers.simulateNetworkFailure(page, '**/api/**');
      
      // Navigate to writing practice
      await homePage.clickFeatureCard('writing');
      
      // Page should still load even with API failures
      await expect(page.locator('h1')).toContainText('汉字书写练习');
      
      // Restore network
      await TestHelpers.restoreNetwork(page);
    });

    await test.step('Test with slow network', async () => {
      await TestHelpers.simulateSlowNetwork(page);
      
      await page.goto('/classics');
      await page.waitForLoadState('networkidle');
      
      // Page should still function
      await classicsPage.verifyPageHeader();
      
      await TestHelpers.restoreNetwork(page);
    });
  });

  test('accessibility throughout journey', async ({ page }) => {
    await test.step('Test keyboard navigation journey', async () => {
      await homePage.goto();
      
      // Test keyboard navigation on homepage
      await TestHelpers.testKeyboardNavigation(page);
      
      // Navigate to classics using keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Should be on classics page
      await expect(page).toHaveURL(/classics/);
    });

    await test.step('Test screen reader compatibility', async () => {
      await homePage.goto();
      
      // Check for proper ARIA landmarks
      const landmarks = await page.locator('[role="main"], main, [role="navigation"], nav').count();
      expect(landmarks).toBeGreaterThan(0);
      
      // Check heading structure
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
    });
  });

  test('cross-browser compatibility journey', async ({ browserName, page }) => {
    await test.step(`Test journey in ${browserName}`, async () => {
      // Complete basic journey
      await homePage.goto();
      await homePage.verifyHeroSection();
      
      await homePage.clickStartLearning();
      await classicsPage.verifyPageHeader();
      
      await classicsPage.clickPracticeWriting('sanzijing');
      await writingPage.verifyPageElements();
      
      // Browser-specific tests
      if (browserName === 'webkit') {
        // Safari-specific tests
        console.log('Running Safari-specific tests');
      } else if (browserName === 'firefox') {
        // Firefox-specific tests
        console.log('Running Firefox-specific tests');
      } else if (browserName === 'chromium') {
        // Chrome-specific tests
        console.log('Running Chrome-specific tests');
      }
      
      // Take browser-specific screenshot
      await TestHelpers.takeTimestampedScreenshot(page, `${browserName}-journey`);
    });
  });

  test.afterEach(async ({ page }) => {
    // Check for console errors
    const errors = await TestHelpers.checkConsoleErrors(page);
    if (errors.length > 0) {
      console.warn('Console errors detected:', errors);
    }
    
    // Check memory usage
    const memory = await TestHelpers.checkMemoryUsage(page);
    console.log('Memory usage:', memory);
  });
});
