# Dockerfile for Spring Boot + React application

# 1. Build Stage
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy gradle wrapper and build files
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle .
COPY settings.gradle .

# Copy application source
COPY src ./src

# Grant execution rights to the gradlew script
RUN chmod +x ./gradlew

# Build the application, skipping tests for faster build
RUN ./gradlew build -x test

# 2. Run Stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
