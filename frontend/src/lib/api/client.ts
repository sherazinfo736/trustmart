import { mockApi } from "@/mocks/adapter";
import { httpApi } from "./httpApi";

export const config = {
  appName: import.meta.env["VITE_APP_NAME"] ?? "TrustMart",
  baseUrl: import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:4000",
  useMock: (import.meta.env["VITE_USE_MOCK_API"] ?? "true") !== "false",
  currency: import.meta.env["VITE_DEFAULT_CURRENCY"] ?? "PKR",
  timezone: import.meta.env["VITE_DEFAULT_TIMEZONE"] ?? "Asia/Karachi",
};

/**
 * Single API boundary. Flip VITE_USE_MOCK_API=false (and set
 * VITE_API_BASE_URL to the running backend, default http://localhost:4000)
 * to switch every screen in the app from fixture data to the real NestJS
 * backend — no component changes required.
 */
export const api = config.useMock ? mockApi : httpApi;
export type Api = typeof mockApi;