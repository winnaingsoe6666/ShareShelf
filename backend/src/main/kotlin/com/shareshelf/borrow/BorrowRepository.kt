package com.shareshelf.borrow

import com.shareshelf.borrow.entity.BorrowRequest
import org.springframework.data.jpa.repository.JpaRepository

interface BorrowRepository : JpaRepository<BorrowRequest, Long> {
    fun findByBorrowerId(borrowerId: Long): List<BorrowRequest>
    fun findByOwnerId(ownerId: Long): List<BorrowRequest>
    fun findByItemId(itemId: Long): List<BorrowRequest>
    fun findByItemIdAndBorrowerIdAndStatus(itemId: Long, borrowerId: Long, status: String): List<BorrowRequest>
}
