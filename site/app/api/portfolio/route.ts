import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getQuotes } from '@/app/actions/fmp';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile for cash balance
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('paper_balance')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Fetch positions
    const { data: positions, error: positionsError } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', user.id);

    if (positionsError) {
      return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
    }

    // Fetch current market prices for each symbol
    const symbols = positions.map(pos => pos.symbol);
    const quotes = symbols.length > 0 ? await getQuotes(symbols) : [];
    
    // Create a map for quick lookup
    const quoteMap = new Map(quotes.map((q: { symbol: string; price: number }) => [q.symbol, q.price]));
    
    let totalPositionsValue = 0;
    let totalCostBasis = 0;

    const enrichedPositions = positions.map(pos => {
      const currentPrice = quoteMap.get(pos.symbol) || pos.average_price; // Fallback to average price if quote fails
      const currentValue = pos.quantity * currentPrice;
      const costBasis = pos.quantity * pos.average_price;
      const unrealizedPl = currentValue - costBasis;
      const unrealizedPlPercent = costBasis > 0 ? (unrealizedPl / costBasis) * 100 : 0;

      totalPositionsValue += currentValue;
      totalCostBasis += costBasis;
      
      return {
        ...pos,
        current_price: currentPrice,
        current_value: currentValue,
        unrealized_pl: unrealizedPl,
        unrealized_pl_percent: unrealizedPlPercent
      };
    });

    const totalPortfolioValue = (profile?.paper_balance || 0) + totalPositionsValue;
    const totalPortfolioCostBasis = (profile?.paper_balance || 0) + totalCostBasis;
    const totalReturn = totalPortfolioCostBasis > 0 ? ((totalPortfolioValue - totalPortfolioCostBasis) / totalPortfolioCostBasis) * 100 : 0;

    return NextResponse.json({
      balance: profile?.paper_balance || 0,
      total_portfolio_value: totalPortfolioValue,
      positions: enrichedPositions,
      performance: {
        daily_return: 0, // Would require historical data to calculate accurately
        total_return: totalReturn
      }
    });

  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
