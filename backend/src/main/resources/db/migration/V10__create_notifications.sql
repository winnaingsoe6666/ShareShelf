CREATE TABLE notifications
(
    id                BIGSERIAL    PRIMARY KEY,
    user_id           BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type              VARCHAR(30)  NOT NULL CHECK (type IN (
                          'borrow_requested', 'borrow_approved', 'borrow_rejected',
                          'borrow_returned', 'review_received'
                      )),
    message           TEXT         NOT NULL,
    related_item_id   BIGINT       REFERENCES items (id) ON DELETE SET NULL,
    related_borrow_id BIGINT       REFERENCES borrow_requests (id) ON DELETE SET NULL,
    is_read           BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id) WHERE NOT is_read;
