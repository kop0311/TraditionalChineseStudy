import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const loginErrorRate = new Rate('login_errors');
const loginDuration = new Trend('login_duration');

// Load test accounts from CSV
const testAccounts = new SharedArray('test_accounts', function () {
  return open('./test-accounts.csv')
    .split('\n')
    .slice(1) // Skip header
    .map(line => {
      const [email, password] = line.split(',');
      return { email: email.trim(), password: password.trim() };
    })
    .filter(account => account.email && account.password);
});

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up to 20 users
    { duration: '1m', target: 50 },    // Stay at 50 users
    { duration: '2m', target: 100 },   // Ramp up to 100 users (100 RPS)
    { duration: '5m', target: 100 },   // Stay at 100 users for 5 minutes
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests must complete below 200ms
    login_errors: ['rate<0.01'],      // Error rate must be below 1%
    login_duration: ['p(95)<200'],    // 95% of login requests below 200ms
  },
};

export default function () {
  // Select random test account
  const account = testAccounts[Math.floor(Math.random() * testAccounts.length)];
  
  const payload = JSON.stringify({
    email: account.email,
    password: account.password,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: '10s',
  };

  // Perform login request
  const loginStart = Date.now();
  const response = http.post('http://localhost:9005/api/auth/login', payload, params);
  const loginEnd = Date.now();
  
  // Record custom metrics
  loginDuration.add(loginEnd - loginStart);

  // Validate response
  const isSuccess = check(response, {
    'login status is 200': (r) => r.status === 200,
    'login response has token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.token && body.token.length > 0;
      } catch (e) {
        return false;
      }
    },
    'login response time < 200ms': (r) => r.timings.duration < 200,
    'login response has user_id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.user_id && body.user_id.length > 0;
      } catch (e) {
        return false;
      }
    },
    'login response has expires_at': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.expires_at && new Date(body.expires_at) > new Date();
      } catch (e) {
        return false;
      }
    },
  });

  // Record error rate
  loginErrorRate.add(!isSuccess);

  // If login successful, test token refresh
  if (isSuccess && response.status === 200) {
    try {
      const loginData = JSON.parse(response.body);
      const token = loginData.token;

      // Test token refresh endpoint
      const refreshParams = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: '5s',
      };

      const refreshResponse = http.post('http://localhost:9005/api/auth/refresh', '', refreshParams);
      
      check(refreshResponse, {
        'refresh status is 200': (r) => r.status === 200,
        'refresh response has new token': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.token && body.token !== token; // New token should be different
          } catch (e) {
            return false;
          }
        },
        'refresh response time < 100ms': (r) => r.timings.duration < 100,
      });

      // Test protected endpoint with token
      const charactersParams = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        timeout: '5s',
      };

      const charactersResponse = http.get('http://localhost:9005/api/characters?limit=5', charactersParams);
      
      check(charactersResponse, {
        'characters endpoint accessible': (r) => r.status === 200,
        'characters response time < 150ms': (r) => r.timings.duration < 150,
        'characters response has data': (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.data && Array.isArray(body.data);
          } catch (e) {
            return false;
          }
        },
      });

    } catch (e) {
      console.error('Error testing authenticated endpoints:', e);
    }
  }

  // Simulate user think time
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

// Setup function - runs once before the test
export function setup() {
  console.log('🚀 Starting Traditional Chinese API Performance Test');
  console.log(`📊 Testing with ${testAccounts.length} test accounts`);
  
  // Verify API is accessible
  const healthCheck = http.get('http://localhost:9005/health');
  if (healthCheck.status !== 200) {
    throw new Error('API health check failed - ensure the server is running');
  }
  
  console.log('✅ API health check passed');
  return { startTime: Date.now() };
}

// Teardown function - runs once after the test
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`🏁 Performance test completed in ${duration.toFixed(2)} seconds`);
}

// Handle summary - custom test result formatting
export function handleSummary(data) {
  const summary = {
    'Test Summary': {
      'Total Requests': data.metrics.http_reqs.values.count,
      'Failed Requests': data.metrics.http_req_failed.values.rate * 100 + '%',
      'Average Response Time': data.metrics.http_req_duration.values.avg.toFixed(2) + 'ms',
      'P95 Response Time': data.metrics.http_req_duration.values['p(95)'].toFixed(2) + 'ms',
      'Login Error Rate': (data.metrics.login_errors?.values.rate * 100 || 0).toFixed(2) + '%',
      'Average Login Duration': (data.metrics.login_duration?.values.avg || 0).toFixed(2) + 'ms',
    },
    'Performance Thresholds': {
      'P95 < 200ms': data.metrics.http_req_duration.values['p(95)'] < 200 ? '✅ PASS' : '❌ FAIL',
      'Error Rate < 1%': (data.metrics.login_errors?.values.rate || 0) < 0.01 ? '✅ PASS' : '❌ FAIL',
      'Login P95 < 200ms': (data.metrics.login_duration?.values['p(95)'] || 0) < 200 ? '✅ PASS' : '❌ FAIL',
    }
  };

  return {
    'stdout': JSON.stringify(summary, null, 2),
    'performance-report.json': JSON.stringify(data, null, 2),
  };
}
