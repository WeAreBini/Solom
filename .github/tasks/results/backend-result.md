# Backend API Routes Scaffolded

Successfully scaffolded the core backend API routes for the trading platform in the Next.js app.

## Routes Created

1. **Trade Execution (`/api/trade/execute`)**
   - **Method:** `POST`
   - **Description:** Processes paper trading orders (buy/sell).
   - **Features:**
     - Validates user authentication.
     - Validates required fields (`symbol`, `quantity`, `type`, `price`).
     - Checks user balance for buy orders.
     - Checks existing position quantity for sell orders.
     - Updates user balance in the `profiles` table.
     - Updates or inserts positions in the `positions` table.
     - Records the transaction in the `transactions` table.

2. **Portfolio Management (`/api/portfolio`)**
   - **Method:** `GET`
   - **Description:** Fetches a user's current positions and calculates portfolio value.
   - **Features:**
     - Validates user authentication.
     - Fetches user's cash balance from the `profiles` table.
     - Fetches user's current positions from the `positions` table.
     - Calculates total portfolio value (cash balance + positions value).
     - Returns enriched positions data with mocked current prices and unrealized P&L.

3. **Alerts Management (`/api/alerts`)**
   - **Methods:** `GET`, `POST`, `PUT`, `DELETE`
   - **Description:** CRUD operations for user price alerts.
   - **Features:**
     - `GET`: Fetches all alerts for the authenticated user.
     - `POST`: Creates a new price alert (`symbol`, `target_price`, `condition`).
     - `PUT`: Updates an existing alert (e.g., toggling `is_active`).
     - `DELETE`: Deletes an alert by ID.

4. **FMP Webhook (`/api/webhooks/fmp`)**
   - **Method:** `POST`
   - **Description:** Placeholder webhook endpoint for receiving real-time price updates or news from Financial Modeling Prep (FMP).
   - **Features:**
     - Uses `createAdminClient` for elevated privileges.
     - Includes placeholder logic for verifying webhook signatures.
     - Includes placeholder logic for processing `price_update` and `news` events.

## Notes
- All routes use the Supabase client (`@/lib/supabase/server`) for database interactions.
- Proper error handling and HTTP status codes are implemented.
- TypeScript typing is used for request bodies and responses.
- Assumes the existence of `profiles`, `positions`, `transactions`, and `alerts` tables in the Supabase database.