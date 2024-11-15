# Step 1: Use Node.js image to build Angular app
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json for installing dependencies
COPY package*.json ./

# Install the app dependencies
RUN npm install -f

# Copy the rest of the application code
COPY . .

# Build the Angular app for production
RUN npm run build --prod

# Step 2: Use Nginx to serve the Angular app
FROM nginx:latest

# Copy the custom Nginx configuration file (if any)
COPY ../nginx.conf /etc/nginx/nginx.conf

# Copy the built Angular app from the Angular build container
# The Angular build output is located in /app/dist/your-angular-app
COPY --from=build /app/dist/your-angular-app /usr/share/nginx/html

# Expose port 80 so that Nginx can serve the app
EXPOSE 80

# Run Nginx in the foreground (this will keep the container running)
CMD ["nginx", "-g", "daemon off;"]
