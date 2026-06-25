package com.shareshelf.chat

import com.fasterxml.jackson.databind.ObjectMapper
import com.shareshelf.auth.entity.User
import com.shareshelf.auth.entity.UserRepository
import com.shareshelf.borrow.BorrowRepository
import com.shareshelf.borrow.entity.BorrowRequest
import com.shareshelf.chat.dto.SendMessageRequest
import com.shareshelf.chat.entity.ChatMessage
import com.shareshelf.item.ItemRepository
import com.shareshelf.item.entity.Item
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.access.AccessDeniedException
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

class ChatServiceTest {

    private val chatRepository = mockk<ChatRepository>()
    private val borrowRepository = mockk<BorrowRepository>()
    private val userRepository = mockk<UserRepository>()
    private val itemRepository = mockk<ItemRepository>()
    private val objectMapper = ObjectMapper()

    private val chatService = ChatService(
        chatRepository = chatRepository,
        borrowRepository = borrowRepository,
        userRepository = userRepository,
        itemRepository = itemRepository,
        objectMapper = objectMapper
    )

    private val now = LocalDateTime.now()

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
        passwordHash = "hash",
        trustScore = BigDecimal("3.0")
    )

    private val stranger = User(
        id = 3L,
        name = "Stranger",
        email = "stranger@example.com",
        passwordHash = "hash",
        trustScore = BigDecimal("2.0")
    )

    private val testItem = Item(
        id = 10L,
        ownerId = 1L,
        title = "Power Drill",
        description = "A drill",
        dailyPrice = BigDecimal("5.00"),
        depositAmount = BigDecimal("20.00"),
        imageUrls = "[]",
        createdAt = now
    )

    private fun chatMessage(
        id: Long = 1L,
        senderId: Long = 2L,
        receiverId: Long = 1L,
        itemId: Long = 10L,
        message: String = "Hello!",
        readAt: LocalDateTime? = null,
        createdAt: LocalDateTime = now
    ) = ChatMessage(
        id = id,
        senderId = senderId,
        receiverId = receiverId,
        itemId = itemId,
        message = message,
        readAt = readAt,
        createdAt = createdAt
    )

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    // --- sendMessage ---

    @Test
    fun `sendMessage succeeds when borrower has borrow request for item`() {
        val request = SendMessageRequest(itemId = 10L, receiverId = 1L, message = "Is this available?")
        val savedMessage = chatMessage(id = 100L, senderId = 2L, receiverId = 1L, message = "Is this available?")

        every { itemRepository.findById(10L) } returns Optional.of(testItem)
        every { userRepository.findById(1L) } returns Optional.of(owner)
        every { borrowRepository.findByItemIdAndBorrowerId(10L, 2L) } returns listOf(
            BorrowRequest(id = 1L, itemId = 10L, borrowerId = 2L, ownerId = 1L)
        )
        every { chatRepository.save(any()) } returns savedMessage

        val result = chatService.sendMessage(2L, request)

        assertEquals(100L, result.id)
        assertEquals("Is this available?", result.message)
        assertEquals(2L, result.senderId)
        assertEquals(1L, result.receiverId)

        verify(exactly = 1) { chatRepository.save(any()) }
    }

    @Test
    fun `sendMessage succeeds when sender is item owner`() {
        val request = SendMessageRequest(itemId = 10L, receiverId = 2L, message = "Yes, it is available")
        val savedMessage = chatMessage(id = 101L, senderId = 1L, receiverId = 2L, message = "Yes, it is available")

        every { itemRepository.findById(10L) } returns Optional.of(testItem)
        every { userRepository.findById(2L) } returns Optional.of(borrower)
        every { borrowRepository.findByItemIdAndBorrowerId(10L, 1L) } returns emptyList()
        every { chatRepository.save(any()) } returns savedMessage

        val result = chatService.sendMessage(1L, request)

        assertEquals(101L, result.id)
        assertEquals("Yes, it is available", result.message)
        assertEquals(1L, result.senderId)

        verify(exactly = 1) { chatRepository.save(any()) }
    }

    @Test
    fun `sendMessage throws AccessDeniedException when user has no borrow request and is not owner`() {
        val request = SendMessageRequest(itemId = 10L, receiverId = 1L, message = "Hey")

        every { itemRepository.findById(10L) } returns Optional.of(testItem)
        every { userRepository.findById(1L) } returns Optional.of(owner)
        every { borrowRepository.findByItemIdAndBorrowerId(10L, 3L) } returns emptyList()

        assertThrows(AccessDeniedException::class.java) {
            chatService.sendMessage(3L, request)
        }

        verify(exactly = 0) { chatRepository.save(any()) }
    }

    @Test
    fun `sendMessage throws IllegalArgumentException when sender equals receiver`() {
        val request = SendMessageRequest(itemId = 10L, receiverId = 1L, message = "Talking to myself")

        assertThrows(IllegalArgumentException::class.java) {
            chatService.sendMessage(1L, request)
        }

        verify(exactly = 0) { itemRepository.findById(any()) }
        verify(exactly = 0) { chatRepository.save(any()) }
    }

    @Test
    fun `sendMessage throws EntityNotFoundException when item not found`() {
        val request = SendMessageRequest(itemId = 999L, receiverId = 1L, message = "Hello")

        every { itemRepository.findById(999L) } returns Optional.empty()

        assertThrows(jakarta.persistence.EntityNotFoundException::class.java) {
            chatService.sendMessage(2L, request)
        }

        verify(exactly = 0) { chatRepository.save(any()) }
    }

    @Test
    fun `sendMessage throws EntityNotFoundException when receiver not found`() {
        val request = SendMessageRequest(itemId = 10L, receiverId = 999L, message = "Hello")

        every { itemRepository.findById(10L) } returns Optional.of(testItem)
        every { userRepository.findById(999L) } returns Optional.empty()

        assertThrows(jakarta.persistence.EntityNotFoundException::class.java) {
            chatService.sendMessage(2L, request)
        }

        verify(exactly = 0) { chatRepository.save(any()) }
    }

    // --- getConversation ---

    @Test
    fun `getConversation returns messages for valid participant`() {
        val messages = listOf(
            chatMessage(id = 1L, senderId = 2L, receiverId = 1L, message = "Hi"),
            chatMessage(id = 2L, senderId = 1L, receiverId = 2L, message = "Hello!")
        )
        val pageable = PageRequest.of(0, 50, Sort.by("createdAt").descending())

        every { chatRepository.findConversation(10L, 1L, 2L, any()) } returns messages
        every { userRepository.findById(2L) } returns Optional.of(borrower)
        every { itemRepository.findById(10L) } returns Optional.of(testItem)

        val result = chatService.getConversation(itemId = 10L, otherUserId = 2L, userId = 1L)

        assertEquals(10L, result.itemId)
        assertEquals("Power Drill", result.itemTitle)
        assertEquals(2L, result.otherUserId)
        assertEquals("Borrower", result.otherUserName)
        assertEquals(2, result.messages.size)
        assertEquals("Hi", result.messages[0].message)
        assertEquals("Hello!", result.messages[1].message)
    }

    @Test
    fun `getConversation returns empty messages when no conversation exists`() {
        every { chatRepository.findConversation(10L, 1L, 2L, any()) } returns emptyList()
        every { userRepository.findById(2L) } returns Optional.of(borrower)
        every { itemRepository.findById(10L) } returns Optional.of(testItem)

        val result = chatService.getConversation(itemId = 10L, otherUserId = 2L, userId = 1L)

        assertTrue(result.messages.isEmpty())
        assertEquals("Power Drill", result.itemTitle)
    }

    // --- getConversations ---

    @Test
    fun `getConversations returns sorted conversation list`() {
        val latestMsg = chatMessage(id = 5L, senderId = 2L, receiverId = 1L, message = "Last message", createdAt = now)

        every { chatRepository.findConversationsByUserId(1L) } returns listOf(latestMsg)
        every { userRepository.findById(2L) } returns Optional.of(borrower)
        every { itemRepository.findById(10L) } returns Optional.of(testItem)
        every { chatRepository.countUnreadByItemAndReceiver(10L, 1L, 2L) } returns 3L

        val result = chatService.getConversations(1L)

        assertEquals(1, result.size)
        assertEquals(10L, result[0].itemId)
        assertEquals("Power Drill", result[0].itemTitle)
        assertEquals(2L, result[0].otherUserId)
        assertEquals("Borrower", result[0].otherUserName)
        assertEquals("Last message", result[0].lastMessage)
        assertEquals(3L, result[0].unreadCount)
    }

    @Test
    fun `getConversations returns empty list when no conversations exist`() {
        every { chatRepository.findConversationsByUserId(1L) } returns emptyList()

        val result = chatService.getConversations(1L)

        assertTrue(result.isEmpty())
    }

    @Test
    fun `getConversations resolves otherUserId correctly when user is sender`() {
        // User 1 sent the last message to user 2
        val latestMsg = chatMessage(id = 5L, senderId = 1L, receiverId = 2L, message = "I sent this")

        every { chatRepository.findConversationsByUserId(1L) } returns listOf(latestMsg)
        every { userRepository.findById(2L) } returns Optional.of(borrower)
        every { itemRepository.findById(10L) } returns Optional.of(testItem)
        every { chatRepository.countUnreadByItemAndReceiver(10L, 1L, 2L) } returns 0L

        val result = chatService.getConversations(1L)

        assertEquals(2L, result[0].otherUserId, "otherUserId should be the other party, not the current user")
    }

    // --- markAsRead ---

    @Test
    fun `markAsRead calls repository with correct params`() {
        every { chatRepository.markAsRead(10L, 2L, 1L) } returns 5

        chatService.markAsRead(itemId = 10L, senderId = 2L, receiverId = 1L)

        verify(exactly = 1) { chatRepository.markAsRead(10L, 2L, 1L) }
    }

    // --- getUnreadCount ---

    @Test
    fun `getUnreadCount returns count of conversations with unread`() {
        every { chatRepository.countUnreadConversationsByReceiverId(1L) } returns 4L

        val result = chatService.getUnreadCount(1L)

        assertEquals(4L, result.conversationsWithUnread)
        verify(exactly = 1) { chatRepository.countUnreadConversationsByReceiverId(1L) }
    }

    @Test
    fun `getUnreadCount returns zero when no unread messages`() {
        every { chatRepository.countUnreadConversationsByReceiverId(1L) } returns 0L

        val result = chatService.getUnreadCount(1L)

        assertEquals(0L, result.conversationsWithUnread)
    }
}
