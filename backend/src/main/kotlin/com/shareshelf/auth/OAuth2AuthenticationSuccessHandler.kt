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

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        val oAuth2User = authentication.principal as OAuth2User
        val user = oAuth2Service.processOAuthUser(oAuth2User)
        val authResponse = oAuth2Service.generateOAuthResponse(user)

        val returnUrl = request.cookies?.firstOrNull { it.name == "oauth_return_url" }?.value ?: ""

        val redirectUrl = buildString {
            append(frontendUrl)
            append("/auth/callback")
            append("?token=").append(authResponse.token)
            append("&refreshToken=").append(authResponse.refreshToken)
            if (returnUrl.isNotBlank()) {
                append("&returnUrl=").append(returnUrl)
            }
        }

        response.sendRedirect(redirectUrl)
    }
}
