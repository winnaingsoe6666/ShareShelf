package com.shareshelf.borrow

import com.shareshelf.borrow.entity.BorrowRequest
import com.shareshelf.borrow.entity.BorrowStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface BorrowRepository : JpaRepository<BorrowRequest, Long> {
    fun findByBorrowerId(borrowerId: Long, pageable: Pageable): Page<BorrowRequest>
    fun findByOwnerId(ownerId: Long, pageable: Pageable): Page<BorrowRequest>
    fun findByItemId(itemId: Long): List<BorrowRequest>
    fun findByItemIdAndBorrowerIdAndStatus(itemId: Long, borrowerId: Long, status: BorrowStatus): List<BorrowRequest>
    fun countByStatus(status: BorrowStatus): Long

    @Query(
        """SELECT b FROM BorrowRequest b
           WHERE b.borrowerId = :userId OR b.ownerId = :userId
           ORDER BY b.createdAt DESC"""
    )
    fun findByUserId(
        @Param("userId") userId: Long,
        pageable: Pageable
    ): Page<BorrowRequest>
}
