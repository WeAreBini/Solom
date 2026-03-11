import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // Verify webhook signature/secret here if applicable
    const authHeader = request.headers.get('authorization');
    const secret = process.env.FMP_WEBHOOK_SECRET;
    
    if (!secret) {
      console.error('FMP_WEBHOOK_SECRET is not set');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const expectedHeader = `Bearer ${secret}`;
    
    if (!authHeader || authHeader.length !== expectedHeader.length || !crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expectedHeader))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
