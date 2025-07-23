// Database models and utilities for Supabase integration
// This provides TypeScript types and helper functions for database operations

import { supabase } from './database';

// Database table types
export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  active: boolean;
  email_verified: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Classic {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  dynasty: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  classic_id: string;
  number: number;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sentence {
  id: string;
  chapter_id: string;
  number: number;
  text: string;
  pinyin: string | null;
  translation: string | null;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  character: string;
  traditional: string | null;
  simplified: string | null;
  pinyin: string | null;
  meaning: string | null;
  etymology: string | null;
  radical: string | null;
  stroke_count: number | null;
  frequency_rank: number | null;
  hsk_level: number | null;
  created_at: string;
  updated_at: string;
}

// Database helper functions
export class DatabaseService {
  // User operations
  static async findUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) return null;
    return data;
  }

  static async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) return null;
    return data;
  }

  static async updateUserLastLogin(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
    
    return !error;
  }

  // Classic operations
  static async getAllClassics(): Promise<Classic[]> {
    const { data, error } = await supabase
      .from('classics')
      .select('*')
      .order('created_at');
    
    return data || [];
  }

  static async getClassicBySlug(slug: string): Promise<Classic | null> {
    const { data, error } = await supabase
      .from('classics')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) return null;
    return data;
  }
}

// Initialize database connection for Next.js API routes
export async function initializeDatabase() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('Supabase connection established successfully');
    return true;
  } catch (error) {
    console.error('Unable to connect to Supabase:', error);
    return false;
  }
}

export default {
  DatabaseService,
  initializeDatabase,
};