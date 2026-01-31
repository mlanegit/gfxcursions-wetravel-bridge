import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Calendar, Users, Music, Waves, Gift, Bus, Palmtree, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function Home() {
  const highlights = [
    { icon: Calendar, text: '5 Days / 4 Nights' },
    { icon: Music, text: 'Celebrity DJs & Hosts' },
    { icon: Waves, text: 'Boat Day Excursion' },
    { icon: Gift, text: '$400 Amenities Credit' },
    { icon: Bus, text: 'Event Transportation' },
    { icon: Star, text: 'VIP Wellness Sessions' },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
            <Link to={createPageUrl('Contact')}>
              <Button className="bg-green-600 hover:bg-green-700 text-white font-black px-12 py-7 text-xl rounded uppercase tracking-wider shadow-2xl hover:shadow-green-600/50 transition-all">
                Register Now
              </Button>
            </Link>
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

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-zinc-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            READY TO GET <span className="text-yellow-400">LOST?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Limited spots available. Lock in your spot before it's too late.
          </p>
          <Link to={createPageUrl('Contact')}>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-black px-16 py-8 text-2xl rounded uppercase tracking-wider shadow-2xl hover:shadow-green-600/50 transition-all">
              Book Now for 2026
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}