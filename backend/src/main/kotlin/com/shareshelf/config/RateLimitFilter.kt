package com.shareshelf.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

@Component
class RateLimitFilter : OncePerRequestFilter() {

    private val attempts = ConcurrentHashMap<String, MutableList<Instant>>()

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        if (request.requestURI.startsWith("/api/auth/login") ||
            request.requestURI.startsWith("/api/auth/register")
        ) {
            val ip = request.remoteAddr
            val now = Instant.now()
            val window = attempts.getOrPut(ip) { mutableListOf() }

            // Remove entries outside the 1-minute window
            window.removeIf { it.isBefore(now.minusSeconds(60)) }

            if (window.size >= 10) {
                response.status = 429
                response.contentType = "application/json"
                response.writer.write(
                    """{"success":false,"message":"Too many attempts. Please try again later."}"""
                )
                return
            }

            window.add(now)
        }

        filterChain.doFilter(request, response)
    }
}
