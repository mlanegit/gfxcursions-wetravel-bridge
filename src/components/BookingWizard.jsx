import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ChevronRight, ChevronLeft, Users, Calendar, DollarSign, Loader2, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function BookingWizard({ onClose }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bookingData, setBookingData] = useState({
    packageType: '',
    nights: '',
    occupancy: '',
    guests: 1,
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    tshirtSize: '',
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

  const getPriceKey = () =>
    `${bookingData.packageType}-${bookingData.nights}-${bookingData.occupancy}`;

  const getPrice = () => pricing[getPriceKey()] || 0;

  const getTotalPrice = () =>
    bookingData.occupancy === 'double'
      ? getPrice() * 2
      : getPrice();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleBookNow = async () => {
    console.log("🔥 Confirm Booking clicked");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://radical-stripe-backend.vercel.app/api/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: bookingData.firstName,
            lastName: bookingData.lastName,
            email: bookingData.email,
            packageType: bookingData.packageType,
            nights: bookingData.nights,
            occupancy: bookingData.occupancy,
            guests: bookingData.guests,
            totalPrice: getTotalPrice()
          })
        }
      );

      const data = await response.json();
      console.log("Stripe response:", data);

      if (!data.url) {
        throw new Error("Stripe session failed");
      }

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
    if (step === 3)
      return bookingData.firstName &&
             bookingData.lastName &&
             bookingData.email &&
             bookingData.phone;
    return true;
  };

  const getPackageName = () => {
    const pkg = packages.find(p => p.id === bookingData.packageType);
    return pkg ? pkg.name : '';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl">
        <Card className="bg-zinc-900 border-green-600/30">
          <CardHeader>
            <CardTitle className="text-white text-2xl font-black uppercase">
              Book Your Retreat
            </CardTitle>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-white font-black text-xl uppercase mb-4">
                    Booking Summary
                  </h3>

                  <div className="bg-black rounded-lg p-6 border border-zinc-800">
                    <div className="flex justify-between">
                      <span className="text-white font-bold">Package</span>
                      <span className="text-white">{getPackageName()}</span>
                    </div>

                    <div className="flex justify-between mt-4">
                      <span className="text-white font-bold">Total</span>
                      <span className="text-yellow-400 font-black text-xl">
                        ${getTotalPrice().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <Button onClick={step === 1 ? onClose : handleBack}>
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>

              {step < 4 ? (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleBookNow}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    "Confirm Booking"
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