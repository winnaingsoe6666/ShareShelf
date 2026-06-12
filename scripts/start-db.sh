#!/usr/bin/env bash
# Start PostgreSQL for ShareShelf development
# Requires PostgreSQL to be installed (apt install postgresql)
set -e

SERVICE_NAME="postgresql"

# Check if postgresql service is already running
if pg_isready -q 2>/dev/null; then
  echo "✓ PostgreSQL is already running"
  exit 0
fi

# Start the service (handles both systemd and service command)
if command -v systemctl &>/dev/null; then
  sudo systemctl start "$SERVICE_NAME"
elif command -v service &>/dev/null; then
  sudo service "$SERVICE_NAME" start
else
  echo "Could not start PostgreSQL automatically. Please start it manually."
  exit 1
fi

echo "✓ PostgreSQL started"

# Create database and user if they don't exist
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='shareshelf'" 2>/dev/null || echo "0")
if [ "$DB_EXISTS" != "1" ]; then
  echo "Creating database and user..."
  sudo -u postgres psql -c "CREATE USER shareshelf WITH PASSWORD 'shareshelf_dev';"
  sudo -u postgres psql -c "CREATE DATABASE shareshelf OWNER shareshelf;"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE shareshelf TO shareshelf;"
  echo "✓ Database 'shareshelf' created"
else
  echo "✓ Database 'shareshelf' already exists"
fi
