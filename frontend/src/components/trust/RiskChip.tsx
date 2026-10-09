import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { riskTone, toneClasses } from "@/lib/status";
import type { RiskLevel, RiskScoreBreakdown } from "@/types";
import { FraudSignalBreakdown } from "./FraudSignalBreakdown";

const icons: Record<RiskLevel, typeof ShieldCheck> = {
  LOW: ShieldCheck,
  MEDIUM: AlertTriangle,
  HIGH: ShieldAlert,
};

const labels: Record<RiskLevel, string> = {
  LOW: "Low risk",
  MEDIUM: "Medium risk",
  HIGH: "High risk",
};

export function RiskChip({
  level,
  risk,
  className,
}: {
  level: RiskLevel;
  risk?: RiskScoreBreakdown | null;
  className?: string;
}) {
  const Icon = icons[level];
  const chip = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneClasses[riskTone[level]],
        risk && "cursor-pointer",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {labels[level]}
      {risk ? <span className="opacity-70">· signals</span> : null}
    </span>
  );

  if (!risk) {
    return (
      <span className="inline-flex items-center gap-2">
        {chip}
        <span className="text-xs text-muted-foreground">Signals not yet computed</span>
      </span>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`${labels[level]} — view contributing signals`}>
          {chip}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <FraudSignalBreakdown risk={risk} />
      </PopoverContent>
    </Popover>
  );
}