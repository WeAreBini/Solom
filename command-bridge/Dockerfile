# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine-slim AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy standalone output from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
