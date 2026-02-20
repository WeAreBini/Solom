# Solom Web Revamp - Master Plan

## 1. Overview
The Solom Web Revamp aims to transition the existing Flutter/Firebase mobile application into a robust, scalable, and SEO-friendly web application. The new architecture will leverage modern web technologies to provide a seamless user experience, improved performance, and easier maintainability.

## 2. Architecture & Tech Stack
- **Frontend:** Next.js (React) with App Router for server-side rendering (SSR) and static site generation (SSG).
- **Styling:** Tailwind CSS for utility-first styling, combined with Shadcn UI for accessible and customizable components.
- **Backend/Database:** Supabase (PostgreSQL) replacing Firebase/Firestore. Supabase provides a powerful relational database, built-in authentication, Row Level Security (RLS), and real-time capabilities.
- **Authentication:** Supabase Auth (Email/Password, OAuth providers).
- **Hosting/Deployment:** Vercel for the Next.js frontend, Railway for infrastructure (if self-hosting Supabase) or Supabase Cloud.
- **External APIs:**
  - Financial Modeling Prep (FMP) for stock data, historical prices, profiles, etc.
  - Stripe for subscription management and payments.
  - Grok (or OpenAI/Gemini) for AI-driven insights and chat features.

## 3. Database Migration Strategy (Firestore to PostgreSQL)
The migration from NoSQL (Firestore) to Relational (PostgreSQL) requires careful planning:
1. **Schema Design:** Map Firestore collections to PostgreSQL tables with appropriate data types, foreign keys, and constraints.
2. **Data Extraction:** Write scripts to export data from Firestore collections into JSON or CSV formats.
3. **Data Transformation:** Transform the exported data to match the new PostgreSQL schema (e.g., converting string IDs to UUIDs where necessary, handling nested objects as JSONB or separate tables).
4. **Data Loading:** Import the transformed data into Supabase using bulk insert operations or Supabase's data import tools.
5. **Validation:** Verify data integrity and consistency between the old and new databases.

## 4. Project Structure
- `finance-web/`: Next.js frontend application.
- `finance-infra/`: Infrastructure configuration, Supabase migrations, and deployment scripts.
- `docs/`: Project documentation, architecture diagrams, and planning materials.

## 5. Key Features & Modules
- **User Management:** Authentication, profiles, settings, and subscription status.
- **Market Data:** Real-time and historical stock, crypto, and ETF data.
- **Portfolio & Watchlist:** User-specific tracking of assets.
- **Social & Community:** Chats, comments, replies, and support tickets.
- **AI & Insights:** AI-powered analysis, stock grades, and market sentiment (Greed/Fear Index).
