import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ChevronRight, ChevronLeft, Users, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BookingWizard({ onClose }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    packageType: '',
    nights: '',
    occupancy: '',
    guests: 1,
    name: '',
    email: '',
    phone: '',
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

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleBookNow = async () => {
    setIsSubmitting(true);
    
    try {
      // Store booking in Base44
      const booking = await base44.entities.Booking.create({
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone || '',
        package: bookingData.packageType,
        nights: bookingData.nights,
        occupancy: bookingData.occupancy,
        guests: bookingData.guests,
        price_per_person: getPrice(),
        total_price: getTotalPrice(),
        payment_status: 'pending',
        status: 'pending',
      });

      // Build WeTravel checkout URL with pre-filled info
      const wetravelUrl = new URL('https://gfxcursions.wetravel.com/trips/TestLostinJamaica00');
      wetravelUrl.searchParams.set('email', bookingData.email);
      wetravelUrl.searchParams.set('first_name', bookingData.name.split(' ')[0]);
      wetravelUrl.searchParams.set('last_name', bookingData.name.split(' ').slice(1).join(' ') || bookingData.name.split(' ')[0]);

      toast.success('Redirecting to payment...');
      
      // Redirect to WeTravel
      setTimeout(() => {
        window.location.href = wetravelUrl.toString();
      }, 500);
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Something went wrong. Please try again or contact support.');
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return bookingData.packageType && bookingData.nights;
    if (step === 2) return bookingData.occupancy;
    if (step === 3) return bookingData.name && bookingData.email;
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

              {/* Step 3: Contact Information */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-white font-black text-xl uppercase mb-4">
                    Your Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-white font-bold mb-2 block uppercase text-sm">
                        Full Name *
                      </Label>
                      <Input
                        value={bookingData.name}
                        onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                        className="bg-black border-zinc-700 text-white"
                        placeholder="John Doe"
                        required
                      />
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
                        Phone Number
                      </Label>
                      <Input
                        type="tel"
                        value={bookingData.phone}
                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                        className="bg-black border-zinc-700 text-white"
                        placeholder="+1 (555) 123-4567"
                      />
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
                      <span className="text-white font-bold">{bookingData.name}</span>
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

                    <div className="flex items-center justify-between pt-4">
                      <span className="text-white font-black text-xl uppercase">Total</span>
                      <span className="text-yellow-400 font-black text-2xl">
                        ${getTotalPrice().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4">
                    <p className="text-white text-sm">
                      <span className="font-black">What's Included:</span> Airport shuttle, all-inclusive accommodations, 
                      entry to all weekend events, resort amenities, and more!
                    </p>
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
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      Complete Payment
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