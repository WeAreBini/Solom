-- Migration: 20260220000000_trading_platform_core.sql
-- Description: Core schema for trading platform including user profiles, assets, portfolios, transactions, watchlists, alerts, and educational progress.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles (Extended)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    paper_balance NUMERIC(15, 2) DEFAULT 100000.00 NOT NULL,
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite')),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Assets (Stocks, Crypto, etc.)
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('stock', 'crypto', 'etf', 'forex')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Portfolios
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('paper', 'real')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Positions (Aggregated Holdings)
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE RESTRICT,
    quantity NUMERIC(15, 6) DEFAULT 0 NOT NULL,
    average_buy_price NUMERIC(15, 4) DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(portfolio_id, asset_id)
);

-- 5. Transactions (Orders, Deposits, Withdrawals)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.assets(id) ON DELETE RESTRICT, -- Nullable for deposits/withdrawals
    type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'deposit', 'withdrawal', 'dividend')),
    quantity NUMERIC(15, 6) NOT NULL,
    price_per_unit NUMERIC(15, 4) NOT NULL,
    total_amount NUMERIC(15, 4) NOT NULL, -- quantity * price_per_unit
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Watchlists
CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Watchlist Items
CREATE TABLE IF NOT EXISTS public.watchlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(watchlist_id, asset_id)
);

-- 8. Price Alerts
CREATE TABLE IF NOT EXISTS public.price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    target_price NUMERIC(15, 4) NOT NULL,
    condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
    is_active BOOLEAN DEFAULT true,
    triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Educational Progress (Learn-to-Earn)
CREATE TABLE IF NOT EXISTS public.educational_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    score NUMERIC(5, 2),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_progress ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Assets: Anyone can read assets, only admins can modify (assuming admin role or service role)
CREATE POLICY "Anyone can view assets" ON public.assets FOR SELECT USING (true);

-- Portfolios: Users can manage their own portfolios
CREATE POLICY "Users can view own portfolios" ON public.portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolios" ON public.portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolios" ON public.portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolios" ON public.portfolios FOR DELETE USING (auth.uid() = user_id);

-- Positions: Users can view their own positions via portfolio join
CREATE POLICY "Users can view own positions" ON public.positions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.portfolios WHERE portfolios.id = positions.portfolio_id AND portfolios.user_id = auth.uid())
);

-- Transactions: Users can view their own transactions via portfolio join
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.portfolios WHERE portfolios.id = transactions.portfolio_id AND portfolios.user_id = auth.uid())
);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.portfolios WHERE portfolios.id = transactions.portfolio_id AND portfolios.user_id = auth.uid())
);

-- Watchlists: Users can manage their own watchlists, and view public ones
CREATE POLICY "Users can view own or public watchlists" ON public.watchlists FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own watchlists" ON public.watchlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watchlists" ON public.watchlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own watchlists" ON public.watchlists FOR DELETE USING (auth.uid() = user_id);

-- Watchlist Items: Users can manage items in their own watchlists
CREATE POLICY "Users can view items in accessible watchlists" ON public.watchlist_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.watchlists WHERE watchlists.id = watchlist_items.watchlist_id AND (watchlists.user_id = auth.uid() OR watchlists.is_public = true))
);
CREATE POLICY "Users can insert items to own watchlists" ON public.watchlist_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.watchlists WHERE watchlists.id = watchlist_items.watchlist_id AND watchlists.user_id = auth.uid())
);
CREATE POLICY "Users can delete items from own watchlists" ON public.watchlist_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.watchlists WHERE watchlists.id = watchlist_items.watchlist_id AND watchlists.user_id = auth.uid())
);

-- Price Alerts: Users can manage their own alerts
CREATE POLICY "Users can view own alerts" ON public.price_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.price_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.price_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON public.price_alerts FOR DELETE USING (auth.uid() = user_id);

-- Educational Progress: Users can manage their own progress
CREATE POLICY "Users can view own educational progress" ON public.educational_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own educational progress" ON public.educational_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own educational progress" ON public.educational_progress FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- TRIGGERS & FUNCTIONS
-- ==========================================

-- Function to automatically update `updated_at` timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_user_profiles_modtime BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_portfolios_modtime BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_positions_modtime BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_watchlists_modtime BEFORE UPDATE ON public.watchlists FOR EACH ROW EXECUTE FUNCTION update_modified_column();
