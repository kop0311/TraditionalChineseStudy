/**
 * Performance Monitor Utility
 * Tracks and reports performance metrics
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = true;
  }

  /**
   * Start performance monitoring
   */
  start() {
    if (!this.isEnabled) return;

    console.log('📊 Starting performance monitoring');

    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();

    // Monitor resource loading
    this.monitorResourceLoading();

    // Monitor navigation timing
    this.monitorNavigationTiming();

    // Monitor memory usage
    this.monitorMemoryUsage();

    // Setup periodic reporting
    this.setupPeriodicReporting();
  }

  /**
   * Monitor Core Web Vitals (LCP, FID, CLS)
   */
  monitorCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        console.warn('LCP monitoring not supported');
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        console.warn('FID monitoring not supported');
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordMetric('CLS', clsValue);
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        console.warn('CLS monitoring not supported');
      }
    }
  }

  /**
   * Monitor resource loading performance
   */
  monitorResourceLoading() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordResourceMetric(entry);
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (e) {
        console.warn('Resource monitoring not supported');
      }
    }
  }

  /**
   * Monitor navigation timing
   */
  monitorNavigationTiming() {
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordNavigationMetrics(entry);
        });
      });

      try {
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);
      } catch (e) {
        console.warn('Navigation monitoring not supported');
      }
    }
  }

  /**
   * Monitor memory usage
   */
  monitorMemoryUsage() {
    if ('memory' in performance) {
      const recordMemory = () => {
        const memory = performance.memory;
        this.recordMetric('memoryUsed', memory.usedJSHeapSize);
        this.recordMetric('memoryTotal', memory.totalJSHeapSize);
        this.recordMetric('memoryLimit', memory.jsHeapSizeLimit);
      };

      recordMemory();
      setInterval(recordMemory, 30000); // Every 30 seconds
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name, value, timestamp = Date.now()) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push({
      value,
      timestamp,
    });

    // Log significant metrics
    if (['LCP', 'FID', 'CLS'].includes(name)) {
      console.log(`📊 ${name}: ${value.toFixed(2)}${this.getMetricUnit(name)}`);
    }
  }

  /**
   * Record resource loading metrics
   */
  recordResourceMetric(entry) {
    const resourceType = entry.initiatorType || 'other';
    const loadTime = entry.responseEnd - entry.startTime;
    
    this.recordMetric(`resource_${resourceType}_loadTime`, loadTime);
    this.recordMetric(`resource_${resourceType}_size`, entry.transferSize || 0);
  }

  /**
   * Record navigation metrics
   */
  recordNavigationMetrics(entry) {
    const metrics = {
      'nav_domContentLoaded': entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      'nav_loadComplete': entry.loadEventEnd - entry.loadEventStart,
      'nav_firstPaint': entry.responseEnd - entry.requestStart,
      'nav_domInteractive': entry.domInteractive - entry.navigationStart,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      this.recordMetric(name, value);
    });
  }

  /**
   * Get metric unit
   */
  getMetricUnit(metricName) {
    const units = {
      'LCP': 'ms',
      'FID': 'ms',
      'CLS': '',
      'memoryUsed': 'bytes',
      'memoryTotal': 'bytes',
      'memoryLimit': 'bytes',
    };
    
    return units[metricName] || 'ms';
  }

  /**
   * Get performance report
   */
  getReport() {
    const report = {
      timestamp: Date.now(),
      metrics: {},
      summary: {},
    };

    // Process metrics
    for (const [name, values] of this.metrics) {
      const latestValue = values[values.length - 1];
      report.metrics[name] = {
        current: latestValue.value,
        count: values.length,
        average: values.reduce((sum, v) => sum + v.value, 0) / values.length,
      };
    }

    // Generate summary
    report.summary = this.generateSummary(report.metrics);

    return report;
  }

  /**
   * Generate performance summary
   */
  generateSummary(metrics) {
    const summary = {
      score: 100,
      issues: [],
      recommendations: [],
    };

    // Check LCP (should be < 2.5s)
    if (metrics.LCP && metrics.LCP.current > 2500) {
      summary.score -= 20;
      summary.issues.push('Large Contentful Paint is slow');
      summary.recommendations.push('Optimize images and critical resources');
    }

    // Check FID (should be < 100ms)
    if (metrics.FID && metrics.FID.current > 100) {
      summary.score -= 15;
      summary.issues.push('First Input Delay is high');
      summary.recommendations.push('Reduce JavaScript execution time');
    }

    // Check CLS (should be < 0.1)
    if (metrics.CLS && metrics.CLS.current > 0.1) {
      summary.score -= 15;
      summary.issues.push('Cumulative Layout Shift is high');
      summary.recommendations.push('Reserve space for dynamic content');
    }

    return summary;
  }

  /**
   * Setup periodic reporting
   */
  setupPeriodicReporting() {
    setInterval(() => {
      const report = this.getReport();
      console.log('📊 Performance Report:', report.summary);
    }, 60000); // Every minute
  }

  /**
   * Stop monitoring
   */
  stop() {
    for (const [name, observer] of this.observers) {
      observer.disconnect();
    }
    this.observers.clear();
    console.log('📊 Performance monitoring stopped');
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics.clear();
  }
}
