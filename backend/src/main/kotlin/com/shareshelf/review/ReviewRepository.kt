package com.shareshelf.review

import com.shareshelf.review.entity.Review
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface ReviewRepository : JpaRepository<Review, Long> {
    fun findByRevieweeId(revieweeId: Long): List<Review>
    fun findByReviewerId(reviewerId: Long): List<Review>
    fun findByBorrowRequestId(borrowRequestId: Long): List<Review>

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.revieweeId = :userId")
    fun averageRatingByRevieweeId(@Param("userId") userId: Long): Double?
}
