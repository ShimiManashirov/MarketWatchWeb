# Build Stage
FROM --platform=linux/amd64 node:18-alpine AS build

WORKDIR /app

# Copy package files for both root and client
COPY package*.json ./
COPY client/package*.json ./client/

# Install root dependencies (for tsc)
RUN npm install

# Build Frontend
WORKDIR /app/client
RUN npm install
COPY client/ ./
RUN npm run build

# Build Backend
WORKDIR /app
COPY . .
RUN npm run build

# Final Stage
FROM node:18-alpine

WORKDIR /app

# Copy production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled backend
COPY --from=build /app/dist ./dist

# Copy compiled frontend
COPY --from=build /app/client/dist ./client/dist

# Copy other necessary files (like uploads or assets)
COPY src/uploads ./src/uploads

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]
