# --------------------------
# Build stage
# --------------------------
FROM maven:3.8.7-openjdk-18 AS build
 WORKDIR /build

 # Copier le POM parent si tu en as un
 COPY pom.xml ./pom.xml

# Copier uniquement le module communication-service
COPY communication-service/pom.xml ./communication-service/pom.xml
COPY communication-service/src ./communication-service/src

# Aller dans le module
WORKDIR /build/communication-service

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
COPY --from=build /build/communication-service/target/communication-service-*.jar /app/

# Exposer le port (adapter si besoin)
EXPOSE 8081

# Variables d'environnement
ENV ACTIVE_PROFILE=${PROFILE}

# Lancer le service avec détection automatique du JAR et extraction de la version
CMD ["sh", "-c", "\
  JAR_FILE=$(ls /app/communication-service-*.jar) && \
  JAR_VERSION=$(basename $JAR_FILE | sed -E 's/communication-service-(.*)\\.jar/\\1/') && \
  echo \"Starting communication-service version $JAR_VERSION...\" && \
  java -Dspring.profiles.active=${ACTIVE_PROFILE} -jar $JAR_FILE \
"]
