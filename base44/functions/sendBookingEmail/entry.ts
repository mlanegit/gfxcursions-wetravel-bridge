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

    // Load trip and package details
    const trip = await base44.asServiceRole.entities.Trip.get(booking.trip_id);
    const pkg = await base44.asServiceRole.entities.TripPackage.get(booking.package_id);

    const recipientEmail = overrideEmail || booking.email;
    const firstName = booking.first_name || 'Guest';
    const lastName = booking.last_name || '';
    const totalPrice = ((booking.total_price_cents || 0) / 100).toFixed(2);
    const depositAmount = ((booking.deposit_amount_cents || 0) / 100).toFixed(2);
    const guestCount = booking.guests || 1;
    const paymentOption = booking.payment_option === 'plan' ? 'Installment Plan' : 'Paid in Full';

    // Build HTML email
    const htmlBody = buildBrandedEmail({
      firstName,
      lastName,
      tripName: trip?.name || 'Lost in Jamaica',
      hotelName: 'Your Luxury Accommodation',
      startDate: trip?.start_date || 'TBD',
      endDate: trip?.end_date || 'TBD',
      packageLabel: pkg?.label || 'Premium Package',
      guestCount,
      paymentOption,
      totalPrice,
      depositAmount,
      isPaymentPlan: booking.payment_option === 'plan',
      nextChargeDate: booking.plan_next_charge_date || '',
    });

    const subject = `You're In! ${trip?.name || 'Lost in Jamaica'} — Booking Confirmed 🍹`;

    // Send email via Base44 integration
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      from_name: 'Lost in Jamaica by GFX',
      subject,
      body: htmlBody,
    });

    console.log(`Email sent to ${recipientEmail} for booking ${bookingId}`);
    return Response.json({ success: true, sentTo: recipientEmail, subject });

  } catch (error) {
    console.error('sendBookingEmail error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildBrandedEmail(data) {
  const { firstName, tripName, hotelName, startDate, endDate, packageLabel, guestCount, paymentOption, totalPrice, depositAmount, isPaymentPlan, nextChargeDate } = data;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #000; padding: 20px; text-align: center; border-radius: 12px 12px 0 0; }
    .logo { font-size: 28px; font-weight: bold; color: #ff0000; margin-bottom: 5px; }
    .tagline { color: #999; font-size: 11px; letter-spacing: 2px; }
    .banner { background: #cc0000; color: white; padding: 40px 20px; text-align: center; }
    .banner h1 { margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 1px; }
    .banner p { margin: 10px 0 0 0; font-size: 18px; letter-spacing: 2px; }
    .content { padding: 30px 20px; }
    .greeting { font-size: 18px; margin-bottom: 20px; line-height: 1.6; }
    .section-title { background: #cc0000; color: white; padding: 12px 20px; font-weight: bold; font-size: 14px; letter-spacing: 1px; margin-top: 25px; margin-bottom: 0; }
    .section-content { border: 1px solid #ddd; border-top: none; padding: 20px; }
    .summary-row { display: flex; border-bottom: 1px solid #e0e0e0; padding: 15px 0; }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { color: #999; font-size: 12px; font-weight: bold; width: 150px; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-value { font-size: 16px; font-weight: bold; flex: 1; }
    .summary-value.highlight { color: #cc0000; font-size: 24px; }
    .info-box { border: 2px solid #f0cccc; background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 14px; line-height: 1.6; }
    .info-box strong { color: #cc0000; }
    .warning { color: #cc0000; font-weight: bold; font-size: 14px; }
    .button { display: inline-block; background: #cc0000; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; letter-spacing: 1px; margin: 25px 0; }
    .footer { background: #000; color: #999; padding: 30px 20px; text-align: center; border-radius: 0 0 12px 12px; font-size: 12px; }
    .footer-logo { color: #cc0000; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
    .footer-contact { margin: 10px 0; }
    .footer-contact a { color: #cc0000; text-decoration: none; }
    .footer-copyright { margin-top: 15px; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">GFX GROWN FOLKX</div>
      <div class="tagline">Xcursions • Xscapes • Xclusives</div>
    </div>

    <!-- Banner -->
    <div class="banner">
      <h1>YOU'RE IN! 🍹</h1>
      <p>${tripName.toUpperCase()} — BOOKING CONFIRMED</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Greeting -->
      <div class="greeting">
        Hello ${firstName},<br><br>
        Thank you for joining us on <strong>${tripName}</strong>! We are thrilled to welcome you on this exciting journey. Your presence truly makes this trip special. We look forward to exploring new places, sharing unforgettable experiences, and creating lasting memories together.<br><br>
        Our itinerary is filled with adventures and opportunities to connect, and we can't wait to get started!
      </div>

      <!-- Booking Summary -->
      <div class="section-title">📋 BOOKING SUMMARY</div>
      <div class="section-content">
        <div class="summary-row">
          <div class="summary-label">Trip</div>
          <div class="summary-value">${tripName}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Hotel</div>
          <div class="summary-value">${hotelName}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Travel Dates</div>
          <div class="summary-value">${startDate} – ${endDate}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Package</div>
          <div class="summary-value">${packageLabel}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Guests</div>
          <div class="summary-value">${guestCount}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Payment Option</div>
          <div class="summary-value">${paymentOption}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Total Price</div>
          <div class="summary-value highlight">$${totalPrice}</div>
        </div>
        <div class="summary-row">
          <div class="summary-label">Deposit Paid</div>
          <div class="summary-value">$${depositAmount}</div>
        </div>
      </div>

      ${isPaymentPlan ? `
      <!-- Payment Plan Info -->
      <div class="section-title">💳 PAYMENT PLAN INFO</div>
      <div class="info-box">
        If you chose the <strong>installment plan</strong>, your payments will be automatically charged to the card on file on the scheduled dates. You can always make early payments through your guest portal — if the amount is already paid before an automatic charge date, the auto-payment will be skipped for that installment.<br><br>
        <strong>All balances are due by ${nextChargeDate}</strong>. We strongly suggest making monthly payments so you don't fall behind.<br><br>
        <div class="warning">⚠️ Any failed payments will incur a $30 retry fee.</div>
      </div>
      ` : ''}

      <!-- Cancellation Policy -->
      <div class="section-title">🎯 CANCELLATION POLICY</div>
      <div class="section-content">
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Your deposit is <strong>NON-REFUNDABLE</strong>, but it counts toward your total package price if you attend.</li>
          <li><strong>No refunds</strong> if you cancel within 60 days of the trip.</li>
          <li><strong>50% refund</strong> if you cancel within 90 days of the trip start date.</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="https://lostin.gfxcursions.com/guest-portal" class="button">MANAGE MY BOOKING →</a>
      </div>

      <!-- Closing -->
      <p style="text-align: center; margin-top: 30px; color: #666;">
        If you have any questions or need assistance, please don't hesitate to reach out. Let's make this trip one to remember!
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-logo">GFX</div>
      <div class="footer-contact">
        Questions? <a href="mailto:gfxsupport@gfxcursions.com">gfxsupport@gfxcursions.com</a> | (347) 301-0714
      </div>
      <div class="footer-copyright">
        © 2026 gfXcursions · Xcursions · Xscapes · Xclusives®. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;
}