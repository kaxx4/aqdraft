-- Migration 012: Add soft-delete support to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON posts(deleted_at) WHERE deleted_at IS NULL;
COMMENT ON COLUMN posts.deleted_at IS 'Soft delete timestamp. Posts with deleted_at IS NULL are visible. NULL = active.';
