# Base image with Java 21
FROM eclipse-temurin:21-jdk-alpine

# Set working directory
WORKDIR /app

# Argument to hold the JAR file path
ARG JAR_FILE=build/libs/TestCaseCraft-0.0.1-SNAPSHOT.jar

# Copy the JAR file into the container
COPY ${JAR_FILE} app.jar

# Expose the application port
EXPOSE 8080

# Set the entrypoint to run the application
# Using environment variables for configuration
ENTRYPOINT ["java", "-jar", "/app/app.jar"]