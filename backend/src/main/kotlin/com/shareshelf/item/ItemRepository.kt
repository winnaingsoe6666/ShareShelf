package com.shareshelf.item

import com.shareshelf.item.entity.Item
import com.shareshelf.item.entity.ItemStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface ItemRepository : JpaRepository<Item, Long> {
    fun findByOwnerId(ownerId: Long): List<Item>
    fun findByStatus(status: ItemStatus, pageable: Pageable): Page<Item>

    fun findTop5ByStatusOrderByCreatedAtDesc(status: ItemStatus): List<Item>

    @Query(
        """SELECT i FROM Item i WHERE
          (:search IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:categoryId IS NULL OR i.categoryId = :categoryId)
          AND (:status IS NULL OR i.status = :status)
          AND (:minRating IS NULL OR
               (SELECT u.trustScore FROM User u WHERE u.id = i.ownerId) >= :minRating)"""
    )
    fun search(
        @Param("search") search: String?,
        @Param("categoryId") categoryId: Long?,
        @Param("status") status: ItemStatus?,
        @Param("minRating") minRating: Double? = null,
        pageable: Pageable
    ): Page<Item>

    @Query(
        """SELECT i.ownerId, COUNT(i) as itemCount, u.name, u.trustScore
           FROM Item i JOIN User u ON i.ownerId = u.id
           WHERE u.enabled = true
           GROUP BY i.ownerId, u.name, u.trustScore
           ORDER BY itemCount DESC"""
    )
    fun findTopLenders(pageable: Pageable): List<Array<Any>>

    @Query(
        value = """SELECT i.*, ST_Distance(i.location::geography,
                  ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) as distance
                  FROM items i
                  WHERE i.location IS NOT NULL
                  AND ST_DWithin(i.location::geography,
                      ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                      :radius)
                  ORDER BY distance""",
        countQuery = """SELECT COUNT(*) FROM items i
                       WHERE i.location IS NOT NULL
                       AND ST_DWithin(i.location::geography,
                           ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                           :radius)""",
        nativeQuery = true
    )
    fun findNearby(
        @Param("lat") lat: Double,
        @Param("lng") lng: Double,
        @Param("radius") radius: Double,
        pageable: Pageable
    ): Page<Item>
}
