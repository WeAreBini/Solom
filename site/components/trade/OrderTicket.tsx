"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * @ai-context OrderTicket component for paper trading interface.
 * Supports Buy/Sell, Market/Limit orders, and fractional shares input.
 * @ai-related app/trade/page.tsx
 */

interface OrderTicketProps {
  symbol: string;
  currentPrice: number;
  buyingPower: number;
}

export function OrderTicket({ symbol, currentPrice, buyingPower }: OrderTicketProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [orderAction, setOrderAction] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [shares, setShares] = useState<string>("");
  const [limitPrice, setLimitPrice] = useState<string>(currentPrice.toString());

  const parsedShares = parseFloat(shares) || 0;
  const parsedLimitPrice = parseFloat(limitPrice) || 0;

  const estimatedCost =
    orderType === "market"
      ? parsedShares * currentPrice
      : parsedShares * parsedLimitPrice;

  const handleTrade = async () => {
    if (parsedShares <= 0) {
      toast.error("Please enter a valid number of shares.");
      return;
    }

    const price = orderType === "market" ? currentPrice : parsedLimitPrice;

    if (orderAction === "buy" && estimatedCost > buyingPower) {
      toast.error("Insufficient buying power.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/trade/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol,
          quantity: parsedShares,
          type: orderAction,
          price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute trade");
      }

      toast.success(`Paper trade executed: ${orderAction.toUpperCase()} ${parsedShares} shares of ${symbol}`);
      
      // Reset form
      setShares("");
      if (orderType === "limit") {
        setLimitPrice(currentPrice.toString());
      }
      
      // Refresh page data
      router.refresh();
    } catch (error: unknown) {
      console.error("Trade execution error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while executing the trade.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Paper Trade {symbol}</span>
          <span className="text-sm font-normal text-muted-foreground">
            ${currentPrice.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Buy / Sell Tabs */}
        <Tabs
          value={orderAction}
          onValueChange={(v) => setOrderAction(v as "buy" | "sell")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="buy"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              Buy
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              className="data-[state=active]:bg-rose-500 data-[state=active]:text-white"
            >
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Order Type */}
        <div className="space-y-2">
          <Label htmlFor="order-type">Order Type</Label>
          <Select
            value={orderType}
            onValueChange={(v) => setOrderType(v as "market" | "limit")}
          >
            <SelectTrigger id="order-type">
              <SelectValue placeholder="Select order type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market">Market Order</SelectItem>
              <SelectItem value="limit">Limit Order</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shares Input */}
        <div className="space-y-2">
          <Label htmlFor="shares">Shares</Label>
          <Input
            id="shares"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Fractional shares allowed.
          </p>
        </div>

        {/* Limit Price Input */}
        {orderType === "limit" && (
          <div className="space-y-2">
            <Label htmlFor="limit-price">Limit Price</Label>
            <Input
              id="limit-price"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
            />
          </div>
        )}

        {/* Summary */}
        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Cost</span>
            <span className="font-medium">${estimatedCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Buying Power</span>
            <span className="font-medium">${buyingPower.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className={cn(
            "w-full font-semibold",
            orderAction === "buy"
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-rose-500 hover:bg-rose-600 text-white"
          )}
          onClick={handleTrade}
          disabled={isLoading || parsedShares <= 0 || (orderAction === "buy" && estimatedCost > buyingPower)}
        >
          {isLoading ? "Processing..." : orderAction === "buy" ? "Review Buy Order" : "Review Sell Order"}
        </Button>
      </CardFooter>
    </Card>
  );
}
