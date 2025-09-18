# Étape de build
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install -g @angular/cli@17 && npm install
COPY . .
RUN ng build --configuration production

# Étape de production
FROM nginx:1.27-alpine
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# Copier le contenu du sous-dossier browser, pas seulement frontend-ang
COPY --from=build /app/dist/frontend-ang/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


