/**
 * @ai-context Reusable section coverage cards derived from the shared navigation model.
 * Used across overview surfaces to keep IA messaging and route exposure consistent.
 * @ai-related lib/navigation.ts, app/page.tsx, app/dashboard/page.tsx
 */
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NavigationSection } from "@/lib/navigation";
import { primarySections } from "@/lib/navigation";

interface SectionCoverageGridProps {
  sections?: readonly NavigationSection[];
  variant?: "grid" | "compact";
  showChildren?: boolean;
  className?: string;
}

/**
 * @ai-context Presents Solom's major product sections as linked coverage cards.
 */
export function SectionCoverageGrid({
  sections = primarySections,
  variant = "grid",
  showChildren = true,
  className,
}: SectionCoverageGridProps) {
  if (variant === "compact") {
    return (
      <div className={cn("grid gap-2", className)}>
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-xl border border-border/60 bg-background/70 p-3 transition-colors hover:border-primary/30 hover:bg-accent/40"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <section.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      {section.eyebrow}
                    </p>
                    <h3 className="text-sm font-semibold">{section.title}</h3>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                    {section.surfaceCount}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
      {sections.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className="rounded-2xl border border-border/60 bg-card/80 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <section.icon className="h-5 w-5" />
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                {section.eyebrow}
              </p>
              <p className="text-xs text-muted-foreground">{section.surfaceCount}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <h3 className="text-base font-semibold tracking-tight">{section.title}</h3>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </div>

          {showChildren && (
            <div className="mt-4 flex flex-wrap gap-2">
              {section.items.map((item) => (
                <span
                  key={item.href}
                  className="rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  {item.title}
                </span>
              ))}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}