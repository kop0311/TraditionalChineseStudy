// API Response Types - Updated to match backend schema
export interface HanziCharacter {
  id: number;
  character: string;
  pinyin: string;
  meaning: string;
  stroke_count: number;
  level: number;
  created_at: string;
}

// Legacy compatibility type (for existing components)
export interface HanziData extends HanziCharacter {
  // Ensure backward compatibility
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user_id: string;
  email: string;
  expires_at: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  code: number;
}

export interface CharacterQuery {
  level?: number;
  stroke_count?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Comment {
  id: number;
  text: string;
  user_id: string;
  created_at: string;
}

export interface NewComment {
  text: string;
  user_id: string;
}

// API Client Configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

// Loading and Error States
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Character Animation Types
export interface StrokeData {
  id: number;
  path: string;
  order: number;
}

export interface CharacterAnimationData {
  character: string;
  strokes: StrokeData[];
  medians: number[][][];
}
