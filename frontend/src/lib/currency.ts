export const formatPKR = (amount: number, locale = "en-PK") =>
  `PKR ${new Intl.NumberFormat(locale === "ur" ? "ur-PK" : "en-PK", {
    maximumFractionDigits: 0,
  }).format(amount)}`;

export const formatCompactPKR = (amount: number) => {
  if (amount >= 1_000_000_000) return `PKR ${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `PKR ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `PKR ${(amount / 1_000).toFixed(0)}K`;
  return `PKR ${amount}`;
};