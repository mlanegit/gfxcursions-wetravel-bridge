import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Utensils, Waves, Mountain, Sparkles, Music, Coffee } from 'lucide-react';

export default function Experience() {
  return (
    <div className="min-h-screen px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">The Experience</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Immerse yourself in the vibrant culture, stunning nature, and luxurious amenities of St. Lucia
          </p>
        </div>

        {/* Daily Itinerary */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Sample Itinerary</h2>
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-yellow-400" />
                  Day 1 - Arrival
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-100 space-y-2">
                <p>• Airport pickup and transfer to resort</p>
                <p>• Check-in and welcome reception</p>
                <p>• Sunset dinner on the beach</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-3">
                  <Mountain className="w-6 h-6 text-yellow-400" />
                  Day 2 - Adventure Day
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-100 space-y-2">
                <p>• Piton Mountains boat tour</p>
                <p>• Waterfall hiking and swimming</p>
                <p>• Traditional Jamaican lunch</p>
                <p>• Evening at resort with live entertainment</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  Day 3 - Relaxation & Culture
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-100 space-y-2">
                <p>• Mud bath and hot springs experience</p>
                <p>• Spa treatments and wellness activities</p>
                <p>• Gourmet dinner experience</p>
                <p>• Beach bonfire and stargazing</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-3">
                  <Waves className="w-6 h-6 text-yellow-400" />
                  Day 4 - Beach Day
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-100 space-y-2">
                <p>• Water sports and beach activities</p>
                <p>• Poolside cocktails and relaxation</p>
                <p>• Farewell dinner celebration</p>
                <p>• Optional: Extend for Day 5!</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Activities & Amenities</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: Utensils, title: 'Fine Dining', desc: '10+ restaurants' },
              { icon: Waves, title: 'Water Sports', desc: 'All inclusive' },
              { icon: Music, title: 'Live Music', desc: 'Every night' },
              { icon: Coffee, title: 'Beach Bars', desc: 'Premium drinks' },
              { icon: Sparkles, title: 'Spa Services', desc: 'World class' },
              { icon: Mountain, title: 'Excursions', desc: 'Guided tours' },
              { icon: Calendar, title: 'Events', desc: 'Special activities' },
              { icon: MapPin, title: 'Explore', desc: 'Local culture' },
            ].map((item, idx) => (
              <Card key={idx} className="bg-gradient-to-br from-green-600 to-green-700 border-green-500/50 text-white hover:scale-105 transition-transform">
                <CardContent className="pt-6 text-center">
                  <item.icon className="w-10 h-10 mx-auto mb-3 text-yellow-400" />
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-green-100">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}