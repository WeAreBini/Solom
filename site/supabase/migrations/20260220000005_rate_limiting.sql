-- Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    request_count INT NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create RPC function for rate limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_user_id UUID,
    p_endpoint TEXT,
    p_limit INT,
    p_window_seconds INT
) RETURNS BOOLEAN AS $$
DECLARE
    v_allowed BOOLEAN;
BEGIN
    -- Insert or update the rate limit record atomically
    INSERT INTO public.rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, NOW())
    ON CONFLICT (user_id, endpoint) DO UPDATE
    SET 
        request_count = CASE 
            WHEN NOW() > public.rate_limits.window_-- Create rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_  CREATE TABLE IF NOT EXISTSeq    user_id UUID NOT NULL REFERENCES auth.userrt    endpoint TEXT NOT NULL,
    request_count INT NOT NULL DEFAULT 1,p_    request_count INT NOT s'    window_start TIMESTAMP WITH TIME ZONpu    PRIMARY KEY (user_id, endpoint)
);

-- Enable RLS
ALTER TABL_c);

-- Enabimit) INTO v_allowed;

  
 REALTER TABLE ed
-- Create RPGUAGE plpgsql SECURITY DEFINER;
