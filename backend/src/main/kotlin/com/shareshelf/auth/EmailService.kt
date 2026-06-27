package com.shareshelf.auth

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

@Service
class EmailService(
    @Value("\${app.frontend-url}") private val frontendUrl: String,
    @Value("\${RESEND_API_KEY:}") private val resendApiKey: String
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    private val restTemplate = RestTemplate()

    @Async
    fun sendVerificationEmail(toEmail: String, token: String) {
        val verificationUrl = "$frontendUrl/auth/verify-email?token=$token"
        val subject = "Please verify your email address - ShareShelf"
        val text = """
            Welcome to ShareShelf!
            
            Please click the following link to verify your email address and activate your account:
            $verificationUrl
            
            If you did not request this, please ignore this email.
            
            Thanks,
            The ShareShelf Team
        """.trimIndent()

        try {
            if (resendApiKey.isBlank() || resendApiKey == "re_dummy_api_key_for_local_testing") {
                logger.warn("Resend API key is not configured. Email will not be sent.")
                logger.info("Verification link for manual testing: $verificationUrl")
                return
            }

            val headers = HttpHeaders()
            headers.setBearerAuth(resendApiKey)
            headers.contentType = MediaType.APPLICATION_JSON

            val body = mapOf(
                "from" to "onboarding@resend.dev",
                "to" to toEmail,
                "subject" to subject,
                "html" to text.replace("\n", "<br>")
            )

            val request = HttpEntity(body, headers)
            val response = restTemplate.postForEntity("https://api.resend.com/emails", request, String::class.java)

            if (response.statusCode.is2xxSuccessful) {
                logger.info("Verification email sent successfully via Resend API to $toEmail")
            } else {
                logger.error("Failed to send email via Resend API. Status: ${response.statusCode}, Body: ${response.body}")
            }
        } catch (e: Exception) {
            logger.error("Exception while sending email via Resend API to $toEmail", e)
            logger.info("Verification link for manual testing: $verificationUrl")
        }
    }
}
