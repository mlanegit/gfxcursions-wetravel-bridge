import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { bookingId, trigger, testEmail } = await req.json();

    if (!bookingId || !trigger) {
      return Response.json({ error: 'Missing bookingId or trigger' }, { status: 400 });
    }

    // Fetch booking and related data
    const bookings = await base44.entities.Booking.filter({ id: bookingId });
    if (!bookings || bookings.length === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }
    const booking = bookings[0];
    
    const trips = await base44.entities.Trip.filter({ id: booking.trip_id });
    if (!trips || trips.length === 0) {
      return Response.json({ error: 'Trip not found' }, { status: 404 });
    }
    const trip = trips[0];
    
    // Fetch email template
    const templates = await base44.entities.EmailTemplate.filter({ trigger });
    if (!templates || templates.length === 0) {
      return Response.json({ error: `No template found for trigger: ${trigger}` }, { status: 400 });
    }

    const template = templates[0];
    if (!template.is_active) {
      return Response.json({ error: `Template for trigger ${trigger} is inactive` }, { status: 400 });
    }

    // Build substitution map from booking and trip data
    const substitutions = {
      'guest_name': `${booking.first_name} ${booking.last_name}`,
      'first_name': booking.first_name,
      'last_name': booking.last_name,
      'trip_name': trip.name,
      'trip_location': trip.location,
      'start_date': trip.start_date,
      'end_date': trip.end_date,
      'total_price': `$${(booking.total_price_cents / 100).toFixed(2)}`,
      'total_price_usd': (booking.total_price_cents / 100).toFixed(2),
      'deposit_amount': `$${(booking.deposit_amount_cents / 100).toFixed(2)}`,
      'guests': booking.guests.toString(),
      'booking_id': booking.id,
      'package_id': booking.package_id,
      'payment_option': booking.payment_option,
      'payment_option_display': booking.payment_option === 'full' ? 'Full Payment' : 'Payment Plan',
      'payment_details': booking.payment_option === 'plan' 
        ? `Deposit: $${(booking.deposit_amount_cents / 100).toFixed(2)} due now, then ${booking.plan_installments_total || '3'} monthly installments`
        : `Full payment of $${(booking.total_price_cents / 100).toFixed(2)} due now`,
    };

    let subject = template.subject;
    let body = template.body;

    // Replace both {{placeholder}} and {placeholder} formats
    Object.entries(substitutions).forEach(([key, value]) => {
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
      subject = subject.replace(new RegExp(`{${key}}`, 'g'), value || '');
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
      body = body.replace(new RegExp(`{${key}}`, 'g'), value || '');
    });

    // Send email via Resend API
    const recipientEmail = testEmail || booking.email;
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'info@gfxcursions.com <noreply@mail-gfxcursions.net>',
        to: recipientEmail,
        subject,
        text: body,
      }),
    });

    const result = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend error:', result);
      return Response.json({ error: result.message || 'Failed to send email' }, { status: 500 });
    }

    console.log(`Email sent to ${booking.email} for trigger: ${trigger}`);
    return Response.json({ success: true, emailId: result.id });

  } catch (error) {
    console.error('sendEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});