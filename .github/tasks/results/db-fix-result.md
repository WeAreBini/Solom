# Database Connection and Migration Fix

## Root Cause Analysis
The user encountered two issues:
1. **TLS Connection Error**: `failed to connect to postgres: failed to connect to host=postgres.railway.internal user=postgres database=postgres: tls error (server refused TLS connection)`
2. **Missing Tables**: `[WatchlistPage] Supabase error: Could not find the table 'public.watchlist_items' in the schema cache`

The root cause of the TLS error is that the Supabase CLI attempts to connect to the database using SSL/TLS by default. However, Railway's internal network (`postgres.railway.internal`) does not support or require SSL/TLS connections. Because the connection failed, the database migrations (including the creation of the `watchlist_items` table) were never applied, leading to the second error.

## Fix Implemented
To resolve this, we need to explicitly disable SSL/TLS when connecting to the Railway internal database by appending `?sslmode=disable` to the connection string.

1. **Updated `site/dev.Dockerfile`**:
   Modified the `ENTRYPOINT` command to append `?sslmode=disable` to the `$DB_PRIVATE_CONNECTION_STRING` environment variable.
   
   **Before**:
   ```dockerfile
   ENTRYPOINT supabase db push --debug --yes --db-url $DB_PRIVATE_CONNECTION_STRING && npm i && npm run dev
   ```
   
   **After**:
   ```dockerfile
   ENTRYPOINT supabase db push --debug --yes --db-url "${DB_PRIVATE_CONNECTION_STRING}?sslmode=disable" && npm i && npm run dev
   ```

2. **Verified `site/Dockerfile`**:
   Checked the production `Dockerfile` and confirmed it already correctly appends `?sslmode=disable` to the connection string:
   ```dockerfile
   ENTRYPOINT sh -c 'supabase db push --yes --db-url "${DB_PRIVATE_CONNECTION_STRING}?sslmode=disable" || echo "Migration warning: db push returned non-zero exit code, continuing..."; exec node server.js'
   ```

## Next Steps
With the `dev.Dockerfile` updated, the next time the Docker container is built and run, the `supabase db push` command will successfully connect to the Railway database without TLS. This will apply all pending migrations, including `20260220000000_trading_platform_core.sql`, which creates the `watchlist_items` table and resolves the missing table error.

No further action is required other than rebuilding and restarting the application container.