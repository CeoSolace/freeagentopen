"use client";

import { useEffect, useState } from "react";

/*
 * Pricing page (client). Fetches runtime pricing from /api/billing/pricing.
 * This is a client component because it uses useEffect and fetches at runtime.
 */

export default function PricingClient() {
  const [pricing, setPricing] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPricing() {
      try {
        const res = await fetch("/api/billing/pricing", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && res.ok) setPricing(data);
      } catch {
        // ignore errors; keep placeholders
      }
    }

    fetchPricing();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Pricing</h1>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>
              Plan
            </th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>
              Features
            </th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>
              Price
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>Free</td>
            <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>Access with ads</td>
            <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>Free</td>
          </tr>

          <tr>
            <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>Pro</td>
            <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
              Fewer ads and premium features
            </td>
            <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
              {pricing?.proPrice || "£5.00/mo + fees"}
            </td>
          </tr>

          <tr>
            <td style={{ padding: "0.5rem" }}>Ultimate</td>
            <td style={{ padding: "0.5rem" }}>No ads and all features</td>
            <td style={{ padding: "0.5rem" }}>
              {pricing?.ultPrice || "£20.00/mo + fees"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
