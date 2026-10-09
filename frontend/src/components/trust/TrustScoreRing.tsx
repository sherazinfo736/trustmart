import { cn } from "@/lib/utils";

const band = (score: number) =>
  score >= 80
    ? { stroke: "var(--success)", label: "Strong" }
    : score >= 50
      ? { stroke: "var(--warning)", label: "Building" }
      : { stroke: "var(--destructive)", label: "Low" };

export function TrustScoreRing({
  score,
  size = 64,
  showLabel = true,
  className,
}: {
  score: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const { stroke, label } = band(score);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Trust Score ${score} out of 100 (${label})`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(100, Math.max(0, score)) / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="52%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.28}
          fontWeight={700}
          fill="var(--foreground)"
        >
          {score}
        </text>
      </svg>
      {showLabel ? (
        <div className="min-w-0">
          <p className="text-sm font-semibold">Trust Score</p>
          <p className="text-xs text-muted-foreground">{label} · 0–100 scale</p>
        </div>
      ) : null}
    </div>
  );
}