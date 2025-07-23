import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ClassicsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly classicsGrid: Locator;
  readonly sanzijingCard: Locator;
  readonly diziguiCard: Locator;
  readonly daodejingCard: Locator;
  readonly learningTips: Locator;
  readonly progressOverview: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1.chinese-title:has-text("经典阅读")');
    this.pageDescription = page.locator('.lead');
    this.classicsGrid = page.locator('.row').first();
    this.sanzijingCard = page.locator('.card:has-text("三字经")');
    this.diziguiCard = page.locator('.card:has-text("弟子规")');
    this.daodejingCard = page.locator('.card:has-text("道德经")');
    this.learningTips = page.locator('.card:has-text("学习建议")');
    this.progressOverview = page.locator('.card:has-text("学习进度")');
  }

  override async goto() {
    await super.goto('/classics');
  }

  async verifyPageHeader() {
    await this.verifyElementVisible(this.pageTitle);
    await this.verifyElementText(this.pageTitle, '经典阅读');
    await this.verifyElementVisible(this.pageDescription);
    await this.verifyElementText(this.pageDescription, '探索中华文化的瑰宝');
  }

  async verifyClassicsCards() {
    // Verify all three classics cards are present
    await this.verifyElementVisible(this.sanzijingCard);
    await this.verifyElementVisible(this.diziguiCard);
    await this.verifyElementVisible(this.daodejingCard);
  }

  async verifyClassicCard(classic: 'sanzijing' | 'dizigui' | 'daodejing') {
    let card: Locator;
    let expectedTitle: string;
    let expectedDifficulty: string;
    let expectedChapters: string;

    switch (classic) {
      case 'sanzijing':
        card = this.sanzijingCard;
        expectedTitle = '三字经';
        expectedDifficulty = '简单';
        expectedChapters = '12';
        break;
      case 'dizigui':
        card = this.diziguiCard;
        expectedTitle = '弟子规';
        expectedDifficulty = '中等';
        expectedChapters = '8';
        break;
      case 'daodejing':
        card = this.daodejingCard;
        expectedTitle = '道德经';
        expectedDifficulty = '困难';
        expectedChapters = '81';
        break;
    }

    await this.verifyElementVisible(card);
    await this.verifyElementText(card, expectedTitle);
    await this.verifyElementText(card, expectedDifficulty);
    await this.verifyElementText(card, expectedChapters);

    // Verify action buttons
    const readButton = card.locator('a:has-text("开始阅读")');
    const practiceButton = card.locator('a:has-text("练字")');
    const pinyinButton = card.locator('a:has-text("拼音")');

    await this.verifyElementVisible(readButton);
    await this.verifyElementVisible(practiceButton);
    await this.verifyElementVisible(pinyinButton);
  }

  async clickReadClassic(classic: 'sanzijing' | 'dizigui' | 'daodejing') {
    let card: Locator;
    let expectedPath: string;

    switch (classic) {
      case 'sanzijing':
        card = this.sanzijingCard;
        expectedPath = '/classics/sanzijing';
        break;
      case 'dizigui':
        card = this.diziguiCard;
        expectedPath = '/classics/dizigui';
        break;
      case 'daodejing':
        card = this.daodejingCard;
        expectedPath = '/classics/daodejing';
        break;
    }

    const readButton = card.locator('a:has-text("开始阅读")');
    await readButton.click();
    await this.waitForPageLoad();
    await this.verifyNavigation(expectedPath);
  }

  async clickPracticeWriting(classic: 'sanzijing' | 'dizigui' | 'daodejing') {
    let card: Locator;

    switch (classic) {
      case 'sanzijing':
        card = this.sanzijingCard;
        break;
      case 'dizigui':
        card = this.diziguiCard;
        break;
      case 'daodejing':
        card = this.daodejingCard;
        break;
    }

    const practiceButton = card.locator('a:has-text("练字")');
    await practiceButton.click();
    await this.waitForPageLoad();
    await this.verifyNavigation('/writing-practice');
  }

  async clickPinyinPractice(classic: 'sanzijing' | 'dizigui' | 'daodejing') {
    let card: Locator;

    switch (classic) {
      case 'sanzijing':
        card = this.sanzijingCard;
        break;
      case 'dizigui':
        card = this.diziguiCard;
        break;
      case 'daodejing':
        card = this.daodejingCard;
        break;
    }

    const pinyinButton = card.locator('a:has-text("拼音")');
    await pinyinButton.click();
    await this.waitForPageLoad();
    await this.verifyNavigation('/pinyin-practice');
  }

  async verifyLearningTips() {
    await this.scrollToElement(this.learningTips);
    await this.verifyElementVisible(this.learningTips);
    await this.verifyElementText(this.learningTips, '学习建议');

    // Check for specific tips
    const tips = [
      '循序渐进',
      '朗读背诵',
      '书写练习'
    ];

    for (const tip of tips) {
      await this.verifyElementText(this.learningTips, tip);
    }
  }

  async verifyProgressOverview() {
    await this.scrollToElement(this.progressOverview);
    await this.verifyElementVisible(this.progressOverview);
    await this.verifyElementText(this.progressOverview, '学习进度');

    // Check for progress elements
    const progressBar = this.progressOverview.locator('.progress-bar');
    await this.verifyElementVisible(progressBar);

    // Check for statistics
    const stats = [
      '已学汉字',
      '已读章节',
      '练习次数',
      '学习天数'
    ];

    for (const stat of stats) {
      await this.verifyElementText(this.progressOverview, stat);
    }
  }

  async verifyDifficultyBadges() {
    // Check difficulty badges
    const easyBadge = this.sanzijingCard.locator('.badge.bg-success');
    const mediumBadge = this.diziguiCard.locator('.badge.bg-warning');
    const hardBadge = this.daodejingCard.locator('.badge.bg-danger');

    await this.verifyElementVisible(easyBadge);
    await this.verifyElementText(easyBadge, '简单');

    await this.verifyElementVisible(mediumBadge);
    await this.verifyElementText(mediumBadge, '中等');

    await this.verifyElementVisible(hardBadge);
    await this.verifyElementText(hardBadge, '困难');
  }

  async verifyResponsiveGrid() {
    const isMobile = await this.isMobile();
    
    if (isMobile) {
      // On mobile, cards should stack vertically
      const cards = this.classicsGrid.locator('.card');
      const cardCount = await cards.count();
      
      for (let i = 0; i < cardCount; i++) {
        const card = cards.nth(i);
        await this.scrollToElement(card);
        await this.verifyElementVisible(card);
      }
    } else {
      // On desktop, verify grid layout
      await this.verifyElementVisible(this.classicsGrid);
    }
  }

  async searchClassics(searchTerm: string) {
    // If there's a search functionality
    const searchInput = this.page.locator('input[type="search"], input[placeholder*="搜索"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill(searchTerm);
      await this.page.keyboard.press('Enter');
      await this.waitForPageLoad();
    }
  }

  async filterByDifficulty(difficulty: 'easy' | 'medium' | 'hard') {
    // If there's a filter functionality
    const filterButton = this.page.locator(`button:has-text("${difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}")`);
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await this.waitForPageLoad();
    }
  }
}
