package com.shareshelf

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class ShareShelfApplication

fun main(args: Array<String>) {
    runApplication<ShareShelfApplication>(*args)
}
