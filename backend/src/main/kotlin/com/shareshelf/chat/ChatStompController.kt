package com.shareshelf.chat

import com.shareshelf.auth.UserPrincipal
import com.shareshelf.chat.dto.SendMessageRequest
import org.slf4j.LoggerFactory
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.stereotype.Controller
import java.security.Principal

@Controller
class ChatStompController(
    private val chatService: ChatService,
    private val simpMessagingTemplate: SimpMessagingTemplate
) {

    private val logger = LoggerFactory.getLogger(ChatStompController::class.java)

    @MessageMapping("/chat.send")
    fun sendMessage(@Payload request: SendMessageRequest, principal: Principal) {
        val userId = extractUserId(principal)
            ?: throw IllegalStateException("Unauthenticated WebSocket message")

        val saved = chatService.sendMessage(userId, request)

        simpMessagingTemplate.convertAndSend("/topic/chat/${saved.receiverId}", saved)
        simpMessagingTemplate.convertAndSend("/topic/chat/${saved.senderId}", saved)

        logger.debug("Message {} broadcast to sender {} and receiver {}", saved.id, saved.senderId, saved.receiverId)
    }

    private fun extractUserId(principal: Principal): Long? {
        return try {
            if (principal is UsernamePasswordAuthenticationToken) {
                val userPrincipal = principal.principal as UserPrincipal
                userPrincipal.getId()
            } else {
                principal.name.toLongOrNull()
            }
        } catch (e: Exception) {
            logger.warn("Failed to extract userId from principal", e)
            null
        }
    }
}
