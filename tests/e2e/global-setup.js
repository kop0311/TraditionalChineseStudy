const { chromium } = require('@playwright/test');

async function globalSetup(config) {
  console.log('🚀 Starting E2E test global setup...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = 'xiaoxiao_dushulang_e2e_test';
  process.env.SESSION_SECRET = 'e2e-test-session-secret';
  process.env.ADMIN_PASS = 'e2e-test-admin-password';
  
  // Wait for server to be ready
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for health check endpoint
    await page.goto(config.use.baseURL + '/health/ping', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    const response = await page.textContent('body');
    const healthData = JSON.parse(response);
    
    if (healthData.status !== 'ok') {
      throw new Error('Server health check failed');
    }
    
    console.log('✅ Server is ready for E2E tests');
  } catch (error) {
    console.error('❌ Server health check failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ E2E test global setup completed');
}

module.exports = globalSetup;
