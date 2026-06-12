#!/usr/bin/env bash
# Seed ShareShelf with demo data
set -e

API_URL="${API_URL:-http://localhost:8080}"

echo "Seeding ShareShelf with demo data..."
echo "API URL: $API_URL"
echo ""

# 1. Register users
echo "--- Creating users ---"

ALICE_RESP=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Johnson","email":"alice@example.com","password":"password123","community":"Downtown"}')
ALICE_TOKEN=$(echo "$ALICE_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "✓ Alice registered"

BOB_RESP=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob Smith","email":"bob@example.com","password":"password123","community":"Downtown"}')
BOB_TOKEN=$(echo "$BOB_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "✓ Bob registered"

CHARLIE_RESP=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie Lee","email":"charlie@example.com","password":"password123","community":"University"}')
CHARLIE_TOKEN=$(echo "$CHARLIE_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "✓ Charlie registered"

# 2. Create items
echo ""
echo "--- Creating items ---"

ITEM1=$(curl -s -X POST "$API_URL/api/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"title":"Cordless Power Drill","description":"18V cordless drill with charger and 2 batteries. Great for home DIY projects.","categoryId":1,"dailyPrice":5.00,"depositAmount":20.00}')
echo "✓ Alice listed: Cordless Power Drill"

ITEM2=$(curl -s -X POST "$API_URL/api/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"title":"Camping Tent - 4 Person","description":"Spacious 4-person tent, easy to set up. Includes carrying bag and stakes.","categoryId":3,"dailyPrice":8.00,"depositAmount":30.00}')
echo "✓ Alice listed: Camping Tent"

ITEM3=$(curl -s -X POST "$API_URL/api/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{"title":"HD Projector","description":"1080p HD projector, perfect for movie nights or presentations. Includes HDMI cable.","categoryId":2,"dailyPrice":10.00,"depositAmount":50.00}')
echo "✓ Bob listed: HD Projector"

ITEM4=$(curl -s -X POST "$API_URL/api/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{"title":"Yoga Mat - Premium","description":"Thick premium yoga mat, non-slip surface. 6mm thickness.","categoryId":4,"dailyPrice":2.00,"depositAmount":5.00}')
echo "✓ Bob listed: Yoga Mat"

ITEM5=$(curl -s -X POST "$API_URL/api/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CHARLIE_TOKEN" \
  -d '{"title":"Electric Lawn Mower","description":"Quiet electric lawn mower, corded. 1200W, 14 inch cutting width.","categoryId":6,"dailyPrice":7.00,"depositAmount":25.00}')
echo "✓ Charlie listed: Electric Lawn Mower"

echo ""
echo "✓ Seeding complete!"
echo ""
echo "Demo login credentials:"
echo "  alice@example.com / password123"
echo "  bob@example.com / password123"
echo "  charlie@example.com / password123"
