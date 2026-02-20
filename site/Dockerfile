FROM node:22 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/prod
COPY site/package.json site/package-lock.json* /temp/prod/
RUN cd /temp/prod && npm ci

# Build
FROM base AS build
COPY --from=install /temp/prod/node_modules node_modules
COPY site/ .
COPY shared/ /shared

ARG PORT
ARG HOSTNAME
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_URL
ARG SUPABASE_SERVICE_ROLE_KEY

ENV PORT=$PORT
ENV HOSTNAME=$HOSTNAME
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Runner
FROM base AS runner

ENV SUPABASE_CLI_VERSION="v2.75.0"

RUN apt-get update && apt-get install -y curl unzip \
  && curl -L https://github.com/supabase/cli/releases/download/${SUPABASE_CLI_VERSION}/supabase_linux_amd64.tar.gz -o supabase.tar.gz \
  && tar -xvzf supabase.tar.gz \
  && mv supabase /usr/local/bin/ \
  && rm supabase.tar.gz

RUN groupadd --system nextjs && useradd --system --create-home --gid nextjs nextjs

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next/static ./.next/static
COPY site/supabase ./supabase

USER nextjs

ENTRYPOINT supabase db push --debug --yes --db-url $DB_PRIVATE_CONNECTION_STRING && node server.js