import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getLiveQuote } from '@/app/actions/fmp';
import { z } from 'zod';

const tradeSchema = z.object({
  symbol: z.string().min(1),
  quantity: z.number().positive().finite(),
  type: z.enum(['buy', 'sell']),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit check: 5 requests per 10 seconds
    const { data: isAllowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_endpoint: 'trade_execute',
      p_limit: 5,
      p_window_seconds: 10
    });

    if (rateLimitError) {
      console.error('Rate limit error:', rateLimitError);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    if (!isAllowed) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    const body = await request.json();
    const parseResult = tradeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid request data', details: parseResult.error.format() }, { status: 400 });
    }

    const { symbol, quantity, type } = parseResult.data;

    const quote = await getLiveQuote(symbol);
    if (!quote || !quote.price) {
      return NextResponse.json({ error: 'Failed to fetch current price' }, { status: 500 });
    }
    const price = quote.price;

    // Execute trade via RPC to ensure atomicity and prevent race conditions
    const { data: rpcResult, error: rpcError } = await adminSupabase.rpc('execute_trade', {
      p_user_id: user.id,
      p_symbol: symbol,
      p_quantity: quantity,
      p_type: type,
      p_price: price
    });

    if (rpcError) {
      return NextResponse.json({ error: 'Trade execution failed', details: rpcError.message }, { status: 500 });
    }

    if (!rpcResult.success) {
      return NextResponse.json({ error: rpcResult.error || 'Trade execution failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: rpcResult.message });

  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
