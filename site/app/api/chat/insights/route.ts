import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: portfolioItems, error } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching portfolio:', error);
      return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
    }

    if (!portfolioItems || portfolioItems.length === 0) {
      return NextResponse.json({
        insights: [
          "Your portfolio is currently empty. Consider exploring the market to find investment opportunities.",
          "Start by adding stocks to your watchlist to track their performance.",
          "Diversification is key to managing risk when you start investing."
        ]
      });
    }

    // Prepare portfolio summary for the AI
    const portfolioSummary = portfolioItems.map(item => 
      `${item.quantity} shares of ${item.symbol} at $${item.average_price}`
    ).join(', ');

    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        insights: z.array(z.string()).min(3).max(4).describe('3 to 4 personalized bullet points providing trading insights or risk analysis based on the portfolio.'),
      }),
      system: 'You are an expert AI financial advisor. Analyze the user\'s portfolio and provide 3-4 concise, personalized, and actionable insights or risk analysis bullet points. Keep them brief and professional. Do not provide financial advice.',
      prompt: `Analyze the following portfolio and provide insights: ${portfolioSummary}`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error('Error generating insights:', error);
    // Fallback mock response in case of API key issues or other errors
    return NextResponse.json({
      insights: [
        "Consider diversifying your portfolio to reduce risk.",
        "Keep an eye on market trends for your top holdings.",
        "Review your asset allocation to ensure it aligns with your goals."
      ]
    });
  }
}
