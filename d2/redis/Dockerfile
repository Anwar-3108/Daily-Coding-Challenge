# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install any dependencies defined in package.json
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port that your app will run on
EXPOSE 4881

# Define the command to run your app
CMD ["node", "server.js"]
