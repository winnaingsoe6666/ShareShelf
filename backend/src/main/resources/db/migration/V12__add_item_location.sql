ALTER TABLE items ADD COLUMN location geometry(Point, 4326);
CREATE INDEX idx_items_location ON items USING GIST (location);
