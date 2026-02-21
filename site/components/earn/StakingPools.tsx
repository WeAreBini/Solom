"use client";

/**
 * @ai-context StakingPools component displaying different assets and their APY.
 * @ai-related app/earn/page.tsx
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, ShieldCheck, AlertCircle } from "lucide-react";

interface StakingPool {
  id: string;
  asset: string;
  symbol: string;
  apy: number;
  tvl: string;
  risk: "Low" | "Medium" | "High";
  lockup: string;
}

const mockPools: StakingPool[] = [
  {
    id: "1",
    asset: "Ethereum",
    symbol: "ETH",
    apy: 4.5,
    tvl: "$1.2B",
    risk: "Low",
    lockup: "Flexible",
  },
  {
    id: "2",
    asset: "Solana",
    symbol: "SOL",
    apy: 7.2,
    tvl: "$450M",
    risk: "Medium",
    lockup: "14 Days",
  },
  {
    id: "3",
    asset: "Polkadot",
    symbol: "DOT",
    apy: 11.5,
    tvl: "$210M",
    risk: "Medium",
    lockup: "28 Days",
  },
  {
    id: "4",
    asset: "USDC",
    symbol: "USDC",
    apy: 5.1,
    tvl: "$800M",
    risk: "Low",
    lockup: "Flexible",
  },
  {
    id: "5",
    asset: "Avalanche",
    symbol: "AVAX",
    apy: 8.4,
    tvl: "$150M",
    risk: "High",
    lockup: "21 Days",
  },
];

export function StakingPools() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {mockPools.map((pool) => (
        <Card key={pool.id} className="flex flex-col hover:border-primary/50 transition-colors">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{pool.asset}</CardTitle>
                  <CardDescription>{pool.symbol}</CardDescription>
                </div>
              </div>
              <Badge variant={pool.risk === "Low" ? "default" : pool.risk === "Medium" ? "secondary" : "destructive"}>
                {pool.risk} Risk
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> APY
                </span>
                <span className="text-2xl font-bold text-green-500">{pool.apy}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Total Value Locked</span>
                <span className="text-lg font-semibold">{pool.tvl}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
              {pool.lockup === "Flexible" ? (
                <ShieldCheck className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
              Lockup: {pool.lockup}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Stake {pool.symbol}</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
