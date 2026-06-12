package com.shareshelf

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ShareShelfApplication

fun main(args: Array<String>) {
    runApplication<ShareShelfApplication>(*args)
}
