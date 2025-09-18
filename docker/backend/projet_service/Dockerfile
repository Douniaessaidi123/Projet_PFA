# --------------------------
# Build stage
# --------------------------
FROM maven:3.8.7-openjdk-18 AS build
 WORKDIR /build

 # Copier le POM parent si tu en as un
 COPY pom.xml ./pom.xml

# Copier uniquement le module project-service
COPY project-service/pom.xml ./project-service/pom.xml
COPY project-service/src ./project-service/src

# Aller dans le module project-service
WORKDIR /build/project-service

# Télécharger les dépendances (optionnel)
RUN mvn dependency:go-offline -B

# Compiler et packager le JAR avec Spring Boot
RUN mvn clean package -DskipTests -B

# --------------------------
# Runtime stage
# --------------------------
FROM eclipse-temurin:21-jre
ARG PROFILE=test

WORKDIR /app

# Copier le JAR généré, peu importe la version
COPY --from=build /build/project-service/target/project-service-*.jar /app/

# Exposer le port (ici 8082)
EXPOSE 8082

# Variables d'environnement
ENV ACTIVE_PROFILE=${PROFILE}

# Lancer le service avec détection automatique du JAR et extraction de la version
CMD ["sh", "-c", "\
  JAR_FILE=$(ls /app/project-service-*.jar) && \
  JAR_VERSION=$(basename $JAR_FILE | sed -E 's/project-service-(.*)\\.jar/\\1/') && \
  echo \"Starting project-service version $JAR_VERSION...\" && \
  java -Dspring.profiles.active=${ACTIVE_PROFILE} -jar $JAR_FILE \
"]
