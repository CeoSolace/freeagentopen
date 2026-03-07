"use client";
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from './Button';

// Load the Stripe.js script using the publishable key. The key must be
// provided via NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface SetupFormProps {
  clientSecret: string;
}

/**
 * Wrapper component that provides the Stripe Elements context. The
 * PaymentElement is rendered inside and confirmation logic is handled by
 * the inner SetupForm component.
 */
export default function StripePaymentForm({ clientSecret }: SetupFormProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'flat' } }}>
      <SetupForm />
    </Elements>
  );
}

function SetupForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    const { error, setupIntent } = await stripe.confirmSetup({ elements, redirect: 'if_required' });
    if (error) {
      setError(error.message || 'Payment failed');
      setLoading(false);
    } else if (setupIntent && setupIntent.payment_method) {
      // Notify our API that a payment method was added
      const res = await fetch('/api/billing/payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId: setupIntent.payment_method })
      });
      if (res.ok) {
        window.location.href = '/billing';
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save payment method');
      }
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" disabled={loading || !stripe || !elements}>
        {loading ? 'Processing...' : 'Add Payment Method'}
      </Button>
    </form>
  );
}