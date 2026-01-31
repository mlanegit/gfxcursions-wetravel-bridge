import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Music, Sunrise, Sunset, Moon, Waves, UtensilsCrossed, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Events() {
  const events = [
    {
      day: 'Day 1',
      title: 'Arrival & Welcome',
      icon: Sunset,
      activities: [
        { time: '3:00 PM', name: 'Check-in & Resort Orientation', type: 'arrival' },
        { time: '6:00 PM', name: 'Welcome Reception', type: 'social' },
        { time: '8:00 PM', name: 'Sunset Dinner on the Beach', type: 'dining' },
        { time: '10:00 PM', name: 'DJ Set & Opening Night Party', type: 'party' },
      ]
    },
    {
      day: 'Day 2',
      title: 'Adventure & Wellness',
      icon: Waves,
      activities: [
        { time: '8:00 AM', name: 'Sunrise Yoga & Meditation', type: 'wellness' },
        { time: '10:00 AM', name: 'Boat Day Excursion', type: 'adventure' },
        { time: '2:00 PM', name: 'Beach BBQ & Day Party', type: 'social' },
        { time: '8:00 PM', name: 'Caribbean Dinner Experience', type: 'dining' },
        { time: '11:00 PM', name: 'Night Pool Party with Celebrity DJ', type: 'party' },
      ]
    },
    {
      day: 'Day 3',
      title: 'Culture & Relaxation',
      icon: Dumbbell,
      activities: [
        { time: '9:00 AM', name: 'Wellness Workshop', type: 'wellness' },
        { time: '11:00 AM', name: 'Free Time / Spa Services', type: 'leisure' },
        { time: '3:00 PM', name: 'Cultural Excursion & Sightseeing', type: 'adventure' },
        { time: '7:00 PM', name: 'Themed Dinner Night', type: 'dining' },
        { time: '10:00 PM', name: 'Beach Bonfire & Live Entertainment', type: 'social' },
      ]
    },
    {
      day: 'Day 4',
      title: 'All Out Party Day',
      icon: Music,
      activities: [
        { time: '10:00 AM', name: 'Brunch & Mimosas', type: 'dining' },
        { time: '1:00 PM', name: 'Pool Tournament & Games', type: 'social' },
        { time: '4:00 PM', name: 'Sunset Cruise', type: 'adventure' },
        { time: '8:00 PM', name: 'VIP Gala Dinner', type: 'dining' },
        { time: '11:00 PM', name: 'All White Party with Special Guests', type: 'party' },
      ]
    },
    {
      day: 'Day 5',
      title: 'Farewell',
      icon: Sunrise,
      activities: [
        { time: '8:00 AM', name: 'Farewell Breakfast', type: 'dining' },
        { time: '10:00 AM', name: 'Final Beach Moments', type: 'leisure' },
        { time: '12:00 PM', name: 'Check-out & Airport Transfer', type: 'departure' },
      ]
    },
  ];

  const typeColors = {
    arrival: 'bg-blue-600',
    social: 'bg-purple-600',
    dining: 'bg-orange-600',
    party: 'bg-red-600',
    wellness: 'bg-green-600',
    adventure: 'bg-cyan-600',
    leisure: 'bg-pink-600',
    departure: 'bg-gray-600',
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-red-600/20 to-black">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter">
            THE <span className="text-yellow-400">EXPERIENCE</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            5 days of curated events, celebrity entertainment, wellness sessions, and unforgettable moments
          </p>
        </div>
      </section>

      {/* Events Timeline */}
      <section className="px-6 py-20 bg-zinc-900">
        <div className="max-w-5xl mx-auto space-y-12">
          {events.map((event, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
            >
              <Card className="bg-black border-green-600/30 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-600 to-green-700">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <event.icon className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-white/80 font-bold text-sm uppercase tracking-wider">{event.day}</p>
                      <CardTitle className="text-white text-2xl font-black uppercase">{event.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {event.activities.map((activity, i) => (
                      <div key={i} className="flex items-center gap-4 pb-4 border-b border-zinc-800 last:border-0">
                        <div className="bg-zinc-900 px-4 py-2 rounded font-bold text-yellow-400 text-sm min-w-[100px] text-center border border-zinc-800">
                          {activity.time}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-bold text-lg">{activity.name}</p>
                        </div>
                        <Badge className={`${typeColors[activity.type]} text-white font-bold uppercase text-xs`}>
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="px-6 py-20 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-12 tracking-tight">
            EVENT <span className="text-yellow-400">HIGHLIGHTS</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Celebrity DJs', desc: 'Top DJs from NYC & ATL spinning all weekend', icon: Music },
              { title: 'Wellness Programs', desc: 'Yoga, meditation, and fitness sessions', icon: Dumbbell },
              { title: 'Gourmet Dining', desc: 'Multiple themed dinner experiences', icon: UtensilsCrossed },
              { title: 'Boat Day', desc: 'Private boat excursion with open bar', icon: Waves },
              { title: 'All White Party', desc: 'VIP gala with special guest performers', icon: Moon },
              { title: 'Beach Sessions', desc: 'Daily beach parties and activities', icon: Sunset },
            ].map((highlight, idx) => (
              <Card key={idx} className="bg-zinc-900 border-green-600/30 hover:border-green-600 transition-all group">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="bg-green-600 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <highlight.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-black text-xl mb-2 uppercase">{highlight.title}</h3>
                  <p className="text-gray-400">{highlight.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}