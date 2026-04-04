import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '');
const FUNCTIONS_BASE = 'https://api.base44.app/api/apps/697e8285d68c1a64ca6d3df7/functions';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  try {
    const base44 = createClientFromRequest(req);
    const today = new Date().toISOString().split('T')[0];
    const results = { charged: 0, failed: 0, retried: 0, errors: [] as string[] };

    const dueInstallments = await base44.asServiceRole.entities.PaymentInstallment.filter({ status: 'scheduled', due_date: today });
    for (const installment of dueInstallments) {
      try {
        const booking = await base44.asServiceRole.entities.Booking.get(installment.booking_id);
        if (!booking || !booking.stripe_customer_id || !booking.stripe_payment_method_id) continue;
        if (booking.status === 'cancelled') continue;
        const pi = await stripe.paymentIntents.create({
          amount: installment.amount_cents,
          currency: 'usd',
          customer: booking.stripe_customer_id,
          payment_method: booking.stripe_payment_method_id,
          off_session: true,
          confirm: true,
          metadata: { booking_id: installment.booking_id, installment_id: installment.id },
          description: `Lost In Jamaica – Installment for booking #${installment.booking_id.slice(-6).toUpperCase()}`,
        });
        if (pi.status === 'succeeded') results.charged++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Installment ${installment.id}: ${err.message}`);
      }
    }

    const retryInstallments = await base44.asServiceRole.entities.PaymentInstallment.filter({ status: 'retrying', retry_date: today });
    for (const installment of retryInstallments) {
      try {
        const booking = await base44.asServiceRole.entities.Booking.get(installment.booking_id);
        if (!booking || !booking.stripe_customer_id || !booking.stripe_payment_method_id) continue;
        if (booking.status === 'cancelled') continue;
        const pi = await stripe.paymentIntents.create({
          amount: installment.amount_cents,
          currency: 'usd',
          customer: booking.stripe_customer_id,
          payment_method: booking.stripe_payment_method_id,
          off_session: true,
          confirm: true,
          metadata: { booking_id: installment.booking_id, installment_id: installment.id },
          description: `Lost In Jamaica – Retry #${(installment.attempt_count || 0) + 1} for booking #${installment.booking_id.slice(-6).toUpperCase()}`,
        });
        if (pi.status === 'succeeded') {
          results.retried++;
          await base44.asServiceRole.entities.Booking.update(installment.booking_id, { status: 'confirmed', payment_status: 'partially_paid' });
        }
      } catch (err) {
        results.errors.push(`Retry ${installment.id}: ${err.message}`);
      }
    }

    return Response.json({ success: true, ...results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});