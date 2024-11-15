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

# The output will be in the dist folder, which is the default output directory for Angular.
# This folder will be needed for Nginx to serve the app.
