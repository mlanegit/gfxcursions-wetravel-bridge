import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    const {
      tripId,
      packageId,
      guests,
      paymentOption,
      totalPriceCents,
      depositPerPerson,
      firstName,
      lastName,
      email,
      phone,
    } = await req.json();

    if (!tripId || !email || !paymentOption) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate charge amount server-side
    let amountCents;
    if (paymentOption === "plan") {
      const deposit = depositPerPerson || 250;
      amountCents = Math.round(deposit * guests * 100);
    } else {
      amountCents = totalPriceCents;
    }

    // Add Stripe fee (2.9% + $0.30)
    const grossCents = Math.round((amountCents + 30) / (1 - 0.029));

    // 1️⃣ Create booking - uses same DB env (dev/prod) as the frontend request
    const booking = await base44.entities.Booking.create({
      trip_id: tripId,
      package_id: packageId,
      guests: guests,
      payment_option: paymentOption,
      total_price_cents: totalPriceCents,
      amount_paid_cents: 0,
      deposit_amount_cents: paymentOption === "plan" ? amountCents : null,
      status: "initiated",
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
    });

    // 2️⃣ Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Lost in Jamaica - ${packageId} (${paymentOption === 'plan' ? 'Deposit' : 'Full Payment'})`,
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
      success_url: "https://radical-task-flow-app.base44.app/success",
      cancel_url: "https://radical-task-flow-app.base44.app/cancel",
    });

    // 3️⃣ Save Stripe session ID back to booking
    await base44.entities.Booking.update(booking.id, {
      stripe_checkout_session_id: session.id,
    });

    return Response.json({ url: session.url, bookingId: booking.id });

  } catch (error) {
    console.error("Stripe error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});