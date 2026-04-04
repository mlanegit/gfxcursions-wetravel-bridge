import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FUNCTIONS_BASE = 'https://697e8285d68c1a64ca6d3df7.base44.app/functions';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { bookingId, trigger } = await req.json();

    if (!bookingId) {
      return Response.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    const authHeader = req.headers.get('Authorization') || '';

    const response = await fetch(`${FUNCTIONS_BASE}/sendEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        trigger: trigger || 'booking_confirmed',
        bookingId,
      }),
    });

    const data = await response.json();
    return Response.json(data);

  } catch (error) {
    console.error('sendBookingEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});