# Use the official lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the port the app runs on (app.js uses 3000)
EXPOSE 3000

# Command to start the application (runs 'node server.js' as defined in package.json)
CMD ["npm", "start"]