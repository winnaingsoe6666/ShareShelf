# Build stage
FROM gradle:8.12-jdk21 AS build
WORKDIR /app
COPY backend/ /app/backend/
COPY railway.json /app/
RUN cd backend && ./gradlew bootJar -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/backend/build/libs/shareshelf-0.0.1-SNAPSHOT.jar app.jar
ENV SPRING_PROFILES_ACTIVE=railway
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
