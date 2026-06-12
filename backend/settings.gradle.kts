pluginManagement {
    plugins {
        kotlin("jvm") version "2.1.0"
        kotlin("plugin.spring") version "2.1.0"
        id("org.springframework.boot") version "3.4.3"
        id("io.spring.dependency-management") version "1.1.7"
        kotlin("plugin.jpa") version "2.1.0"
        kotlin("plugin.allopen") version "2.1.0"
    }
}

rootProject.name = "shareshelf"
