# Step 1: Use Node.js image to build Angular app
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for installing dependencies
COPY package*.json ./

# Install the app dependencies using npm ci for faster and more reliable installs
RUN npm install -f

# Copy the rest of the application code
COPY . .

# Build the Angular app for production (ensure your angular.json config is correct)
RUN npm run build --prod

# Step 2: Use Nginx to serve the Angular app
FROM nginx:latest

# Copy the custom Nginx configuration file (if any)
# Ensure nginx.conf is in the same directory as the Dockerfile or provide the correct relative path
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the built Angular app from the Angular build container
COPY --from=build /app/dist/Pinsender /usr/share/nginx/html

# Expose port 80 so that Nginx can serve the app
EXPOSE 80

# Run Nginx in the foreground (this will keep the container running)
CMD ["nginx", "-g", "daemon off;"]
