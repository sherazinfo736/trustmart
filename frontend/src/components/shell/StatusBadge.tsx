import { cn } from "@/lib/utils";
import { humanize, toneClasses, type Tone } from "@/lib/status";

export function StatusBadge({
  value,
  tone,
  className,
}: {
  value: string;
  tone: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {humanize(value)}
    </span>
  );
}