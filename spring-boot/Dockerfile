# 1. Build stage (Gradle이 아예 내장된 공식 이미지를 사용하여 다운로드 원천 차단)
FROM gradle:7.6.4-jdk17-alpine AS builder
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src src
RUN gradle bootJar -x test --no-daemon

# 2. Runtime stage (실행용 가벼운 이미지)
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
