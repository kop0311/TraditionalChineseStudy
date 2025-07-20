const request = require('supertest');
const app = require('../../app');
const { User } = require('../../models');

describe('Authentication Integration Tests', () => {
  // Helper function to get CSRF token
  const getCSRFToken = async (agent, path) => {
    const response = await agent.get(path);
    const html = response.text;
    const match = html.match(/name="_csrf".*?value="([^"]+)"/);
    return match ? match[1] : null;
  };

  describe('POST /auth/register', () => {
    test('should register new user with valid data', async () => {
      const agent = request.agent(app);
      const csrfToken = await getCSRFToken(agent, '/auth/register');

      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        name: 'Test User',
        phone: '13800138000',
        _csrf: csrfToken
      };

      const response = await agent
        .post('/auth/register')
        .send(userData)
        .expect(302); // Redirect on success

      expect(response.headers.location).toContain('/dashboard');
    });

    test('should reject registration without CSRF token', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(403);

      expect(response.body.error).toBe('Invalid CSRF token');
    });

    test('should reject weak passwords', async () => {
      const agent = request.agent(app);
      const csrfToken = await getCSRFToken(agent, '/auth/register');

      const userData = {
        email: 'test@example.com',
        password: '123', // Weak password
        confirmPassword: '123',
        name: 'Test User',
        _csrf: csrfToken
      };

      const response = await agent
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.details).toContain('Password must be at least 8 characters with uppercase, lowercase, number and special character');
    });

    test('should reject invalid email addresses', async () => {
      const agent = request.agent(app);
      const csrfToken = await getCSRFToken(agent, '/auth/register');

      const userData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        name: 'Test User',
        _csrf: csrfToken
      };

      const response = await agent
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.details).toContain('Valid email is required');
    });

    test('should respect rate limiting', async () => {
      const agent = request.agent(app);
      
      // Make multiple registration attempts
      const promises = Array(6).fill().map(async (_, index) => {
        const csrfToken = await getCSRFToken(agent, '/auth/register');
        return agent
          .post('/auth/register')
          .send({
            email: `test${index}@example.com`,
            password: 'SecurePass123!',
            confirmPassword: 'SecurePass123!',
            name: 'Test User',
            _csrf: csrfToken
          });
      });

      const responses = await Promise.all(promises);
      
      // After 5 attempts, should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      // Create a test user for login tests
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash('TestPassword123!', 12);
      
      await User.create({
        email: 'logintest@example.com',
        password_hash: passwordHash,
        name: 'Login Test User',
        role: 'parent'
      });
    });

    test('should login with valid credentials', async () => {
      const agent = request.agent(app);
      const csrfToken = await getCSRFToken(agent, '/auth/login');

      const response = await agent
        .post('/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'TestPassword123!',
          _csrf: csrfToken
        })
        .expect(302);

      expect(response.headers.location).toContain('/dashboard');
    });

    test('should reject login without CSRF token', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'TestPassword123!'
        })
        .expect(403);

      expect(response.body.error).toBe('Invalid CSRF token');
    });

    test('should reject invalid credentials', async () => {
      const agent = request.agent(app);
      const csrfToken = await getCSRFToken(agent, '/auth/login');

      const response = await agent
        .post('/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'WrongPassword',
          _csrf: csrfToken
        })
        .expect(302);

      expect(response.headers.location).toContain('error=invalid_credentials');
    });

    test('should reject non-existent user', async () => {
      const agent = request.agent(app);
      const csrfToken = await getCSRFToken(agent, '/auth/login');

      const response = await agent
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!',
          _csrf: csrfToken
        })
        .expect(302);

      expect(response.headers.location).toContain('error=invalid_credentials');
    });

    test('should validate email format', async () => {
      const agent = request.agent(app);
      const csrfToken = await getCSRFToken(agent, '/auth/login');

      const response = await agent
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!',
          _csrf: csrfToken
        })
        .expect(400);

      expect(response.body.details).toContain('Valid email is required');
    });

    test('should respect rate limiting', async () => {
      const agent = request.agent(app);
      
      // Make multiple failed login attempts
      const promises = Array(6).fill().map(async () => {
        const csrfToken = await getCSRFToken(agent, '/auth/login');
        return agent
          .post('/auth/login')
          .send({
            email: 'logintest@example.com',
            password: 'WrongPassword',
            _csrf: csrfToken
          });
      });

      const responses = await Promise.all(promises);
      
      // After 5 attempts, should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('POST /auth/logout', () => {
    test('should logout successfully with CSRF token', async () => {
      const agent = request.agent(app);
      
      // First login
      const loginCSRF = await getCSRFToken(agent, '/auth/login');
      await agent
        .post('/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'TestPassword123!',
          _csrf: loginCSRF
        })
        .expect(302);

      // Then logout
      const logoutCSRF = await getCSRFToken(agent, '/dashboard');
      const response = await agent
        .post('/auth/logout')
        .send({ _csrf: logoutCSRF })
        .expect(302);

      expect(response.headers.location).toBe('/');
    });

    test('should reject logout without CSRF token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(403);

      expect(response.body.error).toBe('Invalid CSRF token');
    });
  });

  describe('Session Management', () => {
    test('should maintain session across requests', async () => {
      const agent = request.agent(app);
      
      // Login
      const csrfToken = await getCSRFToken(agent, '/auth/login');
      await agent
        .post('/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'TestPassword123!',
          _csrf: csrfToken
        })
        .expect(302);

      // Access protected route
      const response = await agent
        .get('/dashboard')
        .expect(200);

      expect(response.text).toContain('小小读书郎');
    });

    test('should redirect unauthenticated users', async () => {
      const response = await request(app)
        .get('/dashboard')
        .expect(302);

      expect(response.headers.location).toContain('/auth/login');
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.destroy({
      where: {
        email: 'logintest@example.com'
      }
    });
  });
});