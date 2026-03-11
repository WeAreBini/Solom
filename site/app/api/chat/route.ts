import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit check: 10 requests per 60 seconds
  const { data: isAllowed, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
    p_user_id: user.id,
    p_endpoint: 'chat',
    p_limit: 10,
    p_window_seconds: 60
  });

  if (rateLimitError) {
    console.error('Rate limit error:', rateLimitError);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  if (!isAllowed) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),
    system:
      'You are SolomGPT, an expert AI financial assistant built into the Solom finance app. Provide concise, accurate, and professional financial insights. When asked about stocks, market trends, or economic data, give thoughtful analysis. Always clarify that nothing you say is financial advice.',
    messages,
  });

  return result.toTextStreamResponse();
}
