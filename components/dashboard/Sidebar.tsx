"use client";

/**
 * @ai-context Desktop dashboard sidebar for the current route tree.
 * Handles compact and expanded states while reusing a shared nav model.
 * @ai-related components/dashboard/navigation.ts, app/dashboard/page.tsx
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  dashboardNavItems,
  isDashboardNavItemActive,
} from "@/components/dashboard/navigation";

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r bg-background/95 backdrop-blur transition-[width] duration-300 md:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 font-semibold",
              collapsed && "w-full justify-center"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block text-lg font-bold leading-none">Solom</span>
                <span className="block pt-1 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Market Dashboard
                </span>
              </div>
            )}
          </Link>
        </div>

        <ScrollArea className="flex-1">
          <nav className="space-y-1 p-3" aria-label="Dashboard navigation">
            {dashboardNavItems.map((item) => {
              const isActive = isDashboardNavItemActive(pathname, item.href);
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center rounded-xl text-sm font-medium transition-colors",
                    collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-3",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <div className="min-w-0">
                      <div className="truncate">{item.title}</div>
                      <p className="mt-0.5 truncate text-xs font-normal text-muted-foreground transition-colors group-hover:text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  )}
                </Link>
              );

              if (!collapsed) {
                return link;
              }

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapsedChange(!collapsed)}
            className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}