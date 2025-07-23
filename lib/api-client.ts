import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { 
  HanziCharacter, 
  PaginatedResponse, 
  LoginRequest, 
  LoginResponse, 
  ErrorResponse,
  CharacterQuery,
  Comment,
  NewComment,
  ApiConfig 
} from '../types/api';

class ApiClient {
  private client: AxiosInstance;
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
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
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any; // Type assertion for _retry property

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshResponse = await this.refreshToken();
            localStorage.setItem('auth_token', refreshResponse.data.token);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AxiosResponse<LoginResponse>> {
    return this.client.post('/api/auth/login', credentials);
  }

  async refreshToken(): Promise<AxiosResponse<LoginResponse>> {
    return this.client.post('/api/auth/refresh');
  }

  // Character endpoints
  async getCharacters(query?: CharacterQuery): Promise<AxiosResponse<PaginatedResponse<HanziCharacter>>> {
    const params = new URLSearchParams();
    
    if (query?.level) params.append('level', query.level.toString());
    if (query?.stroke_count) params.append('stroke_count', query.stroke_count.toString());
    if (query?.search) params.append('search', query.search);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    return this.client.get(`/api/characters?${params.toString()}`);
  }

  async getCharacterById(id: number): Promise<AxiosResponse<HanziCharacter>> {
    return this.client.get(`/api/characters/${id}`);
  }

  // Comment endpoints
  async createComment(comment: NewComment): Promise<AxiosResponse<{ message: string }>> {
    return this.client.post('/api/comment', comment);
  }

  // Retry mechanism for failed requests
  async withRetry<T>(
    operation: () => Promise<AxiosResponse<T>>,
    retries: number = this.config.retries
  ): Promise<AxiosResponse<T>> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error as AxiosError)) {
        await this.delay(1000 * (this.config.retries - retries + 1));
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: AxiosError): boolean {
    return (
      !error.response ||
      error.response.status >= 500 ||
      error.response.status === 408 ||
      error.response.status === 429
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create API client instance
const apiConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9005',
  timeout: 10000,
  retries: 3,
};

export const apiClient = new ApiClient(apiConfig);

// Error handling utility
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const errorResponse = error.response?.data as ErrorResponse;
    return errorResponse?.message || error.message || 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};

// Type guards
export const isErrorResponse = (data: any): data is ErrorResponse => {
  return data && typeof data.error === 'string' && typeof data.message === 'string';
};
