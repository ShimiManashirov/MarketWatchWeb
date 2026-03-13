# Build Stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy root package.json for dependencies if any, but mostly for the structure
COPY package*.json ./

# Build Frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Final Stage
FROM node:18-alpine

WORKDIR /app

# Copy Backend files
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Copy Frontend Build to backend's public/static folder if served by express
# Adjusting based on how the server serves static files (usually from client/dist)
COPY --from=build /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]
