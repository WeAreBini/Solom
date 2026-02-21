/**
 * @ai-context Insider & Congressional Trading page.
 * Fetches Form 4 insider trades, Senate, and House STOCK Act disclosures from FMP.
 * @ai-related app/actions/fmp.ts, components/insider-senate/*
 */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getInsiderTrades, getSenateTrades, getHouseTrades } from "@/app/actions/fmp";
import { InsiderTradesTable } from "@/components/insider-senate/InsiderTradesTable";
import { SenateTradesTable } from "@/components/insider-senate/SenateTradesTable";
import { HouseTradesTable } from "@/components/insider-senate/HouseTradesTable";
import { Building2, Landmark, Users } from "lucide-react";

export const metadata = { title: "Insider & Congressional Trading" };

export default async function InsiderSenatePage() {
  const [insiderResult, senateResult, houseResult] = await Promise.allSettled([
    getInsiderTrades(),
    getSenateTrades(),
    getHouseTrades(),
  ]);

  const insiderTrades = insiderResult.status === "fulfilled" ? insiderResult.value : [];
  const insiderError = insiderResult.status === "rejected" ? String(insiderResult.reason) : null;
  const senateTrades = senateResult.status === "fulfilled" ? senateResult.value : [];
  const senateError = senateResult.status === "rejected" ? String(senateResult.reason) : null;
  const houseTrades = houseResult.status === "fulfilled" ? houseResult.value : [];
  const houseError = houseResult.status === "rejected" ? String(houseResult.reason) : null;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Insider &amp; Congressional Trading</h1>
        <p className="text-muted-foreground">
          Monitor stock transactions made by corporate insiders and members of Congress.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <Card className="glass-card flex-1">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Corporate Insider Transactions
              </CardTitle>
              <CardDescription>Recent Form 4 filings — purchases and sales.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {insiderError ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 m-4 text-sm text-destructive">
                  Failed to load insider trades: {insiderError}
                </div>
              ) : insiderTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">No insider trades available.</p>
              ) : (
                <InsiderTradesTable trades={insiderTrades} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="glass-card flex-1">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                Senate Trading Activity
              </CardTitle>
              <CardDescription>Recent STOCK Act disclosures from US Senators.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {senateError ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 m-4 text-sm text-destructive">
                  Failed to load senate trades: {senateError}
                </div>
              ) : senateTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">No senate trades available.</p>
              ) : (
                <SenateTradesTable trades={senateTrades} />
              )}
            </CardContent>
          </Card>

          <Card className="glass-card flex-1">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                House of Representatives Trading
              </CardTitle>
              <CardDescription>Recent STOCK Act disclosures from House members.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {houseError ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 m-4 text-sm text-destructive">
                  Failed to load house trades: {houseError}
                </div>
              ) : houseTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">No house trades available.</p>
              ) : (
                <HouseTradesTable trades={houseTrades} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
