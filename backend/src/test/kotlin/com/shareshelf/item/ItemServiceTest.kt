package com.shareshelf.item

import com.fasterxml.jackson.databind.ObjectMapper
import com.shareshelf.auth.entity.User
import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.category.Category
import com.shareshelf.category.CategoryRepository
import com.shareshelf.item.dto.CreateItemRequest
import com.shareshelf.item.dto.UpdateItemRequest
import com.shareshelf.item.entity.Item
import com.shareshelf.item.entity.ItemStatus
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.security.access.AccessDeniedException
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

class ItemServiceTest {

    private val itemRepository = mockk<ItemRepository>()
    private val userRepository = mockk<UserRepository>()
    private val objectMapper = ObjectMapper()

    private val itemService = ItemService(
        itemRepository = itemRepository,
        userRepository = userRepository,
        objectMapper = objectMapper
    )

    private val testUser = User(
        id = 1L,
        name = "Test User",
        email = "test@example.com",
        passwordHash = "hash",
        trustScore = BigDecimal("4.5")
    )

    private val otherUser = User(
        id = 2L,
        name = "Other User",
        email = "other@example.com",
        passwordHash = "hash2",
        trustScore = BigDecimal("3.0")
    )

    private fun testItem(
        id: Long = 1L,
        ownerId: Long = 1L,
        title: String = "Test Item",
        categoryId: Long? = null,
        status: ItemStatus = ItemStatus.available,
        dailyPrice: BigDecimal = BigDecimal("5.00")
    ) = Item(
        id = id,
        ownerId = ownerId,
        title = title,
        description = "A test item",
        categoryId = categoryId,
        dailyPrice = dailyPrice,
        depositAmount = BigDecimal("20.00"),
        status = status,
        imageUrls = "[]",
        createdAt = LocalDateTime.now()
    ).apply { owner = if (ownerId == 1L) testUser else otherUser }

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    // --- findAll ---

    @Test
    fun `findAll returns paginated items with no filters`() {
        val pageable = PageRequest.of(0, 20)
        val item = testItem()
        val page = PageImpl(listOf(item), pageable, 1)

        every { itemRepository.findAll(pageable) } returns page

        val result = itemService.findAll(pageable = pageable)

        assertEquals(1, result.totalElements)
        assertEquals("Test Item", result.content.first().title)
        assertEquals("Test User", result.content.first().ownerName)

        verify(exactly = 1) { itemRepository.findAll(pageable) }
    }

    @Test
    fun `findAll applies search filter when provided`() {
        val pageable = PageRequest.of(0, 20)
        val item = testItem(title = "Power Drill")
        val page = PageImpl(listOf(item), pageable, 1)

        every { itemRepository.search("drill", null, null, pageable) } returns page

        val result = itemService.findAll(search = "drill", pageable = pageable)

        assertEquals(1, result.totalElements)
        assertEquals("Power Drill", result.content.first().title)

        verify(exactly = 1) { itemRepository.search("drill", null, null, pageable) }
    }

    @Test
    fun `findAll applies category filter when provided`() {
        val pageable = PageRequest.of(0, 20)
        val item = testItem()
        val page = PageImpl(listOf(item), pageable, 1)

        every { itemRepository.search(null, 5L, null, pageable) } returns page

        val result = itemService.findAll(categoryId = 5L, pageable = pageable)

        assertEquals(1, result.totalElements)

        verify(exactly = 1) { itemRepository.search(null, 5L, null, pageable) }
    }

    @Test
    fun `findAll returns owner name from entity association`() {
        val pageable = PageRequest.of(0, 20)
        val item = testItem().apply { owner = testUser }
        val page = PageImpl(listOf(item), pageable, 1)

        every { itemRepository.findAll(pageable) } returns page

        val result = itemService.findAll(pageable = pageable)

        assertEquals("Test User", result.content.first().ownerName)
        assertEquals(4.5, result.content.first().ownerTrustScore)
    }

    // --- findById ---

    @Test
    fun `findById returns item when found`() {
        val item = testItem()
        every { itemRepository.findById(1L) } returns Optional.of(item)

        val result = itemService.findById(1L)

        assertEquals(1L, result.id)
        assertEquals("Test Item", result.title)
        assertEquals("Test User", result.ownerName)

        verify(exactly = 1) { itemRepository.findById(1L) }
    }

    @Test
    fun `findById throws EntityNotFoundException when item not found`() {
        every { itemRepository.findById(99L) } returns Optional.empty()

        assertThrows(jakarta.persistence.EntityNotFoundException::class.java) {
            itemService.findById(99L)
        }

        verify(exactly = 1) { itemRepository.findById(99L) }
    }

    // --- create ---

    @Test
    fun `create saves item and returns response`() {
        val request = CreateItemRequest(
            title = "New Item",
            description = "Brand new",
            categoryId = 1L,
            dailyPrice = BigDecimal("10.00"),
            depositAmount = BigDecimal("50.00")
        )
        val savedItem = testItem(
            id = 10L,
            title = "New Item",
            categoryId = 1L,
            dailyPrice = BigDecimal("10.00")
        ).apply { depositAmount = BigDecimal("50.00") }

        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every { itemRepository.save(any()) } returns savedItem

        val result = itemService.create(request, ownerId = 1L)

        assertEquals(10L, result.id)
        assertEquals("New Item", result.title)
        assertEquals("Test User", result.ownerName)

        verify(exactly = 1) { userRepository.findById(1L) }
        verify(exactly = 1) { itemRepository.save(any()) }
    }

    @Test
    fun `create should return categoryName from category repository`() {
        val request = CreateItemRequest(
            title = "Hammer",
            description = "Heavy duty",
            categoryId = 1L,
            dailyPrice = BigDecimal("3.00"),
            depositAmount = BigDecimal("15.00")
        )
        val savedItem = testItem(
            id = 11L,
            title = "Hammer",
            categoryId = 1L,
            dailyPrice = BigDecimal("3.00")
        ).apply { depositAmount = BigDecimal("15.00") }

        every { userRepository.findById(1L) } returns Optional.of(testUser)
        every { itemRepository.save(any()) } returns savedItem

        val result = itemService.create(request, ownerId = 1L)

        assertEquals(11L, result.id)
        assertEquals("Hammer", result.title)
        assertEquals(1L, result.categoryId)
        assertNotNull(result.categoryName, "categoryName must not be null when categoryId is set")
        assertEquals("Tools", result.categoryName)
    }

    // --- update ---

    @Test
    fun `update succeeds when called by owner`() {
        val item = testItem(title = "Old Title")
        val request = UpdateItemRequest(title = "New Title")
        val updatedItem = testItem(title = "New Title")

        every { itemRepository.findById(1L) } returns Optional.of(item)
        every { itemRepository.save(any()) } returns updatedItem
        every { userRepository.findById(1L) } returns Optional.of(testUser)

        val result = itemService.update(1L, request, userId = 1L)

        assertEquals("New Title", result.title)

        verify(exactly = 1) { itemRepository.findById(1L) }
        verify(exactly = 1) { itemRepository.save(any()) }
    }

    @Test
    fun `update throws AccessDeniedException when called by non-owner`() {
        val item = testItem(ownerId = 1L)
        val request = UpdateItemRequest(title = "Stolen")

        every { itemRepository.findById(1L) } returns Optional.of(item)

        assertThrows(AccessDeniedException::class.java) {
            itemService.update(1L, request, userId = 2L)
        }

        verify(exactly = 1) { itemRepository.findById(1L) }
        verify(exactly = 0) { itemRepository.save(any()) }
    }

    @Test
    fun `update should return updated categoryName when categoryId changes`() {
        val item = testItem(title = "Old Title", categoryId = 1L)
        val request = UpdateItemRequest(categoryId = 2L)
        val updatedItem = testItem(title = "Old Title", categoryId = 2L)

        every { itemRepository.findById(1L) } returns Optional.of(item)
        every { itemRepository.save(any()) } returns updatedItem
        every { userRepository.findById(1L) } returns Optional.of(testUser)

        val result = itemService.update(1L, request, userId = 1L)

        assertEquals(2L, result.categoryId)
        assertNotNull(result.categoryName, "categoryName must not be null when categoryId is set")
    }

    // --- delete ---

    @Test
    fun `delete succeeds when called by owner`() {
        val item = testItem(ownerId = 1L)

        every { itemRepository.findById(1L) } returns Optional.of(item)
        every { itemRepository.delete(item) } just Runs

        itemService.delete(1L, userId = 1L)

        verify(exactly = 1) { itemRepository.findById(1L) }
        verify(exactly = 1) { itemRepository.delete(item) }
    }

    @Test
    fun `delete throws AccessDeniedException when called by non-owner`() {
        val item = testItem(ownerId = 1L)

        every { itemRepository.findById(1L) } returns Optional.of(item)

        assertThrows(AccessDeniedException::class.java) {
            itemService.delete(1L, userId = 2L)
        }

        verify(exactly = 1) { itemRepository.findById(1L) }
        verify(exactly = 0) { itemRepository.delete(any()) }
    }

    @Test
    fun `delete throws EntityNotFoundException when item not found`() {
        every { itemRepository.findById(99L) } returns Optional.empty()

        assertThrows(jakarta.persistence.EntityNotFoundException::class.java) {
            itemService.delete(99L, userId = 1L)
        }
    }
}
