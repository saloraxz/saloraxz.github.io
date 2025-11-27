# Start from a base image (e.g., Node.js 18)
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy application files from your local machine into the container
COPY package*.json ./

# Run commands to install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Define the command to run when the container starts
CMD ["npm", "start"]
