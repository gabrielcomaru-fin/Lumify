import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-11-20.acacia' });
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

function getBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers['host'];
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, priceId, plan } = req.body || {};
    const effectivePriceId = priceId || (plan === 'premium' && process.env.STRIPE_PRICE_PREMIUM_MENSAL) || process.env.STRIPE_PRICE_PRO_MENSAL;

    if (!userId || !effectivePriceId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'userId and priceId (or plan) are required',
      });
    }

    const baseUrl = getBaseUrl(req);
    const successUrl = `${baseUrl}/planos?status=success`;
    const cancelUrl = `${baseUrl}/planos?status=cancel`;

    let stripeCustomerId = null;
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing?.stripe_customer_id) {
      stripeCustomerId = existing.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        metadata: { supabase_user_id: userId },
      });
      stripeCustomerId = customer.id;
      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          stripe_customer_id: stripeCustomerId,
          plan: 'free',
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: effectivePriceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      subscription_data: {
        metadata: { supabase_user_id: userId },
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('create-checkout-session error:', err);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: err.message || 'Internal server error',
    });
  }
}
