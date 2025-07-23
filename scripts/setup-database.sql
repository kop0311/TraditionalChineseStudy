-- Supabase Database Setup for Traditional Chinese Study App
-- Run this script in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Classics table
CREATE TABLE IF NOT EXISTS classics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    dynasty VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classic_id UUID NOT NULL REFERENCES classics(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(classic_id, number)
);

-- Sentences table
CREATE TABLE IF NOT EXISTS sentences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    text TEXT NOT NULL,
    pinyin TEXT,
    translation TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(chapter_id, number)
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character VARCHAR(10) UNIQUE NOT NULL,
    traditional VARCHAR(10),
    simplified VARCHAR(10),
    pinyin VARCHAR(50),
    meaning TEXT,
    etymology TEXT,
    radical VARCHAR(10),
    stroke_count INTEGER,
    frequency_rank INTEGER,
    hsk_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Sessions table (user practice sessions)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    duration INTEGER, -- in seconds
    score INTEGER,
    total_questions INTEGER,
    correct_answers INTEGER,
    data JSONB, -- flexible data storage for session-specific info
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    classic_id UUID REFERENCES classics(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    sentence_id UUID REFERENCES sentences(id) ON DELETE CASCADE,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    progress_type VARCHAR(50) NOT NULL, -- 'reading', 'character', 'comprehension'
    level INTEGER NOT NULL DEFAULT 0,
    experience INTEGER NOT NULL DEFAULT 0,
    mastery_level DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
    last_practiced TIMESTAMP WITH TIME ZONE,
    practice_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Character progress table (specific for character learning)
CREATE TABLE IF NOT EXISTS character_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    recognition_level INTEGER NOT NULL DEFAULT 0, -- 0-10 scale
    writing_level INTEGER NOT NULL DEFAULT 0, -- 0-10 scale
    meaning_level INTEGER NOT NULL DEFAULT 0, -- 0-10 scale
    last_reviewed TIMESTAMP WITH TIME ZONE,
    review_count INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    interval_days INTEGER NOT NULL DEFAULT 1, -- spaced repetition
    ease_factor DECIMAL(3,2) DEFAULT 2.5, -- spaced repetition
    next_review TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, character_id)
);

-- Practice sessions table (detailed practice tracking)
CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL, -- 'reading', 'writing', 'recognition', 'comprehension'
    classic_id UUID REFERENCES classics(id),
    chapter_id UUID REFERENCES chapters(id),
    duration INTEGER, -- in seconds
    questions_count INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    score INTEGER,
    data JSONB, -- detailed session data
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Stats table (user statistics and achievements)
CREATE TABLE IF NOT EXISTS stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_study_time INTEGER NOT NULL DEFAULT 0, -- in seconds
    total_characters_learned INTEGER NOT NULL DEFAULT 0,
    total_sentences_read INTEGER NOT NULL DEFAULT 0,
    total_chapters_completed INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_study_date DATE,
    level INTEGER NOT NULL DEFAULT 1,
    experience_points INTEGER NOT NULL DEFAULT 0,
    achievements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_classics_slug ON classics(slug);
CREATE INDEX IF NOT EXISTS idx_chapters_classic_id ON chapters(classic_id);
CREATE INDEX IF NOT EXISTS idx_chapters_number ON chapters(number);
CREATE INDEX IF NOT EXISTS idx_sentences_chapter_id ON sentences(chapter_id);
CREATE INDEX IF NOT EXISTS idx_sentences_number ON sentences(number);
CREATE INDEX IF NOT EXISTS idx_characters_character ON characters(character);
CREATE INDEX IF NOT EXISTS idx_characters_frequency ON characters(frequency_rank);
CREATE INDEX IF NOT EXISTS idx_characters_hsk ON characters(hsk_level);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(type);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_type ON user_progress(progress_type);
CREATE INDEX IF NOT EXISTS idx_character_progress_user_id ON character_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_character_progress_next_review ON character_progress(next_review);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_type ON practice_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_stats_user_id ON stats(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_classics_updated_at') THEN
        CREATE TRIGGER update_classics_updated_at BEFORE UPDATE ON classics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_chapters_updated_at') THEN
        CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sentences_updated_at') THEN
        CREATE TRIGGER update_sentences_updated_at BEFORE UPDATE ON sentences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_characters_updated_at') THEN
        CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sessions_updated_at') THEN
        CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_progress_updated_at') THEN
        CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_character_progress_updated_at') THEN
        CREATE TRIGGER update_character_progress_updated_at BEFORE UPDATE ON character_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_practice_sessions_updated_at') THEN
        CREATE TRIGGER update_practice_sessions_updated_at BEFORE UPDATE ON practice_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_stats_updated_at') THEN
        CREATE TRIGGER update_stats_updated_at BEFORE UPDATE ON stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Insert sample data
INSERT INTO classics (slug, title, author, dynasty, description) VALUES
('sanzijing', '三字经', '王应麟', '宋朝', '中国传统启蒙教材，以三字一句的韵文编写'),
('daodejing', '道德经', '老子', '春秋', '道家哲学经典，阐述道法自然的思想'),
('dizigui', '弟子规', '李毓秀', '清朝', '儿童学习规范和道德教育的启蒙读物')
ON CONFLICT (slug) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully!' as message;