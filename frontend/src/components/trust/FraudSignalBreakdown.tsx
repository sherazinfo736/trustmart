import { cn } from "@/lib/utils";
import { riskTone, toneClasses } from "@/lib/status";
import type { RiskScoreBreakdown } from "@/types";

const signalLabels: Array<[keyof RiskScoreBreakdown, string]> = [
  ["identitySignal", "Identity"],
  ["deviceReputationSignal", "Device reputation"],
  ["listingBehaviorSignal", "Listing behaviour"],
  ["priceAnomalySignal", "Price anomaly"],
  ["accountAgeSignal", "Account age"],
  ["userReportSignal", "User reports"],
  ["imageAnalysisSignal", "Image analysis"],
  ["locationConsistencySignal", "Location consistency"],
];

export function FraudSignalBreakdown({
  risk,
  className,
}: {
  risk: RiskScoreBreakdown;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Simulated risk score {risk.overall}/100</p>
          <p className="text-xs text-muted-foreground">
            Demo signals only — not a live fraud model result.
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold",
            toneClasses[riskTone[risk.riskLevel]],
          )}
        >
          {risk.riskLevel}
        </span>
      </div>
      <ul className="space-y-2">
        {signalLabels.map(([key, label]) => {
          const value = risk[key] as number;
          return (
            <li key={key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{label}</p>
                <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-1.5 rounded-full",
                      value >= 70 ? "bg-destructive" : value >= 40 ? "bg-warning" : "bg-success",
                    )}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{value}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}