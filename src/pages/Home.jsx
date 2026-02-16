import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, Users, Music, Waves, Gift, Bus, Star } from 'lucide-react';
import BookingWizard from '../components/BookingWizard';

export default function Home() {
  const [showBookingWizard, setShowBookingWizard] = useState(false);
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });
  
  const highlights = [
    { icon: Calendar, text: '5 Days / 4 Nights' },
    { icon: Music, text: 'Celebrity DJs & Hosts' },
    { icon: Waves, text: 'Boat Day Excursion' },
    { icon: Gift, text: '$400 Amenities Credit' },
    { icon: Bus, text: 'Event Transportation' },
    { icon: Star, text: 'VIP Wellness Sessions' },
  ];

  const previousTripImages = [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop',
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Previous Trips Banner */}
      <section className="bg-zinc-900 py-8 border-b border-green-600/30">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-white font-black text-center mb-4 text-lg uppercase tracking-wide">
            Previous <span className="text-yellow-400">Lost In</span> Retreats
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {previousTripImages.map((img, idx) => (
              <div key={idx} className="relative overflow-hidden rounded aspect-square group">
                <img 
                  src={img} 
                  alt={`Previous trip ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative">
        {user?.role === "admin" && (
          <div className="absolute top-6 right-6 z-20">
            <Button
              onClick={() => window.location.href = createPageUrl('AdminDashboard')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase"
            >
              Admin
            </Button>
          </div>
        )}
        
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1920&h=1080&fit=crop" 
            alt="Luxury resort beach"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-red-600/30 via-black/50 to-black"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl md:text-9xl font-black text-white mb-4 tracking-tighter">
              LOST IN<br />
              <span className="text-green-600">JAMAICA</span>
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-yellow-400 mb-3 tracking-wide">
              RETREAT 2026
            </p>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Presented by GFX
            </p>
            <Button 
              onClick={() => setShowBookingWizard(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-black px-12 py-7 text-xl rounded uppercase tracking-wider shadow-2xl hover:shadow-green-600/50 transition-all"
            >
              Register Now
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Quick Nav Bar */}
      <section className="sticky top-16 z-40 bg-green-600 border-y border-green-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-center gap-8 flex-wrap">
            <a href="#whats-included" className="text-white font-bold uppercase text-sm hover:text-black transition-colors">
              What's Included
            </a>
            <a href="#packages" className="text-white font-bold uppercase text-sm hover:text-black transition-colors">
              Packages
            </a>
            <a href="#events" className="text-white font-bold uppercase text-sm hover:text-black transition-colors">
              Events
            </a>
            <a href="#location" className="text-white font-bold uppercase text-sm hover:text-black transition-colors">
              Location
            </a>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section id="whats-included" className="px-6 py-20 bg-gradient-to-b from-black to-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-white text-center mb-16 tracking-tight">
            WHAT'S <span className="text-yellow-400">INCLUDED</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {highlights.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-zinc-900 border-green-600/30 hover:border-green-600 transition-all group">
                  <CardContent className="pt-8 pb-6 text-center">
                    <div className="bg-green-600 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white font-bold text-lg">{item.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <Card className="bg-green-600 border-green-700">
              <CardContent className="pt-6">
                <h3 className="text-white font-black text-xl mb-3 uppercase">All-Inclusive</h3>
                <ul className="text-white space-y-2">
                  <li>✓ Unlimited food & drinks at resort</li>
                  <li>✓ 5 days of curated events</li>
                  <li>✓ Wellness & fitness sessions</li>
                  <li>✓ Gift bags & welcome package</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-green-600 border-green-700">
              <CardContent className="pt-6">
                <h3 className="text-white font-black text-xl mb-3 uppercase">VIP Experience</h3>
                <ul className="text-white space-y-2">
                  <li>✓ Celebrity DJs & special guests</li>
                  <li>✓ Sightseeing & excursions</li>
                  <li>✓ Private boat day experience</li>
                  <li>✓ Transportation to all events</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Video/Image Showcase */}
      <section className="px-6 py-20 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative rounded-xl overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop" 
                alt="Resort pool party"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                <h3 className="text-white font-black text-2xl">POOL PARTIES</h3>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop" 
                alt="Beach vibes"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                <h3 className="text-white font-black text-2xl">BEACH SESSIONS</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-white text-center mb-4 tracking-tight">
            WHAT TRAVELERS <span className="text-yellow-400">SAY</span>
          </h2>
          <p className="text-center text-gray-400 mb-12 text-lg">From previous Lost in St. Lucia retreats</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-black border-green-600/30">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">
                  "This was an amazing experience! The resort was beautiful, the events were well organized, and I met so many wonderful people. Already planning to come back next year!"
                </p>
                <p className="text-white font-bold">- Traveler Review</p>
              </CardContent>
            </Card>

            <Card className="bg-black border-green-600/30">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">
                  "Best group trip I've ever been on! The all-inclusive setup was perfect, the boat day was incredible, and the nightlife was unmatched. GFX knows how to throw a retreat!"
                </p>
                <p className="text-white font-bold">- Traveler Review</p>
              </CardContent>
            </Card>

            <Card className="bg-black border-green-600/30">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">
                  "From the moment we arrived until we left, everything was top tier. The food, entertainment, excursions - all exceeded expectations. Can't wait for Jamaica!"
                </p>
                <p className="text-white font-bold">- Traveler Review</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-3 bg-black border border-green-600/30 rounded-lg px-8 py-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-left">
                <p className="text-white font-black text-2xl">5.0 Rating</p>
                <p className="text-gray-400 text-sm">Based on 43+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-zinc-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            READY TO GET <span className="text-yellow-400">LOST?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Limited spots available. Lock in your spot before it's too late.
          </p>
          <Button 
            onClick={() => setShowBookingWizard(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-black px-16 py-8 text-2xl rounded uppercase tracking-wider shadow-2xl hover:shadow-green-600/50 transition-all"
          >
            Book Now for 2026
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