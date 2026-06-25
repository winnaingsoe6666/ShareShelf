-- Add Google OAuth support to users table
-- google_id: unique identifier from Google OAuth
-- auth_provider: distinguishes LOCAL (email/password) from GOOGLE (OAuth) users
-- password_hash: made nullable to support Google-only users who have no password

ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL';
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
