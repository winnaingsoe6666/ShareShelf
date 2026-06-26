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
          (CAST(:search AS string) IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
           OR LOWER(i.description) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
          AND (CAST(:categoryId AS long) IS NULL OR i.categoryId = :categoryId)
          AND (CAST(:status AS string) IS NULL OR CAST(i.status AS string) = CAST(:status AS string))
          AND (CAST(:minRating AS double) IS NULL OR
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
        value = """SELECT i.*,
                  (6371000 * acos(
                    cos(radians(:lat)) * cos(radians(i.latitude)) *
                    cos(radians(i.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(i.latitude))
                  )) AS distance
                  FROM items i
                  LEFT JOIN users u ON u.id = i.owner_id
                  WHERE i.latitude IS NOT NULL AND i.longitude IS NOT NULL
                  AND (CAST(:search AS text) IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))
                       OR LOWER(i.description) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')))
                  AND (CAST(:categoryId AS bigint) IS NULL OR i.category_id = :categoryId)
                  AND (CAST(:status AS text) IS NULL OR i.status = CAST(:status AS text))
                  AND (CAST(:minRating AS double precision) IS NULL OR u.trust_score >= :minRating)
                  AND (6371000 * acos(LEAST(1.0,
                    cos(radians(:lat)) * cos(radians(i.latitude)) *
                    cos(radians(i.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(i.latitude))
                  ))) <= :radius
                  ORDER BY distance""",
        countQuery = """SELECT COUNT(*) FROM (
                         SELECT (6371000 * acos(LEAST(1.0,
                           cos(radians(:lat)) * cos(radians(i.latitude)) *
                           cos(radians(i.longitude) - radians(:lng)) +
                           sin(radians(:lat)) * sin(radians(i.latitude))
                         ))) AS distance
                         FROM items i
                         LEFT JOIN users u ON u.id = i.owner_id
                         WHERE i.latitude IS NOT NULL AND i.longitude IS NOT NULL
                         AND (CAST(:search AS text) IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))
                              OR LOWER(i.description) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')))
                         AND (CAST(:categoryId AS bigint) IS NULL OR i.category_id = :categoryId)
                         AND (CAST(:status AS text) IS NULL OR i.status = CAST(:status AS text))
                         AND (CAST(:minRating AS double precision) IS NULL OR u.trust_score >= :minRating)
                       ) sub
                       WHERE sub.distance <= :radius""",
        nativeQuery = true
    )
    fun findNearby(
        @Param("lat") lat: Double,
        @Param("lng") lng: Double,
        @Param("radius") radius: Double,
        @Param("search") search: String?,
        @Param("categoryId") categoryId: Long?,
        @Param("status") status: String?,
        @Param("minRating") minRating: Double?,
        pageable: Pageable
    ): Page<Item>
}
