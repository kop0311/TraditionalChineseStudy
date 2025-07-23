-- PostgreSQL Query Optimization for Traditional Chinese Study App
-- Target: Optimize hanzi table queries for better performance

-- 1. ANALYZE current query performance
-- Before optimization - slow query example:
-- SELECT * FROM hanzi WHERE level > 3;

-- Check current table statistics
ANALYZE hanzi;

-- Show current execution plan for the slow query
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM hanzi WHERE level > 3;

-- 2. CREATE OPTIMIZED INDEXES

-- Drop existing indexes if they exist (for clean setup)
DROP INDEX IF EXISTS idx_hanzi_level;
DROP INDEX IF EXISTS idx_hanzi_stroke_count;
DROP INDEX IF EXISTS idx_hanzi_character;
DROP INDEX IF EXISTS idx_hanzi_pinyin;
DROP INDEX IF EXISTS idx_hanzi_level_stroke;
DROP INDEX IF EXISTS idx_hanzi_meaning_gin;

-- Create optimized B-tree indexes
CREATE INDEX CONCURRENTLY idx_hanzi_level_optimized 
ON hanzi(level) 
WHERE level > 0;

CREATE INDEX CONCURRENTLY idx_hanzi_stroke_count_optimized 
ON hanzi(stroke_count) 
WHERE stroke_count > 0;

-- Composite index for common query patterns (level + stroke_count)
CREATE INDEX CONCURRENTLY idx_hanzi_level_stroke_optimized 
ON hanzi(level, stroke_count, id) 
WHERE level > 0 AND stroke_count > 0;

-- Covering index for character searches
CREATE INDEX CONCURRENTLY idx_hanzi_character_covering 
ON hanzi(character) 
INCLUDE (pinyin, meaning, stroke_count, level);

-- Partial index for high-level characters (most common query)
CREATE INDEX CONCURRENTLY idx_hanzi_high_level 
ON hanzi(id, character, pinyin, meaning, stroke_count) 
WHERE level >= 3;

-- GIN index for full-text search on meaning
CREATE INDEX CONCURRENTLY idx_hanzi_meaning_fulltext 
ON hanzi 
USING gin(to_tsvector('english', meaning));

-- 3. OPTIMIZED QUERIES WITH PAGINATION

-- Original slow query (>500ms):
-- SELECT * FROM hanzi WHERE level > 3;

-- Optimized query with pagination and covering index:
-- Query 1: Basic pagination with level filter
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, character, pinyin, meaning, stroke_count, level, created_at
FROM hanzi 
WHERE level > 3 
ORDER BY id 
LIMIT 20 OFFSET 0;

-- Query 2: Optimized with specific level and pagination
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, character, pinyin, meaning, stroke_count, level, created_at
FROM hanzi 
WHERE level >= 3 AND level <= 5
ORDER BY level, id 
LIMIT 20 OFFSET 0;

-- Query 3: Count query for pagination metadata (optimized)
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT COUNT(*) 
FROM hanzi 
WHERE level > 3;

-- Query 4: Search with filters and pagination
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, character, pinyin, meaning, stroke_count, level, created_at
FROM hanzi 
WHERE level > 3 
  AND stroke_count BETWEEN 5 AND 15
  AND (character ILIKE '%水%' OR pinyin ILIKE '%shui%')
ORDER BY level, stroke_count, id
LIMIT 20 OFFSET 0;

-- 4. PERFORMANCE MONITORING QUERIES

-- Check index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename = 'hanzi'
ORDER BY idx_scan DESC;

-- Check table statistics
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
WHERE tablename = 'hanzi';

-- 5. VACUUM AND ANALYZE FOR OPTIMAL PERFORMANCE

-- Update table statistics
ANALYZE hanzi;

-- Vacuum to reclaim space and update statistics
VACUUM (ANALYZE, VERBOSE) hanzi;

-- 6. QUERY PERFORMANCE COMPARISON

-- Create a function to test query performance
CREATE OR REPLACE FUNCTION test_hanzi_query_performance()
RETURNS TABLE(
    query_type TEXT,
    execution_time_ms NUMERIC,
    rows_returned BIGINT
) AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    row_count BIGINT;
BEGIN
    -- Test 1: Original slow query
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO row_count FROM hanzi WHERE level > 3;
    end_time := clock_timestamp();
    
    query_type := 'Original Query (COUNT)';
    execution_time_ms := EXTRACT(MILLISECONDS FROM (end_time - start_time));
    rows_returned := row_count;
    RETURN NEXT;
    
    -- Test 2: Optimized paginated query
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO row_count FROM (
        SELECT id FROM hanzi WHERE level > 3 ORDER BY id LIMIT 20 OFFSET 0
    ) subq;
    end_time := clock_timestamp();
    
    query_type := 'Optimized Paginated Query';
    execution_time_ms := EXTRACT(MILLISECONDS FROM (end_time - start_time));
    rows_returned := row_count;
    RETURN NEXT;
    
    -- Test 3: Covering index query
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO row_count FROM (
        SELECT character, pinyin, meaning FROM hanzi WHERE level > 3 LIMIT 20
    ) subq;
    end_time := clock_timestamp();
    
    query_type := 'Covering Index Query';
    execution_time_ms := EXTRACT(MILLISECONDS FROM (end_time - start_time));
    rows_returned := row_count;
    RETURN NEXT;
    
END;
$$ LANGUAGE plpgsql;

-- Run performance test
SELECT * FROM test_hanzi_query_performance();

-- 7. RECOMMENDED PAGINATION QUERIES FOR APPLICATION

-- For Rust backend - optimized character listing with pagination
-- This query should be used in the characters.rs file:

/*
Rust Query Template:
let characters = hanzi::table
    .filter(hanzi::level.ge(level_filter))
    .order(hanzi::id.asc())
    .limit(limit)
    .offset(offset)
    .load::<HanziCharacter>(&mut conn)?;

SQL equivalent:
*/
PREPARE optimized_character_list(INT, BIGINT, BIGINT) AS
SELECT id, character, pinyin, meaning, stroke_count, level, created_at
FROM hanzi 
WHERE level >= $1 
ORDER BY id 
LIMIT $2 OFFSET $3;

-- Test the prepared statement
EXECUTE optimized_character_list(3, 20, 0);

-- For count query (pagination metadata):
PREPARE optimized_character_count(INT) AS
SELECT COUNT(*) 
FROM hanzi 
WHERE level >= $1;

EXECUTE optimized_character_count(3);

-- 8. INDEX MAINTENANCE RECOMMENDATIONS

-- Set up automatic statistics collection
ALTER TABLE hanzi SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE hanzi SET (autovacuum_vacuum_scale_factor = 0.1);

-- 9. FINAL PERFORMANCE VERIFICATION

-- Verify all indexes are being used
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'hanzi'
ORDER BY indexname;

-- Final execution plan check
EXPLAIN (ANALYZE, BUFFERS, COSTS, FORMAT JSON)
SELECT id, character, pinyin, meaning, stroke_count, level, created_at
FROM hanzi 
WHERE level > 3 
ORDER BY id 
LIMIT 20 OFFSET 0;

-- Performance summary
SELECT 
    'Optimization Complete' as status,
    COUNT(*) as total_characters,
    COUNT(*) FILTER (WHERE level > 3) as high_level_characters,
    AVG(stroke_count) as avg_stroke_count
FROM hanzi;
