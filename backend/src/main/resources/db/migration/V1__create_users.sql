CREATE TABLE users
(
    id           BIGSERIAL    PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    community    VARCHAR(100),
    phone        VARCHAR(20),
    avatar_url   VARCHAR(500),
    trust_score  DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    enabled      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_community ON users (community);
