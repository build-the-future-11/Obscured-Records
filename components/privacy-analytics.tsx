"use client";
import { useEffect } from "react";
import { analyticsAllowed, analyticsToken } from "@/lib/analytics-config";
/** Default off. Operator must review privacy and explicitly enable a valid site token. */
export function PrivacyAnalytics() {
  useEffect(() => {
    const token = analyticsToken(process.env.NEXT_PUBLIC_ANALYTICS_APPROVED, process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN);
    const preferences = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (!token || !analyticsAllowed(preferences) || document.getElementById("or-cloudflare-analytics")) return;
    const script = document.createElement("script");
    script.id = "or-cloudflare-analytics";
    script.src = "https://static.cloudflareinsights.com/beacon.min.js";
    script.defer = true;
    script.dataset.cfBeacon = JSON.stringify({ token });
    document.head.appendChild(script);
    // Intentionally no custom-event bridge: search terms, emails and private notes
    // must not be forwarded. Cloudflare page/performance metrics are not conversions.
  }, []);
  return null;
}
