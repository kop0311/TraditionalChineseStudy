/**
 * Font Loader Utility
 * Handles progressive font loading with fallbacks
 */

export class FontLoader {
  constructor() {
    this.fonts = [
      {
        family: 'Noto Sans SC',
        weight: '400',
        style: 'normal',
        display: 'swap',
      },
      {
        family: 'Noto Sans SC',
        weight: '500',
        style: 'normal',
        display: 'swap',
      },
      {
        family: 'Noto Sans SC',
        weight: '700',
        style: 'normal',
        display: 'swap',
      },
      {
        family: 'Noto Sans TC',
        weight: '400',
        style: 'normal',
        display: 'swap',
      },
    ];
    
    this.loadedFonts = new Set();
    this.loadingPromises = new Map();
  }

  /**
   * Load all fonts with progressive enhancement
   */
  async loadFonts() {
    try {
      // Add font-loading class to body
      document.body.classList.add('font-loading');

      // Load fonts in parallel
      const loadPromises = this.fonts.map(font => this.loadFont(font));
      
      // Wait for all fonts to load or timeout
      await Promise.allSettled(loadPromises);

      // Update body class to indicate fonts are loaded
      document.body.classList.remove('font-loading');
      document.body.classList.add('font-loaded');

      console.log('✅ Fonts loaded successfully');
    } catch (error) {
      console.warn('⚠️ Font loading failed, using fallbacks:', error);
      document.body.classList.remove('font-loading');
      document.body.classList.add('font-fallback');
    }
  }

  /**
   * Load a single font
   */
  async loadFont(fontConfig) {
    const fontKey = `${fontConfig.family}-${fontConfig.weight}-${fontConfig.style}`;
    
    // Return existing promise if already loading
    if (this.loadingPromises.has(fontKey)) {
      return this.loadingPromises.get(fontKey);
    }

    // Return immediately if already loaded
    if (this.loadedFonts.has(fontKey)) {
      return Promise.resolve();
    }

    // Create loading promise
    const loadingPromise = this.createFontLoadPromise(fontConfig);
    this.loadingPromises.set(fontKey, loadingPromise);

    try {
      await loadingPromise;
      this.loadedFonts.add(fontKey);
      console.log(`✅ Font loaded: ${fontKey}`);
    } catch (error) {
      console.warn(`⚠️ Font load failed: ${fontKey}`, error);
    } finally {
      this.loadingPromises.delete(fontKey);
    }

    return loadingPromise;
  }

  /**
   * Create font loading promise using Font Loading API or fallback
   */
  createFontLoadPromise(fontConfig) {
    // Use Font Loading API if available
    if ('fonts' in document) {
      return this.loadFontWithAPI(fontConfig);
    }
    
    // Fallback to CSS-based detection
    return this.loadFontWithCSS(fontConfig);
  }

  /**
   * Load font using Font Loading API
   */
  async loadFontWithAPI(fontConfig) {
    const fontFace = new FontFace(
      fontConfig.family,
      `url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontConfig.family)}:wght@${fontConfig.weight}&display=${fontConfig.display}')`,
      {
        weight: fontConfig.weight,
        style: fontConfig.style,
        display: fontConfig.display,
      }
    );

    // Load the font
    await fontFace.load();
    
    // Add to document fonts
    document.fonts.add(fontFace);
    
    return fontFace;
  }

  /**
   * Load font using CSS-based detection (fallback)
   */
  loadFontWithCSS(fontConfig) {
    return new Promise((resolve, reject) => {
      // Create a test element
      const testElement = document.createElement('div');
      testElement.style.fontFamily = fontConfig.family;
      testElement.style.fontSize = '100px';
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      testElement.style.top = '-9999px';
      testElement.style.visibility = 'hidden';
      testElement.textContent = '中文测试';
      
      document.body.appendChild(testElement);
      
      // Measure initial width
      const initialWidth = testElement.offsetWidth;
      
      // Set timeout for font loading
      const timeout = setTimeout(() => {
        document.body.removeChild(testElement);
        reject(new Error('Font loading timeout'));
      }, 3000);
      
      // Check for font load
      const checkFont = () => {
        const currentWidth = testElement.offsetWidth;
        if (currentWidth !== initialWidth) {
          clearTimeout(timeout);
          document.body.removeChild(testElement);
          resolve();
        } else {
          requestAnimationFrame(checkFont);
        }
      };
      
      // Start checking
      requestAnimationFrame(checkFont);
    });
  }

  /**
   * Check if a font is loaded
   */
  isFontLoaded(family, weight = '400', style = 'normal') {
    const fontKey = `${family}-${weight}-${style}`;
    return this.loadedFonts.has(fontKey);
  }

  /**
   * Get loading status
   */
  getLoadingStatus() {
    return {
      total: this.fonts.length,
      loaded: this.loadedFonts.size,
      loading: this.loadingPromises.size,
      isComplete: this.loadedFonts.size === this.fonts.length,
    };
  }

  /**
   * Preload critical fonts
   */
  preloadCriticalFonts() {
    const criticalFonts = this.fonts.filter(font => 
      font.weight === '400' || font.weight === '500'
    );
    
    return Promise.allSettled(
      criticalFonts.map(font => this.loadFont(font))
    );
  }
}
