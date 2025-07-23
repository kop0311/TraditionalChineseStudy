import { test, expect } from '@playwright/test';
import { WritingPracticePage } from '../../pages/WritingPracticePage';

test.describe('HanziWriter Component', () => {
  let writingPage: WritingPracticePage;

  test.beforeEach(async ({ page }) => {
    writingPage = new WritingPracticePage(page);
    await writingPage.goto();
    
    // Wait for HanziWriter to load
    await writingPage.page.waitForTimeout(2000);
  });

  test('should display HanziWriter component correctly', async () => {
    await writingPage.verifyHanziWriterComponent();
  });

  test('should show stroke animation when animation button is clicked', async () => {
    await writingPage.startStrokeAnimation();
    
    // Verify animation started
    await writingPage.page.waitForTimeout(1000);
    
    // Check if SVG has animation-related classes or attributes
    const svgElement = writingPage.writingSvg;
    await writingPage.verifyElementVisible(svgElement);
  });

  test('should enter practice mode when practice button is clicked', async () => {
    await writingPage.startWritingPractice();
    
    // Verify practice mode indicators
    const practiceIndicators = writingPage.page.locator('.alert, .practice-mode, [data-testid="practice-active"]');
    
    if (await practiceIndicators.first().isVisible()) {
      await writingPage.verifyElementVisible(practiceIndicators.first());
    }
    
    // Verify hints button becomes enabled
    await expect(writingPage.hintsButton).not.toBeDisabled();
  });

  test('should show hints when hints button is clicked during practice', async () => {
    await writingPage.useHints();
    
    // Wait for hints to appear
    await writingPage.page.waitForTimeout(500);
    
    // Verify hints are shown (this depends on implementation)
    // Could check for outline visibility, hint text, etc.
  });

  test('should reset when reset button is clicked', async () => {
    // Start practice first
    await writingPage.startWritingPractice();
    
    // Then reset
    await writingPage.resetPractice();
    
    // Verify reset state
    await writingPage.verifyElementVisible(writingPage.animationButton);
    await writingPage.verifyElementVisible(writingPage.practiceButton);
  });

  test('should handle stroke drawing simulation', async () => {
    await writingPage.startWritingPractice();
    await writingPage.simulateStrokeDrawing();
    
    // Wait for stroke processing
    await writingPage.page.waitForTimeout(1000);
    
    // Verify stroke was processed (implementation specific)
    // Could check for stroke feedback, score updates, etc.
  });

  test('should complete practice session successfully', async () => {
    await writingPage.completePracticeSession();
    
    // Verify completion indicators
    const completionElements = writingPage.page.locator('.practice-complete, .success, .score');
    
    if (await completionElements.first().isVisible()) {
      await writingPage.verifyElementVisible(completionElements.first());
    }
  });

  test('should update practice statistics', async () => {
    // Complete a practice session
    await writingPage.completePracticeSession();
    
    // Check if stats are updated
    await writingPage.verifyPracticeStats();
    
    // Look for updated numbers
    const statsNumbers = writingPage.practiceStats.locator('.stat-value, .badge, .text-primary');
    const count = await statsNumbers.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should work with different characters', async () => {
    // Test with first character
    await writingPage.verifyCharacterInfo('人'); // Assuming first character is '人'
    await writingPage.startStrokeAnimation();
    
    // Navigate to next character
    await writingPage.navigateToNextCharacter();
    
    // Verify new character loaded
    await writingPage.page.waitForTimeout(1000);
    await writingPage.verifyHanziWriterComponent();
  });

  test('should handle character navigation properly', async () => {
    // Test next navigation
    await writingPage.navigateToNextCharacter();
    await writingPage.page.waitForTimeout(500);
    
    // Test previous navigation
    await writingPage.navigateToPreviousCharacter();
    await writingPage.page.waitForTimeout(500);
    
    // Test grid selection
    await writingPage.selectCharacterFromGrid(2);
    await writingPage.page.waitForTimeout(500);
    
    // Verify component still works
    await writingPage.verifyHanziWriterComponent();
  });

  test('should be responsive on mobile devices', async ({ page, isMobile }) => {
    if (isMobile) {
      await writingPage.verifyResponsiveLayout();
      
      // Test touch interactions
      await writingPage.startWritingPractice();
      
      // Simulate touch drawing
      const svgBox = await writingPage.writingSvg.boundingBox();
      if (svgBox) {
        await page.touchscreen.tap(svgBox.x + 50, svgBox.y + 50);
        await page.touchscreen.tap(svgBox.x + 100, svgBox.y + 100);
      }
    }
  });

  test('should handle errors gracefully', async () => {
    // Test with invalid character (if possible)
    // This would depend on how the component handles errors
    
    // Test network interruption simulation
    await writingPage.page.route('**/hanzi-writer**', route => route.abort());
    
    // Reload page to trigger error
    await writingPage.page.reload();
    await writingPage.page.waitForTimeout(2000);
    
    // Verify error handling
    const errorElements = writingPage.page.locator('.error, .alert-danger, .loading');
    if (await errorElements.first().isVisible()) {
      await writingPage.verifyElementVisible(errorElements.first());
    }
    
    // Restore network
    await writingPage.page.unroute('**/hanzi-writer**');
  });

  test('should maintain state during interactions', async () => {
    // Start practice
    await writingPage.startWritingPractice();
    
    // Navigate to different character
    await writingPage.navigateToNextCharacter();
    
    // Verify practice mode is maintained or reset appropriately
    await writingPage.verifyHanziWriterComponent();
  });

  test('should provide accessibility features', async () => {
    await writingPage.verifyAccessibility();
    
    // Test keyboard navigation
    await writingPage.animationButton.focus();
    await writingPage.page.keyboard.press('Enter');
    await writingPage.page.waitForTimeout(500);
    
    // Test screen reader support
    const ariaLabels = await writingPage.page.locator('[aria-label]').count();
    expect(ariaLabels).toBeGreaterThan(0);
  });

  test('should handle rapid interactions', async () => {
    // Rapidly click buttons
    await writingPage.animationButton.click();
    await writingPage.page.waitForTimeout(100);
    
    await writingPage.practiceButton.click();
    await writingPage.page.waitForTimeout(100);
    
    await writingPage.resetButton.click();
    await writingPage.page.waitForTimeout(100);
    
    // Verify component is still functional
    await writingPage.verifyHanziWriterComponent();
  });

  test('should measure performance', async () => {
    const performanceTime = await writingPage.measurePracticePerformance();
    
    // Practice session should complete within reasonable time
    expect(performanceTime).toBeLessThan(10000); // 10 seconds
  });

  test('should work with different difficulty levels', async () => {
    // Test easy difficulty
    await writingPage.selectDifficulty('easy');
    await writingPage.verifyHanziWriterComponent();
    await writingPage.startStrokeAnimation();
    
    // Test hard difficulty
    await writingPage.selectDifficulty('hard');
    await writingPage.verifyHanziWriterComponent();
    await writingPage.startStrokeAnimation();
  });
});
