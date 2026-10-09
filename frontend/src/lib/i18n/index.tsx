import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "ur";

const dictionaries: Record<Locale, Record<string, string>> = {
  en: {
    "brand.tagline": "Pakistan's trust-first marketplace",
    "nav.browse": "Browse",
    "nav.howItWorks": "How verification works",
    "nav.trustSafety": "Trust & Safety",
    "nav.orders": "My orders",
    "nav.chat": "Inbox",
    "nav.sell": "Start selling",
    "nav.certificates": "Certificates",
    "nav.reportScam": "Report a scam",
    "cta.searchPlaceholder": "Search phones, cars, laptops by model or IMEI",
    "cta.search": "Search",
    "label.verifiedSeller": "Verified Seller",
    "label.platformVerified": "Platform Verified",
    "label.sellerClaimed": "Seller Claimed",
    "label.trustScore": "Trust Score",
    "label.escrowProtected": "Escrow protected",
    "risk.LOW": "Low risk",
    "risk.MEDIUM": "Medium risk",
    "risk.HIGH": "High risk",
    "lang.switch": "اردو",
  },
  ur: {
    "brand.tagline": "پاکستان کا بھروسے پر مبنی مارکیٹ پلیس",
    "nav.browse": "تلاش کریں",
    "nav.howItWorks": "تصدیق کیسے ہوتی ہے",
    "nav.trustSafety": "بھروسہ اور تحفظ",
    "nav.orders": "میرے آرڈرز",
    "nav.chat": "پیغامات",
    "nav.sell": "فروخت شروع کریں",
    "nav.certificates": "سرٹیفکیٹس",
    "nav.reportScam": "فراڈ کی اطلاع دیں",
    "cta.searchPlaceholder": "موبائل، گاڑی یا لیپ ٹاپ ماڈل یا IMEI سے تلاش کریں",
    "cta.search": "تلاش",
    "label.verifiedSeller": "تصدیق شدہ بیچنے والا",
    "label.platformVerified": "پلیٹ فارم سے تصدیق شدہ",
    "label.sellerClaimed": "بیچنے والے کا دعویٰ",
    "label.trustScore": "بھروسہ اسکور",
    "label.escrowProtected": "ایسکرو محفوظ",
    "risk.LOW": "کم خطرہ",
    "risk.MEDIUM": "درمیانہ خطرہ",
    "risk.HIGH": "زیادہ خطرہ",
    "lang.switch": "English",
  },
};

type I18nValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  children,
  defaultLocale = "en",
}: {
  children: ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const stored = window.localStorage.getItem("tm.locale");
    if (stored === "en" || stored === "ur") setLocale(stored);
  }, []);

  useEffect(() => {
    const dir = locale === "ur" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", locale);
    window.localStorage.setItem("tm.locale", locale);
  }, [locale]);

  const t = useCallback(
    (key: string) => dictionaries[locale][key] ?? dictionaries.en[key] ?? key,
    [locale],
  );

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir: locale === "ur" ? "rtl" : "ltr",
      setLocale,
      toggleLocale: () => setLocale((prev) => (prev === "en" ? "ur" : "en")),
      t,
    }),
    [locale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}