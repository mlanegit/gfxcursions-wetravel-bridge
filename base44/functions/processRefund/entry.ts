import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const base44 = createClientFromRequest(req);
    const { bookingId, amountCents, reason, refundMethod } = await req.json();
    if (!bookingId) return Response.json({ error: 'Missing bookingId' }, { status: 400 });
    const booking = await base44.asServiceRole.entities.Booking.get(bookingId);
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });
    const paymentIntentId = booking.stripe_payment_intent_id;
    if (paymentIntentId) {
      const refundParams: Stripe.RefundCreateParams = { payment_intent: paymentIntentId };
      if (amountCents && amountCents < booking.total_price_cents) refundParams.amount = amountCents;
      const validReasons = ['duplicate', 'fraudulent', 'requested_by_customer'];
      if (reason && validReasons.includes(reason)) refundParams.reason = reason as Stripe.RefundCreateParams.Reason;
      const refund = await stripe.refunds.create(refundParams);
      await base44.asServiceRole.entities.Booking.update(bookingId, { status: 'canceled', refund_amount_cents: amountCents || booking.amount_paid_cents, refund_date: new Date().toISOString().split('T')[0], refund_method: refundMethod || 'credit_card', refund_notes: `Stripe refund ${refund.id}${reason ? ` – ${reason}` : ''}` });
      return Response.json({ success: true, stripe_refund_id: refund.id, message: 'Refund processed via Stripe' });
    } else {
      await base44.asServiceRole.entities.Booking.update(bookingId, { status: 'canceled', refund_amount_cents: amountCents, refund_date: new Date().toISOString().split('T')[0], refund_method: refundMethod || 'manual', refund_notes: reason || 'Manual refund recorded by admin' });
      return Response.json({ success: true, stripe_refund_id: null, message: 'No Stripe payment found – refund recorded manually' });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});