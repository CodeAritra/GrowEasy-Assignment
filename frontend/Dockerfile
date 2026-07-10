# --- Stage 1: Build the application ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (leverages Docker caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Receive NEXT_PUBLIC_API_URL at build time and set it as an env var
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build Next.js app
RUN npm run build

# --- Stage 2: Final runner ---
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

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
