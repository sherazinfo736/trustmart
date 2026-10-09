import { ShieldCheck, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** identity = "Verified Seller"; field = "Platform Verified: <field>" */
  variant: "identity" | "field";
  field?: string;
  evidence?: "screenshot" | "video";
  className?: string;
};

export function VerifiedBadge({ variant, field, evidence, className }: Props) {
  const Icon = variant === "identity" ? ShieldCheck : BadgeCheck;
  const label =
    variant === "identity" ? "Verified Seller" : `Platform Verified${field ? `: ${field}` : ""}`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        variant === "identity"
          ? "bg-verified text-verified-foreground"
          : "bg-info text-info-foreground",
        className,
      )}
      title={
        variant === "identity"
          ? "Seller identity (CNIC + face) checked by TrustMart"
          : "This specific field was checked against evidence by TrustMart"
      }
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
      {evidence ? <span className="opacity-80">({evidence})</span> : null}
    </span>
  );
}