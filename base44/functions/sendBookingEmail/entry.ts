import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// NOTE: Email triggers are now handled by the Stripe webhook (stripeWebhook function)
// This function is kept as a passthrough for backward compatibility
// The webhook is the single source of truth for booking confirmation emails

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { bookingId } = await req.json();

    if (!bookingId) {
      return Response.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    // Email flow now handled by Stripe webhook
    // checkout.session.completed → booking_confirmed email
    // payment_intent.succeeded → payment_received email
    // payment_intent.payment_failed → payment_failed email
    
    return Response.json({ 
      success: true, 
      message: 'Email triggers are now handled by Stripe webhook',
      bookingId 
    });

  } catch (error) {
    console.error('sendBookingEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});