import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get webhook signature from headers
    const signature = req.headers.get('x-wetravel-signature') || req.headers.get('svix-signature');
    const webhookSecret = Deno.env.get('WETRAVEL_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      return Response.json({ error: 'Webhook verification failed' }, { status: 401 });
    }

    // Read the body
    const body = await req.text();
    
    // Verify webhook signature using HMAC SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const receivedSignature = signature.split(',')[0]?.split('=')[1] || signature;
    
    if (expectedSignature !== receivedSignature) {
      console.error('Signature verification failed');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the webhook payload
    const payload = JSON.parse(body);
    console.log('Webhook event received:', payload.type || payload.event_type);

    const eventType = payload.type || payload.event_type;
    const eventData = payload.data || payload;

    // Log webhook event in database
    const webhookEvent = await base44.asServiceRole.entities.WebhookEvent.create({
      event_type: eventType,
      received_at: new Date().toISOString(),
      payload_raw: payload,
      verified: true,
      processed: false
    });

    // Extract booking/lead reference
    const leadId = eventData.lead_id || eventData.id;
    const bookingId = eventData.booking_id;
    const internalRef = eventData.internal_reference || eventData.notes;

    // Find matching BookingIntent
    let intent = null;
    
    // Try to find by WeTravel lead/booking ID
    if (leadId) {
      const intents = await base44.asServiceRole.entities.BookingIntent.filter({
        'wetravel_refs.lead_id': leadId
      });
      if (intents.length > 0) intent = intents[0];
    }
    
    if (!intent && bookingId) {
      const intents = await base44.asServiceRole.entities.BookingIntent.filter({
        'wetravel_refs.booking_id': bookingId
      });
      if (intents.length > 0) intent = intents[0];
    }

    // Try to find by internal reference
    if (!intent && internalRef) {
      try {
        intent = await base44.asServiceRole.entities.BookingIntent.get(internalRef);
      } catch (e) {
        console.log('Could not find intent by internal reference:', internalRef);
      }
    }

    if (!intent) {
      console.warn('No matching BookingIntent found for webhook event');
      await base44.asServiceRole.entities.WebhookEvent.update(webhookEvent.id, {
        processed: true,
        processing_error: 'No matching BookingIntent found'
      });
      return Response.json({ received: true, warning: 'No matching intent' });
    }

    // Update BookingIntent status based on event type
    const updates = {
      wetravel_refs: {
        ...intent.wetravel_refs,
        booking_id: bookingId || intent.wetravel_refs?.booking_id,
        transaction_id: eventData.transaction_id || intent.wetravel_refs?.transaction_id
      }
    };

    switch (eventType) {
      case 'payment.succeeded':
      case 'payment.completed':
      case 'booking.paid':
        updates.status = 'paid';
        break;
      
      case 'booking.confirmed':
      case 'booking.complete':
        updates.status = 'confirmed';
        break;
      
      case 'booking.cancelled':
      case 'booking.canceled':
        updates.status = 'canceled';
        break;
      
      case 'payment.failed':
      case 'booking.failed':
        updates.status = 'failed';
        break;
      
      default:
        console.log('Unhandled event type:', eventType);
    }

    // Update the intent
    await base44.asServiceRole.entities.BookingIntent.update(intent.id, updates);

    // Mark webhook as processed
    await base44.asServiceRole.entities.WebhookEvent.update(webhookEvent.id, {
      processed: true,
      related_intent_id: intent.id
    });

    console.log(`BookingIntent ${intent.id} updated to status: ${updates.status}`);

    return Response.json({ 
      received: true,
      intent_id: intent.id,
      status: updates.status
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ 
      error: 'Webhook processing failed',
      details: error.message 
    }, { status: 500 });
  }
});