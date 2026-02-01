import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import BookingWizard from '../components/BookingWizard';

export default function Packages() {
  const [showBookingWizard, setShowBookingWizard] = useState(false);
  const packages = [
    {
      name: 'Luxury Suite - 3 Nights',
      nights: '3 Nights (Friday-Monday)',
      features: [
        'DreamBed™ with high-thread-count sheets',
        'Royalton Signature rain shower',
        'King bed or 2 Queen beds',
        'In-suite Jacuzzi soaker tub',
        'Private balcony or terrace',
        'Stocked minibar with beverages',
        '24/7 room service',
        'Resort-wide high-speed Wi-Fi',
      ],
      pricing: [
        { occupancy: 'Single', price: 1455 },
        { occupancy: 'Double', price: 1100 },
      ]
    },
    {
      name: 'Luxury Suite Diamond Club - 3 Nights',
      nights: '3 Nights (Friday-Monday)',
      features: [
        'All Luxury Suite amenities',
        'Exclusive Diamond Club access',
        'Premium dining experiences',
        'VIP lounge access',
        'In-suite Jacuzzi soaker tub',
        'Priority reservations',
        'Enhanced minibar selection',
      ],
      pricing: [
        { occupancy: 'Single', price: 1650 },
        { occupancy: 'Double', price: 1230 },
      ],
      featured: true
    },
    {
      name: 'Luxury Ocean View Diamond Club - 3 Nights',
      nights: '3 Nights (Friday-Monday)',
      features: [
        'Breathtaking ocean views',
        'All Diamond Club amenities',
        'King bed or 2 Queen beds',
        'In-suite Jacuzzi soaker tub',
        'Oceanfront balcony',
        'VIP concierge service',
        'Premium beverage selection',
      ],
      pricing: [
        { occupancy: 'Single', price: 1825 },
        { occupancy: 'Double', price: 1350 },
      ],
      premium: true
    },
    {
      name: 'Luxury Suite - 4 Nights',
      nights: '4 Nights (Thursday-Monday)',
      features: [
        'DreamBed™ with high-thread-count sheets',
        'King bed or 2 Queen beds',
        'In-suite Jacuzzi soaker tub',
        'Private balcony or terrace',
        'Stocked minibar with beverages',
        '24/7 room service',
        'Resort-wide high-speed Wi-Fi',
      ],
      pricing: [
        { occupancy: 'Single', price: 1825 },
        { occupancy: 'Double', price: 1350 },
      ]
    },
    {
      name: 'Luxury Suite Diamond Club - 4 Nights',
      nights: '4 Nights (Thursday-Monday)',
      features: [
        'All Luxury Suite amenities',
        'Exclusive Diamond Club access',
        'Premium dining experiences',
        'In-suite Jacuzzi soaker tub',
        'VIP lounge access',
        'Priority reservations',
      ],
      pricing: [
        { occupancy: 'Single', price: 2100 },
        { occupancy: 'Double', price: 1500 },
      ],
      premium: true
    },
    {
      name: 'Luxury Ocean View Diamond Club - 4 Nights',
      nights: '4 Nights (Thursday-Monday)',
      features: [
        'Stunning ocean views',
        'All Diamond Club amenities',
        'King bed or 2 Queen beds',
        'In-suite Jacuzzi soaker tub',
        'Oceanfront balcony',
        'VIP concierge service',
      ],
      pricing: [
        { occupancy: 'Single', price: 2350 },
        { occupancy: 'Double', price: 1650 },
      ],
      premium: true
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/20 to-black"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter">
            CHOOSE YOUR<br />
            <span className="text-green-600">PACKAGE</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
            Premium all-inclusive suites at luxury Caribbean resorts. Every package includes full access to retreat events, excursions, and experiences.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <div className="bg-zinc-900 border border-green-600/30 rounded-lg px-6 py-3">
              <p className="text-green-500 font-black text-sm uppercase">3 or 4 Night Options</p>
            </div>
            <div className="bg-zinc-900 border border-green-600/30 rounded-lg px-6 py-3">
              <p className="text-yellow-400 font-black text-sm uppercase">Diamond Club Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section id="packages" className="px-6 py-20 bg-zinc-900">
        <div className="max-w-7xl mx-auto space-y-8">
          {packages.map((pkg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`overflow-hidden ${
                pkg.premium ? 'border-2 border-green-600 bg-gradient-to-br from-zinc-900 to-green-950/20' : 
                pkg.featured ? 'border-2 border-yellow-400/50 bg-zinc-900' : 
                'border border-zinc-800 bg-zinc-900'
              }`}>
                <CardHeader className={pkg.premium ? 'bg-red-600/10' : ''}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <CardTitle className="text-white text-2xl md:text-3xl font-black uppercase">{pkg.name}</CardTitle>
                        {pkg.premium && (
                          <span className="bg-green-600 text-white text-xs font-black px-3 py-1 rounded uppercase">
                            Premium
                          </span>
                        )}
                        {pkg.featured && (
                          <span className="bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded uppercase">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 font-medium">{pkg.nights}</p>
                      <p className="text-yellow-400 text-sm font-bold mt-1">All-Inclusive • Adults Only</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Features */}
                    <div>
                      <h4 className="text-white font-black text-lg mb-4 uppercase">Features</h4>
                      <ul className="space-y-3">
                        {pkg.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-300">
                            <Check className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pricing */}
                    <div>
                      <h4 className="text-white font-black text-lg mb-4 uppercase">Pricing</h4>
                      <div className="space-y-4">
                        {pkg.pricing.map((price, i) => (
                          <div key={i} className="flex items-center justify-between bg-black/50 p-4 rounded-lg border border-zinc-800">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-yellow-400" />
                              <span className="text-gray-300 font-medium">{price.occupancy}</span>
                            </div>
                            <span className="text-white font-black text-xl">${price.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <Button 
                      onClick={() => setShowBookingWizard(true)}
                      className={`w-full font-black py-6 text-lg uppercase tracking-wide ${
                        pkg.premium ? 'bg-green-600 hover:bg-green-700' : 'bg-zinc-800 hover:bg-zinc-700'
                      } text-white`}
                    >
                      Book This Package
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            SECURE YOUR <span className="text-yellow-400">SPOT</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Don't miss out on the experience of a lifetime. Register now for Lost in Jamaica 2026.
          </p>
          <Button 
            onClick={() => setShowBookingWizard(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-black px-12 py-7 text-xl rounded uppercase tracking-wider shadow-2xl hover:shadow-green-600/50"
          >
            Start Booking
          </Button>
        </div>
      </section>

      {/* Booking Wizard Modal */}
      {showBookingWizard && (
        <BookingWizard onClose={() => setShowBookingWizard(false)} />
      )}
    </div>
  );
}