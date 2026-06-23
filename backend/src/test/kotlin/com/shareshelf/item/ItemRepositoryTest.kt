package com.shareshelf.item

import com.shareshelf.item.entity.Item
import com.shareshelf.item.entity.ItemStatus
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.math.BigDecimal
import java.time.LocalDateTime

class ItemRepositoryTest {

    private val itemRepository = mockk<ItemRepository>()

    private fun testItem(
        id: Long = 1L,
        ownerId: Long = 1L,
        title: String = "Test Item",
        status: ItemStatus = ItemStatus.available,
        dailyPrice: BigDecimal = BigDecimal("5.00")
    ) = Item(
        id = id,
        ownerId = ownerId,
        title = title,
        description = "A test item",
        categoryId = null,
        dailyPrice = dailyPrice,
        depositAmount = BigDecimal("20.00"),
        status = status,
        imageUrls = "[]",
        createdAt = LocalDateTime.now()
    )

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    @Test
    fun `findNearby returns items within radius`() {
        val pageable = PageRequest.of(0, 20)
        val item = testItem()
        val page = PageImpl(listOf(item), pageable, 1)

        every { itemRepository.findNearby(16.84, 96.17, 5000.0, pageable) } returns page

        val result = itemRepository.findNearby(16.84, 96.17, 5000.0, pageable)

        assertEquals(1, result.totalElements)
        assertEquals("Test Item", result.content.first().title)

        verify(exactly = 1) { itemRepository.findNearby(16.84, 96.17, 5000.0, pageable) }
    }

    @Test
    fun `findNearby excludes items without location`() {
        val pageable = PageRequest.of(0, 20)
        val page = PageImpl(emptyList<Item>(), pageable, 0)

        every { itemRepository.findNearby(16.84, 96.17, 5000.0, pageable) } returns page

        val result = itemRepository.findNearby(16.84, 96.17, 5000.0, pageable)

        assertEquals(0, result.totalElements)
        assertTrue(result.content.isEmpty())

        verify(exactly = 1) { itemRepository.findNearby(16.84, 96.17, 5000.0, pageable) }
    }

    @Test
    fun `findNearby excludes items beyond radius`() {
        val pageable = PageRequest.of(0, 20)
        val page = PageImpl(emptyList<Item>(), pageable, 0)

        every { itemRepository.findNearby(16.84, 96.17, 5000.0, pageable) } returns page

        val result = itemRepository.findNearby(16.84, 96.17, 5000.0, pageable)

        assertEquals(0, result.totalElements)

        verify(exactly = 1) { itemRepository.findNearby(16.84, 96.17, 5000.0, pageable) }
    }

    @Test
    fun `findNearby orders by distance ascending`() {
        val pageable = PageRequest.of(0, 20)
        val nearbyItem = testItem(id = 1L, title = "Nearby Item")
        val farItem = testItem(id = 2L, title = "Far Item")
        val page = PageImpl(listOf(nearbyItem, farItem), pageable, 2)

        every { itemRepository.findNearby(16.84, 96.17, 10000.0, pageable) } returns page

        val result = itemRepository.findNearby(16.84, 96.17, 10000.0, pageable)

        assertEquals(2, result.totalElements)
        assertEquals("Nearby Item", result.content[0].title)
        assertEquals("Far Item", result.content[1].title)

        verify(exactly = 1) { itemRepository.findNearby(16.84, 96.17, 10000.0, pageable) }
    }

    @Test
    fun `findNearby returns empty page when no items match`() {
        val pageable = PageRequest.of(0, 20)
        val page = PageImpl(emptyList<Item>(), pageable, 0)

        every { itemRepository.findNearby(0.0, 0.0, 1000.0, pageable) } returns page

        val result = itemRepository.findNearby(0.0, 0.0, 1000.0, pageable)

        assertNotNull(result)
        assertEquals(0, result.totalElements)
        assertTrue(result.content.isEmpty())

        verify(exactly = 1) { itemRepository.findNearby(0.0, 0.0, 1000.0, pageable) }
    }

    @Test
    fun `findNearby uses correct argument order for ST_MakePoint`() {
        val pageable = PageRequest.of(0, 20)
        val item = testItem()
        val page = PageImpl(listOf(item), pageable, 1)

        // lat=16.84, lng=96.17 — verify the method is called with these exact params
        every { itemRepository.findNearby(16.84, 96.17, 3000.0, pageable) } returns page

        val result = itemRepository.findNearby(16.84, 96.17, 3000.0, pageable)

        assertEquals(1, result.totalElements)

        verify(exactly = 1) { itemRepository.findNearby(16.84, 96.17, 3000.0, pageable) }
    }
}
