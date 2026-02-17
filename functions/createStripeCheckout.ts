import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { bookingId } = await req.json();

    if (!bookingId) {
      return Response.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    // Get booking details
    const booking = await base44.asServiceRole.entities.Booking.get(bookingId);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get trip details
    const trip = await base44.asServiceRole.entities.Trip.get(booking.trip_id);
    if (!trip) {
      return Response.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Calculate amount based on payment option
    const amountCents = booking.payment_option === 'plan' 
      ? booking.deposit_amount_cents 
      : booking.total_price_cents;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: booking.email,
      line_items: [
        {
          price_data: {
            currency: trip.currency.toLowerCase(),
            product_data: {
              name: booking.payment_option === 'plan' 
                ? `${trip.name} - Deposit` 
                : `${trip.name} - Full Payment`,
              description: `${booking.guests} guest${booking.guests > 1 ? 's' : ''}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: bookingId,
        trip_id: trip.id,
        payment_option: booking.payment_option,
      },
      success_url: `${req.headers.get('origin')}/GuestPortal?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/Home`,
    });

    // Update booking with Stripe session ID
    await base44.asServiceRole.entities.Booking.update(bookingId, {
      stripe_checkout_session_id: session.id,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});