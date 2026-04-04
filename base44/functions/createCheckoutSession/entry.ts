import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');
const APP_URL = 'https://radical-task-flow-app.base44.app';

function calculateInstallments(
  totalCents: number,
  depositCents: number,
  paymentDates: string[],
  bookingDate: string,
  lateEnrollmentFeePct: number
): {
  dueTodayCents: number;
  lateAdjustmentCents: number;
  installments: { due_date: string; amount_cents: number }[];
} {
  const today = new Date(bookingDate);
  today.setHours(0, 0, 0, 0);
  const sorted = [...paymentDates].sort();
  const pastDates = sorted.filter(d => new Date(d) < today);
  const futureDates = sorted.filter(d => new Date(d) >= today);
  const regularInstallmentCents = pastDates.length > 0
    ? Math.round((totalCents - depositCents) / sorted.length) : 0;
  const missedPaymentsCents = regularInstallmentCents * pastDates.length;
  const lateAdjustmentCents = Math.round(missedPaymentsCents * (lateEnrollmentFeePct / 100));
  const dueTodayCents = depositCents + lateAdjustmentCents;
  const remainingBalanceCents = totalCents - dueTodayCents;
  let installments: { due_date: string; amount_cents: number }[] = [];
  if (futureDates.length > 0) {
    const baseAmount = Math.floor(remainingBalanceCents / futureDates.length);
    const remainder = remainingBalanceCents - baseAmount * futureDates.length;
    installments = futureDates.map((date, i) => ({
      due_date: date,
      amount_cents: i === futureDates.length - 1 ? baseAmount + remainder : baseAmount,
    }));
  }
  return { dueTodayCents, lateAdjustmentCents, installments };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const base44 = createClientFromRequest(req);
    const { bookingId } = await req.json();
    if (!bookingId) return Response.json({ error: 'Missing bookingId' }, { status: 400 });
    const booking = await base44.asServiceRole.entities.Booking.get(bookingId);
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });
    const trip = await base44.asServiceRole.entities.Trip.get(booking.trip_id);
    if (!trip) return Response.json({ error: 'Trip not found' }, { status: 404 });
    const isPaymentPlan = booking.payment_option === 'plan';
    const totalCents = booking.total_price_cents;
    const depositCents = booking.deposit_amount_cents;
    const today = new Date().toISOString().split('T')[0];
    let customerId = booking.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: booking.email,
        name: `${booking.first_name} ${booking.last_name}`,
        metadata: { booking_id: bookingId },
      });
      customerId = customer.id;
      await base44.asServiceRole.entities.Booking.update(bookingId, { stripe_customer_id: customerId });
    }
    if (!isPaymentPlan) {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{ price_data: { currency: 'usd', product_data: { name: `Lost In Jamaica – ${trip.name || 'Trip'}`, description: `Full payment for booking #${bookingId.slice(-6).toUpperCase()}` }, unit_amount: totalCents }, quantity: 1 }],
        metadata: { booking_id: bookingId, payment_option: 'full' },
        success_url: `${APP_URL}/GuestPortal?booking_id=${bookingId}&payment=success`,
        cancel_url: `${APP_URL}/GuestPortal?booking_id=${bookingId}&payment=cancelled`,
      });
      await base44.asServiceRole.entities.Booking.update(bookingId, { stripe_checkout_session_id: session.id });
      return Response.json({ url: session.url, session_id: session.id });
    }
    const paymentDates = trip.payment_dates || [];
    const lateFeePct = trip.late_enrollment_fee_pct ?? 50;
    const { dueTodayCents, lateAdjustmentCents, installments } = calculateInstallments(totalCents, depositCents, paymentDates, today, lateFeePct);
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{ price_data: { currency: 'usd', product_data: { name: 'Lost In Jamaica – Deposit', description: `Booking deposit for ${trip.name || 'trip'}` }, unit_amount: depositCents }, quantity: 1 }];
    if (lateAdjustmentCents > 0) {
      lineItems.push({ price_data: { currency: 'usd', product_data: { name: 'Late Enrollment Adjustment', description: 'Adjustment for payments already due before your enrollment date.' }, unit_amount: lateAdjustmentCents }, quantity: 1 });
    }
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'payment',
      payment_intent_data: { setup_future_usage: 'off_session', metadata: { booking_id: bookingId, installment_type: 'deposit' } },
      line_items: lineItems,
      metadata: { booking_id: bookingId, payment_option: 'plan', late_adjustment_cents: String(lateAdjustmentCents), installments_json: JSON.stringify(installments) },
      success_url: `${APP_URL}/GuestPortal?booking_id=${bookingId}&payment=success`,
      cancel_url: `${APP_URL}/GuestPortal?booking_id=${bookingId}&payment=cancelled`,
    });
    await base44.asServiceRole.entities.Booking.update(bookingId, { stripe_checkout_session_id: session.id, late_enrollment_adjustment_cents: lateAdjustmentCents });
    return Response.json({ url: session.url, session_id: session.id, due_today_cents: dueTodayCents, late_adjustment_cents: lateAdjustmentCents, installments });
  } catch (error) {
    console.error('createCheckoutSession error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});