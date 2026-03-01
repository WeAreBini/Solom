"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Bell, BellOff, Trash2, Plus, Loader2, TrendingUp, TrendingDown, Check, X } from "lucide-react";

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  status: 'ACTIVE' | 'TRIGGERED' | 'DISABLED' | 'DELETED';
  createdAt: string;
}

interface PriceAlertsProps {
  symbol: string;
  currentPrice?: number;
  onAlertTriggered?: (alert: PriceAlert) => void;
}

export function PriceAlerts({ symbol, currentPrice, onAlertTriggered }: PriceAlertsProps) {
  const [mounted, setMounted] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch alerts for this symbol
  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['alerts', symbol],
    queryFn: async () => {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data.filter((alert: PriceAlert) => alert.symbol === symbol);
    },
    enabled: mounted,
  });

  // Create alert mutation
  const createMutation = useMutation({
    mutationFn: async (params: { symbol: string; targetPrice: number; condition: 'ABOVE' | 'BELOW' }) => {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setShowCreateForm(false);
      setTargetPrice("");
    },
  });

  // Delete alert mutation
  const deleteMutation = useMutation({
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

  // Toggle alert mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ alertId, status }: { alertId: string; status: 'ACTIVE' | 'DISABLED' }) => {
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

  // Check if any alerts should be triggered
  useEffect(() => {
    if (!currentPrice || !alerts) return;

    for (const alert of alerts) {
      if (alert.status !== 'ACTIVE') continue;

      const shouldTrigger =
        (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice);

      if (shouldTrigger) {
        onAlertTriggered?.(alert);
      }
    }
  }, [currentPrice, alerts, onAlertTriggered]);

  const handleCreateAlert = useCallback(() => {
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) return;

    createMutation.mutate({
      symbol: symbol.toUpperCase(),
      targetPrice: price,
      condition,
    });
  }, [symbol, targetPrice, condition, createMutation]);

  const handleDeleteAlert = useCallback((alertId: string) => {
    deleteMutation.mutate(alertId);
  }, [deleteMutation]);

  const handleToggleAlert = useCallback((alertId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    toggleMutation.mutate({ alertId, status: newStatus as 'ACTIVE' | 'DISABLED' });
  }, [toggleMutation]);

  if (!mounted) {
    return null;
  }

  const symbolAlerts = alerts?.filter((a: PriceAlert) => a.symbol === symbol && a.status !== 'DELETED') || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
        Failed to load alerts
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Existing Alerts */}
      {symbolAlerts.length > 0 && (
        <div className="space-y-2">
          {symbolAlerts.map((alert: PriceAlert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between rounded-lg border p-2 text-sm ${
                alert.status === 'TRIGGERED'
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : alert.status === 'DISABLED'
                  ? 'border-muted bg-muted/30'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center gap-2">
                {alert.condition === 'ABOVE' ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium tabular-nums">${alert.targetPrice.toFixed(2)}</span>
                <Badge variant="outline" className="text-xs">
                  {alert.condition === 'ABOVE' ? 'Above' : 'Below'}
                </Badge>
                {alert.status === 'TRIGGERED' && (
                  <Badge variant="success" className="text-xs">
                    <Check className="mr-1 h-3 w-3" />
                    Triggered
                  </Badge>
                )}
                {alert.status === 'DISABLED' && (
                  <Badge variant="secondary" className="text-xs">Paused</Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleToggleAlert(alert.id, alert.status)}
                >
                  {alert.status === 'ACTIVE' ? (
                    <BellOff className="h-3.5 w-3.5" />
                  ) : (
                    <Bell className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteAlert(alert.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Alert Form */}
      {showCreateForm ? (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Target price"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="h-9"
              step="0.01"
              min="0"
            />
            <div className="flex rounded-lg border p-1">
              <Button
                variant={condition === 'ABOVE' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2"
                onClick={() => setCondition('ABOVE')}
              >
                <TrendingUp className="mr-1 h-3 w-3" />
                Above
              </Button>
              <Button
                variant={condition === 'BELOW' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2"
                onClick={() => setCondition('BELOW')}
              >
                <TrendingDown className="mr-1 h-3 w-3" />
                Below
              </Button>
            </div>
          </div>
          {currentPrice && (
            <p className="text-xs text-muted-foreground">
              Current price: ${currentPrice.toFixed(2)}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateAlert}
              disabled={!targetPrice || parseFloat(targetPrice) <= 0 || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : null}
              Create Alert
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="w-full" onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-1 h-3 w-3" />
          Add Price Alert
        </Button>
      )}
    </div>
  );
}

// Alert Notifications Component
interface AlertNotificationProps {
  symbol?: string;
  maxNotifications?: number;
}

export function AlertNotifications({ symbol, maxNotifications = 5 }: AlertNotificationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', symbol || 'all'],
    queryFn: async () => {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      let filtered = data.data.filter((a: PriceAlert) => a.status === 'TRIGGERED');
      if (symbol) {
        filtered = filtered.filter((a: PriceAlert) => a.symbol === symbol);
      }
      return filtered.slice(0, maxNotifications);
    },
    enabled: mounted,
  });

  if (!mounted || isLoading || !alerts || alerts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" />
          Triggered Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map((alert: PriceAlert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-sm"
          >
            <div className="flex items-center gap-2">
              {alert.condition === 'ABOVE' ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-emerald-500" />
              )}
              <span className="font-medium">{alert.symbol}</span>
              <span className="text-muted-foreground">
                hit ${alert.targetPrice.toFixed(2)}
              </span>
            </div>
            <Badge variant="success" className="text-xs">
              Triggered
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}