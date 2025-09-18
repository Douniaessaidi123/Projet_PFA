# --------------------------
## --------------------------
 # Étape Build
 # --------------------------
 FROM maven:3.8.7-openjdk-18 AS build
 WORKDIR /build

 # Copier le POM parent si tu en as un
 COPY pom.xml ./pom.xml

 # Copier le POM et le code source du module auth-service
 COPY auth-service/pom.xml ./auth-service/pom.xml
 COPY auth-service/src ./auth-service/src

 # Aller dans le module auth-service
 WORKDIR /build/auth-service

 # Télécharger les dépendances (optionnel)
 RUN mvn dependency:go-offline -B

 # Compiler et packager le JAR avec Spring Boot
 RUN mvn clean package -DskipTests -B

 # --------------------------
 # Étape Runtime
 # --------------------------
 FROM eclipse-temurin:21-jre
 ARG PROFILE=test

 WORKDIR /app

 # Copier le JAR depuis le build stage, peu importe la version
 COPY --from=build /build/auth-service/target/auth-service-*.jar /app/

 # Exposer le port
 EXPOSE 8080

 # Variables d'environnement
 ENV ACTIVE_PROFILE=${PROFILE}

 # Lancer le service avec détection automatique du JAR et extraction de la version
 CMD ["sh", "-c", "\
   JAR_FILE=$(ls /app/auth-service-*.jar) && \
   JAR_VERSION=$(basename $JAR_FILE | sed -E 's/auth-service-(.*)\\.jar/\\1/') && \
   echo \"Starting auth-service version $JAR_VERSION...\" && \
   java -Dspring.profiles.active=${ACTIVE_PROFILE} -jar $JAR_FILE \
 "]
