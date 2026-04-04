import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const FUNCTIONS_BASE = 'https://api.base44.app/api/apps/697e8285d68c1a64ca6d3df7/functions';

async function callSendEmail(trigger: string, bookingId: string, authHeader: string) {
  try {
    await fetch(`${FUNCTIONS_BASE}/sendEmail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify({ trigger, bookingId }),
    });
  } catch (e) { console.error(`Failed to send ${trigger} email:`, e.message); }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') || '';
  const authHeader = req.headers.get('Authorization') || '';
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
  const base44 = createClientFromRequest(req);
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      const paymentOption = session.metadata?.payment_option;
      if (!bookingId) return Response.json({ received: true });
      const booking = await base44.asServiceRole.entities.Booking.get(bookingId);
      if (!booking) return Response.json({ received: true });
      const trip = await base44.asServiceRole.entities.Trip.get(booking.trip_id);
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent as any)?.id || '';
      const stripeCustomerId = typeof session.customer === 'string' ? session.customer : booking.stripe_customer_id || '';
      if (paymentOption === 'full') {
        await base44.asServiceRole.entities.Booking.update(bookingId, { status: 'paid', amount_paid_cents: booking.total_price_cents, stripe_payment_intent_id: paymentIntentId, stripe_customer_id: stripeCustomerId, confirmation_email_sent: true });
      } else if (paymentOption === 'plan') {
        const depositCents = booking.deposit_amount_cents || 0;
        const planDates: string[] = (trip?.payment_dates || []).sort();
        const today = new Date().toISOString().split('T')[0];
        const futureDates = planDates.filter(d => d > today);
        let paymentMethodId: string | null = null;
        if (paymentIntentId) {
          try {
            const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (pi.payment_method) {
              paymentMethodId = typeof pi.payment_method === 'string' ? pi.payment_method : (pi.payment_method as any).id;
              if (stripeCustomerId && paymentMethodId) {
                try { await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId }); } catch (_) {}
              }
            }
          } catch (e) { console.error('Failed to retrieve payment intent:', e.message); }
        }
        await base44.asServiceRole.entities.Booking.update(bookingId, { status: 'active_plan', amount_paid_cents: depositCents, stripe_payment_intent_id: paymentIntentId, stripe_customer_id: stripeCustomerId, stripe_payment_method_id: paymentMethodId || undefined, due_date: trip?.balance_due_date || null, confirmation_email_sent: true });
      }
      await callSendEmail('booking_confirmed', bookingId, authHeader);
    }
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      if (bookingId) await base44.asServiceRole.entities.Booking.update(bookingId, { status: 'pending', stripe_checkout_session_id: null });
    }
    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const bookingId = pi.metadata?.booking_id;
      if (bookingId) {
        const booking = await base44.asServiceRole.entities.Booking.get(bookingId);
        if (booking && booking.status === 'active_plan') {
          await base44.asServiceRole.entities.Booking.update(bookingId, { status: 'past_due' });
          await callSendEmail('payment_failed', bookingId, authHeader);
        }
      }
    }
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const bookingId = pi.metadata?.booking_id;
      if (bookingId && pi.metadata?.installment_type === 'installment') {
        const booking = await base44.asServiceRole.entities.Booking.get(bookingId);
        if (booking) {
          const newPaid = (booking.amount_paid_cents || 0) + pi.amount;
          const isFullyPaid = newPaid >= (booking.total_price_cents || 0);
          await base44.asServiceRole.entities.Booking.update(bookingId, { amount_paid_cents: newPaid, status: isFullyPaid ? 'paid' : 'active_plan' });
          await callSendEmail('payment_received', bookingId, authHeader);
        }
      }
    }
    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});