"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  LineChart,
  Coins,
  Globe,
  Zap,
  Sparkles,
  ArrowRight,
  Github,
  Shield,
  Clock,
  BarChart3,
  Activity,
  CandlestickChart,
  Landmark,
  DollarSign,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Stock Markets",
    description: "Real-time quotes, historical data, and market analysis for NYSE, NASDAQ, and global exchanges.",
    badge: "Core",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Coins,
    title: "Cryptocurrency",
    description: "Track Bitcoin, Ethereum, and 1000+ altcoins with live prices, charts, and portfolio tools.",
    badge: "Coming Soon",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Globe,
    title: "Forex Markets",
    description: "Major, minor, and exotic currency pairs with real-time rates and technical analysis.",
    badge: "Coming Soon",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: BarChart3,
    title: "Market Indices",
    description: "S&P 500, NASDAQ, Dow Jones, and global indices with performance tracking and comparisons.",
    badge: "Live",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
];

const marketOverview = [
  { name: "S&P 500", value: "5,234.56", change: "+0.82%", positive: true },
  { name: "NASDAQ", value: "16,428.93", change: "+1.24%", positive: true },
  { name: "BTC/USD", value: "$67,432", change: "+2.45%", positive: true },
  { name: "EUR/USD", value: "1.0892", change: "-0.12%", positive: false },
];

const stats = [
  { label: "Markets Tracked", value: "50K+", icon: Globe },
  { label: "Data Points", value: "1B+", icon: BarChart3 },
  { label: "Update Frequency", value: "Real-time", icon: Clock },
  { label: "Data Accuracy", value: "99.9%", icon: Shield },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">Solom</span>
            <Badge variant="secondary" className="ml-2">v2.0</Badge>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard">
                <Activity className="mr-2 h-4 w-4" />
                Markets
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard/stocks">
                <TrendingUp className="mr-2 h-4 w-4" />
                Stocks
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="https://github.com/WeAreBini/Solom" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard">
                Launch App
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm">
          📈 Financial Intelligence Platform — Open Source
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            All Your Markets
          </span>
          <br />
          One Intelligent Dashboard
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Track stocks, crypto, forex, and global indices in real-time. 
          Make informed decisions with comprehensive market data, analysis tools, and personalized insights.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/dashboard">
              Explore Markets
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard/stocks">
              View Stocks
            </Link>
          </Button>
        </div>
      </section>

      {/* Live Market Ticker */}
      <section className="container mx-auto px-4 py-4">
        <Card className="border-none bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">Live Markets</span>
              </div>
              <div className="flex flex-wrap gap-6">
                {marketOverview.map((market) => (
                  <div key={market.name} className="flex items-center gap-2">
                    <span className="text-sm font-medium">{market.name}</span>
                    <span className="text-sm font-bold">{market.value}</span>
                    <Badge 
                      variant={market.positive ? "success" : "destructive"} 
                      className="text-xs"
                    >
                      {market.change}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none bg-muted/50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Complete Market Coverage</h2>
          <p className="mt-2 text-muted-foreground">Everything you need to stay informed about your investments</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="group relative overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <Badge variant="secondary">{feature.badge}</Badge>
                </div>
                <CardTitle className="mt-4">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="container mx-auto px-4 py-16">
        <Card className="overflow-hidden border-none bg-gradient-to-br from-emerald-500/10 via-background to-cyan-500/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-emerald-400" />
              <CardTitle>Market Dashboard — Live Preview</CardTitle>
            </div>
            <CardDescription>
              See the markets in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { symbol: "AAPL", name: "Apple Inc.", price: "$178.72", change: "+2.34%", positive: true },
                  { symbol: "MSFT", name: "Microsoft", price: "$425.22", change: "+1.12%", positive: true },
                  { symbol: "GOOGL", name: "Alphabet", price: "$154.87", change: "-0.45%", positive: false },
                  { symbol: "NVDA", name: "NVIDIA", price: "$892.34", change: "+5.67%", positive: true },
                ].map((stock) => (
                  <div key={stock.symbol} className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                      <TrendingUp className={`h-5 w-5 ${stock.positive ? 'text-emerald-400' : 'text-red-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{stock.symbol}</span>
                        <Badge variant={stock.positive ? "success" : "destructive"} className="text-xs">
                          {stock.change}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{stock.name}</p>
                      <p className="text-lg font-bold">{stock.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Asset Types */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-none bg-muted/30">
          <CardHeader>
            <CardTitle className="text-center">Supported Asset Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: Landmark, label: "Stocks", available: true },
                { icon: BarChart3, label: "Indices", available: true },
                { icon: Coins, label: "Cryptocurrency", available: false },
                { icon: Globe, label: "Forex", available: false },
                { icon: CandlestickChart, label: "Commodities", available: false },
                { icon: DollarSign, label: "Bonds", available: false },
              ].map((asset) => (
                <div key={asset.label} className={`flex items-center gap-2 rounded-lg border bg-background px-4 py-2 ${!asset.available ? 'opacity-60' : ''}`}>
                  <asset.icon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{asset.label}</span>
                  {!asset.available && (
                    <Badge variant="outline" className="text-xs ml-1">Soon</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground">Built with modern technologies</h3>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            {["Next.js 16", "TypeScript", "Tailwind CSS", "FMP API", "Real-time Updates"].map((tech) => (
              <Badge key={tech} variant="outline" className="px-4 py-2 text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-2xl font-bold">Ready to track your markets?</h2>
            <p className="mt-2 text-muted-foreground">
              Get started with real-time data for stocks, crypto, forex, and more.
            </p>
            <Button size="lg" className="mt-6 gap-2" asChild>
              <Link href="/dashboard">
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Solom. Built with ❤️ by WeAreBini</p>
        </div>
      </footer>
    </div>
  );
}