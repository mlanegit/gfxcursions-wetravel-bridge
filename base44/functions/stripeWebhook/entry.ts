import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  try {
    switch (event.type) {

      // ── Checkout completed ──────────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object;
        const bookingId = session.metadata?.booking_id;
        if (!bookingId) break;

        const booking = await base44.asServiceRole.entities.Booking.get(bookingId);
        if (!booking) break;

        const paymentOption = session.metadata?.payment_option || booking.payment_option;
        const customerId = session.customer;

        if (paymentOption === 'full') {
          await base44.asServiceRole.entities.Booking.update(bookingId, {
            status: 'paid',
            amount_paid_cents: booking.total_price_cents,
            stripe_customer_id: customerId,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
          });
          console.log(`Booking ${bookingId} marked as paid (full).`);
          
          // Send branded confirmation email
          try {
            await base44.asServiceRole.functions.invoke('sendEmail', {
              trigger: 'booking_confirmed',
              bookingId,
            });
          } catch (emailErr) {
            console.error(`Failed to send confirmation email for booking ${bookingId}:`, emailErr.message);
          }

        } else if (paymentOption === 'plan') {
          // Load trip to get plan_dates
          const trips = await base44.asServiceRole.entities.Trip.filter({ id: booking.trip_id });
          const trip = trips[0] || null;

          const planDates = (trip?.plan_dates || []).filter(d => d).sort();
          const today = new Date().toISOString().split('T')[0];
          const upcomingDates = planDates.filter(d => d >= today);
          const nextChargeDate = upcomingDates[0] || null;
          const installmentsRemaining = upcomingDates.length;

          await base44.asServiceRole.entities.Booking.update(bookingId, {
            status: 'active_plan',
            amount_paid_cents: booking.deposit_amount_cents || 0,
            stripe_customer_id: customerId,
            stripe_checkout_session_id: session.id,
            plan_anchor_dates: planDates,
            plan_next_charge_date: nextChargeDate,
            plan_installments_remaining: installmentsRemaining,
            plan_installments_total: planDates.length,
          });
          console.log(`Booking ${bookingId} activated on plan. Next charge: ${nextChargeDate}`);
          
          // Send branded confirmation email
          try {
            await base44.asServiceRole.functions.invoke('sendEmail', {
              trigger: 'booking_confirmed',
              bookingId,
            });
          } catch (emailErr) {
            console.error(`Failed to send confirmation email for booking ${bookingId}:`, emailErr.message);
          }
        }
        break;
      }

      // ── Checkout expired ────────────────────────────────────────────────────
      case 'checkout.session.expired': {
        const session = event.data.object;
        const bookingId = session.metadata?.booking_id;
        if (!bookingId) break;

        await base44.asServiceRole.entities.Booking.update(bookingId, {
          status: 'initiated',
        });
        console.log(`Booking ${bookingId} reset to initiated (session expired).`);
        break;
      }

      // ── Payment intent succeeded (future installments) ──────────────────────
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const customerId = pi.customer;
        if (!customerId) break;

        // Find active_plan booking by customer ID
        const bookings = await base44.asServiceRole.entities.Booking.filter({
          stripe_customer_id: customerId,
          status: 'active_plan',
        });
        if (!bookings.length) break;

        const booking = bookings[0];

        // Only handle if this is NOT the initial deposit (already handled by checkout.session.completed)
        // Heuristic: if checkout_session_id matches, skip (initial deposit)
        if (pi.metadata?.checkout_session) break;

        const amountCents = pi.amount_received || pi.amount || 0;
        const newPaid = (booking.amount_paid_cents || 0) + amountCents;
        const remaining = Math.max((booking.plan_installments_remaining || 1) - 1, 0);

        // Advance the anchor dates — remove the first upcoming date
        const today = new Date().toISOString().split('T')[0];
        const planDates = (booking.plan_anchor_dates || []).sort();
        const futureDates = planDates.filter(d => d > today);
        const nextChargeDate = futureDates[0] || null;

        const updates = {
          amount_paid_cents: newPaid,
          plan_installments_remaining: remaining,
          plan_next_charge_date: nextChargeDate,
        };

        if (remaining === 0) {
          updates.status = 'paid';
        }

        await base44.asServiceRole.entities.Booking.update(booking.id, updates);
        console.log(`Installment recorded for booking ${booking.id}. Remaining: ${remaining}`);
        break;
      }

      // ── Payment intent failed ───────────────────────────────────────────────
      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        const customerId = pi.customer;
        if (!customerId) break;

        const bookings = await base44.asServiceRole.entities.Booking.filter({
          stripe_customer_id: customerId,
          status: 'active_plan',
        });
        if (!bookings.length) break;

        const booking = bookings[0];
        await base44.asServiceRole.entities.Booking.update(booking.id, {
          status: 'past_due',
        });
        console.log(`Booking ${booking.id} set to past_due (payment failed).`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });

  } catch (err) {
    console.error('Webhook handler error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});