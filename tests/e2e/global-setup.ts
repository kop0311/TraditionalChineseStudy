import { chromium, FullConfig } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for Traditional Chinese Study E2E tests...');

  // Wait for services to be healthy
  await waitForServices();
  
  // Seed test data
  await seedTestData();
  
  // Create authentication state
  await createAuthState();
  
  console.log('✅ Global setup completed successfully');
}

async function waitForServices() {
  console.log('⏳ Waiting for services to be healthy...');
  
  const services = [
    { name: 'Caddy Proxy', url: 'http://localhost/health', timeout: 120000 },
    { name: 'Next.js Frontend', url: 'http://localhost:3000/health', timeout: 60000 },
    { name: 'Express Backend', url: 'http://localhost:9005/ping', timeout: 60000 },
  ];

  for (const service of services) {
    await waitForService(service.name, service.url, service.timeout);
  }
}

async function waitForService(name: string, url: string, timeout: number) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`✅ ${name} is healthy`);
        return;
      }
    } catch (error) {
      // Service not ready yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error(`❌ ${name} failed to become healthy within ${timeout}ms`);
}

async function seedTestData() {
  console.log('🌱 Seeding test data...');
  
  try {
    // Run database migrations and seeding
    await execAsync('npm run migrate');
    await execAsync('npm run seed');
    
    // Add specific test data
    await addTestData();
    
    console.log('✅ Test data seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed test data:', error);
    throw error;
  }
}

async function addTestData() {
  // Add test-specific data via API calls
  const testData = {
    testUser: {
      username: 'test_user',
      email: 'test@example.com',
      password: 'test123456'
    },
    testProgress: {
      classics_read: 2,
      characters_practiced: 50,
      pinyin_exercises: 25
    }
  };

  try {
    // Create test user via API
    const response = await fetch('http://localhost:9005/api/test/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      console.warn('⚠️ Test data API not available, using default data');
    }
  } catch (error) {
    console.warn('⚠️ Could not create test data via API:', error instanceof Error ? error.message : String(error));
  }
}

async function createAuthState() {
  console.log('🔐 Creating authentication state...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the app
    await page.goto('http://localhost');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // For now, we'll just save the basic state
    // In a real app, you might need to log in here
    await page.context().storageState({ 
      path: 'tests/e2e/.auth/user.json' 
    });
    
    console.log('✅ Authentication state created');
  } catch (error) {
    console.error('❌ Failed to create auth state:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
