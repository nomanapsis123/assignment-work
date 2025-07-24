# Use Node 20 Alpine base image
FROM node:20-alpine

# Set working directory
WORKDIR /src

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn

# Copy the rest of the project
COPY . .

# Build if needed (remove if dev mode doesn't need build)
# RUN yarn build

# Expose the app port
EXPOSE 7000

# Run development server
CMD ["yarn", "dev"]
