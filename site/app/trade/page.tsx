import React from "react";
import { OrderTicket } from "@/components/trade/OrderTicket";
import { AdvancedChart } from "@/components/trade/AdvancedChart";
import { NewsFeed } from "@/components/news/NewsFeed";
import { RecurringBuyModal } from "@/components/trade/RecurringBuyModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * @ai-context Trade page — hosts the OrderTicket, advanced charting, news feed, and recurring buys.
 * @ai-related components/trade/OrderTicket.tsx, components/trade/AdvancedChart.tsx, components/news/NewsFeed.tsx
 */

export const metadata = { title: "Trade" };

export default function TradePage() {
  // Mock data for the trade page
  const symbol = "AAPL";
  const currentPrice = 150.25;
  const buyingPower = 10000.0;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Trade</h1>
        <p className="text-muted-foreground">
          Execute paper trades and analyze advanced charts.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Advanced Charting & News */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="w-full h-full min-h-[500px] flex flex-col overflow-hidden">
            <CardContent className="flex-1 p-0">
              <AdvancedChart symbol={symbol} />
            </CardContent>
          </Card>
          
          <div className="h-[400px]">
            <NewsFeed symbol={symbol} />
          </div>
        </div>

        {/* Right Column: Order Ticket & Recurring Buy */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <OrderTicket
            symbol={symbol}
            currentPrice={currentPrice}
            buyingPower={buyingPower}
          />
          <RecurringBuyModal symbol={symbol} currentPrice={currentPrice} />
        </div>
      </div>
    </div>
  );
}
