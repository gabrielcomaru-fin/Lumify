import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-11-20.acacia' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function planFromPriceId(priceId) {
  const proId = (process.env.STRIPE_PRICE_PRO_MENSAL || '').trim();
  const premiumId = (process.env.STRIPE_PRICE_PREMIUM_MENSAL || '').trim();
  if (priceId === premiumId) return 'premium';
  if (priceId === proId) return 'pro';
  return 'pro';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (e) {
    console.error('Webhook read body error:', e);
    return res.status(400).json({ error: 'Invalid body' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig || !webhookSecret) {
    console.error('Webhook missing signature or STRIPE_WEBHOOK_SECRET');
    return res.status(400).json({ error: 'Missing signature or config' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.subscription_data?.metadata?.supabase_user_id;
        const subscriptionId = session.subscription;
        if (!userId || !subscriptionId) {
          console.warn('checkout.session.completed missing userId or subscriptionId', { session });
          break;
        }
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items?.data?.[0]?.price?.id;
        const plan = planFromPriceId(priceId);
        const customerId = session.customer;
        await supabase.from('subscriptions').upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const subscriptionId = sub.id;
        const customerId = sub.customer;
        const { data: row } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle();
        if (!row?.user_id) {
          const cust = await stripe.customers.retrieve(customerId);
          const userId = cust.metadata?.supabase_user_id;
          if (!userId) break;
          await supabase.from('subscriptions').upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan: event.type === 'customer.subscription.deleted' ? 'free' : planFromPriceId(sub.items?.data?.[0]?.price?.id),
              status: sub.status,
              current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
          break;
        }
        const plan = event.type === 'customer.subscription.deleted' ? 'free' : planFromPriceId(sub.items?.data?.[0]?.price?.id);
        await supabase
          .from('subscriptions')
          .update({
            plan,
            status: sub.status,
            current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', row.user_id);
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_failed':
        break;

      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }

  return res.status(200).json({ received: true });
}
