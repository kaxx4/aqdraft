-- Migration 013: post_documents table
-- Mirror of `post_images` but for PDF / PPTX attachments. Stored as a
-- 1-to-many side table (vs a JSONB column on posts) so we can index
-- by post and query individual document URLs efficiently — same
-- pattern as images so the codebase stays consistent.

CREATE TABLE IF NOT EXISTS post_documents (
  document_id   SERIAL PRIMARY KEY,
  post_id       INTEGER NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
  blob_url      VARCHAR(2048) NOT NULL,
  blob_name     VARCHAR(512)  NOT NULL,
  file_name     VARCHAR(512)  NOT NULL,   -- original filename for UX
  file_size     INTEGER       NOT NULL DEFAULT 0,
  mime_type     VARCHAR(128)  NOT NULL,
  display_order INTEGER       NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_documents_post ON post_documents(post_id);

COMMENT ON TABLE post_documents IS 'PDF and PPTX attachments for posts. One row per attached file.';
COMMENT ON COLUMN post_documents.file_name IS 'Original filename the user uploaded — shown in the post card.';
COMMENT ON COLUMN post_documents.mime_type IS 'Currently restricted to application/pdf and application/vnd.openxmlformats-officedocument.presentationml.presentation';
