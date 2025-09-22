FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/auth-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
CMD ["java","-Dspring.profiles.active=test", "-jar", "app.jar"]
