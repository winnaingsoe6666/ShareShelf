CREATE TABLE borrow_requests
(
    id           BIGSERIAL    PRIMARY KEY,
    item_id      BIGINT       NOT NULL REFERENCES items (id) ON DELETE CASCADE,
    borrower_id  BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    owner_id     BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status       VARCHAR(20)  NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'returned', 'cancelled')),
    start_date   DATE,
    end_date     DATE,
    message      TEXT,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_borrow_requests_borrower ON borrow_requests (borrower_id);
CREATE INDEX idx_borrow_requests_owner ON borrow_requests (owner_id);
CREATE INDEX idx_borrow_requests_item ON borrow_requests (item_id);
CREATE INDEX idx_borrow_requests_status ON borrow_requests (status);
