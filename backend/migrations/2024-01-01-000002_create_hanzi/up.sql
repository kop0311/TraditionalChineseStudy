-- Create hanzi table with optimized indexes
CREATE TABLE hanzi (
    id SERIAL PRIMARY KEY,
    character VARCHAR(10) NOT NULL,
    pinyin VARCHAR(50) NOT NULL,
    meaning TEXT NOT NULL,
    stroke_count INTEGER NOT NULL,
    level INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create optimized indexes for performance
CREATE INDEX idx_hanzi_level ON hanzi(level);
CREATE INDEX idx_hanzi_stroke_count ON hanzi(stroke_count);
CREATE INDEX idx_hanzi_character ON hanzi(character);
CREATE INDEX idx_hanzi_pinyin ON hanzi(pinyin);

-- Composite index for common query patterns
CREATE INDEX idx_hanzi_level_stroke ON hanzi(level, stroke_count);

-- Full-text search index for meaning
CREATE INDEX idx_hanzi_meaning_gin ON hanzi USING gin(to_tsvector('english', meaning));

-- Insert sample data
INSERT INTO hanzi (character, pinyin, meaning, stroke_count, level) VALUES
('你', 'nǐ', 'you', 7, 1),
('好', 'hǎo', 'good', 6, 1),
('我', 'wǒ', 'I/me', 7, 1),
('是', 'shì', 'to be', 9, 1),
('的', 'de', 'possessive particle', 8, 1),
('水', 'shuǐ', 'water', 4, 2),
('火', 'huǒ', 'fire', 4, 2),
('山', 'shān', 'mountain', 3, 2),
('木', 'mù', 'wood/tree', 4, 2),
('土', 'tǔ', 'earth/soil', 3, 2),
('学', 'xué', 'to study', 8, 3),
('习', 'xí', 'to practice', 3, 3),
('中', 'zhōng', 'middle/China', 4, 3),
('国', 'guó', 'country', 8, 3),
('文', 'wén', 'language/culture', 4, 3),
('书', 'shū', 'book', 4, 4),
('法', 'fǎ', 'method/law', 8, 4),
('道', 'dào', 'way/path', 12, 5),
('德', 'dé', 'virtue', 15, 5),
('经', 'jīng', 'classic/scripture', 13, 5);
