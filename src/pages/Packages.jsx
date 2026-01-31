import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Packages() {
  const packages = [
    {
      name: 'Junior Suite',
      size: '646 sq ft',
      features: ['King bed or 2 queen beds', 'Sofa bed', 'Furnished balcony', 'Kitchen amenities', 'Premium toiletries'],
      pricing: [
        { occupancy: 'Single', price: 2100 },
        { occupancy: 'Double', price: 1800 },
        { occupancy: 'Triple', price: 1733 },
      ]
    },
    {
      name: 'One Bedroom Ocean View',
      size: '872 sq ft',
      features: ['King bed', 'Sofa bed', 'Dining area', 'Private balcony', 'Select ocean views', 'Full kitchen'],
      pricing: [
        { occupancy: 'Single', price: 2500 },
        { occupancy: 'Double', price: 2075 },
        { occupancy: 'Triple', price: 1916 },
      ],
      featured: true
    },
    {
      name: 'One Bedroom Penthouse',
      size: '1,593 sq ft',
      features: ['2 floors', 'Private rooftop', 'Whirlpool hot tub', 'BBQ area', 'Panoramic ocean views', 'Luxury amenities'],
      pricing: [
        { occupancy: 'Single', price: 2900 },
        { occupancy: 'Double', price: 2350 },
        { occupancy: 'Triple', price: 2100 },
      ],
      premium: true
    },
    {
      name: 'Two Bedroom Ocean View',
      size: '1,421 sq ft',
      features: ['1 King master bedroom', '1 bedroom with 2 queen beds', 'Private balcony with hot tub', 'Full kitchen', 'Ocean views'],
      pricing: [
        { occupancy: 'Double', price: 2650 },
        { occupancy: '4 Guests', price: 1925 },
        { occupancy: '5 Guests', price: 1860 },
        { occupancy: '6 Guests', price: 1816 },
      ]
    },
    {
      name: 'Two Bedroom Oceanfront',
      size: '1,421 sq ft',
      features: ['Full oceanfront views', 'Expansive balcony with hot tub', '1 King master bedroom', '1 bedroom with 2 queen beds', 'Full kitchen'],
      pricing: [
        { occupancy: 'Double', price: 3150 },
        { occupancy: '4 Guests', price: 2175 },
        { occupancy: '5 Guests', price: 2060 },
        { occupancy: '6 Guests', price: 1983 },
      ],
      premium: true
    },
    {
      name: 'Three Bedroom Oceanfront',
      size: '2,303 sq ft',
      features: ['3 bedrooms', 'Private balcony with hot tub', '1 King master bedroom', '2 rooms with 2 queen beds', 'Full kitchen', 'Premium oceanfront'],
      pricing: [
        { occupancy: 'Triple', price: 2967 },
        { occupancy: '4 Guests', price: 2525 },
        { occupancy: '6 Guests', price: 2083 },
        { occupancy: '8 Guests', price: 1962 },
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
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Premium oceanfront suites with all-inclusive amenities. Every package includes full access to retreat events and experiences.
          </p>
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
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-white text-3xl font-black uppercase">{pkg.name}</CardTitle>
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
                      <p className="text-gray-400 font-medium">{pkg.size}</p>
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
                    <Link to={createPageUrl('Contact')}>
                      <Button className={`w-full font-black py-6 text-lg uppercase tracking-wide ${
                        pkg.premium ? 'bg-green-600 hover:bg-green-700' : 'bg-zinc-800 hover:bg-zinc-700'
                      } text-white`}>
                        Select This Package
                      </Button>
                    </Link>
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
          <Link to={createPageUrl('Contact')}>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-black px-12 py-7 text-xl rounded uppercase tracking-wider shadow-2xl hover:shadow-green-600/50">
              Book Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}