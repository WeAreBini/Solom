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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInsiderTrades, getSenateTrades, getHouseTrades } from "@/app/actions/fmp";
import { InsiderTradesTable } from "@/components/insider-senate/InsiderTradesTable";
import { SenateTradesTable } from "@/components/insider-senate/SenateTradesTable";
import { HouseTradesTable } from "@/components/insider-senate/HouseTradesTable";
import { Badge } from "@/components/ui/badge";
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

      <Tabs defaultValue="insider" className="w-full">
        <TabsList>
          <TabsTrigger value="insider" className="gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            Insider
            <Badge variant="secondary" className="ml-1 text-xs">{insiderTrades.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="senate" className="gap-1.5">
            <Landmark className="h-3.5 w-3.5" />
            Senate
            <Badge variant="secondary" className="ml-1 text-xs">{senateTrades.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="house" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            House
            <Badge variant="secondary" className="ml-1 text-xs">{houseTrades.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insider" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Corporate Insider Transactions</CardTitle>
              <CardDescription>Recent Form 4 filings — purchases and sales.</CardDescription>
            </CardHeader>
            <CardContent>
              {insiderError ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  Failed to load insider trades: {insiderError}
                </div>
              ) : insiderTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No insider trades available.</p>
              ) : (
                <InsiderTradesTable trades={insiderTrades} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="senate" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Senate Trading Activity</CardTitle>
              <CardDescription>Recent STOCK Act disclosures from US Senators.</CardDescription>
            </CardHeader>
            <CardContent>
              {senateError ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  Failed to load senate trades: {senateError}
                </div>
              ) : senateTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No senate trades available.</p>
              ) : (
                <SenateTradesTable trades={senateTrades} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="house" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>House of Representatives Trading</CardTitle>
              <CardDescription>Recent STOCK Act disclosures from House members.</CardDescription>
            </CardHeader>
            <CardContent>
              {houseError ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  Failed to load house trades: {houseError}
                </div>
              ) : houseTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No house trades available.</p>
              ) : (
                <HouseTradesTable trades={houseTrades} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
