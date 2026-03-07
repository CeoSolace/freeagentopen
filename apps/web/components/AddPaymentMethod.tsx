"use client";
import { useEffect, useState } from 'react';
import StripePaymentForm from './StripePaymentForm';

/**
 * Client wrapper that requests a Stripe setup intent from the API and then
 * renders the StripePaymentForm once the client secret is available. This
 * component should only be rendered when the user has no saved payment
 * method.
 */
export default function AddPaymentMethod() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchSecret() {
      try {
        const res = await fetch('/api/billing/setup', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to initiate payment setup');
        } else {
          setClientSecret(data.clientSecret);
        }
      } catch (err) {
        setError('Failed to initiate payment setup');
      }
    }
    fetchSecret();
  }, []);
  if (error) return <p className="text-red-600 text-sm">{error}</p>;
  if (!clientSecret) return <p>Loading payment form...</p>;
  return <StripePaymentForm clientSecret={clientSecret} />;
}