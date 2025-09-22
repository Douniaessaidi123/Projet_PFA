FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/project-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8082
CMD ["java","-Dspring.profiles.active=test", "-jar", "app.jar"]