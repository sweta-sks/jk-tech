# Stage 1: Base image
FROM node:20 AS base

# Stage 2: Dependency installation
FROM base AS deps

WORKDIR /app

COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Stage 3: Build stage
FROM base AS builder
WORKDIR /app

# Copy only necessary files to optimize caching
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Rebuild bcrypt to match the container's architecture
RUN yarn remove bcrypt && yarn add bcrypt

# Build the application
RUN yarn build

EXPOSE 4000

# Command to run the application
CMD ["node", "dist/main.js"]
