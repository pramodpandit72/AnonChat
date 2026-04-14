# ---- Build Stage ----
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Runtime Stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built JAR (use explicit name instead of wildcard for reliability)
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Switch to non-root user
USER appuser

# Expose port (Render injects PORT env variable)
EXPOSE 8080

# Health check - use the simple /health endpoint with generous start period
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget -qO- http://localhost:${PORT:-8080}/health || exit 1

# Run the application with container-optimized JVM settings
# Using shell form so ${PORT} is expanded at runtime by Render
# -XX:+UseContainerSupport: respect container memory limits
# -XX:MaxRAMPercentage=75: use at most 75% of container RAM for heap
# -Djava.security.egd: faster random number generation in containers
CMD java \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -Djava.security.egd=file:/dev/./urandom \
  -Dserver.port=${PORT:-8080} \
  -jar app.jar
