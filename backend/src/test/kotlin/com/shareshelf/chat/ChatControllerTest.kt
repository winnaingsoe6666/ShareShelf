package com.shareshelf.chat

import com.shareshelf.auth.UserPrincipal
import com.shareshelf.auth.entity.User
import com.shareshelf.chat.dto.*
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import java.math.BigDecimal
import java.time.LocalDateTime

class ChatControllerTest {

    private val chatService = mockk<ChatService>()
    private val chatController = ChatController(chatService)

    private val now = LocalDateTime.now()

    private val testUser = User(
        id = 1L,
        name = "Test User",
        email = "test@example.com",
        passwordHash = "hash",
        trustScore = BigDecimal("4.5")
    )

    private val principal = UserPrincipal(testUser)

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    // --- GET /api/chat/conversations ---

    @Test
    fun `getConversations returns conversation list`() {
        val conversations = listOf(
            ConversationResponse(
                itemId = 10L,
                itemTitle = "Power Drill",
                itemImageUrl = null,
                otherUserId = 2L,
                otherUserName = "Borrower",
                otherUserAvatarUrl = null,
                lastMessage = "Is this available?",
                lastMessageAt = now,
                unreadCount = 2L
            )
        )

        every { chatService.getConversations(1L) } returns conversations

        val response = chatController.getConversations(principal)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertTrue(response.body!!.success)
        val data = response.body!!.data!!
        assertEquals(1, data.size)
        assertEquals(10L, data[0].itemId)
        assertEquals("Power Drill", data[0].itemTitle)
        assertEquals(2L, data[0].otherUserId)
        assertEquals(2L, data[0].unreadCount)

        verify(exactly = 1) { chatService.getConversations(1L) }
    }

    @Test
    fun `getConversations returns empty list when no conversations`() {
        every { chatService.getConversations(1L) } returns emptyList()

        val response = chatController.getConversations(principal)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertTrue(response.body!!.success)
        assertTrue(response.body!!.data!!.isEmpty())
    }

    // --- GET /api/chat/conversations/{itemId}/{otherUserId} ---

    @Test
    fun `getConversation returns conversation detail`() {
        val detail = ConversationDetailResponse(
            itemId = 10L,
            itemTitle = "Power Drill",
            itemImageUrl = null,
            otherUserId = 2L,
            otherUserName = "Borrower",
            otherUserAvatarUrl = null,
            messages = listOf(
                MessageResponse(
                    id = 1L,
                    senderId = 2L,
                    receiverId = 1L,
                    itemId = 10L,
                    message = "Hi there",
                    readAt = null,
                    createdAt = now
                )
            )
        )

        every { chatService.getConversation(10L, 2L, 1L, 0, 50) } returns detail

        val response = chatController.getConversation(
            itemId = 10L,
            otherUserId = 2L,
            page = null,
            size = null,
            principal = principal
        )

        assertEquals(HttpStatus.OK, response.statusCode)
        assertTrue(response.body!!.success)
        val data = response.body!!.data!!
        assertEquals(10L, data.itemId)
        assertEquals("Power Drill", data.itemTitle)
        assertEquals(1, data.messages.size)
        assertEquals("Hi there", data.messages[0].message)

        verify(exactly = 1) { chatService.getConversation(10L, 2L, 1L, 0, 50) }
    }

    @Test
    fun `getConversation passes page and size params to service`() {
        val detail = ConversationDetailResponse(
            itemId = 10L,
            itemTitle = "Drill",
            itemImageUrl = null,
            otherUserId = 2L,
            otherUserName = "User",
            otherUserAvatarUrl = null,
            messages = emptyList()
        )

        every { chatService.getConversation(10L, 2L, 1L, 2, 25) } returns detail

        val response = chatController.getConversation(
            itemId = 10L,
            otherUserId = 2L,
            page = 2,
            size = 25,
            principal = principal
        )

        assertEquals(HttpStatus.OK, response.statusCode)
        verify(exactly = 1) { chatService.getConversation(10L, 2L, 1L, 2, 25) }
    }

    @Test
    fun `getConversation caps size at 100`() {
        val detail = ConversationDetailResponse(
            itemId = 10L,
            itemTitle = "Drill",
            itemImageUrl = null,
            otherUserId = 2L,
            otherUserName = "User",
            otherUserAvatarUrl = null,
            messages = emptyList()
        )

        every { chatService.getConversation(10L, 2L, 1L, 0, 100) } returns detail

        val response = chatController.getConversation(
            itemId = 10L,
            otherUserId = 2L,
            page = null,
            size = 500,
            principal = principal
        )

        assertEquals(HttpStatus.OK, response.statusCode)
        verify(exactly = 1) { chatService.getConversation(10L, 2L, 1L, 0, 100) }
    }

    // --- POST /api/chat/conversations/{itemId}/{otherUserId}/read ---

    @Test
    fun `markAsRead marks messages as read`() {
        every { chatService.markAsRead(10L, 2L, 1L) } just Runs

        val response = chatController.markAsRead(
            itemId = 10L,
            otherUserId = 2L,
            principal = principal
        )

        assertEquals(HttpStatus.OK, response.statusCode)
        assertTrue(response.body!!.success)

        verify(exactly = 1) { chatService.markAsRead(10L, 2L, 1L) }
    }

    // --- GET /api/chat/unread-count ---

    @Test
    fun `getUnreadCount returns unread count`() {
        val unreadResponse = UnreadCountResponse(conversationsWithUnread = 5L)

        every { chatService.getUnreadCount(1L) } returns unreadResponse

        val response = chatController.getUnreadCount(principal)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertTrue(response.body!!.success)
        assertEquals(5L, response.body!!.data!!.conversationsWithUnread)

        verify(exactly = 1) { chatService.getUnreadCount(1L) }
    }

    @Test
    fun `getUnreadCount returns zero when no unread`() {
        val unreadResponse = UnreadCountResponse(conversationsWithUnread = 0L)

        every { chatService.getUnreadCount(1L) } returns unreadResponse

        val response = chatController.getUnreadCount(principal)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(0L, response.body!!.data!!.conversationsWithUnread)
    }
}
