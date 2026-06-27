package com.shareshelf

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
@EnableAsync
class ShareShelfApplication

fun main(args: Array<String>) {
    runApplication<ShareShelfApplication>(*args)
}
