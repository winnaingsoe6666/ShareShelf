package com.shareshelf.review

import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.borrow.BorrowRepository
import com.shareshelf.borrow.entity.BorrowStatus
import com.shareshelf.review.dto.CreateReviewRequest
import com.shareshelf.review.dto.ReviewResponse
import com.shareshelf.review.entity.Review
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ReviewService(
    private val reviewRepository: ReviewRepository,
    private val borrowRepository: BorrowRepository,
    private val userRepository: UserRepository
) {

    @Transactional
    fun create(request: CreateReviewRequest, reviewerId: Long): ReviewResponse {
        val borrow = borrowRepository.findById(request.borrowRequestId)
            .orElseThrow { EntityNotFoundException("Borrow request not found") }

        if (borrow.status != BorrowStatus.returned) {
            throw IllegalStateException("Can only review completed borrows")
        }

        if (borrow.borrowerId != reviewerId && borrow.ownerId != reviewerId) {
            throw IllegalArgumentException("You were not part of this transaction")
        }

        if (reviewRepository.findByBorrowRequestId(request.borrowRequestId)
                .any { it.reviewerId == reviewerId }
        ) {
            throw IllegalStateException("You have already reviewed this transaction")
        }

        val revieweeId = if (borrow.borrowerId == reviewerId) borrow.ownerId else borrow.borrowerId

        val review = Review(
            borrowRequestId = request.borrowRequestId,
            reviewerId = reviewerId,
            revieweeId = revieweeId,
            rating = request.rating,
            comment = request.comment
        )

        val saved = reviewRepository.save(review)

        // Update trust score
        updateTrustScore(revieweeId)

        return toResponse(saved)
    }

    fun findByUser(userId: Long): List<ReviewResponse> {
        return reviewRepository.findByRevieweeId(userId).map { toResponse(it) }
    }

    private fun updateTrustScore(userId: Long) {
        val avg = reviewRepository.averageRatingByRevieweeId(userId)
        if (avg != null) {
            val user = userRepository.findById(userId)
                .orElseThrow { EntityNotFoundException("User not found") }
            user.trustScore = java.math.BigDecimal.valueOf(Math.round(avg * 100.0) / 100.0)
            userRepository.save(user)
        }
    }

    private fun toResponse(review: Review): ReviewResponse {
        val reviewer = userRepository.findById(review.reviewerId)
        val reviewee = userRepository.findById(review.revieweeId)
        return ReviewResponse(
            id = review.id!!,
            borrowRequestId = review.borrowRequestId,
            reviewerId = review.reviewerId,
            reviewerName = reviewer.map { it.name }.orElse("Unknown"),
            revieweeId = review.revieweeId,
            revieweeName = reviewee.map { it.name }.orElse("Unknown"),
            rating = review.rating,
            comment = review.comment,
            createdAt = review.createdAt
        )
    }
}
