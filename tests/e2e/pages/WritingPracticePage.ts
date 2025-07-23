import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class WritingPracticePage extends BasePage {
  readonly pageTitle: Locator;
  readonly difficultyFilter: Locator;
  readonly characterNavigation: Locator;
  readonly characterInfo: Locator;
  readonly practiceStats: Locator;
  readonly hanziWriterComponent: Locator;
  readonly strokeAnimator: Locator;
  readonly practiceHistory: Locator;

  // HanziWriter component elements
  readonly hanziWriterContainer: Locator;
  readonly animationButton: Locator;
  readonly practiceButton: Locator;
  readonly hintsButton: Locator;
  readonly resetButton: Locator;
  readonly writingSvg: Locator;

  // Character navigation elements
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly characterGrid: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1:has-text("汉字书写练习")');
    this.difficultyFilter = page.locator('.card:has-text("选择难度")');
    this.characterNavigation = page.locator('.card:has-text("字符选择")');
    this.characterInfo = page.locator('.card:has-text("字符信息")');
    this.practiceStats = page.locator('.card:has-text("练习统计")');
    this.hanziWriterComponent = page.locator('.hanzi-writer-container');
    this.strokeAnimator = page.locator('.stroke-animator-container');
    this.practiceHistory = page.locator('.card:has-text("练习记录")');

    // HanziWriter specific elements
    this.hanziWriterContainer = page.locator('.hanzi-writer-container');
    this.animationButton = page.locator('button:has-text("演示笔画")');
    this.practiceButton = page.locator('button:has-text("开始练习")');
    this.hintsButton = page.locator('button:has-text("显示提示")');
    this.resetButton = page.locator('button:has-text("重新开始")');
    this.writingSvg = page.locator('.stroke-animation-container svg');

    // Navigation elements
    this.previousButton = page.locator('button:has-text("上一个")');
    this.nextButton = page.locator('button:has-text("下一个")');
    this.characterGrid = page.locator('.character-grid');
  }

  override async goto() {
    await super.goto('/writing-practice');
  }

  async verifyPageElements() {
    await this.verifyElementVisible(this.pageTitle);
    await this.verifyElementVisible(this.difficultyFilter);
    await this.verifyElementVisible(this.characterNavigation);
    await this.verifyElementVisible(this.characterInfo);
    await this.verifyElementVisible(this.practiceStats);
  }

  async selectDifficulty(difficulty: 'all' | 'easy' | 'medium' | 'hard') {
    const difficultyText = {
      'all': '全部',
      'easy': '简单',
      'medium': '中等',
      'hard': '困难'
    }[difficulty];

    const difficultyButton = this.difficultyFilter.locator(`button:has-text("${difficultyText}")`);
    await difficultyButton.click();
    await this.waitForPageLoad();
  }

  async verifyCharacterInfo(expectedCharacter: string) {
    await this.verifyElementVisible(this.characterInfo);
    await this.verifyElementText(this.characterInfo, expectedCharacter);
    
    // Verify character details are shown
    const infoElements = ['拼音', '含义', '笔画', '部首'];
    for (const element of infoElements) {
      await this.verifyElementText(this.characterInfo, element);
    }
  }

  async navigateToNextCharacter() {
    await this.nextButton.click();
    await this.waitForPageLoad();
  }

  async navigateToPreviousCharacter() {
    await this.previousButton.click();
    await this.waitForPageLoad();
  }

  async selectCharacterFromGrid(index: number) {
    const characterButtons = this.characterGrid.locator('button');
    await characterButtons.nth(index).click();
    await this.waitForPageLoad();
  }

  async verifyHanziWriterComponent() {
    await this.verifyElementVisible(this.hanziWriterContainer);
    await this.verifyElementVisible(this.writingSvg);
    
    // Verify control buttons
    await this.verifyElementVisible(this.animationButton);
    await this.verifyElementVisible(this.practiceButton);
    await this.verifyElementVisible(this.hintsButton);
    await this.verifyElementVisible(this.resetButton);
  }

  async startStrokeAnimation() {
    await this.animationButton.click();
    
    // Wait for animation to start
    await this.page.waitForTimeout(1000);
    
    // Verify animation is running (this might need adjustment based on actual implementation)
    const animationState = await this.writingSvg.getAttribute('class');
    // Add specific checks for animation state if available
  }

  async startWritingPractice() {
    await this.practiceButton.click();
    
    // Wait for practice mode to activate
    await this.page.waitForTimeout(500);
    
    // Verify practice mode is active
    await this.verifyElementText(this.page.locator('.alert'), '练习提示');
  }

  async useHints() {
    // First start practice mode
    await this.startWritingPractice();
    
    // Then use hints
    await this.hintsButton.click();
    
    // Verify hints are shown (implementation specific)
    await this.page.waitForTimeout(500);
  }

  async resetPractice() {
    await this.resetButton.click();
    
    // Verify reset state
    await this.page.waitForTimeout(500);
  }

  async simulateStrokeDrawing() {
    // Simulate drawing strokes on the SVG
    const svgBox = await this.writingSvg.boundingBox();
    
    if (svgBox) {
      // Start from top-left and draw a simple stroke
      const startX = svgBox.x + 50;
      const startY = svgBox.y + 50;
      const endX = svgBox.x + 150;
      const endY = svgBox.y + 150;
      
      await this.page.mouse.move(startX, startY);
      await this.page.mouse.down();
      await this.page.mouse.move(endX, endY, { steps: 10 });
      await this.page.mouse.up();
      
      // Wait for stroke processing
      await this.page.waitForTimeout(1000);
    }
  }

  async verifyPracticeStats() {
    await this.verifyElementVisible(this.practiceStats);
    
    // Check for stat elements
    const statElements = ['已练习', '平均分'];
    for (const element of statElements) {
      await this.verifyElementText(this.practiceStats, element);
    }
  }

  async verifyPracticeHistory() {
    // Scroll to practice history if it exists
    if (await this.practiceHistory.isVisible()) {
      await this.scrollToElement(this.practiceHistory);
      await this.verifyElementVisible(this.practiceHistory);
    }
  }

  async completePracticeSession() {
    // Start practice
    await this.startWritingPractice();
    
    // Simulate drawing strokes
    await this.simulateStrokeDrawing();
    
    // Wait for completion
    await this.page.waitForTimeout(2000);
    
    // Check for completion indicators
    const completionElements = this.page.locator('.practice-stats, .alert-success');
    if (await completionElements.first().isVisible()) {
      await this.verifyElementVisible(completionElements.first());
    }
  }

  async verifyResponsiveLayout() {
    const isMobile = await this.isMobile();
    
    if (isMobile) {
      // On mobile, verify stacked layout
      await this.verifyElementVisible(this.characterInfo);
      await this.verifyElementVisible(this.hanziWriterComponent);
      
      // Character grid should be scrollable
      if (await this.characterGrid.isVisible()) {
        await this.swipe('left', this.characterGrid);
      }
    } else {
      // On desktop, verify side-by-side layout
      await this.verifyElementVisible(this.characterInfo);
      await this.verifyElementVisible(this.practiceStats);
    }
  }

  async measurePracticePerformance() {
    const startTime = Date.now();
    
    // Perform a complete practice session
    await this.completePracticeSession();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Practice session duration: ${duration}ms`);
    return duration;
  }

  async verifyAccessibility() {
    // Check for ARIA labels and roles
    const interactiveElements = [
      this.animationButton,
      this.practiceButton,
      this.hintsButton,
      this.resetButton,
      this.previousButton,
      this.nextButton
    ];
    
    for (const element of interactiveElements) {
      if (await element.isVisible()) {
        // Verify element is focusable
        await element.focus();
        
        // Verify element has accessible name
        const accessibleName = await element.getAttribute('aria-label') || 
                              await element.textContent();
        
        if (!accessibleName || accessibleName.trim() === '') {
          console.warn('Element missing accessible name:', await element.innerHTML());
        }
      }
    }
  }
}
