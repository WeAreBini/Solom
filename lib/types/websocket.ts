// WebSocket connection status
export type ConnectionStatus = 
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

// WebSocket message types
export interface WebSocketMessage<T = unknown> {
  type: 'price_update' | 'update' | 'snapshot' | 'error' | 'ping' | 'pong' | 'subscribe' | 'unsubscribe';
  payload: T;
  timestamp: number;
}

// Price update message
export interface PriceUpdatePayload {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
  bid?: number;
  ask?: number;
  dayHigh?: number;
  dayLow?: number;
}

// Subscription messages
export interface SubscribePayload {
  symbols: string[];
}

export interface UnsubscribePayload {
  symbols: string[];
}

// WebSocket configuration
export interface WebSocketConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

// Connection state
export interface ConnectionState {
  status: ConnectionStatus;
  lastConnected: Date | null;
  reconnectAttempts: number;
  error: Error | null;
}