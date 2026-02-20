-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Function to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Users Table (Extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Subscriptions Table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT,
    plan_type TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Usage Table (API usage, AI queries, etc.)
CREATE TABLE public.usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_usage_updated_at BEFORE UPDATE ON public.usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Stocks Table
CREATE TABLE public.stocks (
    symbol TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    exchange TEXT,
    asset_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON public.stocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Stock Profiles
CREATE TABLE public.stock_profiles (
    symbol TEXT PRIMARY KEY REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    description TEXT,
    sector TEXT,
    industry TEXT,
    website TEXT,
    ceo TEXT,
    employees INTEGER,
    market_cap BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_stock_profiles_updated_at BEFORE UPDATE ON public.stock_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Stock Ratios
CREATE TABLE public.stock_ratios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    date DATE NOT NULL,
    pe_ratio NUMERIC,
    pb_ratio NUMERIC,
    debt_to_equity NUMERIC,
    roe NUMERIC,
    roa NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol, date)
);

CREATE TRIGGER update_stock_ratios_updated_at BEFORE UPDATE ON public.stock_ratios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Stock Historical Prices
CREATE TABLE public.stock_historical_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    date DATE NOT NULL,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    close NUMERIC,
    volume BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol, date)
);

-- 8. Stock News
CREATE TABLE public.stock_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT,
    url TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Stock Grades
CREATE TABLE public.stock_grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    date DATE NOT NULL,
    grade TEXT NOT NULL,
    grading_company TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_stock_grades_updated_at BEFORE UPDATE ON public.stock_grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Stock Peers
CREATE TABLE public.stock_peers (
    symbol TEXT PRIMARY KEY REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    peers TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_stock_peers_updated_at BEFORE UPDATE ON public.stock_peers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Portfolio
CREATE TABLE public.portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    symbol TEXT REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    shares NUMERIC NOT NULL,
    average_price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON public.portfolio FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Watchlist
CREATE TABLE public.watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    symbol TEXT REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- 13. Greed & Fear Index
CREATE TABLE public.greed_fear_index (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE UNIQUE NOT NULL,
    value INTEGER NOT NULL,
    rating TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Ranks
CREATE TABLE public.ranks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    rank_type TEXT NOT NULL,
    rank_value INTEGER NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol, rank_type, date)
);

CREATE TRIGGER update_ranks_updated_at BEFORE UPDATE ON public.ranks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Rank Fundamentals
CREATE TABLE public.rank_fundamentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    score NUMERIC NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol, date)
);

CREATE TRIGGER update_rank_fundamentals_updated_at BEFORE UPDATE ON public.rank_fundamentals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. Rank Sharpe
CREATE TABLE public.rank_sharpe (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    sharpe_ratio NUMERIC NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol, date)
);

CREATE TRIGGER update_rank_sharpe_updated_at BEFORE UPDATE ON public.rank_sharpe FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 17. Chats
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 18. Comments
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- e.g., 'stock', 'news', 'chat'
    target_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 19. Replies
CREATE TABLE public.replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_replies_updated_at BEFORE UPDATE ON public.replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 20. Support Tickets
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 21. Cryptocurrencies
CREATE TABLE public.cryptocurrencies (
    symbol TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_cryptocurrencies_updated_at BEFORE UPDATE ON public.cryptocurrencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 22. ETFs
CREATE TABLE public.etfs (
    symbol TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_etfs_updated_at BEFORE UPDATE ON public.etfs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_ratios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_historical_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_peers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greed_fear_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rank_fundamentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rank_sharpe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cryptocurrencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etfs ENABLE ROW LEVEL SECURITY;

-- Users: Users can read and update their own profile
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Usage: Users can view their own usage
CREATE POLICY "Users can view their own usage" ON public.usage FOR SELECT USING (auth.uid() = user_id);

-- Public Data: Anyone can read stocks, profiles, ratios, prices, news, grades, peers, greed/fear, ranks, cryptos, etfs
CREATE POLICY "Public read access for stocks" ON public.stocks FOR SELECT USING (true);
CREATE POLICY "Public read access for stock_profiles" ON public.stock_profiles FOR SELECT USING (true);
CREATE POLICY "Public read access for stock_ratios" ON public.stock_ratios FOR SELECT USING (true);
CREATE POLICY "Public read access for stock_historical_prices" ON public.stock_historical_prices FOR SELECT USING (true);
CREATE POLICY "Public read access for stock_news" ON public.stock_news FOR SELECT USING (true);
CREATE POLICY "Public read access for stock_grades" ON public.stock_grades FOR SELECT USING (true);
CREATE POLICY "Public read access for stock_peers" ON public.stock_peers FOR SELECT USING (true);
CREATE POLICY "Public read access for greed_fear_index" ON public.greed_fear_index FOR SELECT USING (true);
CREATE POLICY "Public read access for ranks" ON public.ranks FOR SELECT USING (true);
CREATE POLICY "Public read access for rank_fundamentals" ON public.rank_fundamentals FOR SELECT USING (true);
CREATE POLICY "Public read access for rank_sharpe" ON public.rank_sharpe FOR SELECT USING (true);
CREATE POLICY "Public read access for cryptocurrencies" ON public.cryptocurrencies FOR SELECT USING (true);
CREATE POLICY "Public read access for etfs" ON public.etfs FOR SELECT USING (true);

-- Portfolio: Users can manage their own portfolio
CREATE POLICY "Users can manage their own portfolio" ON public.portfolio FOR ALL USING (auth.uid() = user_id);

-- Watchlist: Users can manage their own watchlist
CREATE POLICY "Users can manage their own watchlist" ON public.watchlist FOR ALL USING (auth.uid() = user_id);

-- Chats: Users can manage their own chats
CREATE POLICY "Users can manage their own chats" ON public.chats FOR ALL USING (auth.uid() = user_id);

-- Comments & Replies: Anyone can read, users can create, users can update/delete their own
CREATE POLICY "Public read access for comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public read access for replies" ON public.replies FOR SELECT USING (true);
CREATE POLICY "Users can insert replies" ON public.replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own replies" ON public.replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own replies" ON public.replies FOR DELETE USING (auth.uid() = user_id);

-- Support Tickets: Users can manage their own tickets
CREATE POLICY "Users can manage their own support tickets" ON public.support_tickets FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_portfolio_user_id ON public.portfolio(user_id);
CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX idx_stock_historical_prices_symbol_date ON public.stock_historical_prices(symbol, date DESC);
CREATE INDEX idx_stock_news_symbol_published_at ON public.stock_news(symbol, published_at DESC);
CREATE INDEX idx_comments_target ON public.comments(target_type, target_id);
CREATE INDEX idx_replies_comment_id ON public.replies(comment_id);
