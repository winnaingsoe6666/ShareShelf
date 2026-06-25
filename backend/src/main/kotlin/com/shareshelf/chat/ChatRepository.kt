package com.shareshelf.chat

import com.shareshelf.chat.entity.ChatMessage
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.transaction.annotation.Transactional

interface ChatRepository : JpaRepository<ChatMessage, Long> {

    /**
     * Load conversation messages between two users for a specific item, ordered newest first.
     * Used for chat history with pagination (load last N messages).
     */
    @Query(
        """SELECT m FROM ChatMessage m
           WHERE m.itemId = :itemId
             AND ((m.senderId = :user1Id AND m.receiverId = :user2Id)
               OR (m.senderId = :user2Id AND m.receiverId = :user1Id))
           ORDER BY m.createdAt DESC"""
    )
    fun findConversation(
        @Param("itemId") itemId: Long,
        @Param("user1Id") user1Id: Long,
        @Param("user2Id") user2Id: Long,
        pageable: Pageable
    ): List<ChatMessage>

    /**
     * Find the latest message for each distinct conversation the user participates in.
     * A conversation is identified by (item_id, least_user_id, greatest_user_id).
     * Returns messages ordered by createdAt DESC for inbox display.
     */
    @Query(
        """SELECT m FROM ChatMessage m
           WHERE m.id IN (
               SELECT MAX(m2.id) FROM ChatMessage m2
               WHERE m2.senderId = :userId OR m2.receiverId = :userId
               GROUP BY m2.itemId,
                        CASE WHEN m2.senderId < m2.receiverId THEN m2.senderId ELSE m2.receiverId END,
                        CASE WHEN m2.senderId < m2.receiverId THEN m2.receiverId ELSE m2.senderId END
           )
           ORDER BY m.createdAt DESC"""
    )
    fun findConversationsByUserId(
        @Param("userId") userId: Long
    ): List<ChatMessage>

    /**
     * Count unread messages for a user (messages where they are the receiver and read_at is null).
     */
    @Query(
        """SELECT COUNT(m) FROM ChatMessage m
           WHERE m.receiverId = :receiverId AND m.readAt IS NULL"""
    )
    fun countUnreadByReceiverId(
        @Param("receiverId") receiverId: Long
    ): Long

    /**
     * Count unread messages in a specific conversation (item + receiver + sender).
     */
    @Query(
        """SELECT COUNT(m) FROM ChatMessage m
           WHERE m.itemId = :itemId
             AND m.receiverId = :receiverId
             AND m.senderId = :senderId
             AND m.readAt IS NULL"""
    )
    fun countUnreadByItemAndReceiver(
        @Param("itemId") itemId: Long,
        @Param("receiverId") receiverId: Long,
        @Param("senderId") senderId: Long
    ): Long

    /**
     * Count distinct conversations with unread messages for a user.
     */
    @Query(
        """SELECT COUNT(DISTINCT CONCAT(m.itemId, '-', m.senderId)) FROM ChatMessage m
           WHERE m.receiverId = :receiverId AND m.readAt IS NULL"""
    )
    fun countUnreadConversationsByReceiverId(
        @Param("receiverId") receiverId: Long
    ): Long

    /**
     * Mark all messages from senderId to receiverId for a specific item as read.
     * Sets read_at = NOW() for unread messages.
     */
    @Modifying
    @Transactional
    @Query(
        """UPDATE ChatMessage m SET m.readAt = CURRENT_TIMESTAMP
           WHERE m.itemId = :itemId
             AND m.senderId = :senderId
             AND m.receiverId = :receiverId
             AND m.readAt IS NULL"""
    )
    fun markAsRead(
        @Param("itemId") itemId: Long,
        @Param("senderId") senderId: Long,
        @Param("receiverId") receiverId: Long
    ): Int
}
