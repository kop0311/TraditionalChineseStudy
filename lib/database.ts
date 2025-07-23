import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database connection for server-side operations
export const getServerSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

// Database types based on our schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
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
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          password_hash: string;
          role?: string;
          active?: boolean;
          email_verified?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          password_hash?: string;
          role?: string;
          active?: boolean;
          email_verified?: boolean;
          last_login?: string | null;
          updated_at?: string;
        };
      };
      classics: {
        Row: {
          id: string;
          slug: string;
          title: string;
          author: string | null;
          dynasty: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          author?: string | null;
          dynasty?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          author?: string | null;
          dynasty?: string | null;
          description?: string | null;
          updated_at?: string;
        };
      };
      chapters: {
        Row: {
          id: string;
          classic_id: string;
          number: number;
          title: string;
          content: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          classic_id: string;
          number: number;
          title: string;
          content?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          classic_id?: string;
          number?: number;
          title?: string;
          content?: string | null;
          updated_at?: string;
        };
      };
      sentences: {
        Row: {
          id: string;
          chapter_id: string;
          number: number;
          text: string;
          pinyin: string | null;
          translation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          number: number;
          text: string;
          pinyin?: string | null;
          translation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          number?: number;
          text?: string;
          pinyin?: string | null;
          translation?: string | null;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
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
        };
        Insert: {
          id?: string;
          character: string;
          traditional?: string | null;
          simplified?: string | null;
          pinyin?: string | null;
          meaning?: string | null;
          etymology?: string | null;
          radical?: string | null;
          stroke_count?: number | null;
          frequency_rank?: number | null;
          hsk_level?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          character?: string;
          traditional?: string | null;
          simplified?: string | null;
          pinyin?: string | null;
          meaning?: string | null;
          etymology?: string | null;
          radical?: string | null;
          stroke_count?: number | null;
          frequency_rank?: number | null;
          hsk_level?: number | null;
          updated_at?: string;
        };
      };
    };
  };
}