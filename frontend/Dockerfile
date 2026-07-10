# --- Stage 1: Build the application ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (leverages Docker caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Select environment file (defaults to development)
ARG APP_ENV=development
RUN cp .env.${APP_ENV} .env || true
RUN rm .env.development .env.production || true

# Build Next.js app
RUN npm run build

# --- Stage 2: Final runner ---
FROM node:20-alpine AS runner

WORKDIR /app

# Set development environment
ENV NODE_ENV=development

# Run Next.js as non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets and static files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Expose Next.js port
EXPOSE 3000
ENV PORT=3000

# Start server
CMD ["node", "server.js"]
