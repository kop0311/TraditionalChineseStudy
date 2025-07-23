import { FullConfig } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for Traditional Chinese Study E2E tests...');

  try {
    // Clean up test data
    await cleanupTestData();
    
    // Generate test report summary
    await generateTestSummary();
    
    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
  }
}

async function cleanupTestData() {
  console.log('🗑️ Cleaning up test data...');
  
  try {
    // Clean up test-specific data via API
    const response = await fetch('http://localhost:9005/api/test/cleanup', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('✅ Test data cleaned up via API');
    } else {
      console.warn('⚠️ Could not clean up test data via API');
    }
  } catch (error) {
    console.warn('⚠️ Test cleanup API not available:', error instanceof Error ? error.message : String(error));
  }
}

async function generateTestSummary() {
  console.log('📊 Generating test summary...');
  
  try {
    // Read test results if available
    const fs = require('fs');
    const path = require('path');
    
    const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');
    
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      
      const summary = {
        totalTests: results.stats?.total || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0,
        duration: results.stats?.duration || 0,
        timestamp: new Date().toISOString(),
      };
      
      console.log('📈 Test Summary:');
      console.log(`   Total Tests: ${summary.totalTests}`);
      console.log(`   Passed: ${summary.passed}`);
      console.log(`   Failed: ${summary.failed}`);
      console.log(`   Skipped: ${summary.skipped}`);
      console.log(`   Duration: ${Math.round(summary.duration / 1000)}s`);
      
      // Save summary for CI/CD
      const summaryPath = path.join(process.cwd(), 'test-results', 'summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      
      console.log(`✅ Test summary saved to ${summaryPath}`);
    }
  } catch (error) {
    console.warn('⚠️ Could not generate test summary:', error instanceof Error ? error.message : String(error));
  }
}

export default globalTeardown;
