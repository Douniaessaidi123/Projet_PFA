# --------------------------
# Étape de build
# --------------------------
FROM node:22 AS build-stage

WORKDIR /app

# Copier uniquement les fichiers de dépendances pour mettre en cache npm install
COPY package*.json ./

# Installer Angular CLI et les dépendances
RUN npm install -g @angular/cli@17 && npm install

# Copier tout le code source
COPY . .

# Build en production
RUN ng build --configuration production

# --------------------------
# Étape de production / runtime
# --------------------------
FROM nginx:1.27-alpine AS runtime-stage

# Copier le fichier de configuration Nginx
COPY ./nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés depuis l'étape de build
COPY --from=build-stage /app/dist/frontend-ang/browser /usr/share/nginx/html

# Exposer le port
EXPOSE 80

# Lancer Nginx au premier plan
CMD ["nginx", "-g", "daemon off;"]

