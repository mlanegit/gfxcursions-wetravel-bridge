import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Calendar, MapPin, Users, Music, Palmtree, Camera, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-6 py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <div className="text-white space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              Lost in<br />Jamaica
            </h1>
            <p className="text-xl text-green-100 leading-relaxed">
              Join us on this beautiful island filled with breathtaking mountains, waterfalls, illustrious beaches and culinary delights
            </p>
            
            {/* Info Pills */}
            <div className="flex flex-wrap gap-3 pt-4">
              <div className="flex items-center gap-2 bg-green-700/40 backdrop-blur-sm border border-green-500/30 rounded-full px-4 py-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">4 or 5 Days</span>
              </div>
              <div className="flex items-center gap-2 bg-green-700/40 backdrop-blur-sm border border-green-500/30 rounded-full px-4 py-2">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">St. Lucia</span>
              </div>
              <div className="flex items-center gap-2 bg-green-700/40 backdrop-blur-sm border border-green-500/30 rounded-full px-4 py-2">
                <Users className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Limited Spots</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to={createPageUrl('Contact')}>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-6 text-lg rounded-lg shadow-xl hover:shadow-2xl transition-all">
                  Reserve Your Spot
                </Button>
              </Link>
              <Link to={createPageUrl('Gallery')}>
                <Button variant="outline" className="border-2 border-green-400 text-white hover:bg-green-700/30 font-bold px-8 py-6 text-lg rounded-lg backdrop-blur-sm">
                  View Gallery
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-yellow-400">
              <img 
                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop" 
                alt="Beautiful beach sunset in Jamaica"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 bg-gradient-to-b from-transparent to-green-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Breathtaking Mountains */}
            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500/50 shadow-xl hover:shadow-2xl transition-all">
              <CardHeader>
                <div className="bg-yellow-400 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                  <Music className="w-7 h-7 text-green-900" />
                </div>
                <CardTitle className="text-white text-2xl">Breathtaking Mountains</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-100">Explore stunning volcanic peaks and lush landscapes</p>
              </CardContent>
            </Card>

            {/* Pristine Beaches */}
            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500/50 shadow-xl hover:shadow-2xl transition-all">
              <CardHeader>
                <div className="bg-yellow-400 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                  <Palmtree className="w-7 h-7 text-green-900" />
                </div>
                <CardTitle className="text-white text-2xl">Pristine Beaches</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-100">Relax on illustrious shores of St. Lucia</p>
              </CardContent>
            </Card>

            {/* Culinary Delights */}
            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500/50 shadow-xl hover:shadow-2xl transition-all">
              <CardHeader>
                <div className="bg-yellow-400 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                  <Camera className="w-7 h-7 text-green-900" />
                </div>
                <CardTitle className="text-white text-2xl">Culinary Delights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-100">Experience world-class dining and local cuisine</p>
              </CardContent>
            </Card>

            {/* Community Vibes */}
            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500/50 shadow-xl hover:shadow-2xl transition-all">
              <CardHeader>
                <div className="bg-yellow-400 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-green-900" />
                </div>
                <CardTitle className="text-white text-2xl">Community Vibes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-100">Connect with like-minded travelers and adventurers</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center text-white space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">About This Trip</h2>
          <div className="space-y-4 text-lg text-green-100 leading-relaxed">
            <p>
              Last year we found ourselves "Lost In" A. This year we hope you are ready for the sequel. 
              This year we find ourselves getting "Lost IN" St. Lucia!
            </p>
            <p>
              We invite you to join us as we get "Lost in Jamaica" - a beautiful island filled with 
              breathtaking mountains, waterfalls, illustrious beaches and culinary delights.
            </p>
            <p>
              This year we decided to do something new. We heard your requests, so we're adding a night! 
              You now have the option of either <strong className="text-yellow-400">4 Days and 3 Nights</strong> or{' '}
              <strong className="text-yellow-400">5 Days and 4 Nights</strong>. We also have an amazing optional excursion day lined up!
            </p>
            <p>
              Take a boat ride with astonishing views of the Piton Mountains, walk the beautiful waterfalls, 
              take a world-famous mud bath and soak in the hot springs.
            </p>
          </div>
        </div>
      </section>

      {/* Resort Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-green-950/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Your Home Away From Home</h2>
            <p className="text-2xl text-yellow-400 font-semibold mb-2">Royalton Negril - The Best of Both Worlds!</p>
            <p className="text-lg text-green-100 max-w-3xl mx-auto">
              Enjoy exclusive Adults-Only amenities while having full access to nearby family-friendly resorts, 
              combining relaxation and entertainment for a unique getaway. Why settle for one vibe when you can have both!
            </p>
          </div>

          {/* Resort Images */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=500&h=300&fit=crop" 
                alt="Resort beachfront"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop" 
                alt="Resort pool"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&fit=crop" 
                alt="Fine dining"
                className="w-full h-64 object-cover"
              />
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Gourmet Dining</h3>
                <p className="text-sm text-green-100">Multiple à la carte restaurants featuring international and Caribbean cuisine</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Swim-Up Bar</h3>
                <p className="text-sm text-green-100">Refreshing cocktails and drinks while enjoying the pool</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Water Sports</h3>
                <p className="text-sm text-green-100">Snorkeling, paddleboarding, kayaking, and more</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Spa & Wellness</h3>
                <p className="text-sm text-green-100">Full-service spa with massages and relaxation treatments</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Nightly Entertainment</h3>
                <p className="text-sm text-green-100">Live music, shows, and themed events throughout your stay</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg mb-2">Beachfront Access</h3>
                <p className="text-sm text-green-100">Private beach with pristine sand and crystal-clear waters</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Included/Not Included */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl">What's Included</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white">
              <div>
                <h4 className="font-semibold text-lg text-yellow-400">Airport Shuttle</h4>
                <p className="text-green-100">Transportation to and from the airport</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg text-yellow-400">All Weekend Events</h4>
                <p className="text-green-100">Guests entry to all weekend events</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg text-yellow-400">All-Inclusive Accommodations</h4>
                <p className="text-green-100">Room packages with full amenities</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl">What's Not Included</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white">
              <div>
                <h4 className="font-semibold text-lg text-yellow-400">Flights</h4>
                <p className="text-green-100">Flights not included</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg text-yellow-400">Travel Insurance</h4>
                <p className="text-green-100">Travel insurance not included</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg text-yellow-400">Optional Excursions</h4>
                <p className="text-green-100">Optional group excursion available at additional cost</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What Awaits Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-green-950/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">What Awaits You</h2>
          <p className="text-xl text-green-100 text-center mb-12">
            Unforgettable experiences and adventures await on this beautiful Caribbean island
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1580721958134-2bfb8c6bb8da?w=500&h=300&fit=crop" 
                  alt="Waterfalls"
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">Waterfalls & Mud Baths</h3>
                <p className="text-green-100">Walk beautiful waterfalls, take a world-famous mud bath, and soak in hot springs</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop" 
                  alt="Boat ride"
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">Scenic Boat Rides</h3>
                <p className="text-green-100">Experience astonishing views of the Piton Mountains from the water</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&h=300&fit=crop" 
                  alt="Resort"
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">Adults-Only Resort</h3>
                <p className="text-green-100">Exclusive amenities with access to nearby family-friendly resorts for the best of both worlds</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center text-white space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to Get Lost?</h2>
          <p className="text-xl text-green-100">
            Spaces are limited for this exclusive retreat. Secure your spot today and prepare for the adventure of a lifetime.
          </p>
          <Link to={createPageUrl('Contact')}>
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-10 py-6 text-xl rounded-lg shadow-xl hover:shadow-2xl transition-all mt-6">
              Book Your Experience
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}