package com.shareshelf.borrow

import com.fasterxml.jackson.databind.ObjectMapper
import com.shareshelf.auth.entity.User
import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.borrow.dto.CreateBorrowRequest
import com.shareshelf.borrow.entity.BorrowRequest
import com.shareshelf.borrow.entity.BorrowStatus
import com.shareshelf.item.ItemRepository
import com.shareshelf.item.entity.Item
import com.shareshelf.item.entity.ItemStatus
import com.shareshelf.notification.NotificationService
import com.shareshelf.review.ReviewService
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.security.access.AccessDeniedException
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

class BorrowServiceTest {

    private val borrowRepository = mockk<BorrowRepository>()
    private val itemRepository = mockk<ItemRepository>()
    private val userRepository = mockk<UserRepository>()
    private val notificationService = mockk<NotificationService>(relaxed = true)
    private val objectMapper = ObjectMapper()
    private val reviewService = mockk<ReviewService>(relaxed = true)

    private val borrowService = BorrowService(
        borrowRepository = borrowRepository,
        itemRepository = itemRepository,
        userRepository = userRepository,
        notificationService = notificationService,
        objectMapper = objectMapper,
        reviewService = reviewService
    )

    private val owner = User(
        id = 1L,
        name = "Owner",
        email = "owner@example.com",
        passwordHash = "hash",
        trustScore = BigDecimal("4.5")
    )

    private val borrower = User(
        id = 2L,
        name = "Borrower",
        email = "borrower@example.com",
        passwordHash = "hash2",
        trustScore = BigDecimal("3.0")
    )

    private fun testItem(
        id: Long = 1L,
        ownerId: Long = 1L,
        status: ItemStatus = ItemStatus.available,
        title: String = "Test Item"
    ) = Item(
        id = id,
        ownerId = ownerId,
        title = title,
        description = null,
        categoryId = null,
        dailyPrice = BigDecimal("5.00"),
        depositAmount = null,
        status = status,
        imageUrls = "[\"https://example.com/img.jpg\"]",
        createdAt = LocalDateTime.now()
    )

    private fun testBorrow(
        id: Long = 1L,
        itemId: Long = 1L,
        borrowerId: Long = 2L,
        ownerId: Long = 1L,
        status: BorrowStatus = BorrowStatus.pending,
        startDate: LocalDate = LocalDate.now(),
        endDate: LocalDate = LocalDate.now().plusDays(3)
    ) = BorrowRequest(
        id = id,
        itemId = itemId,
        borrowerId = borrowerId,
        ownerId = ownerId,
        status = status,
        startDate = startDate,
        endDate = endDate,
        message = "Can I borrow this?",
        createdAt = LocalDateTime.now()
    )

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    // --- create ---

    @Test
    fun `create borrow request when item is available`() {
        val item = testItem(id = 1L, ownerId = 1L, status = ItemStatus.available)
        val request = CreateBorrowRequest(
            itemId = 1L,
            message = "Need this for the weekend",
            startDate = LocalDate.now(),
            endDate = LocalDate.now().plusDays(2)
        )

        every { itemRepository.findById(1L) } returns Optional.of(item)
        every { borrowRepository.findByItemIdAndBorrowerIdAndStatus(1L, 2L, BorrowStatus.pending) } returns emptyList()
        val savedBorrow = testBorrow(id = 1L).copy(
            message = "Need this for the weekend",
            startDate = LocalDate.now(),
            endDate = LocalDate.now().plusDays(2)
        )
        every { borrowRepository.save(any<BorrowRequest>()) } returns savedBorrow
        // toResponse() lookups
        every { userRepository.findById(2L) } returns Optional.of(borrower)
        every { userRepository.findById(1L) } returns Optional.of(owner)
        every { itemRepository.findById(1L) } returns Optional.of(item)

        val result = borrowService.create(request, borrowerId = 2L)

        assertEquals(1L, result.itemId)
        assertEquals(BorrowStatus.pending, result.status)
        assertEquals("Borrower", result.borrowerName)
        assertEquals("Owner", result.ownerName)

        verify(exactly = 2) { itemRepository.findById(1L) }  // create() + toResponse()
        verify(exactly = 1) { borrowRepository.save(any<BorrowRequest>()) }
    }

    @Test
    fun `create throws when item is not available`() {
        val item = testItem(id = 1L, status = ItemStatus.borrowed)
        val request = CreateBorrowRequest(itemId = 1L)

        every { itemRepository.findById(1L) } returns Optional.of(item)

        assertThrows(IllegalStateException::class.java) {
            borrowService.create(request, borrowerId = 2L)
        }

        verify(exactly = 1) { itemRepository.findById(1L) }
        verify(exactly = 0) { borrowRepository.save(any()) }
    }

    @Test
    fun `create throws when borrowing own item`() {
        val item = testItem(id = 1L, ownerId = 1L, status = ItemStatus.available)
        val request = CreateBorrowRequest(itemId = 1L)

        every { itemRepository.findById(1L) } returns Optional.of(item)

        assertThrows(IllegalArgumentException::class.java) {
            borrowService.create(request, borrowerId = 1L)
        }

        verify(exactly = 1) { itemRepository.findById(1L) }
        verify(exactly = 0) { borrowRepository.save(any()) }
    }

    @Test
    fun `create method is annotated with Transactional`() {
        val method = BorrowService::class.java.getMethod(
            "create",
            CreateBorrowRequest::class.java,
            Long::class.java
        )
        assertTrue(
            method.isAnnotationPresent(Transactional::class.java),
            "BorrowService.create() must be annotated with @Transactional to prevent item/borrow state desync"
        )
    }

    // --- approve ---

    @Test
    fun `approve transitions borrow to APPROVED and item to BORROWED`() {
        val borrow = testBorrow(status = BorrowStatus.pending)
        val item = testItem(status = ItemStatus.available)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)
        every { itemRepository.findById(1L) } returns Optional.of(item)
        every { itemRepository.save(any()) } answers { firstArg() }
        every { borrowRepository.save(any()) } answers { firstArg() }
        // toResponse lookups
        every { userRepository.findById(2L) } returns Optional.of(borrower)
        every { userRepository.findById(1L) } returns Optional.of(owner)

        val result = borrowService.approve(1L, userId = 1L)

        assertEquals(BorrowStatus.approved, result.status)
        assertEquals(ItemStatus.borrowed, item.status)

        verify(exactly = 1) { borrowRepository.findById(1L) }
        verify(exactly = 1) { itemRepository.save(any()) }
        verify(exactly = 1) { borrowRepository.save(any()) }
    }

    @Test
    fun `approve throws AccessDeniedException when caller is not the owner`() {
        val borrow = testBorrow(status = BorrowStatus.pending, ownerId = 1L)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)

        assertThrows(AccessDeniedException::class.java) {
            borrowService.approve(1L, userId = 3L)
        }

        verify(exactly = 0) { itemRepository.save(any()) }
        verify(exactly = 0) { borrowRepository.save(any()) }
    }

    @Test
    fun `approve throws when borrow is not pending`() {
        val borrow = testBorrow(status = BorrowStatus.approved)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)

        assertThrows(IllegalStateException::class.java) {
            borrowService.approve(1L, userId = 1L)
        }

        verify(exactly = 0) { itemRepository.save(any()) }
        verify(exactly = 0) { borrowRepository.save(any()) }
    }

    // --- reject ---

    @Test
    fun `reject transitions borrow to REJECTED and makes item available`() {
        val borrow = testBorrow(status = BorrowStatus.pending)
        val item = testItem(status = ItemStatus.borrowed)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)
        every { itemRepository.findById(1L) } returns Optional.of(item)
        every { borrowRepository.findByItemId(1L) } returns listOf(borrow)
        every { itemRepository.save(any()) } answers { firstArg() }
        every { borrowRepository.save(any()) } answers { firstArg() }
        // toResponse lookups
        every { userRepository.findById(2L) } returns Optional.of(borrower)
        every { userRepository.findById(1L) } returns Optional.of(owner)

        val result = borrowService.reject(1L, userId = 1L)

        assertEquals(BorrowStatus.rejected, result.status)
        assertEquals(ItemStatus.available, item.status)

        verify(exactly = 1) { borrowRepository.findById(1L) }
        verify(exactly = 1) { itemRepository.save(any()) }
        verify(exactly = 1) { borrowRepository.save(any()) }
    }

    @Test
    fun `reject throws when borrow is not pending`() {
        val borrow = testBorrow(status = BorrowStatus.approved)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)

        assertThrows(IllegalStateException::class.java) {
            borrowService.reject(1L, userId = 1L)
        }
    }

    @Test
    fun `reject throws AccessDeniedException when caller is not the owner`() {
        val borrow = testBorrow(status = BorrowStatus.pending, ownerId = 1L)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)

        assertThrows(AccessDeniedException::class.java) {
            borrowService.reject(1L, userId = 3L)
        }
    }

    // --- markReturned ---

    @Test
    fun `markReturned transitions borrow to RETURNED and makes item available`() {
        val borrow = testBorrow(status = BorrowStatus.approved)
        val item = testItem(status = ItemStatus.borrowed)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)
        every { itemRepository.findById(1L) } returns Optional.of(item)
        every { itemRepository.save(any()) } answers { firstArg() }
        every { borrowRepository.save(any()) } answers { firstArg() }
        every { reviewService.addTrustScoreBonus(any(), any()) } just Runs
        // toResponse lookups
        every { userRepository.findById(2L) } returns Optional.of(borrower)
        every { userRepository.findById(1L) } returns Optional.of(owner)

        val result = borrowService.markReturned(1L, userId = 1L)

        assertEquals(BorrowStatus.returned, result.status)
        assertEquals(ItemStatus.available, item.status)

        verify(exactly = 1) { borrowRepository.findById(1L) }
        verify(exactly = 1) { itemRepository.save(any()) }
        verify(exactly = 1) { borrowRepository.save(any()) }
        verify(exactly = 1) { reviewService.addTrustScoreBonus(2L, 0.1) }
        verify(exactly = 1) { reviewService.addTrustScoreBonus(1L, 0.1) }
    }

    @Test
    fun `markReturned throws when borrow is not approved`() {
        val borrow = testBorrow(status = BorrowStatus.pending)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)

        assertThrows(IllegalStateException::class.java) {
            borrowService.markReturned(1L, userId = 1L)
        }
    }

    @Test
    fun `markReturned throws AccessDeniedException when caller is not the owner`() {
        val borrow = testBorrow(status = BorrowStatus.approved, ownerId = 1L)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)

        assertThrows(AccessDeniedException::class.java) {
            borrowService.markReturned(1L, userId = 3L)
        }
    }

    // --- cancel ---

    @Test
    fun `cancel transitions pending borrow to CANCELLED`() {
        val borrow = testBorrow(status = BorrowStatus.pending)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)
        every { borrowRepository.save(any()) } answers { firstArg() }
        every { userRepository.findById(2L) } returns Optional.of(borrower)
        every { userRepository.findById(1L) } returns Optional.of(owner)
        every { itemRepository.findById(1L) } returns Optional.of(testItem())

        val result = borrowService.cancel(1L, borrowerId = 2L)

        assertEquals(BorrowStatus.cancelled, result.status)
        verify(exactly = 1) { borrowRepository.save(any()) }
    }

    @Test
    fun `cancel throws AccessDeniedException when caller is not the borrower`() {
        val borrow = testBorrow(status = BorrowStatus.pending, borrowerId = 2L)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)

        assertThrows(AccessDeniedException::class.java) {
            borrowService.cancel(1L, borrowerId = 3L)
        }
    }

    @Test
    fun `cancel throws when borrow is not pending`() {
        val borrow = testBorrow(status = BorrowStatus.approved)

        every { borrowRepository.findById(1L) } returns Optional.of(borrow)

        assertThrows(IllegalStateException::class.java) {
            borrowService.cancel(1L, borrowerId = 2L)
        }
    }

    @Test
    fun `create throws when duplicate pending request exists`() {
        val item = testItem(id = 1L, ownerId = 1L, status = ItemStatus.available)
        val request = CreateBorrowRequest(itemId = 1L)

        every { itemRepository.findById(1L) } returns Optional.of(item)
        every { borrowRepository.findByItemIdAndBorrowerIdAndStatus(1L, 2L, BorrowStatus.pending) } returns listOf(testBorrow())

        assertThrows(IllegalStateException::class.java) {
            borrowService.create(request, borrowerId = 2L)
        }

        verify(exactly = 0) { borrowRepository.save(any()) }
    }

    // --- findByUser ---

    @Test
    fun `findByUser returns paginated borrows for the user`() {
        val pageable = PageRequest.of(0, 20)
        val borrow = testBorrow()
        val page = PageImpl(listOf(borrow), pageable, 1)
        val item = testItem()

        every { borrowRepository.findByUserId(2L, pageable) } returns page
        every { itemRepository.findById(1L) } returns Optional.of(item)
        every { userRepository.findById(2L) } returns Optional.of(borrower)
        every { userRepository.findById(1L) } returns Optional.of(owner)

        val result = borrowService.findByUser(2L, pageable)

        assertEquals(1, result.totalElements)
        assertEquals("Borrower", result.content.first().borrowerName)
        assertEquals("Owner", result.content.first().ownerName)

        verify(exactly = 1) { borrowRepository.findByUserId(2L, pageable) }
        verify(exactly = 1) { itemRepository.findById(1L) }
        verify(exactly = 1) { userRepository.findById(2L) }
        verify(exactly = 1) { userRepository.findById(1L) }
    }
}
