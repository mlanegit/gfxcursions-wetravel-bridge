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

    const WETRAVEL_TRIP_ID = Deno.env.get('WETRAVEL_TRIP_ID');
    console.log('WETRAVEL_TRIP_ID from env:', WETRAVEL_TRIP_ID);

    if (!WETRAVEL_TRIP_ID) {
      return Response.json({ error: 'WeTravel not configured' }, { status: 500 });
    }
    
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
      payment_status: 'pending',
      status: 'pending',
    });

    // Build WeTravel checkout URL
    const checkoutUrl = `https://gfxcursions.wetravel.com/trips/test-lost-in-jamaica-gfx-${WETRAVEL_TRIP_ID}`;
    console.log('Generated checkout URL:', checkoutUrl);

    return Response.json({
      success: true,
      booking_id: booking.id,
      checkout_url: checkoutUrl,
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
});