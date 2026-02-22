"use client";

/**
 * @ai-context Thin, collapsible left rail for global navigation.
 * Expands on hover or click. Hidden on mobile.
 * @ai-related components/layout/AppShell.tsx, lib/stores/sidebar-store.ts
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  LineChart,
  Users,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Trade", href: "/trade", icon: LineChart },
  { name: "Community", href: "/community", icon: Users },
  { name: "Learn", href: "/learn", icon: GraduationCap },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarStore();
  const [isHovered, setIsHovered] = useState(false);

  // The sidebar is expanded if it's not collapsed OR if it's hovered while collapsed
  const isExpanded = !collapsed || isHovered;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "hidden md:flex flex-col h-screen sticky top-0 border-r border-border bg-card text-card-foreground transition-all duration-300 ease-in-out z-30",
          isExpanded ? "w-60" : "w-16"
        )}
      >
        {/* Logo Area */}
        <div className="flex items-center h-14 px-4 shrink-0 border-b border-border/50">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 font-bold text-xl transition-all",
              !isExpanded && "justify-center w-full px-0"
            )}
          >
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
              S
            </div>
            {isExpanded && (
              <span className="whitespace-nowrap overflow-hidden animate-in fade-in tracking-tight">
                Solom
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 flex flex-col gap-2 px-3">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            const linkContent = (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-200 group",
                  isExpanded ? "px-3 py-2.5" : "justify-center h-10 w-10 mx-auto",
                  active
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {active && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary" />
                )}
                <item.icon className={cn(
                  "shrink-0 transition-colors",
                  isExpanded ? "w-5 h-5" : "w-5 h-5",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {isExpanded && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );

            if (!isExpanded) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>

        {/* Bottom Toggle */}
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
