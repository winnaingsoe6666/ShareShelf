CREATE TABLE chat_messages
(
    id          BIGSERIAL    PRIMARY KEY,
    sender_id   BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    receiver_id BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    item_id     BIGINT       NOT NULL REFERENCES items (id) ON DELETE CASCADE,
    message     TEXT         NOT NULL,
    read_at     TIMESTAMP,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Conversation query: load messages between two users for a specific item
CREATE INDEX idx_chat_messages_conversation ON chat_messages (item_id, sender_id, receiver_id, created_at);

-- Unread count: messages received by a user that haven't been read
CREATE INDEX idx_chat_messages_receiver_unread ON chat_messages (receiver_id, read_at) WHERE read_at IS NULL;

-- Inbox: conversations where user is sender or receiver
CREATE INDEX idx_chat_messages_sender ON chat_messages (sender_id, created_at);
CREATE INDEX idx_chat_messages_receiver ON chat_messages (receiver_id, created_at);
