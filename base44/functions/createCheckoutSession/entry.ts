import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { bookingId } = await req.json();

    if (!bookingId) {
      return Response.json({ error: "Missing bookingId" }, { status: 400 });
    }

    // Load booking record (use service role — booking may be anonymous)
    const b44 = createClientFromRequest(req);
    const booking = await b44.asServiceRole.entities.Booking.get(bookingId);
    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    // Load trip to check processing_fee_enabled
    const trips = await b44.asServiceRole.entities.Trip.filter({ id: booking.trip_id });
    const trip = trips[0] || null;

    const paymentOption = booking.payment_option;
    const guests = booking.guests || 1;
    const totalPriceCents = booking.total_price_cents;

    // Calculate charge amount
    let amountCents;
    if (paymentOption === "plan") {
      amountCents = booking.deposit_amount_cents || Math.round(250 * guests * 100);
    } else {
      amountCents = totalPriceCents;
    }

    // Add Stripe fee (2.9% + $0.30) if enabled
    const feeEnabled = trip ? trip.processing_fee_enabled !== false : true;
    const grossCents = feeEnabled
      ? Math.round((amountCents + 30) / (1 - 0.029))
      : amountCents;

    const origin = req.headers.get('origin') || 'https://radical-task-flow-app.base44.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: booking.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Lost in Jamaica - ${booking.package_id} (${paymentOption === 'plan' ? 'Deposit' : 'Full Payment'})`,
            },
            unit_amount: grossCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking.id,
        payment_option: paymentOption,
      },
      success_url: `${origin}/BookingConfirmation?booking_id=${booking.id}`,
      cancel_url: `${origin}/`,
    });

    // Save Stripe session ID back to booking
    await base44.asServiceRole.entities.Booking.update(booking.id, {
      stripe_checkout_session_id: session.id,
    });

    return Response.json({ url: session.url, bookingId: booking.id });

  } catch (error) {
    console.error("createCheckoutSession error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});