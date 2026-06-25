package com.shareshelf.config

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

    @Bean
    fun s3Client(): S3Client = S3Client.builder()
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
}
