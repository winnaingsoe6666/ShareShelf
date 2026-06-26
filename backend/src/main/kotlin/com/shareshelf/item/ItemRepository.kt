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
        value = """SELECT i.*,
                  (6371000 * acos(
                    cos(radians(:lat)) * cos(radians(i.latitude)) *
                    cos(radians(i.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(i.latitude))
                  )) AS distance
                  FROM items i
                  LEFT JOIN users u ON u.id = i.owner_id
                  WHERE i.latitude IS NOT NULL AND i.longitude IS NOT NULL
                  AND (:search IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%'))
                       OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')))
                  AND (:categoryId IS NULL OR i.category_id = :categoryId)
                  AND (:status IS NULL OR i.status = :status)
                  AND (:minRating IS NULL OR u.trust_score >= :minRating)
                  HAVING distance <= :radius
                  ORDER BY distance""",
        countQuery = """SELECT COUNT(*) FROM (
                         SELECT (6371000 * acos(
                           cos(radians(:lat)) * cos(radians(i.latitude)) *
                           cos(radians(i.longitude) - radians(:lng)) +
                           sin(radians(:lat)) * sin(radians(i.latitude))
                         )) AS distance
                         FROM items i
                         LEFT JOIN users u ON u.id = i.owner_id
                         WHERE i.latitude IS NOT NULL AND i.longitude IS NOT NULL
                         AND (:search IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%'))
                              OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')))
                         AND (:categoryId IS NULL OR i.category_id = :categoryId)
                         AND (:status IS NULL OR i.status = :status)
                         AND (:minRating IS NULL OR u.trust_score >= :minRating)
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
