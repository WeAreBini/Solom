"use client";

/**
 * @ai-context IA-driven left rail for Solom's market-intelligence surfaces.
 * Expands on hover or click, with grouped sections that expose product breadth.
 * @ai-related components/layout/AppShell.tsx, lib/navigation.ts, lib/stores/sidebar-store.ts
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import {
  matchesPath,
  primarySections,
  secondaryLinks,
} from "@/lib/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarStore();
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = !collapsed || isHovered;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "hidden md:flex h-screen sticky top-0 flex-col border-r border-border bg-card text-card-foreground transition-all duration-300 ease-in-out z-30",
          isExpanded ? "w-60" : "w-16"
        )}
      >
        <div className="flex items-center h-14 px-4 shrink-0 border-b border-border/50">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 font-bold text-xl transition-all",
              !isExpanded && "justify-center w-full px-0"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              S
            </div>
            {isExpanded && (
              <div className="min-w-0 overflow-hidden animate-in fade-in">
                <span className="block whitespace-nowrap tracking-tight">Solom</span>
                <span className="block text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Market Intelligence
                </span>
              </div>
            )}
          </Link>
        </div>

        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-4 px-3 py-4" aria-label="Primary navigation">
            {primarySections.map((section) => {
              const sectionActive = matchesPath(
                pathname,
                section.href,
                section.matchPrefixes
              );

              const sectionLink = (
                <Link
                  href={section.href}
                  className={cn(
                    "group relative flex items-center rounded-xl transition-all duration-200",
                    isExpanded
                      ? "gap-3 px-3 py-3"
                      : "mx-auto h-10 w-10 justify-center",
                    sectionActive
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                  aria-current={sectionActive ? "page" : undefined}
                >
                  {sectionActive && (
                    <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <section.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      sectionActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {isExpanded && (
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">
                          {section.title}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                          {section.surfaceCount}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  )}
                </Link>
              );

              if (!isExpanded) {
                return (
                  <Tooltip key={section.title}>
                    <TooltipTrigger asChild>{sectionLink}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {section.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <div key={section.title} className="rounded-xl border border-border/60 bg-background/40 p-1">
                  <div className="mb-2 px-2 pt-2">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      {section.eyebrow}
                    </p>
                  </div>
                  {sectionLink}
                  <div className="mt-2 grid gap-1 px-2 pb-2">
                    {section.items.map((item) => {
                      const itemActive = matchesPath(
                        pathname,
                        item.href,
                        item.matchPrefixes
                      );

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors",
                            itemActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                          )}
                        >
                          <item.icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {isExpanded && (
              <div className="border-t border-border/60 pt-4">
                <p className="px-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Workspace
                </p>
                <div className="mt-2 grid gap-1">
                  {secondaryLinks.map((item) => {
                    const active = matchesPath(pathname, item.href, item.matchPrefixes);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>
        </ScrollArea>

        <div className="p-3 border-t border-border/50">
          <button
            onClick={toggle}
            className={cn(
              "flex items-center gap-3 w-full rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200",
              isExpanded ? "px-3 py-2.5" : "justify-center h-10 w-10 mx-auto"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5 shrink-0" />
            ) : (
              <PanelLeftClose className="w-5 h-5 shrink-0" />
            )}
            {isExpanded && <span className="whitespace-nowrap">Collapse</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
