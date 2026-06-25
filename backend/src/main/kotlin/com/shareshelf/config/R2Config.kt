package com.shareshelf.config

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.S3Configuration
import java.net.URI

@Configuration
class R2Config(
    @Value("\${app.r2.endpoint}") private val endpoint: String,
    @Value("\${app.r2.access-key-id}") private val accessKeyId: String,
    @Value("\${app.r2.secret-access-key}") private val secretAccessKey: String
) {
    private val logger = LoggerFactory.getLogger(R2Config::class.java)

    @Bean
    fun s3Client(): S3Client? {
        if (endpoint.contains("YOUR_ACCOUNT_ID") || accessKeyId == "disabled") {
            logger.warn("R2/S3 not configured — image upload disabled. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY to enable.")
            return null
        }
        return try {
            S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(
                    StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                    )
                )
                .region(Region.of("auto"))
                .serviceConfiguration(
                    S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build()
                )
                .build()
        } catch (e: Exception) {
            logger.error("Failed to create R2/S3 client: ${e.message}")
            null
        }
    }
}
