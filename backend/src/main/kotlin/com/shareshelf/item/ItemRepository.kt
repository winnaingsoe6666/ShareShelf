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

    @Query(
        """SELECT i FROM Item i WHERE
          (:search IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:categoryId IS NULL OR i.categoryId = :categoryId)
          AND (:status IS NULL OR i.status = :status)"""
    )
    fun search(
        @Param("search") search: String?,
        @Param("categoryId") categoryId: Long?,
        @Param("status") status: ItemStatus?,
        pageable: Pageable
    ): Page<Item>
}
