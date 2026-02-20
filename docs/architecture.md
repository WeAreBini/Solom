# Architecture

## Repository Structure
The project is organized into three main workspaces to separate concerns:
- **`finance-web`**: The main Next.js 15 frontend application.
- **`finance-shared`**: Shared utilities, types, and configurations used across the project.
- **`finance-infra`**: Infrastructure configurations, including Supabase migrations and Railway deployment setups.

## Infrastructure Details
- **Database:** Supabase, self-hosted on Railway.
- **External APIs:** Financial Modeling Prep (FMP) API. Requests to FMP are proxied through our backend to secure API keys and manage rate limits effectively.
