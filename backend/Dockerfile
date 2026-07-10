# --- Stage 1: Build the application ---
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./

# Install all dependencies and force sqlite3 to compile from source
# The full node:20 image contains python, g++, make, so native dependencies compile successfully
RUN npm install --build-from-source=sqlite3

COPY . .

# Build the TypeScript project (compiles src/ to dist/)
RUN npm run build

# Remove development dependencies to keep the image small
RUN npm prune --production

# --- Stage 2: Production runner ---
FROM node:20-slim AS runner

WORKDIR /app

COPY package*.json ./

# Copy built files and production dependencies from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose the API port
EXPOSE 4000

# Set environment variables
ENV PORT=4000
ENV NODE_ENV=development
# Default SQLite path inside a dedicated data directory
ENV DATABASE_PATH=/app/data/leads.db

CMD ["node", "dist/index.js"]
