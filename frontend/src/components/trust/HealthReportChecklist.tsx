import { cn } from "@/lib/utils";
import { humanize } from "@/lib/status";

type Rating = "good" | "fair" | "poor" | "not_working";

const ratingStyles: Record<Rating, string> = {
  good: "bg-success/10 text-success border-success/25",
  fair: "bg-warning/15 text-warning border-warning/30",
  poor: "bg-destructive/10 text-destructive border-destructive/25",
  not_working: "bg-destructive text-destructive-foreground border-transparent",
};

export function HealthReportChecklist({
  report,
  overallScore,
  className,
}: {
  report: Record<string, Rating>;
  overallScore?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {overallScore !== undefined ? (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2">
          <span className="text-sm font-medium">Overall condition score</span>
          <span className="text-sm font-bold tabular-nums">{overallScore}/100</span>
        </div>
      ) : null}
      <ul className="divide-y divide-border">
        {Object.entries(report).map(([field, rating]) => (
          <li key={field} className="flex items-center justify-between gap-3 py-2">
            <span className="min-w-0 truncate text-sm">{humanize(field)}</span>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold",
                ratingStyles[rating],
              )}
            >
              {humanize(rating)}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Condition ratings are seller-declared unless a Platform Verified badge is shown next to the
        field.
      </p>
    </div>
  );
}