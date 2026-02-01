import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingData = await req.json();
    
    // Validate required fields
    if (!bookingData.name || !bookingData.email || !bookingData.package || 
        !bookingData.nights || !bookingData.occupancy || !bookingData.total_price) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const WETRAVEL_API_KEY = Deno.env.get('WETRAVEL_API_KEY');
    const WETRAVEL_TRIP_ID = Deno.env.get('WETRAVEL_TRIP_ID');

    if (!WETRAVEL_API_KEY || !WETRAVEL_TRIP_ID) {
      return Response.json({ error: 'WeTravel not configured' }, { status: 500 });
    }

    // Step 1: Get access token from refresh token
    const tokenResponse = await fetch('https://api.wetravel.com/auth/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WETRAVEL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('WeTravel Token Error:', error);
      return Response.json({ 
        error: 'Failed to authenticate with WeTravel',
        details: error 
      }, { status: 500 });
    }

    const { access_token } = await tokenResponse.json();

    // Step 2: Create booking via WeTravel API
    const firstName = bookingData.name.split(' ')[0];
    const lastName = bookingData.name.split(' ').slice(1).join(' ') || bookingData.name.split(' ')[0];

    const wetravelPayload = {
      first_name: firstName,
      last_name: lastName,
      email: bookingData.email,
      phone: bookingData.phone || '',
      num_participants: bookingData.guests,
    };

    console.log('Creating WeTravel booking with payload:', JSON.stringify(wetravelPayload, null, 2));

    const wetravelResponse = await fetch(`https://api.wetravel.com/trips/${WETRAVEL_TRIP_ID}/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wetravelPayload),
    });

    if (!wetravelResponse.ok) {
      const error = await wetravelResponse.text();
      console.error('WeTravel Booking Error:', wetravelResponse.status, error);
      return Response.json({ 
        error: 'Failed to create WeTravel booking',
        status: wetravelResponse.status,
        details: error 
      }, { status: 500 });
    }

    const wetravelBooking = await wetravelResponse.json();
    console.log('WeTravel Booking Response:', JSON.stringify(wetravelBooking, null, 2));
    
    // Extract checkout URL from response
    const checkoutUrl = wetravelBooking.checkout_url || 
                        wetravelBooking.booking_url ||
                        wetravelBooking.payment_url ||
                        `https://gfxcursions.wetravel.com/trips/test-lost-in-jamaica-gfx-${WETRAVEL_TRIP_ID}`;
    
    // Store booking in Base44
    const booking = await base44.asServiceRole.entities.Booking.create({
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone || '',
      package: bookingData.package,
      nights: bookingData.nights,
      occupancy: bookingData.occupancy,
      guests: bookingData.guests,
      price_per_person: bookingData.price_per_person,
      total_price: bookingData.total_price,
      wetravel_booking_id: wetravelBooking.id || wetravelBooking.booking_id || wetravelBooking.uuid,
      checkout_url: checkoutUrl,
      payment_status: 'pending',
      status: 'pending',
    });

    return Response.json({
      success: true,
      booking_id: booking.id,
      checkout_url: checkoutUrl,
      wetravel_booking: wetravelBooking,
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
});