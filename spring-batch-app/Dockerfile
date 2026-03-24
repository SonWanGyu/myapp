FROM gradle:7.6.1-jdk17-alpine AS builder
WORKDIR /workspace
COPY build.gradle settings.gradle ./
COPY src src
RUN gradle build -x test --no-daemon

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /workspace/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
