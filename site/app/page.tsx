/**
 * @ai-context Landing page for Solom Finance.
 * Modern hero section with gradient background, feature highlights, and CTA.
 */
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Shield,
  Zap,
  TrendingUp,
  Building2,
  Globe,
  ArrowRight,
  LineChart,
  Star,
  CalendarDays,
} from 'lucide-react';

const features = [
  {
    icon: LineChart,
    title: 'Real-Time Market Data',
    description: 'Live stock quotes, market movers, gainers and losers updated throughout the day.',
  },
  {
    icon: BarChart3,
    title: 'Portfolio Tracking',
    description: 'Track your holdings with live prices, returns, and performance analytics.',
  },
  {
    icon: Building2,
    title: 'Insider & Congress Trades',
    description: 'Monitor Form 4 filings and STOCK Act disclosures from corporate insiders and lawmakers.',
  },
  {
    icon: Star,
    title: 'Smart Watchlists',
    description: 'Build and manage watchlists with real-time price cards and quick actions.',
  },
  {
    icon: Globe,
    title: 'Economic Indicators',
    description: 'Key macro data — GDP, CPI, unemployment, Fed funds rate — with YoY trends.',
  },
  {
    icon: CalendarDays,
    title: 'Earnings Calendar',
    description: 'Upcoming earnings reports with EPS estimates, revenue forecasts, and beat/miss tracking.',
  },
];

const stats = [
  { value: '50K+', label: 'Stocks Tracked' },
  { value: 'Real-Time', label: 'Market Data' },
  { value: '13F', label: 'Institutional Filings' },
  { value: 'AI-Powered', label: 'Financial Chat' },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-chart-5/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-chart-2/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-32">
          <div className="flex flex-col items-center text-center gap-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border bg-surface px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Modern Finance Platform
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
              Your complete{' '}
              <span className="bg-gradient-to-r from-primary to-chart-5 bg-clip-text text-transparent">
                financial intelligence
              </span>{' '}
              platform
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Track portfolios, monitor insider trades, analyze market trends, and get AI-powered
              insights — all in one beautifully designed platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <Button asChild size="lg" className="gap-2 press-scale">
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 press-scale">
                <Link href="/market">
                  Explore Markets
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-surface/50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Professional-grade tools built for modern investors
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border bg-card p-6 transition-all duration-200 hover:shadow-md hover:border-primary/20"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-surface/50">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join Solom Finance and get access to real-time market data, portfolio tracking, and institutional-grade research tools.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="gap-2 press-scale">
              <Link href="/signup">
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}