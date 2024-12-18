# Stage 1: Build
FROM node:22.12.0-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Stage 2: Production
FROM node:22.12.0-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json yarn.lock ./

# Install only production dependencies using Yarn
RUN yarn install --production

# Copy built artifacts from build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules

# Expose port (adjust to your NestJS app's port)
EXPOSE 3000

# Set environment to production
ENV NODE_ENV production

# Run the application
CMD ["node", "dist/main"]
