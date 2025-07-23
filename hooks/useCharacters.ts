'use client';

import { use, useMemo, useState, useCallback } from 'react';
import { apiClient, handleApiError } from '../lib/api-client';
import { HanziCharacter, PaginatedResponse, CharacterQuery, ApiState } from '../types/api';

// Create a promise-based data fetcher for React 19's use hook
const createCharactersFetcher = (query?: CharacterQuery) => {
  return apiClient.withRetry(() => apiClient.getCharacters(query))
    .then(response => response.data)
    .catch(error => {
      throw new Error(handleApiError(error));
    });
};

// Custom hook using React 19's use hook
export function useCharacters(query?: CharacterQuery) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create a stable promise based on query parameters
  const charactersPromise = useMemo(() => {
    setIsLoading(true);
    setError(null);
    
    return createCharactersFetcher(query)
      .then(data => {
        setIsLoading(false);
        return data;
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
        throw err;
      });
  }, [
    query?.level,
    query?.stroke_count,
    query?.search,
    query?.page,
    query?.limit
  ]);

  // Use React 19's use hook to suspend until data is ready
  let data: PaginatedResponse<HanziCharacter> | null = null;
  
  try {
    data = use(charactersPromise);
  } catch (err) {
    // Error will be caught by error boundary
    console.error('Characters fetch error:', err);
  }

  const refetch = useCallback(() => {
    setError(null);
    setIsLoading(true);
    // Force re-creation of promise by updating a dependency
    return createCharactersFetcher(query);
  }, [query]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// Hook for single character
export function useCharacter(id: number) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const characterPromise = useMemo(() => {
    setIsLoading(true);
    setError(null);
    
    return apiClient.withRetry(() => apiClient.getCharacterById(id))
      .then(response => {
        setIsLoading(false);
        return response.data;
      })
      .catch(err => {
        setError(handleApiError(err));
        setIsLoading(false);
        throw err;
      });
  }, [id]);

  let data: HanziCharacter | null = null;
  
  try {
    data = use(characterPromise);
  } catch (err) {
    console.error('Character fetch error:', err);
  }

  const refetch = useCallback(() => {
    setError(null);
    setIsLoading(true);
    return apiClient.getCharacterById(id).then(response => response.data);
  }, [id]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

// Traditional hook approach for comparison/fallback
export function useCharactersTraditional(query?: CharacterQuery): ApiState<PaginatedResponse<HanziCharacter>> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiState<PaginatedResponse<HanziCharacter>>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchCharacters = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.withRetry(() => apiClient.getCharacters(query));
      setState({
        data: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: handleApiError(error),
      });
    }
  }, [query?.level, query?.stroke_count, query?.search, query?.page, query?.limit]);

  // Fetch data on mount and when query changes
  useMemo(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  return {
    ...state,
    refetch: fetchCharacters,
  };
}
