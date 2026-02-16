import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ChevronRight, ChevronLeft, Users, Calendar, DollarSign, Loader2, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BookingWizard({ onClose, tripSlug }) {
const [step, setStep] = useState(1);
const [isSubmitting, setIsSubmitting] = useState(false);
const [trip, setTrip] = useState(null);

const [bookingData, setBookingData] = useState({
    packageType: '',
    nights: '',
    occupancy: '',
    guests: 1,
    paymentOption: '',
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    tshirtSize: '',
    guest2FirstName: '',
    guest2LastName: '',
    guest2Email: '',
    guest2CountryCode: '+1',
    guest2Phone: '',
    guest2TshirtSize: '',
    bedPreference: '',
    referredBy: '',
    celebratingBirthday: '',
    notes: '',
    arrivalAirline: '',
    arrivalDate: '',
    arrivalTime: '',
    departureAirline: '',
    departureDate: '',
    departureTime: '',
  });

  const packages = [
    { id: 'luxury-suite', name: 'Luxury Suite', nights: [3, 4] },
    { id: 'diamond-club', name: 'Luxury Suite Diamond Club', nights: [3, 4], featured: true },
    { id: 'ocean-view-dc', name: 'Luxury Ocean View Diamond Club', nights: [3, 4], premium: true },
  ];

  const pricing = {
    'luxury-suite-3-single': 1455,
    'luxury-suite-3-double': 1100,
    'luxury-suite-4-single': 1825,
    'luxury-suite-4-double': 1350,
    'diamond-club-3-single': 1650,
    'diamond-club-3-double': 1230,
    'diamond-club-4-single': 2100,
    'diamond-club-4-double': 1500,
    'ocean-view-dc-3-single': 1825,
    'ocean-view-dc-3-double': 1350,
    'ocean-view-dc-4-single': 2350,
    'ocean-view-dc-4-double': 1650,
  };

  const getPriceKey = () => {
    return `${bookingData.packageType}-${bookingData.nights}-${bookingData.occupancy}`;
  };

  const getPrice = () => {
    const key = getPriceKey();
    return pricing[key] || 0;
  };

  const getTotalPrice = () => {
    const pricePerPerson = getPrice();
    if (bookingData.occupancy === 'double') {
      return pricePerPerson * 2;
    }
    return pricePerPerson;
  };

  const calculateStripeGross = (amount) => {
    return Math.round(((amount + 0.30) / (1 - 0.029)) * 100) / 100;
  };

  const getBaseAmountDueToday = () => {
  if (bookingData.paymentOption === 'plan') {
    return getDepositAmount();
  }
  return getTotalPrice();
};

  const getGrossAmountDueToday = () => {
    const base = getBaseAmountDueToday();
    return calculateStripeGross(base);
  };

  const getProcessingFee = () => {
    return Math.round((getGrossAmountDueToday() - getBaseAmountDueToday()) * 100) / 100;
  };

  const getDepositAmount = () => {
  if (!trip) return 0;

  const depositPerPerson = trip.deposit_per_person || 250;
  const guests = Number(bookingData.guests) || 0;

  return depositPerPerson * bookingData.guests;
};
useEffect(() => {
  const loadTrip = async () => {
    try {
      const trips = await base44.entities.Trip.list({
        filter: { slug: tripSlug }
      });

      if (trips.length > 0) {
        setTrip(trips[0]);
      }
    } catch (err) {
      console.error("Failed to load trip", err);
    }
  };

  if (tripSlug) {
    loadTrip();
  }
}, [tripSlug]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleBookNow = async () => {
  if (!trip) {
  toast.error("Trip data not loaded yet. Please try again.");
  setIsSubmitting(false);
  return;
}
  console.log("🔥 Confirm Booking clicked");
  setIsSubmitting(true);

  try {

    // 1️⃣ Create booking in Base44 FIRST
    const booking = await base44.entities.Booking.create({
      trip_id: trip.id,
      package_id: bookingData.packageType,
      guests: bookingData.guests,
      payment_option: bookingData.paymentOption,
      total_price: getTotalPrice(),
      deposit_amount:
        bookingData.paymentOption === "plan"
          ? getDepositAmount()
          : null,
      status: "initiated",
      first_name: bookingData.firstName,
      last_name: bookingData.lastName,
      email: bookingData.email,
      phone: `${bookingData.countryCode} ${bookingData.phone}`
    });

    // 2️⃣ Send ONLY bookingId to backend
    const response = await fetch(
      "https://radical-stripe-backend.vercel.app/api/create-checkout-session",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id
        })
      }
    );

    const data = await response.json();

    if (!data.url) {
      throw new Error("Stripe session failed");
    }

    // 3️⃣ Redirect to Stripe
    window.location.href = data.url;

  } catch (error) {
    console.error("Stripe error:", error);
    toast.error("Payment session failed. Please try again.");
    setIsSubmitting(false);
  }
};

  const canProceed = () => {
   if (step === 1) return bookingData.packageType && bookingData.nights;

   if (step === 2) return bookingData.occupancy;

   if (step === 3) {
    const guest1Valid =
      bookingData.firstName &&
      bookingData.lastName &&
      bookingData.email &&
      bookingData.phone;

    if (bookingData.occupancy === 'double') {
      const guest2Valid =
        bookingData.guest2FirstName &&
        bookingData.guest2LastName &&
        bookingData.guest2Email &&
        bookingData.guest2Phone;
      return guest1Valid && guest2Valid;
    }

    return guest1Valid;
  }
  
  if (step === 4) {
    // Must select payment option first
    if (!bookingData.paymentOption) return false;

    // 🚫 Block payment plan Dynamic Setting
    if (bookingData.paymentOption === "plan") {
  if (!trip) return false;

  if (!trip.payment_plan_enabled) return false;

  if (trip.plan_cutoff_date) {
    const today = new Date();
    const cutoff = new Date(trip.plan_cutoff_date);

    if (today >= cutoff) {
      return false;
    }
  }
}

    return true;
  }

  return true;
};

  const isPaymentPlanAvailable = () => {
    if (!trip) return false;
    if (!trip.payment_plan_enabled) return false;
    if (trip.plan_cutoff_date) {
      const today = new Date();
      const cutoff = new Date(trip.plan_cutoff_date);
      if (today >= cutoff) return false;
    }
    return true;
  };

  const getPackageName = () => {
    const pkg = packages.find(p => p.id === bookingData.packageType);
    return pkg ? pkg.name : '';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-zinc-900 border-green-600/30">
          <CardHeader className="border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-2xl font-black uppercase">
                Book Your Retreat
              </CardTitle>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center gap-4 mt-6">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= num ? 'bg-green-600 border-green-600 text-white' : 'border-zinc-700 text-gray-500'
                  } font-bold`}>
                    {step > num ? <Check className="w-5 h-5" /> : num}
                  </div>
                  {num < 4 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > num ? 'bg-green-600' : 'bg-zinc-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs font-bold uppercase">
              <span className={step >= 1 ? 'text-green-500' : 'text-gray-500'}>Package</span>
              <span className={step >= 2 ? 'text-green-500' : 'text-gray-500'}>Occupancy</span>
              <span className={step >= 3 ? 'text-green-500' : 'text-gray-500'}>Your Info</span>
              <span className={step >= 4 ? 'text-green-500' : 'text-gray-500'}>Confirm</span>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Select Package */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-white font-black text-xl uppercase mb-4">
                    Choose Your Package
                  </h3>
                  
                  <div className="space-y-4">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => setBookingData({ ...bookingData, packageType: pkg.id, nights: '' })}
                        className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                          bookingData.packageType === pkg.id
                            ? 'border-green-600 bg-green-600/10'
                            : 'border-zinc-700 hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-white font-black text-lg">{pkg.name}</h4>
                              {pkg.premium && (
                                <span className="bg-green-600 text-white text-xs font-black px-2 py-1 rounded">
                                  PREMIUM
                                </span>
                              )}
                              {pkg.featured && (
                                <span className="bg-yellow-400 text-black text-xs font-black px-2 py-1 rounded">
                                  POPULAR
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">
                              Available: {pkg.nights.join(' or ')} Nights
                            </p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 ${
                            bookingData.packageType === pkg.id
                              ? 'border-green-600 bg-green-600'
                              : 'border-zinc-600'
                          } flex items-center justify-center`}>
                            {bookingData.packageType === pkg.id && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {bookingData.packageType && (
                    <div className="mt-6">
                      <Label className="text-white font-bold mb-2 block uppercase text-sm">
                        Select Number of Nights
                      </Label>
                      <Select
                        value={bookingData.nights}
                        onValueChange={(value) => setBookingData({ ...bookingData, nights: value })}
                      >
                        <SelectTrigger className="bg-black border-zinc-700 text-white">
                          <SelectValue placeholder="Choose nights" />
                        </SelectTrigger>
                        <SelectContent>
                          {packages.find(p => p.id === bookingData.packageType)?.nights.map((night) => (
                            <SelectItem key={night} value={String(night)}>
                              {night} Nights ({night === 3 ? 'Friday-Monday' : 'Thursday-Monday'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Guests & Occupancy */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-white font-black text-xl uppercase mb-4">
                    Select Occupancy
                  </h3>

                  <div className="space-y-4">
                    <div
                      onClick={() => setBookingData({ ...bookingData, occupancy: 'single', guests: 1 })}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                        bookingData.occupancy === 'single'
                          ? 'border-green-600 bg-green-600/10'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Users className="w-6 h-6 text-green-500" />
                            <h4 className="text-white font-black text-lg">Single Occupancy</h4>
                          </div>
                          <p className="text-gray-400 text-sm">Perfect for solo travelers</p>
                          <p className="text-yellow-400 font-bold mt-2">
                            ${pricing[`${bookingData.packageType}-${bookingData.nights}-single`]?.toLocaleString()} per person
                          </p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          bookingData.occupancy === 'single'
                            ? 'border-green-600 bg-green-600'
                            : 'border-zinc-600'
                        } flex items-center justify-center`}>
                          {bookingData.occupancy === 'single' && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setBookingData({ ...bookingData, occupancy: 'double', guests: 2 })}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                        bookingData.occupancy === 'double'
                          ? 'border-green-600 bg-green-600/10'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Users className="w-6 h-6 text-green-500" />
                            <h4 className="text-white font-black text-lg">Double Occupancy</h4>
                          </div>
                          <p className="text-gray-400 text-sm">Share with a friend or partner</p>
                          <p className="text-yellow-400 font-bold mt-2">
                            ${pricing[`${bookingData.packageType}-${bookingData.nights}-double`]?.toLocaleString()} per person
                          </p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          bookingData.occupancy === 'double'
                            ? 'border-green-600 bg-green-600'
                            : 'border-zinc-600'
                        } flex items-center justify-center`}>
                          {bookingData.occupancy === 'double' && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Contact & Personal Information */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 max-h-[60vh] overflow-y-auto pr-2"
                >
                  <h3 className="text-white font-black text-xl uppercase mb-4">
                    Your Information
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white font-bold mb-2 block uppercase text-sm">
                          First Name *
                        </Label>
                        <Input
                          value={bookingData.firstName}
                          onChange={(e) => setBookingData({ ...bookingData, firstName: e.target.value })}
                          className="bg-black border-zinc-700 text-white"
                          placeholder="John"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-white font-bold mb-2 block uppercase text-sm">
                          Last Name *
                        </Label>
                        <Input
                          value={bookingData.lastName}
                          onChange={(e) => setBookingData({ ...bookingData, lastName: e.target.value })}
                          className="bg-black border-zinc-700 text-white"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white font-bold mb-2 block uppercase text-sm">
                        Email Address *
                      </Label>
                      <Input
                        type="email"
                        value={bookingData.email}
                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                        className="bg-black border-zinc-700 text-white"
                        placeholder="john@example.com"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-white font-bold mb-2 block uppercase text-sm">
                        Phone Number *
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={bookingData.countryCode}
                          onValueChange={(value) => setBookingData({ ...bookingData, countryCode: value })}
                        >
                          <SelectTrigger className="bg-black border-zinc-700 text-white w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+1">+1 (US)</SelectItem>
                            <SelectItem value="+44">+44 (UK)</SelectItem>
                            <SelectItem value="+1-876">+1-876 (JM)</SelectItem>
                            <SelectItem value="+91">+91 (IN)</SelectItem>
                            <SelectItem value="+86">+86 (CN)</SelectItem>
                            <SelectItem value="+61">+61 (AU)</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="tel"
                          value={bookingData.phone}
                          onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                          className="bg-black border-zinc-700 text-white flex-1"
                          placeholder="555-123-4567"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white font-bold mb-2 block uppercase text-sm">
                        T-Shirt Size
                      </Label>
                      <Select
                        value={bookingData.tshirtSize}
                        onValueChange={(value) => setBookingData({ ...bookingData, tshirtSize: value })}
                      >
                        <SelectTrigger className="bg-black border-zinc-700 text-white">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">XS</SelectItem>
                          <SelectItem value="S">S</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                          <SelectItem value="XXL">XXL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Second Guest Information - Only for Double Occupancy */}
                    {bookingData.occupancy === 'double' && (
                      <div className="border-t border-green-600/30 pt-6 mt-6">
                        <h4 className="text-white font-black uppercase text-lg mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5 text-green-500" />
                          Second Guest Information
                        </h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-white font-bold mb-2 block uppercase text-sm">
                                First Name *
                              </Label>
                              <Input
                                value={bookingData.guest2FirstName}
                                onChange={(e) => setBookingData({ ...bookingData, guest2FirstName: e.target.value })}
                                className="bg-black border-zinc-700 text-white"
                                placeholder="Jane"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-white font-bold mb-2 block uppercase text-sm">
                                Last Name *
                              </Label>
                              <Input
                                value={bookingData.guest2LastName}
                                onChange={(e) => setBookingData({ ...bookingData, guest2LastName: e.target.value })}
                                className="bg-black border-zinc-700 text-white"
                                placeholder="Doe"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-white font-bold mb-2 block uppercase text-sm">
                              Email Address *
                            </Label>
                            <Input
                              type="email"
                              value={bookingData.guest2Email}
                              onChange={(e) => setBookingData({ ...bookingData, guest2Email: e.target.value })}
                              className="bg-black border-zinc-700 text-white"
                              placeholder="jane@example.com"
                              required
                            />
                          </div>

                          <div>
                            <Label className="text-white font-bold mb-2 block uppercase text-sm">
                              Phone Number *
                            </Label>
                            <div className="flex gap-2">
                              <Select
                                value={bookingData.guest2CountryCode}
                                onValueChange={(value) => setBookingData({ ...bookingData, guest2CountryCode: value })}
                              >
                                <SelectTrigger className="bg-black border-zinc-700 text-white w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="+1">+1 (US)</SelectItem>
                                  <SelectItem value="+44">+44 (UK)</SelectItem>
                                  <SelectItem value="+1-876">+1-876 (JM)</SelectItem>
                                  <SelectItem value="+91">+91 (IN)</SelectItem>
                                  <SelectItem value="+86">+86 (CN)</SelectItem>
                                  <SelectItem value="+61">+61 (AU)</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                type="tel"
                                value={bookingData.guest2Phone}
                                onChange={(e) => setBookingData({ ...bookingData, guest2Phone: e.target.value })}
                                className="bg-black border-zinc-700 text-white flex-1"
                                placeholder="555-987-6543"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-white font-bold mb-2 block uppercase text-sm">
                              T-Shirt Size
                            </Label>
                            <Select
                              value={bookingData.guest2TshirtSize}
                              onValueChange={(value) => setBookingData({ ...bookingData, guest2TshirtSize: value })}
                            >
                              <SelectTrigger className="bg-black border-zinc-700 text-white">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="XS">XS</SelectItem>
                                <SelectItem value="S">S</SelectItem>
                                <SelectItem value="M">M</SelectItem>
                                <SelectItem value="L">L</SelectItem>
                                <SelectItem value="XL">XL</SelectItem>
                                <SelectItem value="XXL">XXL</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-white font-bold mb-2 block uppercase text-sm">
                        Bed Preference
                      </Label>
                      <Select
                        value={bookingData.bedPreference}
                        onValueChange={(value) => setBookingData({ ...bookingData, bedPreference: value })}
                      >
                        <SelectTrigger className="bg-black border-zinc-700 text-white">
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="king">King</SelectItem>
                          <SelectItem value="double">Double Beds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white font-bold mb-2 block uppercase text-sm">
                        Referred By
                      </Label>
                      <Select
                        value={bookingData.referredBy}
                        onValueChange={(value) => setBookingData({ ...bookingData, referredBy: value })}
                      >
                        <SelectTrigger className="bg-black border-zinc-700 text-white">
                          <SelectValue placeholder="How did you hear about us?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gfx">GFX</SelectItem>
                          <SelectItem value="social-media">Social Media</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="previous-attendee">Previous Attendee</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white font-bold mb-2 block uppercase text-sm">
                        Celebrating a Birthday?
                      </Label>
                      <Select
                        value={bookingData.celebratingBirthday}
                        onValueChange={(value) => setBookingData({ ...bookingData, celebratingBirthday: value })}
                      >
                        <SelectTrigger className="bg-black border-zinc-700 text-white">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white font-bold mb-2 block uppercase text-sm">
                        Notes to Organizer
                      </Label>
                      <textarea
                        value={bookingData.notes}
                        onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                        className="w-full bg-black border border-zinc-700 text-white rounded-md px-3 py-2 min-h-[80px]"
                        placeholder="Any special requests or notes..."
                      />
                    </div>

                    <div className="border-t border-zinc-800 pt-4 mt-4">
                      <h4 className="text-white font-bold uppercase text-sm mb-4">Arrival Information</h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-white font-bold mb-2 block uppercase text-xs">
                            Airline
                          </Label>
                          <Input
                            value={bookingData.arrivalAirline}
                            onChange={(e) => setBookingData({ ...bookingData, arrivalAirline: e.target.value })}
                            className="bg-black border-zinc-700 text-white"
                            placeholder="e.g., Delta"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-white font-bold mb-2 block uppercase text-xs">
                              Date
                            </Label>
                            <Input
                              type="date"
                              value={bookingData.arrivalDate}
                              onChange={(e) => setBookingData({ ...bookingData, arrivalDate: e.target.value })}
                              className="bg-black border-zinc-700 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white font-bold mb-2 block uppercase text-xs">
                              Time
                            </Label>
                            <Input
                              type="time"
                              value={bookingData.arrivalTime}
                              onChange={(e) => setBookingData({ ...bookingData, arrivalTime: e.target.value })}
                              className="bg-black border-zinc-700 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-4">
                      <h4 className="text-white font-bold uppercase text-sm mb-4">Departure Information</h4>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-white font-bold mb-2 block uppercase text-xs">
                            Airline
                          </Label>
                          <Input
                            value={bookingData.departureAirline}
                            onChange={(e) => setBookingData({ ...bookingData, departureAirline: e.target.value })}
                            className="bg-black border-zinc-700 text-white"
                            placeholder="e.g., United"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-white font-bold mb-2 block uppercase text-xs">
                              Date
                            </Label>
                            <Input
                              type="date"
                              value={bookingData.departureDate}
                              onChange={(e) => setBookingData({ ...bookingData, departureDate: e.target.value })}
                              className="bg-black border-zinc-700 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white font-bold mb-2 block uppercase text-xs">
                              Time
                            </Label>
                            <Input
                              type="time"
                              value={bookingData.departureTime}
                              onChange={(e) => setBookingData({ ...bookingData, departureTime: e.target.value })}
                              className="bg-black border-zinc-700 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Summary */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-white font-black text-xl uppercase mb-4">
                    Booking Summary
                  </h3>

                  <div className="bg-black rounded-lg p-6 space-y-4 border border-zinc-800">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-green-500" />
                        <span className="text-gray-400">Guest Name</span>
                      </div>
                      <span className="text-white font-bold">{bookingData.firstName} {bookingData.lastName}</span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-green-500" />
                        <span className="text-gray-400">Email</span>
                      </div>
                      <span className="text-white font-bold">{bookingData.email}</span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-green-500" />
                        <span className="text-gray-400">Phone</span>
                      </div>
                      <span className="text-white font-bold">{bookingData.countryCode} {bookingData.phone}</span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-green-500" />
                        <span className="text-gray-400">Package</span>
                      </div>
                      <span className="text-white font-bold">{getPackageName()}</span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-green-500" />
                        <span className="text-gray-400">Duration</span>
                      </div>
                      <span className="text-white font-bold">
                        {bookingData.nights} Nights ({bookingData.nights === '3' ? 'Fri-Mon' : 'Thu-Mon'})
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-green-500" />
                        <span className="text-gray-400">Occupancy</span>
                      </div>
                      <span className="text-white font-bold">
                        {bookingData.occupancy === 'single' ? 'Single' : 'Double'} ({bookingData.guests} {bookingData.guests === 1 ? 'Guest' : 'Guests'})
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <span className="text-gray-400">Price Per Person</span>
                      </div>
                      <span className="text-white font-bold">${getPrice().toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment Selection */}
                  <div className="mt-6 space-y-4">
                    <h4 className="text-white font-black uppercase text-lg">
                      Choose Payment Option
                    </h4>

                    {/* Full Payment */}
                    <div
                      onClick={() =>
                        setBookingData({ ...bookingData, paymentOption: 'full' })
                      }
                      className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                        bookingData.paymentOption === 'full'
                          ? 'border-green-600 bg-green-600/10'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-white font-black text-lg">
                            Pay In Full
                          </h5>
                          <p className="text-gray-400 text-sm">
                            Secure your spot today with full payment.
                          </p>
                        </div>
                        <div className="text-yellow-400 font-black text-xl">
                          ${getTotalPrice().toLocaleString()}
                        </div>
                      </div>
                    </div>

                  {/* Payment Plan */}
                  {isPaymentPlanAvailable() && (
                    <div
                      onClick={() =>
                        setBookingData({ ...bookingData, paymentOption: 'plan' })
                      }
                      className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                        bookingData.paymentOption === 'plan'
                          ? 'border-green-600 bg-green-600/10'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-white font-black text-lg">
                            Payment Plan
                          </h5>
                          <p className="text-gray-400 text-sm">
                            ${(trip?.deposit_per_person || 250).toLocaleString()} deposit per person today. 
                            Remaining balance split into fixed monthly payments.
                          </p>
                        </div>
                        <div className="text-yellow-400 font-black text-xl">
                          ${getDepositAmount().toLocaleString()} Due Today
                        </div>
                      </div>
                    </div>
                  )}

                  {trip && !isPaymentPlanAvailable() && (
                    <div className="text-sm text-red-400 mt-2">
                      Payment plans are no longer available for this trip.
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="bg-black rounded-lg p-6 space-y-3 border border-zinc-800 mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white font-bold">
                        ${getBaseAmountDueToday().toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Taxes & Fees</span>
                      <span className="text-white font-bold">
                        ${getProcessingFee().toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                      <span className="text-white font-black text-xl uppercase">
                        Total Due Today
                      </span>
                      <span className="text-yellow-400 font-black text-2xl">
                        ${getGrossAmountDueToday().toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4">
                    <p className="text-white text-sm">
                      <span className="font-black">What's Included:</span> Airport shuttle, all-inclusive accommodations, 
                      entry to all weekend events, resort amenities, and more!
                    </p>
                  </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
              <Button
                onClick={step === 1 ? onClose : handleBack}
                variant="outline"
                className="border-zinc-700 text-white hover:bg-zinc-800"
                disabled={isSubmitting}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>

              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-green-600 hover:bg-green-700 text-white font-black uppercase"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleBookNow}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white font-black uppercase px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirming Booking...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}