"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import {
  ConnectionStatus,
  ConnectionState,
  WebSocketMessage,
  PriceUpdatePayload,
} from "@/lib/types/websocket";

// WebSocket configuration
const WS_CONFIG = {
  // Use environment variable for WebSocket URL
  baseUrl: process.env.NEXT_PUBLIC_WS_URL || "",
  reconnectAttempts: 5,
  reconnectInterval: 1000, // Start with 1s, exponential backoff
  maxReconnectInterval: 30000, // Max 30s between retries
  heartbeatInterval: 30000, // 30 seconds
  connectionTimeout: 10000, // 10 seconds to connect
};

// Context interface
interface WebSocketContextValue {
  connectionState: ConnectionState;
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
  prices: Map<string, PriceUpdatePayload>;
  latestPrices: Record<string, PriceUpdatePayload>;
  reconnect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

// Provider props
interface WebSocketProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

export function WebSocketProvider({
  children,
  enabled = true,
}: WebSocketProviderProps) {
  // State
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: "disconnected",
    lastConnected: null,
    reconnectAttempts: 0,
    error: null,
  });

  // Price updates Map - using Map for O(1) lookups
  const [prices, setPrices] = useState<Map<string, PriceUpdatePayload>>(new Map());

  // Refs for mutable values
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set());
  const isUnmountedRef = useRef(false);

  // Get the current prices as a plain object for easy consumption
  const latestPrices = useMemo(() => {
    return Object.fromEntries(prices);
  }, [prices]);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (
      isUnmountedRef.current ||
      !enabled ||
      wsRef.current?.readyState === WebSocket.OPEN
    ) {
      return;
    }

    // If we don't have a WebSocket URL, stay disconnected (will use polling fallback)
    if (!WS_CONFIG.baseUrl) {
      setConnectionState({
        status: "disconnected",
        lastConnected: null,
        reconnectAttempts: 0,
        error: null,
      });
      return;
    }

    setConnectionState((prev) => ({
      ...prev,
      status: "connecting",
      error: null,
    }));

    try {
      const ws = new WebSocket(WS_CONFIG.baseUrl);
      wsRef.current = ws;

      // Connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          setConnectionState((prev) => ({
            ...prev,
            status: "error",
            error: new Error("Connection timeout"),
          }));
        }
      }, WS_CONFIG.connectionTimeout);

      ws.onopen = () => {
        if (isUnmountedRef.current) return;

        // Clear connection timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        setConnectionState({
          status: "connected",
          lastConnected: new Date(),
          reconnectAttempts: 0,
          error: null,
        });

        // Resubscribe to existing subscriptions
        if (subscriptionsRef.current.size > 0) {
          ws.send(
            JSON.stringify({
              type: "subscribe",
              payload: { symbols: Array.from(subscriptionsRef.current) },
              timestamp: Date.now(),
            })
          );
        }

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping", payload: {}, timestamp: Date.now() }));
          }
        }, WS_CONFIG.heartbeatInterval);
      };

      ws.onclose = (event) => {
        if (isUnmountedRef.current) return;

        clearTimers();

        setConnectionState((prev) => ({
          ...prev,
          status: "disconnected",
          error: event.reason ? new Error(event.reason) : null,
        }));

        // Attempt reconnection with exponential backoff
        const currentAttempts = connectionState.reconnectAttempts;
        if (currentAttempts < WS_CONFIG.reconnectAttempts && enabled) {
          setConnectionState((prev) => ({
            ...prev,
            status: "reconnecting",
            reconnectAttempts: prev.reconnectAttempts + 1,
          }));

          const delay = Math.min(
            WS_CONFIG.reconnectInterval * Math.pow(2, currentAttempts),
            WS_CONFIG.maxReconnectInterval
          );

          reconnectTimeoutRef.current = setTimeout(() => connect(), delay);
        }
      };

      ws.onerror = () => {
        if (isUnmountedRef.current) return;

        setConnectionState((prev) => ({
          ...prev,
          status: "error",
          error: new Error("WebSocket error"),
        }));
      };

      ws.onmessage = (event) => {
        if (isUnmountedRef.current) return;

        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === "price_update" || message.type === "update") {
            const payload = message.payload as PriceUpdatePayload;
            if (payload && payload.symbol) {
              setPrices((prev) => {
                const newMap = new Map(prev);
                newMap.set(payload.symbol, {
                  ...payload,
                  timestamp: payload.timestamp || Date.now(),
                });
                return newMap;
              });
            }
          } else if (message.type === "pong") {
            // Heartbeat response - no action needed
          } else if (message.type === "error") {
            console.error("WebSocket error:", message.payload);
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };
    } catch (error) {
      setConnectionState({
        status: "error",
        lastConnected: null,
        reconnectAttempts: 0,
        error: error instanceof Error ? error : new Error("Failed to connect"),
      });
    }
  }, [enabled, connectionState.reconnectAttempts, clearTimers]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }
    setConnectionState({
      status: "disconnected",
      lastConnected: null,
      reconnectAttempts: 0,
      error: null,
    });
  }, [clearTimers]);

  // Reconnect
  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  // Subscribe to symbols
  const subscribe = useCallback((symbols: string[]) => {
    // Add to subscriptions
    symbols.forEach((s) => subscriptionsRef.current.add(s));

    // Send subscribe message if connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "subscribe",
          payload: { symbols },
          timestamp: Date.now(),
        })
      );
    }

    // Trigger connection if not connected
    if (
      connectionState.status === "disconnected" ||
      connectionState.status === "error"
    ) {
      connect();
    }
  }, [connectionState.status, connect]);

  // Unsubscribe from symbols
  const unsubscribe = useCallback((symbols: string[]) => {
    // Remove from subscriptions
    symbols.forEach((s) => subscriptionsRef.current.delete(s));

    // Send unsubscribe message if connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "unsubscribe",
          payload: { symbols },
          timestamp: Date.now(),
        })
      );
    }

    // Clear prices for unsubscribed symbols
    setPrices((prev) => {
      const newMap = new Map(prev);
      symbols.forEach((s) => newMap.delete(s));
      return newMap;
    });
  }, []);

  // Connection effect - connect on mount if enabled
  useEffect(() => {
    isUnmountedRef.current = false;

    if (enabled && WS_CONFIG.baseUrl) {
      connect();
    }

    return () => {
      isUnmountedRef.current = true;
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Memoized context value
  const value = useMemo<WebSocketContextValue>(
    () => ({
      connectionState,
      subscribe,
      unsubscribe,
      prices,
      latestPrices,
      reconnect,
      disconnect,
    }),
    [connectionState, subscribe, unsubscribe, prices, latestPrices, reconnect, disconnect]
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook to use WebSocket context
export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    // Return a default context when provider is not available
    // This allows components to work without the provider (using polling fallback)
    return {
      connectionState: {
        status: "disconnected" as ConnectionStatus,
        lastConnected: null,
        reconnectAttempts: 0,
        error: null,
      },
      subscribe: () => {},
      unsubscribe: () => {},
      prices: new Map<string, PriceUpdatePayload>(),
      latestPrices: {} as Record<string, PriceUpdatePayload>,
      reconnect: () => {},
      disconnect: () => {},
    };
  }
  return context;
}

// Connection status for display
export function useConnectionStatus(): {
  status: ConnectionStatus;
  isConnected: boolean;
  isReconnecting: boolean;
  hasError: boolean;
  lastConnected: Date | null;
  error: Error | null;
} {
  const { connectionState } = useWebSocketContext();

  return {
    status: connectionState.status,
    isConnected: connectionState.status === "connected",
    isReconnecting: connectionState.status === "reconnecting",
    hasError: connectionState.status === "error",
    lastConnected: connectionState.lastConnected,
    error: connectionState.error,
  };
}