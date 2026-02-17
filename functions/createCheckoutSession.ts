import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
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

    // Use user-scoped client so it respects test/prod DB context from the request
    const booking = await base44.entities.Booking.get(bookingId);

    if (!booking) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    // Fetch trip to get deposit_per_person
    const trip = await base44.entities.Trip.get(booking.trip_id);

    // Calculate amount - never trust frontend values
    let amountCents;
    if (booking.payment_option === "plan") {
      const depositPerPerson = trip?.deposit_per_person || 250;
      amountCents = depositPerPerson * booking.guests * 100;
    } else {
      amountCents = booking.total_price_cents;
    }

    // Add Stripe fee (2.9% + $0.30)
    const grossCents = Math.round((amountCents + 30) / (1 - 0.029));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: booking.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Lost in Jamaica - ${booking.package_id} (${booking.payment_option === 'plan' ? 'Deposit' : 'Full Payment'})`,
            },
            unit_amount: grossCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking.id,
        payment_option: booking.payment_option,
      },
      success_url: "https://radical-task-flow-app.base44.app/success",
      cancel_url: "https://radical-task-flow-app.base44.app/cancel",
    });

    // Save Stripe session ID back to booking
    await base44.asServiceRole.entities.Booking.update(booking.id, {
      stripe_checkout_session_id: session.id,
    });

    return Response.json({ url: session.url });

  } catch (error) {
    console.error("Stripe error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});