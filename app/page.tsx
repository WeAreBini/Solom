"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Globe,
  Users,
  Zap,
  Sparkles,
  ArrowRight,
  Github,
  MessageSquare,
  Cpu,
  Layers,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Council Mode",
    description: "Multi-agent deliberation system where AI agents collaborate, debate, and reach consensus on complex problems.",
    badge: "Core",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: Globe,
    title: "Web Operator",
    description: "Browser automation powered by Playwright. Navigate, extract, and interact with any website programmatically.",
    badge: "Automation",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Brain,
    title: "System 2 Reasoning",
    description: "Extended compute cycles for deliberate, analytical thinking. Solve complex problems that require deep reflection.",
    badge: "Intelligence",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Real-Time Firehose",
    description: "Live Twitter/X feed processing with sentiment analysis, trend detection, and instant notifications.",
    badge: "Streams",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
];

const agents = [
  { name: "Analyst", status: "active", task: "Processing market data...", progress: 75 },
  { name: "Researcher", status: "active", task: "Web scraping financial news", progress: 45 },
  { name: "Strategist", status: "idle", task: "Awaiting assignment", progress: 0 },
  { name: "Critic", status: "active", task: "Reviewing proposals", progress: 90 },
];

const stats = [
  { label: "Active Agents", value: "3", icon: Cpu },
  { label: "Tasks Completed", value: "1,247", icon: Layers },
  { label: "Uptime", value: "99.9%", icon: Shield },
  { label: "Avg Response", value: "1.2s", icon: Clock },
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
                <TrendingUp className="mr-2 h-4 w-4" />
                Markets
              </a>
            </Button>
            <Button variant="ghost" size="sm">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Discord
            </Button>
            <Button size="sm">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm">
          🚀 AI Agent Toolkit — Open Source
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Intelligent Agents
          </span>
          <br />
          That Think, Act & Collaborate
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Council Mode for multi-agent deliberation, Web Operator for browser automation, 
          and System 2 Reasoning for deep analytical thinking. Build the next generation of AI applications.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" className="gap-2">
            Start Building
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            View Demo
          </Button>
        </div>
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
          <h2 className="text-3xl font-bold">Powerful Capabilities</h2>
          <p className="mt-2 text-muted-foreground">Everything you need to build sophisticated AI agents</p>
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

      {/* Council Mode Demo */}
      <section className="container mx-auto px-4 py-16">
        <Card className="overflow-hidden border-none bg-gradient-to-br from-violet-500/10 via-background to-indigo-500/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-400" />
              <CardTitle>Council Mode — Live</CardTitle>
            </div>
            <CardDescription>
              Watch AI agents deliberate in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agents.map((agent, index) => (
                <div key={agent.name}>
                  <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {agent.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{agent.name}</span>
                        <Badge 
                          variant={agent.status === "active" ? "success" : "secondary"}
                          className="text-xs"
                        >
                          {agent.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{agent.task}</p>
                      {agent.progress > 0 && (
                        <Progress value={agent.progress} className="mt-2 h-1" />
                      )}
                    </div>
                  </div>
                  {index < agents.length - 1 && <Separator className="my-2" />}
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
            {["Next.js 16", "tRPC", "TypeScript", "Prisma", "PostgreSQL", "Redis", "BullMQ", "Playwright"].map((tech) => (
              <Badge key={tech} variant="outline" className="px-4 py-2 text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
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