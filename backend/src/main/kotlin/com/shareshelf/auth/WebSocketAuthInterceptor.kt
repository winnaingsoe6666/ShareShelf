package com.shareshelf.auth

import org.slf4j.LoggerFactory
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompCommand
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.messaging.support.MessageHeaderAccessor
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.stereotype.Component

@Component
class WebSocketAuthInterceptor(
    private val jwtTokenProvider: JwtTokenProvider,
    private val userDetailsService: CustomUserDetailsService,
    private val jtiBlacklist: JtiBlacklist
) : ChannelInterceptor {

    private val logger = LoggerFactory.getLogger(WebSocketAuthInterceptor::class.java)

    companion object {
        private const val AUTHORIZATION_HEADER = "Authorization"
        private const val BEARER_PREFIX = "Bearer "
    }

    override fun preSend(message: Message<*>, channel: MessageChannel): Message<*>? {
        val accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java)
            ?: return message

        if (StompCommand.CONNECT == accessor.command) {
            val token = extractToken(accessor)

            if (token == null) {
                logger.warn("WebSocket CONNECT rejected: no JWT token provided")
                return null
            }

            if (!jwtTokenProvider.validateToken(token)) {
                logger.warn("WebSocket CONNECT rejected: invalid JWT token")
                return null
            }

            val jti = jwtTokenProvider.getJtiFromToken(token)
            if (jtiBlacklist.isBlacklisted(jti)) {
                logger.warn("WebSocket CONNECT rejected: blacklisted JTI")
                return null
            }

            try {
                val userId = jwtTokenProvider.getUserIdFromToken(token)
                val userDetails = userDetailsService.loadUserById(userId)

                val authentication = UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.authorities
                )

                accessor.user = authentication
                logger.debug("WebSocket CONNECT authenticated user: {}", userId)
            } catch (ex: Exception) {
                logger.warn("WebSocket CONNECT rejected: authentication failed", ex)
                return null
            }
        }

        return message
    }

    private fun extractToken(accessor: StompHeaderAccessor): String? {
        val authHeader = accessor.getFirstNativeHeader(AUTHORIZATION_HEADER)
            ?: return null

        return if (authHeader.startsWith(BEARER_PREFIX)) {
            authHeader.substring(BEARER_PREFIX.length)
        } else {
            authHeader
        }
    }
}
