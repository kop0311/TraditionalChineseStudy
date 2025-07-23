-- Create comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL CHECK (length(text) > 0 AND length(text) <= 200),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
