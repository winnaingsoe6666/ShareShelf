package com.shareshelf.item

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.nio.file.Files
import java.nio.file.Paths

class SpatialIndexTest {

    @Test
    fun `V12 migration creates GiST index on items location`() {
        val migrationPath = Paths.get(
            "src/main/resources/db/migration/V12__add_item_location.sql"
        )
        val sql = Files.readString(migrationPath)

        assertTrue(
            sql.contains("CREATE INDEX idx_items_location ON items USING GIST (location)"),
            "V12 migration must create GiST index idx_items_location"
        )
    }

    @Test
    fun `V12 migration adds location column with correct geometry type`() {
        val migrationPath = Paths.get(
            "src/main/resources/db/migration/V12__add_item_location.sql"
        )
        val sql = Files.readString(migrationPath)

        assertTrue(
            sql.contains("ALTER TABLE items ADD COLUMN location geometry(Point, 4326)"),
            "V12 migration must add location column as geometry(Point, 4326)"
        )
    }

    @Test
    fun `V11 migration enables PostGIS extension`() {
        val migrationPath = Paths.get(
            "src/main/resources/db/migration/V11__enable_postgis.sql"
        )
        val sql = Files.readString(migrationPath)

        assertTrue(
            sql.contains("CREATE EXTENSION IF NOT EXISTS postgis"),
            "V11 migration must enable PostGIS extension"
        )
    }
}
