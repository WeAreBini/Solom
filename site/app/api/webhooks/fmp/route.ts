import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Verify webhook signature/secret here if applicable
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.FMP_WEBHOOK_SECRET}`) {
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      // Commented out for placeholder purposes
    }

    const body = await request.json();
    
    // Example payload from FMP might contain price updates or news
    const { type, data } = body;

    // const supabase = await createAdminClient();

    if (type === 'price_update') {
      // Process price update
      // e.g., check against active alerts
      // This is a placeholder for the actual logic
      console.log('Received price update:', data);
      
      // Example: Trigger alerts
      // const { symbol, price } = data;
      // await processAlerts(supabase, symbol, price);
    } else if (type === 'news') {
      // Process news update
      console.log('Received news update:', data);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
