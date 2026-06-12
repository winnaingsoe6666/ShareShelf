CREATE TABLE reviews
(
    id               BIGSERIAL    PRIMARY KEY,
    borrow_request_id BIGINT      NOT NULL REFERENCES borrow_requests (id) ON DELETE CASCADE,
    reviewer_id      BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    reviewee_id      BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    rating           INTEGER      NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment          TEXT,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (borrow_request_id, reviewer_id)
);

CREATE INDEX idx_reviews_reviewee ON reviews (reviewee_id);
CREATE INDEX idx_reviews_borrow_request ON reviews (borrow_request_id);
