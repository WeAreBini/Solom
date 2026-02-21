"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * @ai-context SimulatedTradeCard component provides a mock trading interface.
 * @ai-related app/ticker/[symbol]/page.tsx
 */

interface SimulatedTradeCardProps {
  symbol: string;
  currentPrice: number;
}

export function SimulatedTradeCard({ symbol, currentPrice }: SimulatedTradeCardProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState<string>('1');

  const numShares = parseFloat(shares) || 0;
  const estimatedCost = numShares * currentPrice;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Trade {symbol}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={tradeType} onValueChange={(v) => setTradeType(v as 'buy' | 'sell')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="shares" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Shares</label>
            <Input
              id="shares"
              type="number"
              min="0"
              step="1"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="0"
              className="text-right text-lg"
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Market Price</span>
            <span className="font-medium">${currentPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-sm font-medium pt-2 border-t border-border">
            <span>Estimated {tradeType === 'buy' ? 'Cost' : 'Credit'}</span>
            <span className="text-lg">${estimatedCost.toFixed(2)}</span>
          </div>
        </div>

        <Button className="w-full text-lg h-12 font-semibold" variant={tradeType === 'buy' ? 'default' : 'destructive'}>
          Review Order
        </Button>
      </CardContent>
    </Card>
  );
}
