package com.shareshelf.community

import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.borrow.BorrowRepository
import com.shareshelf.borrow.entity.BorrowStatus
import com.shareshelf.item.ItemRepository
import com.shareshelf.item.ItemService
import com.shareshelf.item.entity.Item
import com.shareshelf.item.entity.ItemStatus
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageRequest
import java.math.BigDecimal
import java.time.LocalDateTime

class CommunityControllerTest {

    private val itemRepository = mockk<ItemRepository>()
    private val userRepository = mockk<UserRepository>()
    private val borrowRepository = mockk<BorrowRepository>()
    private val itemService = mockk<ItemService>()

    private val controller = CommunityController(
        itemRepository = itemRepository,
        userRepository = userRepository,
        borrowRepository = borrowRepository,
        itemService = itemService
    )

    private val testItem = Item(
        id = 1L,
        ownerId = 1L,
        title = "Power Drill",
        description = "A cordless drill",
        categoryId = 1L,
        dailyPrice = BigDecimal("5.00"),
        status = ItemStatus.available,
        imageUrls = "[]",
        createdAt = LocalDateTime.now()
    )

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    @Test
    fun `getStats returns correct community statistics`() {
        every { itemRepository.count() } returns 10L
        every { userRepository.count() } returns 25L
        every { borrowRepository.countByStatus(BorrowStatus.approved) } returns 3L
        every { itemRepository.findTop5ByStatusOrderByCreatedAtDesc(ItemStatus.available) } returns listOf(testItem)
        every { itemRepository.findTopLenders(PageRequest.of(0, 5)) } returns listOf(
            arrayOf(1L, 5L, "Alice", BigDecimal("4.8")),
            arrayOf(2L, 3L, "Bob", BigDecimal("4.5"))
        )
        every { itemService.findById(1L) } returns com.shareshelf.item.dto.ItemResponse(
            id = 1L,
            ownerId = 1L,
            ownerName = "Alice",
            ownerTrustScore = 4.8,
            categoryId = 1L,
            categoryName = "Tools",
            title = "Power Drill",
            description = "A cordless drill",
            dailyPrice = BigDecimal("5.00"),
            depositAmount = null,
            status = ItemStatus.available,
            imageUrls = emptyList(),
            createdAt = LocalDateTime.now()
        )

        val result = controller.getStats()

        assertEquals(200, result.statusCode.value())
        assertNotNull(result.body?.data)
        val stats = result.body?.data!!
        assertEquals(10L, stats.totalItems)
        assertEquals(25L, stats.totalMembers)
        assertEquals(3L, stats.activeBorrows)
        assertEquals(1, stats.recentItems.size)
        assertEquals(2, stats.topLenders.size)
        assertEquals("Alice", stats.topLenders.first().name)
        assertEquals(5L, stats.topLenders.first().itemCount)
        assertEquals(BigDecimal("4.8"), stats.topLenders.first().trustScore)

        verify(exactly = 1) { itemRepository.count() }
        verify(exactly = 1) { userRepository.count() }
        verify(exactly = 1) { borrowRepository.countByStatus(BorrowStatus.approved) }
    }

    @Test
    fun `getStats handles empty database`() {
        every { itemRepository.count() } returns 0L
        every { userRepository.count() } returns 0L
        every { borrowRepository.countByStatus(BorrowStatus.approved) } returns 0L
        every { itemRepository.findTop5ByStatusOrderByCreatedAtDesc(ItemStatus.available) } returns emptyList()
        every { itemRepository.findTopLenders(PageRequest.of(0, 5)) } returns emptyList()

        val result = controller.getStats()

        assertEquals(200, result.statusCode.value())
        val stats = result.body?.data!!
        assertEquals(0L, stats.totalItems)
        assertEquals(0L, stats.totalMembers)
        assertEquals(0L, stats.activeBorrows)
        assertTrue(stats.recentItems.isEmpty())
        assertTrue(stats.topLenders.isEmpty())
    }
}
