---
name: db-inspect
description: Inspect the ShareShelf PostgreSQL database — list tables, describe schema, run safe SELECT queries, and debug data issues.
---

# Database Inspect

## Purpose
Inspect the local ShareShelf PostgreSQL database to debug data issues, verify schema, and run diagnostic queries.

## Instructions
1. Use the `shareshelf-db` MCP server for all database operations.
2. Start with a schema overview to orient yourself:
   - `list_tables` to see all tables
   - `describe_table` on each relevant table to see columns, types, and constraints
3. Then run diagnostic queries. Common patterns:

### Schema Inspection
```
list_tables
describe_table users
describe_table items
describe_table borrow_requests
describe_table reviews
describe_table categories
```

### Data Diagnostics
```sql
-- User counts and duplicates
SELECT COUNT(*) FROM users;
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;

-- Items by status
SELECT status, COUNT(*) FROM items GROUP BY status;

-- Active borrow requests with context
SELECT br.id, br.status, u.email AS borrower, i.name AS item, i.status AS item_status
FROM borrow_requests br
JOIN users u ON br.borrower_id = u.id
JOIN items i ON br.item_id = i.id
ORDER BY br.created_at DESC;

-- Trust score audit
SELECT u.email, u.trust_score, COUNT(r.id) AS review_count,
       COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating
FROM users u
LEFT JOIN reviews r ON r.reviewee_id = u.id
GROUP BY u.id
ORDER BY u.trust_score DESC;

-- Items with owner details
SELECT i.id, i.name, i.status, i.daily_price, u.email AS owner_email
FROM items i
JOIN users u ON i.owner_id = u.id
ORDER BY i.created_at DESC;

-- Borrow lifecycle check — any stuck states?
SELECT br.id, br.status, br.request_date, br.approval_date, br.return_date,
       i.name AS item, u.email AS borrower
FROM borrow_requests br
JOIN items i ON br.item_id = i.id
JOIN users u ON br.borrower_id = u.id
WHERE br.status NOT IN ('RETURNED', 'REJECTED')
  AND br.request_date < NOW() - INTERVAL '7 days'
ORDER BY br.request_date;
```

4. Never run destructive operations (INSERT, UPDATE, DELETE, DROP, TRUNCATE) unless the user explicitly asks for testing data changes.
5. If the user asks to fix data, describe what SQL you would run and wait for confirmation before executing.
6. Present results clearly — table format for data, summary counts, and highlight any anomalies found.

## Entity Reference
| Table | Key Columns |
|---|---|
| `users` | id, email, password (bcrypt), name, community, trust_score, created_at, updated_at |
| `items` | id, name, description, daily_price, deposit_amount, status (AVAILABLE/BORROWED/INACTIVE), owner_id, category_id |
| `borrow_requests` | id, item_id, borrower_id, status (PENDING/APPROVED/REJECTED/RETURNED), request_date, approval_date, return_date |
| `reviews` | id, borrow_request_id (OneToOne), rating (1-5), comment, reviewer_id, reviewee_id |
| `categories` | id, name |
