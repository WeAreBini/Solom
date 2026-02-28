import { NextResponse } from "next/server";

/**
 * WebSocket API Documentation
 * 
 * GET /api/websocket
 * Returns WebSocket connection configuration
 * 
 * WebSocket Endpoint (if configured):
 * WebSocket URL: NEXT_PUBLIC_WS_URL
 * Message Types:
 * 
 * Subscribe:
 * {
 *   "type": "subscribe",
 *   "payload": { "symbols": ["AAPL", "GOOGL"] },
 *   "timestamp": 1234567890000
 * }
 * 
 * Unsubscribe:
 * {
 *   "type": "unsubscribe",
 *   "payload": { "symbols": ["AAPL"] },
 *   "timestamp": 1234567890000
 * }
 * 
 * Price Update (from server):
 * {
 *   "type": "price_update",
 *   "payload": {
 *     "symbol": "AAPL",
 *     "price": 150.25,
 *     "change": 1.50,
 *     "changePercent": 1.01,
 *     "volume": 50000000,
 *     "timestamp": 1234567890000
 *   },
 *   "timestamp": 1234567890000
 * }
 * 
 * Heartbeat:
 * - Client sends: { "type": "ping", "payload": {}, "timestamp": ... }
 * - Server responds: { "type": "pong", "payload": {}, "timestamp": ... }
 */

export async function GET() {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  
  return NextResponse.json({
    websocket: {
      enabled: !!wsUrl,
      url: wsUrl || null,
      reconnectAttempts: 5,
      reconnectInterval: 1000,
      heartbeatInterval: 30000,
    },
    fallback: {
      method: "polling",
      interval: 5000,
      endpoints: {
        quote: "/api/stocks/[symbol]/quote",
        quotes: "/api/stocks/quote?symbols=[symbols]",
      },
    },
    messageTypes: {
      subscribe: {
        type: "subscribe",
        payload: { symbols: ["AAPL"] },
      },
      unsubscribe: {
        type: "unsubscribe",
        payload: { symbols: ["AAPL"] },
      },
      price_update: {
        type: "price_update",
        payload: {
          symbol: "AAPL",
          price: 150.25,
          change: 1.50,
          changePercent: 1.01,
          volume: 50000000,
          timestamp: Date.now(),
        },
      },
      ping: { type: "ping" },
      pong: { type: "pong" },
    },
  });
}