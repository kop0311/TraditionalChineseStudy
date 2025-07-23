async function globalTeardown(config) {
  console.log('🧹 Starting E2E test global teardown...');
  
  // Clean up test data if needed
  // This could include database cleanup, file cleanup, etc.
  
  console.log('✅ E2E test global teardown completed');
}

module.exports = globalTeardown;
