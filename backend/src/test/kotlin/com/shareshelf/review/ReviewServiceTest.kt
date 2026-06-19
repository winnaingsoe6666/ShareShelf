package com.shareshelf.review

import com.shareshelf.auth.entity.User
import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.borrow.BorrowRepository
import com.shareshelf.borrow.entity.BorrowRequest
import com.shareshelf.borrow.entity.BorrowStatus
import com.shareshelf.notification.NotificationService
import com.shareshelf.review.dto.CreateReviewRequest
import com.shareshelf.review.entity.Review
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

class ReviewServiceTest {

    private val reviewRepository = mockk<ReviewRepository>()
    private val borrowRepository = mockk<BorrowRepository>()
    private val userRepository = mockk<UserRepository>()
    private val notificationService = mockk<NotificationService>(relaxed = true)

    private val reviewService = ReviewService(
        reviewRepository = reviewRepository,
        borrowRepository = borrowRepository,
        userRepository = userRepository,
        notificationService = notificationService
    )

    private val owner = User(
        id = 1L,
        name = "Owner",
        email = "owner@example.com",
        passwordHash = "hash",
        trustScore = BigDecimal("4.0")
    )

    private val borrower = User(
        id = 2L,
        name = "Borrower",
        email = "borrower@example.com",
        passwordHash = "hash2",
        trustScore = BigDecimal("3.0")
    )

    private fun testBorrow(
        id: Long = 1L,
        itemId: Long = 1L,
        borrowerId: Long = 2L,
        ownerId: Long = 1L,
        status: BorrowStatus = BorrowStatus.returned
    ) = BorrowRequest(
        id = id,
        itemId = itemId,
        borrowerId = borrowerId,
        ownerId = ownerId,
        status = status,
        startDate = LocalDate.now().minusDays(5),
        endDate = LocalDate.now().minusDays(2),
        message = null,
        createdAt = LocalDateTime.now().minusDays(5)
    )

    private fun testReview(
        id: Long = 1L,
        borrowRequestId: Long = 1L,
        reviewerId: Long = 2L,
        revieweeId: Long = 1L,
        rating: Int = 4
    ) = Review(
        id = id,
        borrowRequestId = borrowRequestId,
        reviewerId = reviewerId,
        revieweeId = revieweeId,
        rating = rating,
        comment = "Good experience",
        createdAt = LocalDateTime.now()
    )

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    // --- create ---

    @Test
    fun `create review succeeds for returned borrow (borrower reviewing owner)`() {
        val borrow = testBorrow(status = BorrowStatus.returned)
        val request = CreateReviewRequest(
            borrowRequestId = 1L,
            rating = 5,
            comment = "Great lender!"
        )
        val review = testReview(reviewerId = 2L, revieweeId = 1L, rating = 5)

        // Validation checks
        every { borrowRepository.findById(1L) } returns Optional.of(borrow)
        every { reviewRepository.findByBorrowRequestId(1L) } returns emptyList()
        // Save
        every { reviewRepository.save(any()) } returns review
        // Trust score update
        every { reviewRepository.averageRatingByRevieweeId(1L) } returns 4.5
        every { userRepository.findById(1L) } returns Optional.of(owner)
        every { userRepository.save(any()) } answers { firstArg() }
        // toResponse lookups
        every { userRepository.findById(2L) } returns Optional.of(borrower)

        val result = reviewService.create(request, reviewerId = 2L)

        assertEquals(1L, result.borrowRequestId)
        assertEquals(5, result.rating)
        assertEquals("Borrower", result.reviewerName)
        assertEquals("Owner", result.revieweeName)
        assertEquals(BigDecimal.valueOf(4.5), owner.trustScore)

        verify(exactly = 1) { borrowRepository.findById(1L) }
        verify(exactly = 1) { reviewRepository.findByBorrowRequestId(1L) }
        verify(exactly = 1) { reviewRepository.save(any()) }
        verify(exactly = 1) { reviewRepository.averageRatingByRevieweeId(1L) }
        verify(exactly = 2) { userRepository.findById(1L) }
        verify(exactly = 1) { userRepository.save(any()) }
    }

    @Test
    fun `create review succeeds for owner reviewing borrower`() {
        val borrow = testBorrow(status = BorrowStatus.returned)
        val request = CreateReviewRequest(
            borrowRequestId = 1L,
            rating = 4,
            comment = "Good borrower"
        )
        val review = testReview(reviewerId = 1L, revieweeId = 2L, rating = 4)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)
        every { reviewRepository.findByBorrowRequestId(1L) } returns emptyList()
        every { reviewRepository.save(any()) } returns review
        // Trust score update for the reviewee (borrower)
        every { reviewRepository.averageRatingByRevieweeId(2L) } returns 3.5
        every { userRepository.findById(2L) } returns Optional.of(borrower)
        every { userRepository.save(any()) } answers { firstArg() }
        // toResponse lookups
        every { userRepository.findById(1L) } returns Optional.of(owner)

        val result = reviewService.create(request, reviewerId = 1L)

        assertEquals(4, result.rating)
        assertEquals("Owner", result.reviewerName)
        assertEquals("Borrower", result.revieweeName)
        assertEquals(BigDecimal.valueOf(3.5), borrower.trustScore)

        verify(exactly = 1) { reviewRepository.averageRatingByRevieweeId(2L) }
    }

    @Test
    fun `create review throws when borrow is not returned`() {
        val borrow = testBorrow(status = BorrowStatus.approved)
        val request = CreateReviewRequest(borrowRequestId = 1L, rating = 4)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)

        assertThrows(IllegalStateException::class.java) {
            reviewService.create(request, reviewerId = 2L)
        }

        verify(exactly = 0) { reviewRepository.save(any()) }
    }

    @Test
    fun `create review throws when reviewer was not part of the transaction`() {
        val borrow = testBorrow(status = BorrowStatus.returned, borrowerId = 2L, ownerId = 1L)
        val request = CreateReviewRequest(borrowRequestId = 1L, rating = 3)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)

        assertThrows(IllegalArgumentException::class.java) {
            reviewService.create(request, reviewerId = 3L)
        }

        verify(exactly = 0) { reviewRepository.save(any()) }
    }

    @Test
    fun `create review throws when user already reviewed`() {
        val borrow = testBorrow(status = BorrowStatus.returned)
        val request = CreateReviewRequest(borrowRequestId = 1L, rating = 4)
        val existingReview = testReview(reviewerId = 2L)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)
        every { reviewRepository.findByBorrowRequestId(1L) } returns listOf(existingReview)

        assertThrows(IllegalStateException::class.java) {
            reviewService.create(request, reviewerId = 2L)
        }

        verify(exactly = 0) { reviewRepository.save(any()) }
    }

    // --- trust score recalculation ---

    @Test
    fun `trust score is updated to average of all ratings`() {
        val borrow = testBorrow(status = BorrowStatus.returned)
        val request = CreateReviewRequest(borrowRequestId = 1L, rating = 5)
        val review = testReview(reviewerId = 2L, revieweeId = 1L, rating = 5)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)
        every { reviewRepository.findByBorrowRequestId(1L) } returns emptyList()
        every { reviewRepository.save(any()) } returns review
        // Average rating is 4.67 (should round to 4.67)
        every { reviewRepository.averageRatingByRevieweeId(1L) } returns 4.67
        every { userRepository.findById(1L) } returns Optional.of(owner)
        every { userRepository.save(any()) } answers { firstArg() }
        // toResponse lookups
        every { userRepository.findById(2L) } returns Optional.of(borrower)

        val result = reviewService.create(request, reviewerId = 2L)

        assertEquals(5, result.rating)
        // Math.round(4.67 * 100.0) / 100.0 = 4.67
        assertEquals(BigDecimal.valueOf(4.67), owner.trustScore)

        verify(exactly = 1) { reviewRepository.averageRatingByRevieweeId(1L) }
        verify(exactly = 1) { userRepository.save(any()) }
    }

    @Test
    fun `trust score is not updated when average returns null`() {
        val borrow = testBorrow(status = BorrowStatus.returned)
        val request = CreateReviewRequest(borrowRequestId = 1L, rating = 3)
        val review = testReview(reviewerId = 2L, revieweeId = 1L, rating = 3)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)
        every { reviewRepository.findByBorrowRequestId(1L) } returns emptyList()
        every { reviewRepository.save(any()) } returns review
        every { reviewRepository.averageRatingByRevieweeId(1L) } returns null
        // toResponse lookups
        every { userRepository.findById(2L) } returns Optional.of(borrower)
        every { userRepository.findById(1L) } returns Optional.of(owner)

        val result = reviewService.create(request, reviewerId = 2L)

        assertEquals(3, result.rating)
        // Trust score should NOT have been updated (stays at original 4.0)
        assertEquals(BigDecimal.valueOf(4.0), owner.trustScore)

        verify(exactly = 1) { reviewRepository.averageRatingByRevieweeId(1L) }
        verify(exactly = 0) { userRepository.save(any()) }
    }
}
