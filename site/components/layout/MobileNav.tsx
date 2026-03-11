"use client";

/**
 * @ai-context Mobile navigation with a full IA drawer and bottom section tabs.
 * Exposes the same grouped product model as desktop without hiding breadth behind a single route.
 * @ai-related components/layout/AppShell.tsx, components/layout/Sidebar.tsx, lib/navigation.ts
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  matchesPath,
  primarySections,
  secondaryLinks,
} from "@/lib/navigation";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MobileNav() {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen } = useSidebarStore();

  return (
    <>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[92vw] max-w-sm border-r border-border bg-background p-0"
        >
          <SheetHeader className="border-b border-border px-5 py-4 text-left">
            <SheetTitle>Market Intelligence</SheetTitle>
            <SheetDescription>
              Overview, markets, macro, flows, digital assets, and portfolio tools.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-88px)]">
            <div className="flex flex-col gap-5 px-5 py-5">
              {primarySections.map((section) => {
                const sectionActive = matchesPath(
                  pathname,
                  section.href,
                  section.matchPrefixes
                );

                return (
                  <section key={section.href} className="rounded-2xl border border-border/60 bg-card/60 p-4">
                    <Link
                      href={section.href}
                      className={cn(
                        "flex items-start gap-3 rounded-xl transition-colors",
                        sectionActive ? "text-primary" : "text-foreground"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                        <section.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                              {section.eyebrow}
                            </p>
                            <h2 className="text-sm font-semibold">{section.title}</h2>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </Link>

                    <div className="mt-4 grid gap-2">
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
                                : "bg-background/70 text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => setMobileOpen(false)}
                          >
                            <item.icon className="h-3.5 w-3.5 shrink-0" />
                            <span>{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              <section className="grid gap-2 pb-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Workspace
                </p>
                {secondaryLinks.map((item) => {
                  const active = matchesPath(pathname, item.href, item.matchPrefixes);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3 text-sm transition-colors",
                        active
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "bg-card/60 text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </section>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card pb-safe md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="grid h-16 w-full grid-cols-6 px-1">
          {primarySections.map((section) => {
            const active = matchesPath(pathname, section.href, section.matchPrefixes);

            return (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-1 text-center text-[9px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <section.icon className={cn("h-4.5 w-4.5", active && "text-primary")} />
                <span className="leading-none">{section.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
