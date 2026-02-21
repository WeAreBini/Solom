import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { symbol, quantity, type, price } = body; // type: 'buy' | 'sell'

    if (!symbol || !quantity || !type || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (quantity <= 0 || price <= 0) {
      return NextResponse.json({ error: 'Invalid quantity or price' }, { status: 400 });
    }

    const totalCost = quantity * price;

    // Fetch user balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    if (type === 'buy') {
      if (profile.balance < totalCost) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }

      // Deduct balance
      const { error: updateBalanceError } = await supabase
        .from('profiles')
        .update({ balance: profile.balance - totalCost })
        .eq('id', user.id);

      if (updateBalanceError) {
        return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
      }

      // Update or insert position
      const { data: existingPosition } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .single();

      if (existingPosition) {
        const newQuantity = existingPosition.quantity + quantity;
        const newAveragePrice = ((existingPosition.quantity * existingPosition.average_price) + totalCost) / newQuantity;
        
        await supabase
          .from('positions')
          .update({ quantity: newQuantity, average_price: newAveragePrice })
          .eq('id', existingPosition.id);
      } else {
        await supabase
          .from('positions')
          .insert({ user_id: user.id, symbol, quantity, average_price: price });
      }

    } else if (type === 'sell') {
      // Check if user has enough quantity
      const { data: existingPosition } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', symbol)
        .single();

      if (!existingPosition || existingPosition.quantity < quantity) {
        return NextResponse.json({ error: 'Insufficient position quantity' }, { status: 400 });
      }

      // Add to balance
      const { error: updateBalanceError } = await supabase
        .from('profiles')
        .update({ balance: profile.balance + totalCost })
        .eq('id', user.id);

      if (updateBalanceError) {
        return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
      }

      const newQuantity = existingPosition.quantity - quantity;
      if (newQuantity === 0) {
        await supabase
          .from('positions')
          .delete()
          .eq('id', existingPosition.id);
      } else {
        await supabase
          .from('positions')
          .update({ quantity: newQuantity })
          .eq('id', existingPosition.id);
      }
    } else {
      return NextResponse.json({ error: 'Invalid trade type' }, { status: 400 });
    }

    // Record transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        symbol,
        type,
        quantity,
        price,
        total: totalCost
      });

    return NextResponse.json({ success: true, message: `Successfully executed ${type} order for ${quantity} ${symbol}` });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
