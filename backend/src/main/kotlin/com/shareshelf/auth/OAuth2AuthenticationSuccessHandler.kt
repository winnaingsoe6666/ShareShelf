package com.shareshelf.auth

import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component

@Component
class OAuth2AuthenticationSuccessHandler(
    private val oAuth2Service: OAuth2Service,
    @Value("\${app.frontend-url}") private val frontendUrl: String
) : AuthenticationSuccessHandler {

    private val logger = LoggerFactory.getLogger(javaClass)

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        try {
            logger.info("=== OAuth2 Success Handler START ===")
            
            val oAuth2User = authentication.principal as OAuth2User
            logger.info("OAuth2User attributes: ${oAuth2User.attributes}")

            logger.info("Calling processOAuthUser...")
            val user = oAuth2Service.processOAuthUser(oAuth2User)
            logger.info("processOAuthUser SUCCESS: userId=${user.id}")

            logger.info("Calling generateOAuthResponse...")
            val authResponse = oAuth2Service.generateOAuthResponse(user)
            logger.info("generateOAuthResponse SUCCESS")

            val returnUrl = request.cookies
                ?.firstOrNull { it.name == "oauth_return_url" }
                ?.value ?: ""

            val redirectUrl = buildString {
                append(frontendUrl)
                append("/auth/callback")
                append("?token=").append(authResponse.token)
                append("&refreshToken=").append(authResponse.refreshToken)
                if (returnUrl.isNotBlank()) {
                    append("&returnUrl=").append(returnUrl)
                }
            }

            logger.info("Redirecting to: $redirectUrl")
            response.sendRedirect(redirectUrl)

        } catch (e: Exception) {
            logger.error("=== OAuth2 FAILED at: ${e.javaClass.simpleName} ===", e)
            logger.error("Message: ${e.message}")
            logger.error("Cause: ${e.cause}")
            // frontend error page ကို redirect လုပ်
            response.sendRedirect("$frontendUrl/auth/error?reason=oauth_failed")
        }
    }
}