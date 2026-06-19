package com.shareshelf.notification

import com.shareshelf.notification.entity.Notification
import com.shareshelf.notification.entity.NotificationType
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.security.access.AccessDeniedException
import java.time.LocalDateTime
import java.util.*

class NotificationServiceTest {

    private val notificationRepository = mockk<NotificationRepository>()

    private val notificationService = NotificationService(
        notificationRepository = notificationRepository
    )

    private val testNotification = Notification(
        id = 1L,
        userId = 1L,
        type = NotificationType.borrow_requested,
        message = "Alice wants to borrow your drill",
        relatedItemId = 5L,
        relatedBorrowId = 10L,
        isRead = false,
        createdAt = LocalDateTime.now()
    )

    @BeforeEach
    fun setUp() {
        clearAllMocks()
    }

    // --- create ---

    @Test
    fun `create saves and returns notification`() {
        every { notificationRepository.save(any()) } returns testNotification

        val result = notificationService.create(
            userId = 1L,
            type = NotificationType.borrow_requested,
            message = "Alice wants to borrow your drill",
            relatedItemId = 5L,
            relatedBorrowId = 10L
        )

        assertEquals(1L, result.id)
        assertEquals(NotificationType.borrow_requested, result.type)
        assertEquals("Alice wants to borrow your drill", result.message)
        assertEquals(5L, result.relatedItemId)
        assertEquals(10L, result.relatedBorrowId)
        assertFalse(result.isRead)

        verify(exactly = 1) { notificationRepository.save(any()) }
    }

    // --- findByUser ---

    @Test
    fun `findByUser returns paginated notifications for user`() {
        val pageable = PageRequest.of(0, 20)
        val page = PageImpl(listOf(testNotification), pageable, 1)

        every { notificationRepository.findByUserIdOrderByCreatedAtDesc(1L, pageable) } returns page

        val result = notificationService.findByUser(1L, pageable)

        assertEquals(1, result.totalElements)
        assertEquals(NotificationType.borrow_requested, result.content.first().type)
        assertEquals("Alice wants to borrow your drill", result.content.first().message)

        verify(exactly = 1) { notificationRepository.findByUserIdOrderByCreatedAtDesc(1L, pageable) }
    }

    // --- getUnreadCount ---

    @Test
    fun `getUnreadCount returns count of unread notifications`() {
        every { notificationRepository.countByUserIdAndIsReadFalse(1L) } returns 3L

        val count = notificationService.getUnreadCount(1L)

        assertEquals(3L, count)
        verify(exactly = 1) { notificationRepository.countByUserIdAndIsReadFalse(1L) }
    }

    // --- markRead ---

    @Test
    fun `markRead sets notification as read`() {
        val unreadNotification = testNotification.copy(isRead = false)
        every { notificationRepository.findById(1L) } returns Optional.of(unreadNotification)
        every { notificationRepository.save(any()) } answers { firstArg() }

        val result = notificationService.markRead(1L, userId = 1L)

        assertTrue(result.isRead)
        verify(exactly = 1) { notificationRepository.findById(1L) }
        verify(exactly = 1) { notificationRepository.save(any()) }
    }

    @Test
    fun `markRead throws AccessDeniedException when user does not own notification`() {
        val notification = testNotification.copy(userId = 2L, isRead = false)
        every { notificationRepository.findById(1L) } returns Optional.of(notification)

        assertThrows(AccessDeniedException::class.java) {
            notificationService.markRead(1L, userId = 1L)
        }

        verify(exactly = 0) { notificationRepository.save(any()) }
    }

    // --- markAllRead ---

    @Test
    fun `markAllRead marks all unread notifications as read`() {
        val unread1 = testNotification.copy(id = 1L, isRead = false)
        val unread2 = testNotification.copy(id = 2L, type = NotificationType.borrow_approved, isRead = false)

        every {
            notificationRepository.findByUserIdOrderByCreatedAtDesc(1L, Pageable.unpaged())
        } returns PageImpl(listOf(unread1, unread2))
        every { notificationRepository.saveAll(any<List<Notification>>()) } returns listOf(unread1, unread2)

        notificationService.markAllRead(1L)

        verify(exactly = 1) { notificationRepository.saveAll(any<List<Notification>>()) }
    }
}
