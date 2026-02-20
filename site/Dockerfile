FROM node:22 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json package-lock.json* /temp/prod/
RUN cd /temp/prod && npm ci

# Build
FROM base AS build
COPY --from=install /temp/prod/node_modules node_modules
COPY . .

ARG PORT
ARG HOSTNAME
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_URL
ARG SUPABASE_SERVICE_ROLE_KEY
ARG FMP_API_KEY
ARG OPENAI_API_KEY
ARG OPENAI_BASE_URL
ARG NEXTAUTH_SECRET

ENV PORT=$PORT
ENV HOSTNAME=$HOSTNAME
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV FMP_API_KEY=$FMP_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV OPENAI_BASE_URL=$OPENAI_BASE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Runner
FROM base AS runner

ENV SUPABASE_CLI_VERSION="v2.75.0"

ARG PORT
ARG HOSTNAME
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_URL
ARG SUPABASE_SERVICE_ROLE_KEY
ARG FMP_API_KEY
ARG OPENAI_API_KEY
ARG OPENAI_BASE_URL
ARG NEXTAUTH_SECRET

ENV PORT=$PORT
ENV HOSTNAME=$HOSTNAME
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
ENV FMP_API_KEY=$FMP_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV OPENAI_BASE_URL=$OPENAI_BASE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

RUN apt-get update && apt-get install -y curl unzip \
  && curl -L https://github.com/supabase/cli/releases/download/${SUPABASE_CLI_VERSION}/supabase_linux_amd64.tar.gz -o supabase.tar.gz \
  && tar -xvzf supabase.tar.gz \
  && mv supabase /usr/local/bin/ \
  && rm supabase.tar.gz \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN groupadd --system nextjs && useradd --system --create-home --gid nextjs nextjs

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/supabase ./supabase

# Create supabase temp directory and ensure nextjs user can write to it
RUN mkdir -p /app/supabase/.temp && chown -R nextjs:nextjs /app/supabase

USER nextjs

# Run migrations (non-blocking) then start server
# The || true ensures the server starts even if migrations fail
ENTRYPOINT sh -c 'supabase db push --yes --db-url "$DB_PRIVATE_CONNECTION_STRING" || echo "Migration warning: db push returned non-zero exit code, continuing..."; exec node server.js'