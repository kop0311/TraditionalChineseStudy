import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly startLearningButton: Locator;
  readonly hanziPracticeButton: Locator;
  readonly featuresSection: Locator;
  readonly classicsCard: Locator;
  readonly writingCard: Locator;
  readonly pinyinCard: Locator;
  readonly statisticsSection: Locator;
  readonly callToActionSection: Locator;

  constructor(page: Page) {
    super(page);
    this.heroTitle = page.locator('h1.chinese-title');
    this.heroSubtitle = page.locator('.lead.chinese-text');
    this.startLearningButton = page.locator('a[href="/classics"]:has-text("开始学习")');
    this.hanziPracticeButton = page.locator('a[href="/writing-practice"]:has-text("汉字练习")');
    this.featuresSection = page.locator('.row').nth(1); // Features section
    this.classicsCard = page.locator('.card:has-text("经典阅读")');
    this.writingCard = page.locator('.card:has-text("汉字练习")');
    this.pinyinCard = page.locator('.card:has-text("拼音学习")');
    this.statisticsSection = page.locator('.row').nth(2); // Statistics section
    this.callToActionSection = page.locator('.card.bg-primary');
  }

  override async goto() {
    await super.goto('/');
  }

  async verifyHeroSection() {
    await this.verifyElementVisible(this.heroTitle);
    await this.verifyElementText(this.heroTitle, '小小读书郎');
    await this.verifyElementVisible(this.heroSubtitle);
    await this.verifyElementText(this.heroSubtitle, '传承中华文化，启蒙智慧人生');
  }

  async verifyNavigationButtons() {
    await this.verifyElementVisible(this.startLearningButton);
    await this.verifyElementVisible(this.hanziPracticeButton);
  }

  async clickStartLearning() {
    await this.startLearningButton.click();
    await this.waitForPageLoad();
    await this.verifyNavigation('/classics');
  }

  async clickHanziPractice() {
    await this.hanziPracticeButton.click();
    await this.waitForPageLoad();
    await this.verifyNavigation('/writing-practice');
  }

  async verifyFeatureCards() {
    // Verify classics reading card
    await this.verifyElementVisible(this.classicsCard);
    await this.verifyElementText(this.classicsCard, '经典阅读');
    await this.verifyElementText(this.classicsCard, '三字经、弟子规、道德经');
    
    // Verify writing practice card
    await this.verifyElementVisible(this.writingCard);
    await this.verifyElementText(this.writingCard, '汉字练习');
    await this.verifyElementText(this.writingCard, '交互式汉字书写练习');
    
    // Verify pinyin practice card
    await this.verifyElementVisible(this.pinyinCard);
    await this.verifyElementText(this.pinyinCard, '拼音学习');
    await this.verifyElementText(this.pinyinCard, '拼音发音练习和声调训练');
  }

  async clickFeatureCard(cardType: 'classics' | 'writing' | 'pinyin') {
    let card: Locator;
    let expectedPath: string;
    
    switch (cardType) {
      case 'classics':
        card = this.classicsCard.locator('a[href="/classics"]');
        expectedPath = '/classics';
        break;
      case 'writing':
        card = this.writingCard.locator('a[href="/writing-practice"]');
        expectedPath = '/writing-practice';
        break;
      case 'pinyin':
        card = this.pinyinCard.locator('a[href="/pinyin-practice"]');
        expectedPath = '/pinyin-practice';
        break;
    }
    
    await card.click();
    await this.waitForPageLoad();
    await this.verifyNavigation(expectedPath);
  }

  async verifyStatistics() {
    await this.verifyElementVisible(this.statisticsSection);
    
    // Check for statistics numbers
    const stats = [
      { value: '3', label: '经典文本' },
      { value: '1000+', label: '常用汉字' },
      { value: '400+', label: '拼音组合' },
      { value: '∞', label: '学习乐趣' }
    ];
    
    for (const stat of stats) {
      await this.verifyElementText(this.statisticsSection, stat.value);
      await this.verifyElementText(this.statisticsSection, stat.label);
    }
  }

  async verifyCallToAction() {
    await this.verifyElementVisible(this.callToActionSection);
    await this.verifyElementText(this.callToActionSection, '开始您的学习之旅');
    
    const ctaButton = this.callToActionSection.locator('a[href="/classics"]');
    await this.verifyElementVisible(ctaButton);
    await this.verifyElementText(ctaButton, '立即开始');
  }

  async clickCallToAction() {
    const ctaButton = this.callToActionSection.locator('a[href="/classics"]');
    await ctaButton.click();
    await this.waitForPageLoad();
    await this.verifyNavigation('/classics');
  }

  async verifyResponsiveLayout() {
    const isMobile = await this.isMobile();
    
    if (isMobile) {
      // On mobile, cards should stack vertically
      const cards = this.page.locator('.card');
      const cardCount = await cards.count();
      
      for (let i = 0; i < cardCount; i++) {
        const card = cards.nth(i);
        await this.verifyElementVisible(card);
      }
    } else {
      // On desktop, cards should be in a row
      await this.verifyElementVisible(this.featuresSection);
    }
  }

  async verifyPagePerformance() {
    const loadTime = await this.measurePageLoadTime();
    
    // Page should load within 3 seconds
    if (loadTime > 3000) {
      console.warn(`Homepage load time: ${loadTime}ms (exceeds 3s threshold)`);
    }
    
    return loadTime;
  }

  async scrollToSection(section: 'features' | 'statistics' | 'cta') {
    let target: Locator;
    
    switch (section) {
      case 'features':
        target = this.featuresSection;
        break;
      case 'statistics':
        target = this.statisticsSection;
        break;
      case 'cta':
        target = this.callToActionSection;
        break;
    }
    
    await this.scrollToElement(target);
    await this.verifyElementVisible(target);
  }
}
