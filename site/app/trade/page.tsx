import React from "react";
import { OrderTicket } from "@/components/trade/OrderTicket";
import { AdvancedChart } from "@/components/trade/AdvancedChart";
import { NewsFeed } from "@/components/news/NewsFeed";
import { RecurringBuyModal } from "@/components/trade/RecurringBuyModal";
import CompanyProfile from "@/components/finance/CompanyProfile";
import AnalystRatings from "@/components/finance/AnalystRatings";
import { KeyStatistics } from "@/components/finance/KeyStatistics";
import { Card, CardContent } from "@/components/ui/card";
import { getQuote } from "@/app/actions/fmp";
import { createClient } from "@/lib/supabase/server";

/**
 * @ai-context Trade page — hosts the OrderTicket, advanced charting, news feed, and recurring buys.
 * @ai-related components/trade/OrderTicket.tsx, components/trade/AdvancedChart.tsx, components/news/NewsFeed.tsx
 */

export const metadata = { title: "Simulator" };

export default async function TradePage({
  searchParams,
}: {
  searchParams: Promise<{ symbol?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const symbol = (resolvedSearchParams.symbol || "SPY").toUpperCase();
  
  const quote = await getQuote(symbol);
  const currentPrice = quote?.price || 150.25;
  
  let buyingPower = 0;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('paper_balance')
        .eq('id', user.id)
        .single();
      
      if (profile && profile.paper_balance !== undefined) {
        buyingPower = profile.paper_balance;
      }
    }
  } catch (error) {
    console.error("Failed to fetch buying power:", error);
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Simulator</h1>
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
          
          <KeyStatistics quote={quote} />
        </div>

        {/* Right Column: Order Ticket & Recurring Buy */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <OrderTicket
            symbol={symbol}
            currentPrice={currentPrice}
            buyingPower={buyingPower}
          />
          <RecurringBuyModal symbol={symbol} currentPrice={currentPrice} />
          <CompanyProfile symbol={symbol} />
          <AnalystRatings symbol={symbol} />
        </div>
      </div>
    </div>
  );
}
