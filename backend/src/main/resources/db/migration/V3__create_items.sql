CREATE TABLE items
(
    id           BIGSERIAL     PRIMARY KEY,
    owner_id     BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    category_id  BIGINT        REFERENCES categories (id) ON DELETE SET NULL,
    title        VARCHAR(200) NOT NULL,
    description  TEXT,
    daily_price  DECIMAL(10, 2),
    deposit_amount DECIMAL(10, 2),
    status       VARCHAR(20)  NOT NULL DEFAULT 'available'
                     CHECK (status IN ('available', 'borrowed', 'unavailable')),
    image_urls   JSONB        DEFAULT '[]'::jsonb,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_items_owner ON items (owner_id);
CREATE INDEX idx_items_category ON items (category_id);
CREATE INDEX idx_items_status ON items (status);

-- Full-text search index
CREATE INDEX idx_items_search ON items
    USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));
