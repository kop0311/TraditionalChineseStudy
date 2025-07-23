/**
 * 小小读书郎 - 现代化前端应用入口
 * Modern Frontend Application Entry Point
 */

// Import CSS
import '../css/main.css';

// Import utilities and modules
import { FontLoader } from './utils/font-loader.js';
import { PerformanceMonitor } from './utils/performance-monitor.js';
import { ErrorHandler } from './utils/error-handler.js';
import { ServiceWorkerManager } from './utils/service-worker.js';

/**
 * Application class for managing the entire frontend
 */
class App {
  constructor() {
    this.isInitialized = false;
    this.modules = new Map();
    this.config = {
      debug: __DEV__,
      version: '2.0.0',
      apiBaseUrl: '/api',
    };
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🚀 Initializing 小小读书郎 App v' + this.config.version);

      // Initialize core services
      await this.initCoreServices();

      // Initialize page-specific modules
      await this.initPageModules();

      // Setup global event listeners
      this.setupGlobalEventListeners();

      // Mark as initialized
      this.isInitialized = true;

      console.log('✅ App initialized successfully');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      ErrorHandler.handleError(error);
    }
  }

  /**
   * Initialize core services
   */
  async initCoreServices() {
    // Initialize font loader
    const fontLoader = new FontLoader();
    await fontLoader.loadFonts();

    // Initialize performance monitoring
    if (this.config.debug) {
      const perfMonitor = new PerformanceMonitor();
      perfMonitor.start();
    }

    // Initialize service worker
    if ('serviceWorker' in navigator && !this.config.debug) {
      const swManager = new ServiceWorkerManager();
      await swManager.register();
    }

    // Initialize error handling
    ErrorHandler.init();
  }

  /**
   * Initialize page-specific modules based on current page
   */
  async initPageModules() {
    const currentPage = this.getCurrentPage();

    switch (currentPage) {
      case 'reader':
        await this.loadModule('reader', () => import('./modules/reader.js'));
        break;
      case 'writing-practice':
        await this.loadModule('writing-practice', () => import('./modules/writing-practice.js'));
        break;
      case 'pinyin-practice':
        await this.loadModule('pinyin-practice', () => import('./modules/pinyin-practice.js'));
        break;
      case 'admin':
        await this.loadModule('admin', () => import('./modules/admin.js'));
        break;
      default:
        await this.loadModule('home', () => import('./modules/home.js'));
    }
  }

  /**
   * Load a module dynamically
   */
  async loadModule(name, importFn) {
    try {
      const module = await importFn();
      const instance = new module.default();
      await instance.init();
      this.modules.set(name, instance);
      console.log(`📦 Module '${name}' loaded successfully`);
    } catch (error) {
      console.error(`❌ Failed to load module '${name}':`, error);
    }
  }

  /**
   * Get current page identifier
   */
  getCurrentPage() {
    const path = window.location.pathname;
    
    if (path.includes('/reader/')) return 'reader';
    if (path.includes('/writing-practice')) return 'writing-practice';
    if (path.includes('/pinyin-practice')) return 'pinyin-practice';
    if (path.includes('/admin')) return 'admin';
    
    return 'home';
  }

  /**
   * Setup global event listeners
   */
  setupGlobalEventListeners() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('📱 Page hidden');
      } else {
        console.log('📱 Page visible');
      }
    });

    // Handle online/offline status
    window.addEventListener('online', () => {
      console.log('🌐 Back online');
      this.showNotification('网络连接已恢复', 'success');
    });

    window.addEventListener('offline', () => {
      console.log('📴 Gone offline');
      this.showNotification('网络连接已断开', 'warning');
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      ErrorHandler.handleError(event.reason);
    });
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Get module instance
   */
  getModule(name) {
    return this.modules.get(name);
  }

  /**
   * Cleanup and destroy the app
   */
  destroy() {
    // Cleanup modules
    for (const [name, module] of this.modules) {
      if (module.destroy) {
        module.destroy();
      }
    }
    this.modules.clear();
    
    this.isInitialized = false;
    console.log('🧹 App destroyed');
  }
}

// Create global app instance
window.App = new App();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.App.init();
  });
} else {
  window.App.init();
}

// Export for module usage
export default App;
