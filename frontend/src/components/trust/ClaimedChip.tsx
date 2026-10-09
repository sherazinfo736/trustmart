import { CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClaimedChip({ field, className }: { field?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-dashed border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground",
        className,
      )}
      title="Stated by the seller. Not checked by TrustMart."
    >
      <CircleDashed className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">Seller Claimed{field ? `: ${field}` : ""}</span>
    </span>
  );
}