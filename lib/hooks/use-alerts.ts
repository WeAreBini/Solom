"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ============ WATCHLIST HOOKS ============

interface WatchlistItem {
  symbol: string;
  addedAt: string;
}

export function useWatchlist() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const query = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const response = await fetch('/api/watchlist');
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data as WatchlistItem[];
    },
    enabled: mounted,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    watchlist: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useWatchlistMutations() {
  const queryClient = useQueryClient();

  const addToWatchlist = useMutation({
    mutationFn: async (symbol: string) => {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const removeFromWatchlist = useMutation({
    mutationFn: async (symbol: string) => {
      const response = await fetch(`/api/watchlist/${symbol}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  return {
    addToWatchlist,
    removeFromWatchlist,
  };
}

// ============ ALERTS HOOKS ============

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  status: 'ACTIVE' | 'TRIGGERED' | 'DISABLED' | 'DELETED';
  createdAt: string;
}

export function useAlerts(symbol?: string) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const query = useQuery({
    queryKey: ['alerts', symbol],
    queryFn: async () => {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      let alerts = data.data as PriceAlert[];
      if (symbol) {
        alerts = alerts.filter(a => a.symbol === symbol);
      }
      return alerts;
    },
    enabled: mounted,
    staleTime: 1000 * 30, // 30 seconds
  });

  return {
    alerts: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    triggeredAlerts: (query.data || []).filter(a => a.status === 'TRIGGERED'),
    activeAlerts: (query.data || []).filter(a => a.status === 'ACTIVE'),
  };
}

export function useAlertMutations() {
  const queryClient = useQueryClient();

  const createAlert = useMutation({
    mutationFn: async (params: { symbol: string; targetPrice: number; condition: 'ABOVE' | 'BELOW' }) => {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const deleteAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const toggleAlert = useMutation({
    mutationFn: async ({ alertId, status }: { alertId: string; status: 'ACTIVE' | 'DISABLED' | 'TRIGGERED' }) => {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return {
    createAlert,
    deleteAlert,
    toggleAlert,
  };
}

// ============ PRICE CHECK & ALERT TRIGGERING ============

export function usePriceAlertChecker() {
  const { alerts } = useAlerts();
  const { toggleAlert } = useAlertMutations();

  const checkAlerts = useCallback((symbol: string, currentPrice: number) => {
    const triggeredAlerts = alerts.filter(alert => {
      if (alert.symbol !== symbol || alert.status !== 'ACTIVE') return false;

      return (
        (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice)
      );
    });

    // Mark alerts as triggered
    for (const alert of triggeredAlerts) {
      toggleAlert.mutate({ alertId: alert.id, status: 'TRIGGERED' as const });
    }

    return triggeredAlerts;
  }, [alerts, toggleAlert]);

  return { checkAlerts };
}

// ============ COMBINED HOOK FOR DASHBOARD ============

export function useStockDashboard() {
  const { watchlist, isLoading: watchlistLoading } = useWatchlist();
  const { alerts, isLoading: alertsLoading } = useAlerts();

  // Calculate summary stats
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const triggeredAlerts = alerts.filter(a => a.status === 'TRIGGERED');

  return {
    watchlist,
    alerts,
    activeAlerts,
    triggeredAlerts,
    isLoading: watchlistLoading || alertsLoading,
    watchlistSymbols: watchlist.map(w => w.symbol),
    alertSymbols: [...new Set(activeAlerts.map(a => a.symbol))],
  };
}