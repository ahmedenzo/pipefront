# Étape 1 : Construction de l'application Angular
FROM node:18 AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration du projet (package.json et package-lock.json)
COPY package*.json ./

# Installer les dépendances
RUN npm install -f

# Copier tout le code de l'application dans le conteneur
COPY . .

# Construire l'application Angular pour la production
RUN npm run build --prod

# Étape 2 : Serveur de production avec Nginx
FROM nginx:alpine

# Copier le fichier de configuration Nginx (facultatif)
COPY ./nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers construits d'Angular dans le répertoire de Nginx
COPY --from=build /app/dist/ /usr/share/nginx/html

# Exposer le port 80 pour l'application Nginx
EXPOSE 80

# Démarrer Nginx en mode non-démon
CMD ["nginx", "-g", "daemon off;"]
