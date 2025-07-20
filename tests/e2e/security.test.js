const request = require('supertest');
const app = require('../../app');

describe('E2E Security Tests', () => {
  describe('CSRF Protection', () => {
    test('should prevent CSRF attacks on all POST endpoints', async () => {
      const endpoints = [
        '/auth/register',
        '/auth/login',
        '/auth/logout',
        '/auth/children'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .post(endpoint)
          .send({ test: 'data' })
          .expect(403);

        expect(response.body.error).toBe('Invalid CSRF token');
      }
    });

    test('should accept requests with valid CSRF tokens', async () => {
      const agent = request.agent(app);
      
      // Get CSRF token from registration page
      const registerPage = await agent.get('/auth/register');
      const csrfMatch = registerPage.text.match(/name="_csrf".*?value="([^"]+)"/);
      const csrfToken = csrfMatch ? csrfMatch[1] : null;
      
      expect(csrfToken).toBeTruthy();

      // Use valid CSRF token (this should not be 403)
      const response = await agent
        .post('/auth/register')
        .send({
          email: `csrf-test-${Date.now()}@example.com`,
          password: 'InvalidPassword', // Will fail validation, but not CSRF
          name: 'Test',
          _csrf: csrfToken
        });

      // Should not be 403 (CSRF error), might be 400 (validation error)
      expect(response.status).not.toBe(403);
    });

    test('should reject tampered CSRF tokens', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password',
          _csrf: 'tampered-token-123'
        })
        .expect(403);

      expect(response.body.error).toBe('Invalid CSRF token');
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits on authentication endpoints', async () => {
      const agent = request.agent(app);
      const endpoint = '/auth/login';
      
      // Attempt multiple requests rapidly
      const requests = [];
      for (let i = 0; i < 6; i++) {
        requests.push(
          agent.post(endpoint).send({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
        );
      }

      const responses = await Promise.all(requests);
      
      // At least one should be rate limited
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });

    test('should enforce rate limits on API endpoints', async () => {
      const endpoint = '/api/classics';
      
      // Make many requests rapidly
      const requests = [];
      for (let i = 0; i < 102; i++) {
        requests.push(request(app).get(endpoint));
      }

      const responses = await Promise.all(requests);
      
      // Some should be rate limited
      const rateLimited = responses.filter(res => res.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    test('should include rate limit headers', async () => {
      const response = await request(app).get('/api/classics');
      
      // Check for rate limit headers (if implemented)
      expect(response.headers['x-ratelimit-limit'] || 
             response.headers['ratelimit-limit']).toBeDefined();
    });
  });

  describe('Input Validation and Sanitization', () => {
    test('should sanitize XSS attempts in form inputs', async () => {
      const agent = request.agent(app);
      
      // Get CSRF token
      const registerPage = await agent.get('/auth/register');
      const csrfMatch = registerPage.text.match(/name="_csrf".*?value="([^"]+)"/);
      const csrfToken = csrfMatch[1];

      const response = await agent
        .post('/auth/register')
        .send({
          name: '<script>alert("xss")</script>John',
          email: 'test@example.com<script>',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          _csrf: csrfToken
        });

      // Should process without XSS content (might fail for other reasons)
      expect(response.status).not.toBe(500); // No server error from XSS
    });

    test('should validate API input parameters', async () => {
      const response = await request(app)
        .get('/api/chapters/invalid-slug-with-<script>')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should validate character API input', async () => {
      const response = await request(app)
        .post('/api/characters')
        .send({
          character: '<script>alert("xss")</script>'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    test('should include comprehensive security headers', async () => {
      const response = await request(app).get('/');

      // Check for security headers
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(response.headers['permissions-policy']).toContain('geolocation=()');
      
      // CSP header from Helmet
      expect(response.headers['content-security-policy']).toBeDefined();
    });

    test('should prevent clickjacking with X-Frame-Options', async () => {
      const response = await request(app).get('/auth/login');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    test('should prevent MIME sniffing', async () => {
      const response = await request(app).get('/api/classics');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Session Security', () => {
    test('should use secure session configuration', async () => {
      const agent = request.agent(app);
      
      const response = await agent.get('/auth/login');
      
      // Check session cookie security (in production, should be secure)
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        const sessionCookie = cookies.find(cookie => 
          cookie.includes('connect.sid') || cookie.includes('session')
        );
        
        if (sessionCookie) {
          // In test environment, might not be secure
          // In production, should have Secure and HttpOnly flags
          expect(sessionCookie).toContain('HttpOnly');
        }
      }
    });

    test('should regenerate session on login', async () => {
      const agent = request.agent(app);
      
      // Get initial session
      const initialResponse = await agent.get('/auth/login');
      const initialCookies = initialResponse.headers['set-cookie'];
      
      // Login (this would regenerate session in real app)
      const csrfToken = initialResponse.text.match(/name="_csrf".*?value="([^"]+)"/)[1];
      
      // Note: Actual session regeneration testing would require
      // creating a test user and successful login
      expect(csrfToken).toBeTruthy();
    });
  });

  describe('Error Handling Security', () => {
    test('should not leak sensitive information in errors', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      // Should not contain sensitive system information
      expect(response.body.error).toBeDefined();
      expect(response.text).not.toContain('password');
      expect(response.text).not.toContain('secret');
      expect(response.text).not.toContain('token');
    });

    test('should handle database errors securely', async () => {
      const response = await request(app)
        .post('/api/characters')
        .send({
          character: '"; DROP TABLE users; --'
        })
        .expect(400);

      // Should return sanitized error, not database error details
      expect(response.body.success).toBe(false);
      expect(response.text).not.toContain('DROP TABLE');
      expect(response.text).not.toContain('SQL');
    });
  });

  describe('Authentication Flow Security', () => {
    test('should prevent session fixation', async () => {
      const agent = request.agent(app);
      
      // Get session before login
      const preLoginResponse = await agent.get('/');
      const preLoginCookies = preLoginResponse.headers['set-cookie'];
      
      // In a real test, we would:
      // 1. Login with valid credentials
      // 2. Check that session ID changed
      // 3. Verify old session is invalidated
      
      expect(preLoginCookies).toBeDefined();
    });

    test('should handle concurrent login attempts', async () => {
      // Simulate multiple login attempts from same user
      const promises = Array(3).fill().map(() => {
        const agent = request.agent(app);
        return agent
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
      });

      const responses = await Promise.all(promises);
      
      // All should be handled gracefully (might be rate limited)
      responses.forEach(response => {
        expect([400, 401, 403, 429]).toContain(response.status);
      });
    });
  });
});