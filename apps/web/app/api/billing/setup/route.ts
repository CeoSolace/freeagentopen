import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' });

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Create a setup intent to collect a payment method. In a production
  // environment you should attach the customer id and usage metadata.
  const intent = await stripe.setupIntents.create({
    usage: 'on_session',
    payment_method_types: ['card']
  });
  return NextResponse.json({ clientSecret: intent.client_secret });
}