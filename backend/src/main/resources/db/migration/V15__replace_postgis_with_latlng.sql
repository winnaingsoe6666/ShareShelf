-- Replace PostGIS geometry columns with simple lat/lng columns
-- This migration removes the PostGIS dependency

-- Drop the geometry column and its index if they exist
DO $$
BEGIN
    DROP INDEX IF EXISTS idx_items_location;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'location') THEN
        ALTER TABLE items DROP COLUMN location;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors (e.g., if PostGIS type is not available)
    NULL;
END $$;

-- Add new lat/lng columns if they don't exist
ALTER TABLE items ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE items ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
