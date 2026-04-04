import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM_EMAIL = 'info@mail-gfxcursions.net';
const FROM_NAME = 'gfXcursions | Lost In Jamaica';

function renderTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { trigger, bookingId, extraVars } = await req.json();

    if (!trigger || !bookingId) {
      return Response.json({ error: 'Missing trigger or bookingId' }, { status: 400 });
    }

    // Fetch matching active template from DB
    const templates = await base44.asServiceRole.entities.EmailTemplate.filter({
      trigger,
      is_active: true,
    });

    if (!templates || templates.length === 0) {
      return Response.json({ message: `No active template for trigger: ${trigger}` }, { status: 200 });
    }

    const template = templates[0];
    const booking = await base44.asServiceRole.entities.Booking.get(bookingId);
    if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 });

    let trip = {};
    if (booking.trip_id) {
      try { trip = await base44.asServiceRole.entities.Trip.get(booking.trip_id); } catch (_) {}
    }

    const packageNames = {
      'luxury-suite': 'Luxury Suite',
      'diamond-club': 'Luxury Suite Diamond Club',
      'ocean-view-dc': 'Luxury Ocean View Diamond Club',
    };

    const totalDollars = booking.total_price_cents ? `$${(booking.total_price_cents / 100).toFixed(2)}` : 'N/A';
    const amountPaid = booking.amount_paid_cents ? `$${(booking.amount_paid_cents / 100).toFixed(2)}` : '$0.00';
    const balance = (booking.total_price_cents && booking.amount_paid_cents)
      ? `$${((booking.total_price_cents - booking.amount_paid_cents) / 100).toFixed(2)}`
      : totalDollars;

    const vars = {
      first_name: booking.first_name || '',
      last_name: booking.last_name || '',
      email: booking.email || '',
      package: packageNames[booking.package_id] || booking.package_id || '',
      total_price: totalDollars,
      amount_paid: amountPaid,
      balance_due: balance,
      payment_option: booking.payment_option === 'plan' ? 'Installment Plan' : 'Full Payment',
      guests: String(booking.guests || 1),
      trip_name: trip.name || 'Lost In Jamaica',
      trip_start_date: trip.start_date || '',
      trip_end_date: trip.end_date || '',
      balance_due_date: trip.balance_due_date || booking.due_date || '',
      hotel: trip.hotel || 'Royalton Blue Waters',
      arrival_date: booking.arrival_date || '',
      arrival_time: booking.arrival_time || '',
      arrival_airline: booking.arrival_airline || '',
      departure_date: booking.departure_date || '',
      departure_time: booking.departure_time || '',
      departure_airline: booking.departure_airline || '',
      booking_id: booking.id || '',
      ...(extraVars || {}),
    };

    const subject = renderTemplate(template.subject, vars);
    const htmlBody = renderTemplate(template.body, vars);

    // Send via Resend — html field is the full branded HTML from the DB template
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [booking.email],
        subject,
        html: htmlBody,        // ← full HTML from DB, sent as HTML
        text: htmlBody.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(), // plain text fallback only
      }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(`Resend error: ${JSON.stringify(data)}`);

    return Response.json({ success: true, to: booking.email, trigger });

  } catch (error) {
    console.error('sendEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});