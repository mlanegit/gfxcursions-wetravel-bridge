import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify webhook signature
    const signature = req.headers.get('x-wetravel-signature');
    const WEBHOOK_SECRET = Deno.env.get('WETRAVEL_WEBHOOK_SECRET');
    
    if (!signature || !WEBHOOK_SECRET) {
      console.error('Missing signature or webhook secret');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.text();
    
    // Verify signature (WeTravel uses HMAC SHA256)
    const encoder = new TextEncoder();
    const keyData = encoder.encode(WEBHOOK_SECRET);
    const messageData = encoder.encode(payload);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const calculatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    if (calculatedSignature !== signature) {
      console.error('Invalid webhook signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook payload
    const event = JSON.parse(payload);
    
    console.log('WeTravel webhook received:', event.type);

    // Handle different webhook events
    if (event.type === 'booking.payment_received' || 
        event.type === 'booking.paid' ||
        event.type === 'payment.completed') {
      
      const bookingId = event.data?.booking_id || event.data?.id;
      
      if (!bookingId) {
        console.error('No booking ID in webhook payload');
        return Response.json({ error: 'No booking ID' }, { status: 400 });
      }

      // Find booking by wetravel_booking_id
      const bookings = await base44.asServiceRole.entities.Booking.filter({
        wetravel_booking_id: String(bookingId)
      });

      if (bookings.length > 0) {
        const booking = bookings[0];
        
        // Update payment status
        await base44.asServiceRole.entities.Booking.update(booking.id, {
          payment_status: 'paid',
          status: 'confirmed',
        });

        console.log(`Updated booking ${booking.id} to paid status`);
      } else {
        console.warn(`No booking found for WeTravel ID: ${bookingId}`);
      }
    } else if (event.type === 'booking.cancelled' || event.type === 'payment.cancelled') {
      
      const bookingId = event.data?.booking_id || event.data?.id;
      
      if (bookingId) {
        const bookings = await base44.asServiceRole.entities.Booking.filter({
          wetravel_booking_id: String(bookingId)
        });

        if (bookings.length > 0) {
          await base44.asServiceRole.entities.Booking.update(bookings[0].id, {
            payment_status: 'cancelled',
            status: 'cancelled',
          });
          console.log(`Cancelled booking ${bookings[0].id}`);
        }
      }
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
});