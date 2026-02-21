# Architecture Result: Trading Platform Core

## Overview
This document summarizes the architectural decisions and the database schema created for the new trading platform features, including Paper Trading, Watchlists, Price Alerts, Portfolio Tracking, and Social/Educational features.

## Files Created
1. **Architecture Plan:** `.github/tasks/plan.md`
   - Outlines the high-level architecture, data flow, and component responsibilities.
2. **Database Migration:** `site/supabase/migrations/20260220000000_trading_platform_core.sql`
   - Contains the comprehensive Supabase PostgreSQL schema, including tables, relationships, constraints, and Row Level Security (RLS) policies.

## Architectural Decisions

### 1. Database Schema & Normalization
- **User Profiles (`user_profiles`):** Extended the base authentication user model to include a `paper_balance` (defaulting to $100,000) and user `tier` settings.
- **Asset Management (`assets`):** Centralized table for all tradable entities (stocks, crypto, ETFs) to ensure consistency across portfolios, transactions, and watchlists.
- **Portfolio Tracking (`portfolios`, `positions`, `transactions`):** 
  - Separated `portfolios` to allow users to have multiple accounts (e.g., 'paper' vs. 'real').
  - `transactions` act as an immutable ledger of all trades, deposits, and withdrawals.
  - `positions` represent the aggregated current holdings, which can be updated via database triggers or backend services upon transaction completion.
- **Watchlists (`watchlists`, `watchlist_items`):** Designed to support multiple custom watchlists per user. Added an `is_public` flag to support future social sharing features.
- **Alerts (`price_alerts`):** Stored user-defined thresholds. A separate worker/edge function will evaluate these against real-time market data.
- **Learn-to-Earn (`educational_progress`):** Tracks user progress through educational modules, laying the groundwork for gamification and rewards.

### 2. Security & Data Isolation
- **Row Level Security (RLS):** Enabled on all new tables. Policies strictly enforce that users can only `SELECT`, `INSERT`, `UPDATE`, or `DELETE` their own data.
- **Cascading Deletes:** Implemented `ON DELETE CASCADE` for user-owned entities (portfolios, watchlists, alerts) to ensure clean data removal if a user deletes their account.
- **Data Integrity:** Used `ON DELETE RESTRICT` for `assets` referenced in `positions` and `transactions` to prevent accidental deletion of historical financial records.

### 3. Extensibility
- The schema is designed to be easily extended for real trading by adding new portfolio types and integrating with external brokerage APIs.
- Social features are supported by the `is_public` flag on watchlists and can be expanded with dedicated social tables in future migrations.
