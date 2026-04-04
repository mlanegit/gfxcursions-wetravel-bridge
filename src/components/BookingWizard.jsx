import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ChevronRight, ChevronLeft, Users, Calendar, DollarSign, Loader2, Phone, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const PACKAGES = [
  { id: 'luxury-suite', name: 'Luxury Suite', description: 'All-inclusive luxury suite with resort amenities.', nights: [3, 4] },
  { id: 'diamond-club', name: 'Luxury Suite Diamond Club', description: 'Elevated Diamond Club access with premium perks.', nights: [3, 4], featured: true },
  { id: 'ocean-view-dc', name: 'Luxury Ocean View Diamond Club', description: 'Stunning ocean views with the full Diamond Club experience.', nights: [3, 4], premium: true },
];

const PRICING = {
  'luxury-suite-3-single': 1455, 'luxury-suite-3-double': 1100,
  'luxury-suite-4-single': 1825, 'luxury-suite-4-double': 1350,
  'diamond-club-3-single': 1650, 'diamond-club-3-double': 1230,
  'diamond-club-4-single': 2100, 'diamond-club-4-double': 1500,
  'ocean-view-dc-3-single': 1825, 'ocean-view-dc-3-double': 1350,
  'ocean-view-dc-4-single': 2350, 'ocean-view-dc-4-double': 1650,
};

export default function BookingWizard({ onClose, tripSlug }) {
  const [step, setStep] = useState(1);
  const [trip, setTrip] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    packageType: '', nights: '', occupancy: '', paymentOption: '',
    firstName: '', lastName: '', email: '', countryCode: '+1', phone: '', tshirtSize: '',
    guest2FirstName: '', guest2LastName: '', guest2Email: '', guest2CountryCode: '+1', guest2Phone: '', guest2TshirtSize: '',
    bedPreference: '', referredBy: '', celebratingBirthday: '', notes: '',
    arrivalAirline: '', arrivalDate: '', arrivalTime: '',
    departureAirline: '', departureDate: '', departureTime: '',
  });

  useEffect(() => {
    if (!tripSlug) return;
    base44.entities.Trip.filter({ slug: tripSlug })
      .then((trips) => trips.length > 0 && setTrip(trips[0]))
      .catch((err) => console.error('Failed to load trip:', err));
  }, [tripSlug]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const pricePerPerson = () => PRICING[`${form.packageType}-${form.nights}-${form.occupancy}`] || 0;

  const totalPrice = () => {
    const pp = pricePerPerson();
    return form.occupancy === 'double' ? pp * 2 : pp;
  };

 const depositAmount = () => {
  if (!trip) return 0;
  const depositPP = trip.deposit_per_person || 500;
  return form.occupancy === 'double' ? depositPP * 2 : depositPP;
};

  const isPaymentPlanAvailable = () => {
  if (!trip) return false;
  // Support both old schema (payment_plan_enabled + plan_cutoff_date) 
  // and new schema (balance_due_date)
  if (trip.payment_plan_enabled === false) return false;
  const cutoff = trip.plan_cutoff_date || trip.balance_due_date;
  if (cutoff) return new Date(cutoff) > new Date();
  return true;
};

  const packageName = () => PACKAGES.find((p) => p.id === form.packageType)?.name || '';

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.packageType) e.packageType = 'Please select a package.';
      if (!form.nights) e.nights = 'Please select nights.';
    }
    if (step === 2) {
      if (!form.occupancy) e.occupancy = 'Please select occupancy.';
    }
    if (step === 3) {
      if (!form.firstName) e.firstName = 'Required';
      if (!form.lastName) e.lastName = 'Required';
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
      if (!form.phone) e.phone = 'Required';
      if (!form.tshirtSize) e.tshirtSize = 'Required';
      if (form.occupancy === 'double') {
        if (!form.guest2FirstName) e.guest2FirstName = 'Required';
        if (!form.guest2LastName) e.guest2LastName = 'Required';
        if (!form.guest2Email || !/\S+@\S+\.\S+/.test(form.guest2Email)) e.guest2Email = 'Valid email required';
        if (!form.guest2Phone) e.guest2Phone = 'Required';
        if (!form.guest2TshirtSize) e.guest2TshirtSize = 'Required';
      }
    }
    if (step === 4) {
      if (!form.paymentOption) e.paymentOption = 'Please select a payment option.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) setStep((s) => Math.min(s + 1, 4)); };
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!trip) { toast.error('Trip data not loaded yet. Please try again.'); return; }
    setIsSubmitting(true);
    try {
      const guests = form.occupancy === 'double' ? 2 : 1;
      const bookingPayload = {
        trip_id: trip.id,
        package_id: form.packageType,
        occupancy: form.occupancy,
        guests,
        payment_option: form.paymentOption,
        total_price_cents: Math.round(totalPrice() * 100),
        deposit_amount_cents: Math.round(depositAmount() * 100),
        status: 'pending',
        payment_status: 'pending',
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: `${form.countryCode} ${form.phone}`,
        tshirt_size: form.tshirtSize,
        bed_preference: form.bedPreference,
        referred_by: form.referredBy,
        celebrating_birthday: form.celebratingBirthday,
        notes: form.notes,
        arrival_airline: form.arrivalAirline,
        arrival_date: form.arrivalDate,
        arrival_time: form.arrivalTime,
        departure_airline: form.departureAirline,
        departure_date: form.departureDate,
        departure_time: form.departureTime,
      };
      if (form.occupancy === 'double') {
        bookingPayload.guest2_first_name = form.guest2FirstName;
        bookingPayload.guest2_last_name = form.guest2LastName;
        bookingPayload.guest2_email = form.guest2Email;
        bookingPayload.guest2_phone = `${form.guest2CountryCode} ${form.guest2Phone}`;
        bookingPayload.guest2_tshirt_size = form.guest2TshirtSize;
      }
      const booking = await base44.entities.Booking.create(bookingPayload);
      const response = await base44.functions.invoke('createCheckoutSession', { bookingId: booking.id });
      const data = response?.data || response;
      if (!data?.url) throw new Error('Stripe session URL missing');
      window.location.href = data.url;
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const FieldError = ({ field }) => errors[field] ? <p className="text-red-400 text-xs mt-1">{errors[field]}</p> : null;

  const stepLabels = ['Package', 'Occupancy', 'Your Info', 'Confirm'];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-2xl my-8">
        <Card className="bg-zinc-900 border-zinc-700 shadow-2xl">
          <CardHeader className="border-b border-zinc-800 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-white text-2xl font-black uppercase tracking-wide">Book Your Retreat</CardTitle>
                {trip && <p className="text-red-500 text-sm font-bold mt-1">{trip.name} • {trip.hotel}</p>}
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl leading-none font-light">×</button>
            </div>
            <div className="flex items-center gap-1">
              {stepLabels.map((label, i) => {
                const num = i + 1;
                const done = step > num;
                const active = step === num;
                return (
                  <React.Fragment key={num}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 font-black text-sm transition-all ${done ? 'bg-red-600 border-red-600 text-white' : active ? 'border-red-600 text-red-500 bg-zinc-800' : 'border-zinc-700 text-zinc-500 bg-zinc-800'}`}>
                        {done ? <Check className="w-4 h-4" /> : num}
                      </div>
                      <span className={`text-xs mt-1 font-bold uppercase tracking-wide ${active ? 'text-red-500' : done ? 'text-red-700' : 'text-zinc-600'}`}>{label}</span>
                    </div>
                    {i < stepLabels.length - 1 && <div className={`flex-1 h-0.5 mb-4 ${step > num ? 'bg-red-600' : 'bg-zinc-700'}`} />}
                  </React.Fragment>
                );
              })}
            </div>
          </CardHeader>

          <CardContent className="pt-6 pb-8 px-6">
            <AnimatePresence mode="wait">

              {/* STEP 1 — Package */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                  <h3 className="text-white font-black text-lg uppercase mb-2">Choose Your Package</h3>
                  {PACKAGES.map((pkg) => (
                    <div key={pkg.id} onClick={() => { set('packageType', pkg.id); set('nights', ''); }}
                      className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${form.packageType === pkg.id ? 'border-red-600 bg-red-600/10' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-500'}`}>
                      {pkg.featured && <span className="absolute top-3 right-3 bg-yellow-400 text-black text-xs font-black px-2 py-0.5 rounded uppercase">Most Popular</span>}
                      {pkg.premium && <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded uppercase">Premium</span>}
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${form.packageType === pkg.id ? 'border-red-600 bg-red-600' : 'border-zinc-600'}`}>
                          {form.packageType === pkg.id && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <p className="text-white font-black">{pkg.name}</p>
                          <p className="text-zinc-400 text-sm mt-0.5">{pkg.description}</p>
                        </div>
                      </div>
                      {form.packageType === pkg.id && (
                        <div className="mt-4 pt-4 border-t border-zinc-700">
                          <p className="text-gray-400 text-sm font-bold uppercase tracking-wide mb-2">Select Nights</p>
                          <div className="flex gap-3">
                            {pkg.nights.map((n) => (
                              <button key={n} onClick={(e) => { e.stopPropagation(); set('nights', String(n)); }}
                                className={`px-5 py-2 rounded-lg border-2 font-black text-sm transition-all ${form.nights === String(n) ? 'border-red-600 bg-red-600 text-white' : 'border-zinc-600 text-zinc-300 hover:border-zinc-400'}`}>
                                {n} Nights ({n === 3 ? 'Fri–Mon' : 'Thu–Mon'})
                              </button>
                            ))}
                          </div>
                          {errors.nights && <p className="text-red-400 text-xs mt-1">{errors.nights}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                  {errors.packageType && <p className="text-red-400 text-xs">{errors.packageType}</p>}
                </motion.div>
              )}

              {/* STEP 2 — Occupancy */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                  <h3 className="text-white font-black text-lg uppercase mb-2">Room Occupancy</h3>
                  <p className="text-zinc-400 text-sm">Will you be sharing your room or staying solo?</p>
                  {['single', 'double'].map((occ) => {
                    const pp = PRICING[`${form.packageType}-${form.nights}-${occ}`] || 0;
                    const total = occ === 'double' ? pp * 2 : pp;
                    return (
                      <div key={occ} onClick={() => set('occupancy', occ)}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${form.occupancy === occ ? 'border-red-600 bg-red-600/10' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-500'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${form.occupancy === occ ? 'border-red-600 bg-red-600' : 'border-zinc-600'}`}>
                              {form.occupancy === occ && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <p className="text-white font-black">{occ === 'single' ? 'Single Occupancy' : 'Double Occupancy'}</p>
                              <p className="text-zinc-400 text-sm">{occ === 'single' ? 'Room for 1 — you get your own space' : 'Room for 2 — share with a travel partner'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-red-500 font-black text-lg">${pp.toLocaleString()}<span className="text-xs text-zinc-500">/pp</span></p>
                            {occ === 'double' && <p className="text-zinc-400 text-xs">${total.toLocaleString()} total</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {errors.occupancy && <p className="text-red-400 text-xs">{errors.occupancy}</p>}
                  {form.occupancy && (
                    <div className="mt-2 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      {[['Package', packageName()], ['Nights', form.nights], ['Occupancy', form.occupancy === 'double' ? 'Double' : 'Single']].map(([l, v]) => (
                        <div key={l} className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-400">{l}</span>
                          <span className="text-white font-bold">{v}</span>
                        </div>
                      ))}
                      <div className="border-t border-zinc-700 mt-2 pt-2 flex justify-between">
                        <span className="text-white font-black">Total</span>
                        <span className="text-red-500 font-black text-lg">${totalPrice().toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 3 — Guest Info */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                  <h3 className="text-white font-black text-lg uppercase">Your Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">First Name <span className="text-red-400">*</span></Label>
                      <Input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className={`mt-1 bg-zinc-800 border-zinc-700 text-white ${errors.firstName ? 'border-red-500' : ''}`} placeholder="John" />
                      <FieldError field="firstName" />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Last Name <span className="text-red-400">*</span></Label>
                      <Input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className={`mt-1 bg-zinc-800 border-zinc-700 text-white ${errors.lastName ? 'border-red-500' : ''}`} placeholder="Doe" />
                      <FieldError field="lastName" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Email <span className="text-red-400">*</span></Label>
                    <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={`mt-1 bg-zinc-800 border-zinc-700 text-white ${errors.email ? 'border-red-500' : ''}`} placeholder="you@[example.com](https://example.com)" />
                    <FieldError field="email" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Phone <span className="text-red-400">*</span></Label>
                      <div className="flex gap-2 mt-1">
                        <Select value={form.countryCode} onValueChange={(v) => set('countryCode', v)}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-24"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['+1','+44','+1-876','+1-242','+1-246','+1-868'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={`flex-1 bg-zinc-800 border-zinc-700 text-white ${errors.phone ? 'border-red-500' : ''}`} placeholder="555-000-1234" />
                      </div>
                      <FieldError field="phone" />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">T-Shirt Size <span className="text-red-400">*</span></Label>
                      <Select value={form.tshirtSize} onValueChange={(v) => set('tshirtSize', v)}>
                        <SelectTrigger className={`mt-1 bg-zinc-800 border-zinc-700 text-white ${errors.tshirtSize ? 'border-red-500' : ''}`}><SelectValue placeholder="Select size" /></SelectTrigger>
                        <SelectContent>
                          {['XS','S','M','L','XL','XXL','3XL'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FieldError field="tshirtSize" />
                    </div>
                  </div>

                  {form.occupancy === 'double' && (
                    <div className="pt-4 border-t border-zinc-800">
                      <h3 className="text-white font-black text-lg uppercase mb-4">Roommate Information</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">First Name <span className="text-red-400">*</span></Label>
                          <Input value={form.guest2FirstName} onChange={(e) => set('guest2FirstName', e.target.value)} className={`mt-1 bg-zinc-800 border-zinc-700 text-white ${errors.guest2FirstName ? 'border-red-500' : ''}`} placeholder="Jane" />
                          <FieldError field="guest2FirstName" />
                        </div>
                        <div>
                          <Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Last Name <span className="text-red-400">*</span></Label>
                          <Input value={form.guest2LastName} onChange={(e) => set('guest2LastName', e.target.value)} className={`mt-1 bg-zinc-800 border-zinc-700 text-white ${errors.guest2LastName ? 'border-red-500' : ''}`} placeholder="Doe" />
                          <FieldError field="guest2LastName" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Email <span className="text-red-400">*</span></Label>
                        <Input type="email" value={form.guest2Email} onChange={(e) => set('guest2Email', e.target.value)} className={`mt-1 bg-zinc-800 border-zinc-700 text-white ${errors.guest2Email ? 'border-red-500' : ''}`} placeholder="roommate@[example.com](https://example.com)" />
                        <FieldError field="guest2Email" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Phone <span className="text-red-400">*</span></Label>
                          <div className="flex gap-2 mt-1">
                            <Select value={form.guest2CountryCode} onValueChange={(v) => set('guest2CountryCode', v)}>
                              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white w-24"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['+1','+44','+1-876','+1-242','+1-246','+1-868'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Input type="tel" value={form.guest2Phone} onChange={(e) => set('guest2Phone', e.target.value)} className={`flex-1 bg-zinc-800 border-zinc-700 text-white ${errors.guest2Phone ? 'border-red-500' : ''}`} placeholder="555-000-5678" />
                          </div>
                          <FieldError field="guest2Phone" />
                        </div>
                        <div>
                          <Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">T-Shirt Size <span className="text-red-400">*</span></Label>
                          <Select value={form.guest2TshirtSize} onValueChange={(v) => set('guest2TshirtSize', v)}>
                            <SelectTrigger className={`mt-1 bg-zinc-800 border-zinc-700 text-white ${errors.guest2TshirtSize ? 'border-red-500' : ''}`}><SelectValue placeholder="Select size" /></SelectTrigger>
                            <SelectContent>
                              {['XS','S','M','L','XL','XXL','3XL'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FieldError field="guest2TshirtSize" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-zinc-800 space-y-3">
                    <h3 className="text-zinc-400 font-black text-xs uppercase tracking-wide">Optional Details</h3>
                    {form.occupancy === 'double' && (
                      <div>
                        <Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Bed Preference</Label>
                        <Select value={form.bedPreference} onValueChange={(v) => set('bedPreference', v)}>
                          <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="No preference" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="two-beds">Two Beds</SelectItem>
                            <SelectItem value="king">King Bed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Referred By</Label>
                      <Select value={form.referredBy} onValueChange={(v) => set('referredBy', v)}>
                        <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="How did you hear about us?" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gfx">GFX</SelectItem>
                          <SelectItem value="social-media">Social Media</SelectItem>
                          <SelectItem value="friend">Friend / Word of Mouth</SelectItem>
                          <SelectItem value="previous-attendee">Previous Attendee</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Celebrating a Birthday?</Label>
                      <Select value={form.celebratingBirthday} onValueChange={(v) => set('celebratingBirthday', v)}>
                        <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="No" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="guest1">Yes — Mine!</SelectItem>
                          {form.occupancy === 'double' && <SelectItem value="guest2">Yes — My Roommate's!</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Notes / Special Requests</Label>
                      <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
                        className="mt-1 w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 min-h-[70px] text-sm"
                        placeholder="Anything we should know?" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800">
                    <h3 className="text-zinc-400 font-black text-xs uppercase tracking-wide mb-1">Travel Information</h3>
                    <p className="text-zinc-500 text-xs mb-3">You can fill this in later if you haven't booked flights yet.</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div><Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Arrival Airline</Label><Input value={form.arrivalAirline} onChange={(e) => set('arrivalAirline', e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-white" placeholder="e.g. Delta" /></div>
                      <div><Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Arrival Date</Label><Input type="date" value={form.arrivalDate} onChange={(e) => set('arrivalDate', e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-white" /></div>
                      <div><Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Arrival Time</Label><Input type="time" value={form.arrivalTime} onChange={(e) => set('arrivalTime', e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-white" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div><Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Departure Airline</Label><Input value={form.departureAirline} onChange={(e) => set('departureAirline', e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-white" placeholder="e.g. Delta" /></div>
                      <div><Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Departure Date</Label><Input type="date" value={form.departureDate} onChange={(e) => set('departureDate', e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-white" /></div>
                      <div><Label className="text-gray-300 text-xs font-bold uppercase tracking-wide">Departure Time</Label><Input type="time" value={form.departureTime} onChange={(e) => set('departureTime', e.target.value)} className="mt-1 bg-zinc-800 border-zinc-700 text-white" /></div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 — Confirm & Pay */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                  <h3 className="text-white font-black text-lg uppercase">Confirm & Pay</h3>
                  <div className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden">
                    <div className="bg-red-600 px-4 py-2"><p className="text-white font-black text-xs uppercase tracking-widest">Booking Summary</p></div>
                    <div className="p-4 space-y-2 text-sm">
                      {[
                        ['Trip', trip?.name || 'Lost In Jamaica'],
                        ['Hotel', trip?.hotel || 'Royalton Blue Waters'],
                        ['Dates', trip ? `${trip.start_date} – ${trip.end_date}` : ''],
                        ['Package', packageName()],
                        ['Nights', form.nights],
                        ['Occupancy', form.occupancy === 'double' ? 'Double' : 'Single'],
                        ['Guest', `${form.firstName} ${form.lastName}`],
                        form.occupancy === 'double' ? ['Roommate', `${form.guest2FirstName} ${form.guest2LastName}`] : null,
                      ].filter(Boolean).map(([label, val]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-zinc-400">{label}</span>
                          <span className="text-white font-bold">{val}</span>
                        </div>
                      ))}
                      <div className="border-t border-zinc-700 pt-2 flex justify-between">
                        <span className="text-white font-black">Total Price</span>
                        <span className="text-red-500 font-black text-lg">${totalPrice().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-white font-black text-sm uppercase tracking-wide mb-3">Payment Option <span className="text-red-400">*</span></p>
                    <div className="space-y-3">
                      <div onClick={() => set('paymentOption', 'full')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${form.paymentOption === 'full' ? 'border-red-600 bg-red-600/10' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-500'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.paymentOption === 'full' ? 'border-red-600 bg-red-600' : 'border-zinc-600'}`}>
                              {form.paymentOption === 'full' && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <p className="text-white font-black">Pay in Full</p>
                              <p className="text-zinc-400 text-xs">One-time payment — done!</p>
                            </div>
                          </div>
                          <p className="text-red-500 font-black">${totalPrice().toLocaleString()}</p>
                        </div>
                      </div>

                      {isPaymentPlanAvailable() ? (
                        <div onClick={() => set('paymentOption', 'plan')}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${form.paymentOption === 'plan' ? 'border-red-600 bg-red-600/10' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-500'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.paymentOption === 'plan' ? 'border-red-600 bg-red-600' : 'border-zinc-600'}`}>
                                {form.paymentOption === 'plan' && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div>
                                <p className="text-white font-black">Installment Plan</p>
                                <p className="text-zinc-400 text-xs">Pay deposit today, rest on scheduled dates</p>
                              </div>
                            </div>
                            <p className="text-red-500 font-black">${depositAmount().toLocaleString()} <span className="text-zinc-500 text-xs">today</span></p>
                          </div>
                          {form.paymentOption === 'plan' && (
                            <div className="mt-3 pt-3 border-t border-zinc-700 space-y-1 text-xs text-zinc-400">
                              <p className="flex items-start gap-1"><Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-red-500" /> Remaining <strong className="text-white">${(totalPrice() - depositAmount()).toLocaleString()}</strong> charged automatically on scheduled dates.</p>
                              <p className="flex items-start gap-1"><Info className="w-3 h-3 mt-0.5 flex-shrink-0 text-red-500" /> All balances due by <strong className="text-white">{trip?.balance_due_date}</strong>.</p>
                              <p className="flex items-start gap-1"><AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-500" /> Failed payments incur a <strong className="text-yellow-400">$30 retry fee</strong>.</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border-2 border-zinc-800 bg-zinc-800/30 opacity-60">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-zinc-500" />
                            <div>
                              <p className="text-zinc-400 font-black">Installment Plan Unavailable</p>
                              <p className="text-zinc-500 text-xs">The payment plan deadline has passed. Full payment required.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.paymentOption && <p className="text-red-400 text-xs mt-1">{errors.paymentOption}</p>}
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 text-xs text-zinc-400 space-y-1">
                    <p className="font-bold text-zinc-300 uppercase tracking-wide text-xs mb-2">Cancellation Policy</p>
                    <p>• Deposits are <strong className="text-white">NON-REFUNDABLE</strong> but apply to your total if you attend.</p>
                    <p>• <strong className="text-white">No refund</strong> if cancelled within 60 days of trip.</p>
                    <p>• <strong className="text-white">50% refund</strong> if cancelled 90+ days before trip start.</p>
                  </div>
                  <p className="text-zinc-500 text-xs text-center">By clicking below you agree to the cancellation policy and payment terms.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-4 border-t border-zinc-800">
              <Button variant="outline" onClick={step === 1 ? onClose : handleBack} className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                <ChevronLeft className="w-4 h-4 mr-1" />{step === 1 ? 'Cancel' : 'Back'}
              </Button>
              {step < 4 ? (
                <Button onClick={handleNext} className="bg-red-600 hover:bg-red-700 text-white font-black px-8">
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white font-black px-8">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : <>Proceed to Payment <ChevronRight className="w-4 h-4 ml-1" /></>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}