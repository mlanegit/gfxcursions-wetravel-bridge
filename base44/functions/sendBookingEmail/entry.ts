import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { bookingId, trigger } = await req.json();

    if (!bookingId || !trigger) {
      return Response.json({ error: 'Missing bookingId or trigger' }, { status: 400 });
    }

    // Forward to sendEmail function
    const result = await base44.asServiceRole.functions.invoke('sendEmail', {
      trigger,
      bookingId,
    });

    return Response.json({ success: true, ...result });

  } catch (error) {
    console.error('sendBookingEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});