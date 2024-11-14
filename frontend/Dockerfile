# Step 1: Build Angular app
FROM node:18 AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install -f

# Copy the rest of the application code
COPY . .

# Build the Angular app
RUN npm run build --prod

# Step 2: Use Nginx to serve the built app
FROM nginx:latest

# Copy the build artifacts from the first image
COPY --from=build /app/dist/ /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
