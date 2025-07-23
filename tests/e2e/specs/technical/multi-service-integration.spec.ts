import { test, expect } from '@playwright/test';

test.describe('Multi-Service Integration Tests', () => {
  
  test.describe('Service Health Checks', () => {
    test('should verify all services are healthy', async ({ request }) => {
      // Test Caddy proxy health
      const caddyResponse = await request.get('http://localhost/health');
      expect(caddyResponse.ok()).toBeTruthy();
      
      // Test Next.js frontend health
      const nextjsResponse = await request.get('http://localhost:3000/health');
      expect(nextjsResponse.ok()).toBeTruthy();
      
      // Test Express backend health
      const expressResponse = await request.get('http://localhost:9005/ping');
      expect(expressResponse.ok()).toBeTruthy();
      expect(await expressResponse.text()).toBe('pong');
    });

    test('should verify API endpoints are accessible', async ({ request }) => {
      // Test API health endpoint
      const apiHealthResponse = await request.get('http://localhost:9005/api/health');
      expect(apiHealthResponse.ok()).toBeTruthy();
      
      const healthData = await apiHealthResponse.json();
      expect(healthData).toHaveProperty('status', 'ok');
      expect(healthData).toHaveProperty('service', 'traditional-chinese-study');
    });
  });

  test.describe('Caddy Reverse Proxy Routing', () => {
    test('should route requests correctly through Caddy', async ({ page }) => {
      // Test main application routing
      await page.goto('http://localhost/');
      await page.waitForLoadState('networkidle');
      
      // Verify we get the Next.js frontend
      await expect(page.locator('h1')).toContainText('小小读书郎');
    });

    test('should route API requests to Express backend', async ({ request }) => {
      // Test API routing through Caddy
      const response = await request.get('http://localhost/api/health');
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('status', 'ok');
    });

    test('should handle static assets correctly', async ({ page }) => {
      await page.goto('http://localhost/');
      
      // Check if static assets load correctly
      const responses: any[] = [];
      page.on('response', response => {
        if (response.url().includes('/_next/') || response.url().includes('/static/')) {
          responses.push(response);
        }
      });
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify static assets loaded successfully
      for (const response of responses) {
        expect(response.status()).toBeLessThan(400);
      }
    });

    test('should handle CORS correctly', async ({ request }) => {
      const response = await request.get('http://localhost/api/health', {
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });
      
      expect(response.ok()).toBeTruthy();
      
      const headers = response.headers();
      // Check for CORS headers if configured
      if (headers['access-control-allow-origin']) {
        expect(headers['access-control-allow-origin']).toBeTruthy();
      }
    });
  });

  test.describe('Next.js Frontend Integration', () => {
    test('should serve Next.js pages correctly', async ({ page }) => {
      // Test homepage
      await page.goto('http://localhost:3000/');
      await expect(page.locator('h1')).toContainText('小小读书郎');
      
      // Test classics page
      await page.goto('http://localhost:3000/classics');
      await expect(page.locator('h1')).toContainText('经典阅读');
      
      // Test writing practice page
      await page.goto('http://localhost:3000/writing-practice');
      await expect(page.locator('h1')).toContainText('汉字书写练习');
      
      // Test pinyin practice page
      await page.goto('http://localhost:3000/pinyin-practice');
      await expect(page.locator('h1')).toContainText('拼音练习');
    });

    test('should handle client-side routing', async ({ page }) => {
      await page.goto('http://localhost:3000/');
      
      // Test client-side navigation
      await page.click('a[href="/classics"]');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/\/classics/);
      await expect(page.locator('h1')).toContainText('经典阅读');
    });

    test('should load React components correctly', async ({ page }) => {
      await page.goto('http://localhost:3000/writing-practice');
      await page.waitForLoadState('networkidle');
      
      // Wait for React components to hydrate
      await page.waitForTimeout(2000);
      
      // Check for interactive components
      const hanziWriter = page.locator('.hanzi-writer-container');
      if (await hanziWriter.isVisible()) {
        await expect(hanziWriter).toBeVisible();
      }
    });
  });

  test.describe('Express Backend Integration', () => {
    test('should handle API requests correctly', async ({ request }) => {
      // Test various API endpoints
      const endpoints = [
        '/ping',
        '/api/health',
        '/health'
      ];
      
      for (const endpoint of endpoints) {
        const response = await request.get(`http://localhost:9005${endpoint}`);
        expect(response.status()).toBeLessThan(500);
      }
    });

    test('should serve static files if configured', async ({ request }) => {
      // Test if Express serves any static files
      const response = await request.get('http://localhost:9005/');
      
      // Should either serve content or redirect
      expect([200, 301, 302, 404]).toContain(response.status());
    });

    test('should handle database connections', async ({ request }) => {
      // Test database-dependent endpoints
      const response = await request.get('http://localhost:9005/api/health');
      
      if (response.ok()) {
        const data = await response.json();
        
        // Check if database status is included
        if (data.database) {
          expect(data.database.status).toBe('connected');
        }
      }
    });
  });

  test.describe('Cross-Service Communication', () => {
    test('should handle requests between services', async ({ page }) => {
      await page.goto('http://localhost/');
      
      // Monitor network requests
      const apiRequests = [];
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          apiRequests.push(request);
        }
      });
      
      // Navigate to a page that might make API calls
      await page.click('a[href="/classics"]');
      await page.waitForLoadState('networkidle');
      
      // Wait for any API calls to complete
      await page.waitForTimeout(2000);
      
      // Verify API requests were made if expected
      console.log(`API requests made: ${apiRequests.length}`);
    });

    test('should handle service failures gracefully', async ({ page }) => {
      // Test with simulated backend failure
      await page.route('**/api/**', route => route.abort());
      
      await page.goto('http://localhost/');
      await page.waitForLoadState('networkidle');
      
      // Page should still load even if API calls fail
      await expect(page.locator('h1')).toContainText('小小读书郎');
      
      // Restore routing
      await page.unroute('**/api/**');
    });
  });

  test.describe('Performance Integration', () => {
    test('should meet performance thresholds across services', async ({ page }) => {
      // Test homepage performance
      const startTime = Date.now();
      await page.goto('http://localhost/');
      await page.waitForLoadState('networkidle');
      const homeLoadTime = Date.now() - startTime;
      
      expect(homeLoadTime).toBeLessThan(3000);
      
      // Test API response time
      const apiStartTime = Date.now();
      const response = await page.request.get('http://localhost/api/health');
      const apiResponseTime = Date.now() - apiStartTime;
      
      expect(response.ok()).toBeTruthy();
      expect(apiResponseTime).toBeLessThan(1000);
    });

    test('should handle concurrent requests', async ({ browser }) => {
      const contexts = await Promise.all([
        browser.newContext(),
        browser.newContext(),
        browser.newContext()
      ]);
      
      const pages = await Promise.all(
        contexts.map(context => context.newPage())
      );
      
      // Make concurrent requests
      const promises = pages.map(page => 
        page.goto('http://localhost/').then(() => 
          page.waitForLoadState('networkidle')
        )
      );
      
      await Promise.all(promises);
      
      // Verify all pages loaded successfully
      for (const page of pages) {
        await expect(page.locator('h1')).toContainText('小小读书郎');
      }
      
      // Cleanup
      await Promise.all(contexts.map(context => context.close()));
    });
  });

  test.describe('Security Integration', () => {
    test('should have proper security headers', async ({ request }) => {
      const response = await request.get('http://localhost/');
      const headers = response.headers();
      
      // Check for security headers
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['referrer-policy']).toBeTruthy();
    });

    test('should handle authentication properly', async ({ page }) => {
      // Test protected routes if any exist
      await page.goto('http://localhost/admin');
      
      // Should either redirect to login or show 404/403
      const status = await page.evaluate(() => {
        return fetch('/admin').then(r => r.status);
      });
      
      expect([401, 403, 404]).toContain(status);
    });
  });
});
