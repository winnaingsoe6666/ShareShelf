package com.shareshelf.auth

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service

@Service
class EmailService(
    private val mailSender: JavaMailSender,
    @Value("\${app.frontend-url}") private val frontendUrl: String,
    @Value("\${app.mail.from:\${spring.mail.username}}") private val fromAddress: String
) {
    private val logger = LoggerFactory.getLogger(javaClass)

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
            val message = SimpleMailMessage()
            message.setTo(toEmail)
            message.subject = subject
            message.text = text
            message.from = fromAddress

            mailSender.send(message)
            logger.info("Verification email sent to $toEmail")
        } catch (e: Exception) {
            logger.error("Failed to send verification email to $toEmail", e)
            logger.info("Verification link for manual testing: $verificationUrl")
        }
    }
}
