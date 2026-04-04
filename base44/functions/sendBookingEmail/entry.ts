import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { bookingId, trigger, overrideEmail } = await req.json();

    if (!bookingId) {
      return Response.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    // Load booking
    const booking = await base44.asServiceRole.entities.Booking.get(bookingId);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Determine trigger based on status if not provided
    const emailTrigger = trigger || (booking.status === 'paid' ? 'booking_confirmed' : booking.status === 'active_plan' ? 'booking_confirmed' : 'booking_confirmed');

    // Load matching email template
    const templates = await base44.asServiceRole.entities.EmailTemplate.filter({ trigger: emailTrigger, is_active: true });
    const template = templates[0] || null;

    const recipientEmail = overrideEmail || booking.email;
    const firstName = booking.first_name || 'Guest';
    const lastName = booking.last_name || '';
    const packageId = booking.package_id || '';
    const paymentOption = booking.payment_option === 'plan' ? 'Installment Plan' : 'Paid in Full';
    const totalFormatted = `$${((booking.total_price_cents || 0) / 100).toFixed(2)}`;
    const depositFormatted = `$${((booking.deposit_amount_cents || 0) / 100).toFixed(2)}`;
    const remainingBalance = booking.total_price_cents - booking.amount_paid_cents;
    const remainingFormatted = `$${(remainingBalance / 100).toFixed(2)}`;
    const nextCharge = booking.plan_next_charge_date || 'N/A';

    // Placeholder values
    const placeholders = {
      first_name: firstName,
      last_name: lastName,
      package_name: packageId,
      payment_option_display: paymentOption,
      guest_count: booking.guests || 1,
      total_price_usd: totalFormatted.replace('$', ''),
      deposit_amount_usd: depositFormatted.replace('$', ''),
      remaining_balance_usd: remainingFormatted.replace('$', ''),
      plan_next_charge_date: nextCharge,
      installment_1_date: 'TBD',
      installment_2_date: 'TBD',
      installment_3_date: 'TBD',
      installment_4_date: 'TBD',
    };

    let subject, body;

    if (template) {
      subject = template.subject;
      body = template.body;

      // Replace all placeholders
      Object.entries(placeholders).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      });
    } else {
      // Fallback template
      subject = `You're In! Your Lost in Jamaica Booking is Confirmed`;
      body = `Hi ${firstName},\n\nYour booking for Lost in Jamaica is confirmed!\n\nPackage: ${packageId}\nPayment: ${paymentOption}\nTotal: ${totalFormatted}\n${booking.payment_option === 'plan' ? `Deposit Paid: ${depositFormatted}\nNext Installment: ${nextCharge}` : ''}\n\nWe can't wait to see you in Jamaica!\n\n— The GFX Cursions Team`;
    }

    // Send email via Base44 integration
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      from_name: 'Lost in Jamaica by GFX',
      subject,
      body,
    });

    console.log(`Email sent to ${recipientEmail} for booking ${bookingId} (trigger: ${emailTrigger})`);
    return Response.json({ success: true, sentTo: recipientEmail, subject });

  } catch (error) {
    console.error('sendBookingEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});