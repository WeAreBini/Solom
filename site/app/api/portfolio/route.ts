import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile for cash balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Fetch positions
    const { data: positions, error: positionsError } = await supabase
      .from('positions')
      .select('*')
      .eq('user_id', user.id);

    if (positionsError) {
      return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
    }

    // In a real app, we would fetch current market prices for each symbol here
    // For now, we'll mock the current price as the average price for calculation purposes
    // or assume the client will calculate the live value.
    
    let totalPositionsValue = 0;
    const enrichedPositions = positions.map(pos => {
      const currentPrice = pos.average_price; // Mocked current price
      const currentValue = pos.quantity * currentPrice;
      totalPositionsValue += currentValue;
      
      return {
        ...pos,
        current_price: currentPrice,
        current_value: currentValue,
        unrealized_pl: currentValue - (pos.quantity * pos.average_price),
        unrealized_pl_percent: 0 // Mocked
      };
    });

    const totalPortfolioValue = (profile?.balance || 0) + totalPositionsValue;

    return NextResponse.json({
      balance: profile?.balance || 0,
      total_portfolio_value: totalPortfolioValue,
      positions: enrichedPositions,
      performance: {
        daily_return: 0, // Mocked
        total_return: 0  // Mocked
      }
    });

  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
