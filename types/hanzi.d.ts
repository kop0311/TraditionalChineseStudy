// Traditional Chinese Study - Hanzi Type Definitions
// This file ensures type alignment between frontend and backend

declare namespace HanziTypes {
  // Main Hanzi character interface - matches Rust backend schema
  interface HanziCharacter {
    id: number;
    character: string;
    pinyin: string;
    meaning: string;
    stroke_count: number;
    level: number;
    created_at: string;
  }

  // Legacy compatibility - for existing components
  interface HanziData extends HanziCharacter {
    // All properties inherited from HanziCharacter
    // This ensures 'pinyin' property exists on type 'HanziData'
  }

  // Character query parameters
  interface CharacterQuery {
    level?: number;
    stroke_count?: number;
    search?: string;
    page?: number;
    limit?: number;
  }

  // Paginated response wrapper
  interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  }

  // Character animation data
  interface StrokeData {
    id: number;
    path: string;
    order: number;
  }

  interface CharacterAnimationData {
    character: string;
    strokes: StrokeData[];
    medians: number[][][];
  }

  // API response states
  interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
  }

  // Character learning progress
  interface LearningProgress {
    character_id: number;
    user_id: string;
    mastery_level: number; // 0-100
    practice_count: number;
    last_practiced: string;
    created_at: string;
    updated_at: string;
  }

  // Character practice session
  interface PracticeSession {
    id: number;
    user_id: string;
    character_id: number;
    strokes_completed: number;
    accuracy_score: number; // 0-100
    time_spent: number; // seconds
    completed_at: string;
  }
}

// Export types for use in components
export = HanziTypes;
export as namespace HanziTypes;

// Global type declarations for backward compatibility
declare global {
  // Ensure HanziData type is available globally
  interface HanziData extends HanziTypes.HanziCharacter {}
  
  // Character component props
  interface CharacterProps {
    character: HanziTypes.HanziCharacter;
    showPinyin?: boolean;
    showMeaning?: boolean;
    onClick?: (character: HanziTypes.HanziCharacter) => void;
  }

  // Character list component props
  interface CharacterListProps {
    characters: HanziTypes.HanziCharacter[];
    loading?: boolean;
    error?: string | null;
    onCharacterClick?: (character: HanziTypes.HanziCharacter) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
  }

  // Practice component props
  interface PracticeProps {
    character: HanziTypes.HanziCharacter;
    onComplete?: (session: HanziTypes.PracticeSession) => void;
    onSkip?: () => void;
    showHints?: boolean;
  }
}
