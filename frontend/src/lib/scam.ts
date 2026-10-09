import type { ScamPatternType } from "@/types";

const rules: { pattern: ScamPatternType; test: RegExp }[] = [
  {
    pattern: "OTP_REQUEST",
    test: /\b(otp|one[-\s]?time\s?(code|password)|verification code|code bhej)/i,
  },
  {
    pattern: "PHISHING_LINK",
    test: /(https?:\/\/|www\.)\S*(pay|verify|login|wallet|secure)/i,
  },
  {
    pattern: "FAKE_COURIER",
    test: /\b(courier|rider|delivery)\b[^.]{0,40}\b(fee|charges|payment|cash)\b/i,
  },
  {
    pattern: "ADVANCE_PAYMENT",
    test: /\b(advance|booking amount|token money|easypaisa|jazzcash|bank transfer|account number|outside trustmart)\b/i,
  },
];

/** Client-side scam pattern detection used by monitored chat (simulated). */
export const detectScamPattern = (text: string): ScamPatternType | null =>
  rules.find((rule) => rule.test.test(text))?.pattern ?? null;