const request = require('supertest');
const app = require('../../app');

describe('API Integration Tests', () => {
  describe('GET /api/classics', () => {
    test('should return list of classics', async () => {
      const response = await request(app)
        .get('/api/classics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBe('/api/classics');
    });

    test('should respect rate limiting', async () => {
      // Make multiple requests to test rate limiting
      const promises = Array(105).fill().map(() => 
        request(app).get('/api/classics')
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited (429 status)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/chapters/:classicSlug', () => {
    test('should return chapters for valid classic', async () => {
      // First get a list of classics to get a valid slug
      const classicsResponse = await request(app)
        .get('/api/classics')
        .expect(200);

      if (classicsResponse.body.data.length > 0) {
        const slug = classicsResponse.body.data[0].slug;
        
        const response = await request(app)
          .get(`/api/chapters/${slug}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    test('should return 404 for invalid classic slug', async () => {
      const response = await request(app)
        .get('/api/chapters/nonexistent-classic')
        .expect(404);

      expect(response.body.error).toBeDefined();
    });

    test('should validate slug parameter', async () => {
      const response = await request(app)
        .get('/api/chapters/invalid-slug-with-spaces')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/sentences/:chapterId', () => {
    test('should validate chapter ID parameter', async () => {
      const response = await request(app)
        .get('/api/sentences/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should return sentences for valid chapter ID', async () => {
      const response = await request(app)
        .get('/api/sentences/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/characters', () => {
    test('should validate character input', async () => {
      const response = await request(app)
        .post('/api/characters')
        .send({ character: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should reject multiple characters', async () => {
      const response = await request(app)
        .post('/api/characters')
        .send({ character: '学习' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('should return character data for valid character', async () => {
      const response = await request(app)
        .post('/api/characters')
        .send({ character: '学' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('should return 404 for character not found', async () => {
      const response = await request(app)
        .post('/api/characters')
        .send({ character: '㈰' }) // Unusual character unlikely to be in database
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('API Response Structure', () => {
    test('should have consistent response structure', async () => {
      const response = await request(app)
        .get('/api/classics')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        timestamp: expect.any(String),
        path: '/api/classics'
      });
    });

    test('should handle errors consistently', async () => {
      const response = await request(app)
        .get('/api/chapters/nonexistent')
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/classics');

      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 routes gracefully', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint')
        .expect(404);

      expect(response.body.error).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    test('should handle method not allowed', async () => {
      const response = await request(app)
        .delete('/api/classics')
        .expect(404); // Express returns 404 for unmatched routes

      expect(response.body.error).toBeDefined();
    });
  });
});