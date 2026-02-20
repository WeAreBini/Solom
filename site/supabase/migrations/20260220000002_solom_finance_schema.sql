-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    photo_url TEXT,
    subscription_status TEXT,
    subscription_type TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Stocks Table
CREATE TABLE public.stocks (
    symbol TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    exchange TEXT,
    price NUMERIC,
    change NUMERIC,
    market_cap BIGINT,
    volume BIGINT,
    pe NUMERIC,
    eps NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Stock Profiles Table
CREATE TABLE public.stock_profiles (
    symbol TEXT PRIMARY KEY REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    company_name TEXT,
    description TEXT,
    sector TEXT,
    industry TEXT,
    ceo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Portfolio Table
CREATE TABLE public.portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    symbol TEXT REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    price_purchased NUMERIC NOT NULL,
    amount_of_shares NUMERIC NOT NULL,
    purchased_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Watchlist Table
CREATE TABLE public.watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ticker TEXT REFERENCES public.stocks(symbol) ON DELETE CASCADE,
    is_watching BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, ticker)
);

-- 6. Subscriptions Table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT,
    amount NUMERIC,
    status TEXT,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Chats Table
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Chat Messages Table
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Can read and update their own profile
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Stocks: Public read access
CREATE POLICY "Stocks are viewable by everyone" ON public.stocks FOR SELECT USING (true);

-- Stock Profiles: Public read access
CREATE POLICY "Stock profiles are viewable by everyone" ON public.stock_profiles FOR SELECT USING (true);

-- Portfolio: Users can CRUD their own portfolio
CREATE POLICY "Users can view their own portfolio" ON public.portfolio FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert into their own portfolio" ON public.portfolio FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolio" ON public.portfolio FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from their own portfolio" ON public.portfolio FOR DELETE USING (auth.uid() = user_id);

-- Watchlist: Users can CRUD their own watchlist
CREATE POLICY "Users can view their own watchlist" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert into their own watchlist" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own watchlist" ON public.watchlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from their own watchlist" ON public.watchlist FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions: Users can read their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Chats: Users can CRUD their own chats
CREATE POLICY "Users can view their own chats" ON public.chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own chats" ON public.chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own chats" ON public.chats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own chats" ON public.chats FOR DELETE USING (auth.uid() = user_id);

-- Chat Messages: Users can CRUD messages in their own chats
CREATE POLICY "Users can view messages of their own chats" ON public.chat_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chats WHERE id = chat_messages.chat_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert messages to their own chats" ON public.chat_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.chats WHERE id = chat_messages.chat_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update messages of their own chats" ON public.chat_messages FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.chats WHERE id = chat_messages.chat_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete messages of their own chats" ON public.chat_messages FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.chats WHERE id = chat_messages.chat_id AND user_id = auth.uid())
);