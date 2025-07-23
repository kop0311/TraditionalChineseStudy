# Traditional Chinese Study - API Integration Documentation

## 🚀 **Backend API Endpoints**

### **Base URL**
```
Development: http://localhost:9005
Production: https://api.traditional-chinese-study.com
```

### **Authentication Endpoints**

#### **POST /api/auth/login**
用户登录认证

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Method | POST | ✅ | HTTP Method |
| Content-Type | application/json | ✅ | Request Header |
| Body | LoginRequest | ✅ | JSON Payload |

**Request Body:**
```typescript
interface LoginRequest {
  email: string;      // Valid email format
  password: string;   // Minimum 6 characters
}
```

**Example Request:**
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'encrypted_string'
  })
});
```

**Response (200 OK):**
```typescript
interface LoginResponse {
  token: string;        // JWT token
  user_id: string;      // UUID
  email: string;        // User email
  expires_at: string;   // ISO 8601 timestamp
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Server error

---

#### **POST /api/auth/refresh**
刷新JWT令牌

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Method | POST | ✅ | HTTP Method |
| Authorization | Bearer {token} | ✅ | JWT Token Header |

**Example Request:**
```javascript
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${currentToken}`,
    'Content-Type': 'application/json',
  }
});
```

**Response:** Same as login response with new token

---

### **Character Endpoints**

#### **GET /api/characters**
获取汉字列表（分页）

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| level | number | ❌ | Filter by difficulty level (≥ value) |
| stroke_count | number | ❌ | Filter by exact stroke count |
| search | string | ❌ | Search in character/pinyin/meaning |
| page | number | ❌ | Page number (default: 1) |
| limit | number | ❌ | Items per page (default: 20, max: 100) |

**Example Request:**
```javascript
const response = await apiClient.getCharacters({
  level: 3,
  page: 1,
  limit: 20
});
```

**Response (200 OK):**
```typescript
interface PaginatedResponse<HanziCharacter> {
  data: HanziCharacter[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

interface HanziCharacter {
  id: number;
  character: string;
  pinyin: string;
  meaning: string;
  stroke_count: number;
  level: number;
  created_at: string;
}
```

---

#### **GET /api/characters/:id**
获取单个汉字详情

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | ✅ | Character ID |

**Example Request:**
```javascript
const response = await apiClient.getCharacterById(123);
```

**Response (200 OK):** Single `HanziCharacter` object

**Error Responses:**
- `404 Not Found` - Character not found
- `500 Internal Server Error` - Server error

---

### **Comment Endpoints**

#### **POST /api/comment**
创建评论（带输入验证）

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| text | string | ✅ | 1-200 characters |
| user_id | string | ✅ | Valid UUID |

**Example Request:**
```javascript
const response = await fetch('/api/comment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    text: '这个汉字很有趣！',
    user_id: 'user-uuid-here'
  })
});
```

**Response (201 Created):**
```json
{
  "message": "Comment created successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Missing/invalid token
- `500 Internal Server Error` - Server error

---

## 🎨 **Frontend API Client Implementation**

### **API Client Setup**

```typescript
// lib/api-client.ts
import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9005',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh
          try {
            const refreshResponse = await this.refreshToken();
            localStorage.setItem('auth_token', refreshResponse.data.token);
            // Retry original request
            return this.client(error.config);
          } catch (refreshError) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }
}

export const apiClient = new ApiClient();
```

### **React 19 Hook Usage**

```typescript
// hooks/useCharacters.ts
import { use, useMemo } from 'react';
import { apiClient } from '../lib/api-client';

export function useCharacters(query?: CharacterQuery) {
  const charactersPromise = useMemo(() => {
    return apiClient.getCharacters(query)
      .then(response => response.data);
  }, [query?.level, query?.page, query?.limit]);

  // Use React 19's use hook
  const data = use(charactersPromise);

  return { data };
}
```

### **Component Implementation**

```typescript
// components/CharacterList.tsx
import { Suspense } from 'react';
import { useCharacters } from '../hooks/useCharacters';
import { ErrorBoundary } from './ErrorBoundary';

function CharacterListContent({ level }: { level: number }) {
  const { data } = useCharacters({ level, limit: 20 });

  return (
    <div className="character-grid">
      {data.data.map(character => (
        <div key={character.id} className="character-card">
          <div className="hanzi-display">{character.character}</div>
          <div className="pinyin">{character.pinyin}</div>
          <div className="meaning">{character.meaning}</div>
        </div>
      ))}
    </div>
  );
}

export function CharacterList({ level }: { level: number }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<CharacterListSkeleton />}>
        <CharacterListContent level={level} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## 🔧 **Error Handling**

### **Error Response Format**

All API errors follow this consistent format:

```typescript
interface ErrorResponse {
  error: string;      // Error type
  message: string;    // Human-readable message
  code: number;       // HTTP status code
}
```

### **Frontend Error Handling**

```typescript
// lib/error-handler.ts
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const errorResponse = error.response?.data as ErrorResponse;
    return errorResponse?.message || 'Network error occurred';
  }
  return 'An unexpected error occurred';
};

// Usage in components
try {
  const response = await apiClient.getCharacters();
  setData(response.data);
} catch (error) {
  setError(handleApiError(error));
}
```

---

## 📊 **Performance Considerations**

### **Caching Strategy**

1. **Redis Caching**: API responses cached for 1 hour
2. **Browser Caching**: Static assets cached with proper headers
3. **Query Optimization**: Database queries optimized with indexes

### **Pagination Best Practices**

```typescript
// Efficient pagination
const getCharacters = async (page: number = 1, limit: number = 20) => {
  const response = await apiClient.getCharacters({
    page,
    limit: Math.min(limit, 100), // Enforce max limit
  });
  
  return {
    characters: response.data.data,
    pagination: {
      currentPage: response.data.page,
      totalPages: response.data.total_pages,
      totalItems: response.data.total,
      hasNextPage: response.data.page < response.data.total_pages,
      hasPrevPage: response.data.page > 1,
    }
  };
};
```

---

## 🧪 **Testing**

### **API Testing with k6**

```bash
# Run performance test
k6 run tests/performance/login-test.js

# Expected results:
# - Response time P95 < 200ms
# - Error rate < 1%
# - 100 RPS sustained load
```

### **Frontend Testing**

```typescript
// __tests__/api-client.test.ts
import { apiClient } from '../lib/api-client';

describe('API Client', () => {
  test('should fetch characters successfully', async () => {
    const response = await apiClient.getCharacters({ level: 1 });
    expect(response.data.data).toBeInstanceOf(Array);
    expect(response.data.page).toBe(1);
  });

  test('should handle authentication errors', async () => {
    // Mock 401 response
    expect(apiClient.login({ email: 'invalid', password: 'wrong' }))
      .rejects.toThrow('Invalid credentials');
  });
});
```

---

## 🔐 **Security**

### **Authentication Flow**

1. **Login**: POST credentials → Receive JWT token
2. **Store**: Save token in localStorage (consider httpOnly cookies for production)
3. **Use**: Include `Authorization: Bearer {token}` in requests
4. **Refresh**: Auto-refresh expired tokens
5. **Logout**: Clear token and redirect

### **Input Validation**

- **Backend**: Rust `validator` crate for server-side validation
- **Frontend**: TypeScript types + runtime validation
- **Database**: PostgreSQL constraints and indexes

---

## 📈 **Monitoring & Analytics**

### **Performance Metrics**

- Response time percentiles (P50, P95, P99)
- Error rates by endpoint
- Database query performance
- Redis cache hit rates

### **Error Tracking**

```typescript
// Sentry integration
import * as Sentry from '@sentry/nextjs';

Sentry.withScope((scope) => {
  scope.setTag('api_endpoint', '/api/characters');
  scope.setLevel('error');
  Sentry.captureException(error);
});
```

---

## 🚀 **Deployment**

### **Environment Variables**

```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
PORT=9005

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:9005
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### **Docker Setup**

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "9005:9005"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/traditional_chinese
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  frontend:
    build: ./
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:9005

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: traditional_chinese
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password

  redis:
    image: redis:7-alpine
```

---

## 📚 **Additional Resources**

- **API Documentation**: [Swagger/OpenAPI spec](./api-spec.yaml)
- **Database Schema**: [Schema documentation](./database-schema.md)
- **Performance Testing**: [k6 test results](./performance-reports/)
- **Error Monitoring**: [Sentry dashboard](https://sentry.io/your-project)

---

**Last Updated**: 2024-07-20  
**API Version**: v1.0.0  
**Status**: ✅ Production Ready
