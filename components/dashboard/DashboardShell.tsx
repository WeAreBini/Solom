"use client";

/**
 * @ai-context Persistent shell for the dashboard route tree.
 * Shares sidebar, header navigation, mobile navigation, and command palette across all dashboard routes.
 * @ai-related app/dashboard/layout.tsx, components/dashboard/Sidebar.tsx, components/dashboard/CommandPalette.tsx
 */

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, House, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { Sidebar } from "@/components/dashboard/Sidebar";
import {
  dashboardNavItems,
  isDashboardNavItemActive,
} from "@/components/dashboard/navigation";

interface DashboardShellProps {
  children: ReactNode;
}

/**
 * @ai-context Maps the active pathname to the current dashboard navigation item.
 * @param pathname Active dashboard pathname.
 * @returns Matching dashboard navigation metadata for the shared shell header.
 */
function getCurrentDashboardItem(pathname: string) {
  return dashboardNavItems.find((item) => item.href === pathname) ?? dashboardNavItems[0];
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentItem = getCurrentDashboardItem(pathname);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <CommandPalette />

      <div
        className={cn(
          "transition-[padding] duration-300",
          sidebarCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-sm">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open dashboard navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Dashboard
                </p>
                <h1 className="truncate text-xl font-semibold">{currentItem.title}</h1>
                <p className="hidden text-sm text-muted-foreground sm:block">
                  {currentItem.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden items-center gap-1 rounded-md border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground lg:flex">
                <Command className="h-3 w-3" />
                <span>K</span>
                <span className="mx-1">to search</span>
              </div>
              <Button variant="ghost" size="icon" className="sm:hidden" asChild>
                <Link href="/" aria-label="Go to home">
                  <House className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">Home</Link>
              </Button>
            </div>
          </div>

          <div className="border-t border-border/60 px-4 py-3 md:px-6">
            <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Dashboard sections">
              {dashboardNavItems.map((item) => {
                const isActive = isDashboardNavItemActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="p-4 pb-24 md:p-6 md:pb-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent className="left-0 top-0 h-screen w-[88vw] max-w-sm translate-x-0 translate-y-0 rounded-none border-r border-l-0 border-t-0 border-b-0 p-0 sm:max-w-sm">
          <DialogHeader className="border-b px-5 py-4 text-left">
            <DialogTitle>Dashboard Navigation</DialogTitle>
            <DialogDescription>
              Move between the current market, stock, finance, and social surfaces.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(100vh-88px)]">
            <div className="space-y-3 px-5 py-5">
              {dashboardNavItems.map((item) => {
                const isActive = isDashboardNavItemActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border px-4 py-4 transition-colors",
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 bg-card text-foreground hover:border-primary/30 hover:bg-accent/40"
                    )}
                  >
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold">{item.title}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur md:hidden"
        aria-label="Dashboard quick navigation"
      >
        <div className="grid h-16 grid-cols-4">
          {dashboardNavItems.map((item) => {
            const isActive = isDashboardNavItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.shortTitle}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}