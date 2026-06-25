-- Replace PostGIS geometry columns with simple lat/lng columns
-- This migration removes the PostGIS dependency

-- Drop the geometry column and its index first
DROP INDEX IF EXISTS idx_items_location;
ALTER TABLE items DROP COLUMN IF EXISTS location;

-- Add new lat/lng columns
ALTER TABLE items ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE items ADD COLUMN longitude DOUBLE PRECISION;
