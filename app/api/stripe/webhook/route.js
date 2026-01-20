// app/api/stripe/webhook/route.js
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });

export const runtime = 'nodejs'; // Required for raw body access in App Router

export async function POST(req) {
  const body = await req.text(); // Get raw body as text
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id; // Pass user.id in checkout creation
    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeSubscriptionId: subscription.id,
        // Update role or status based on plan (e.g., PRO or ULT)
      },
    });
  } else if (event.type === 'charge.succeeded') {
    // Handle one-time payments (e.g., boosts)
    const charge = event.data.object;
    const amount = charge.amount / 100; // Convert to GBP
    const fee = (amount * parseFloat(process.env.STRIPE_FEE_RATE)) + parseFloat(process.env.STRIPE_FEE_FLAT);
    // Log payment, update listing boost, etc.
    await prisma.payment.create({
      data: {
        amount,
        currency: 'GBP',
        status: 'Succeeded',
        stripeChargeId: charge.id,
        userId: charge.metadata.userId, // Set in metadata during charge
      },
    });
  }

  return new Response('Webhook received', { status: 200 });
}
