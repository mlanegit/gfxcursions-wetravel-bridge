import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Send, Instagram } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    package: 'junior-suite',
    guests: '2',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await base44.entities.Booking.create(formData);
      toast.success('Registration submitted! We\'ll contact you with next steps.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        package: 'junior-suite',
        guests: '2',
        message: ''
      });
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter">
            BOOK YOUR<br />
            <span className="text-green-600">SPOT</span>
          </h1>
          <p className="text-xl text-gray-300">
            Registration for 2026 is now open. Secure your spot before we sell out.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="bg-zinc-900 border-green-600/30 shadow-2xl">
            <CardHeader className="border-b border-zinc-800">
              <CardTitle className="text-white text-3xl font-black uppercase">Registration Form</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white mb-2 block font-bold uppercase text-xs">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="bg-black border-zinc-800 text-white placeholder:text-gray-600 focus:border-green-600"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white mb-2 block font-bold uppercase text-xs">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="bg-black border-zinc-800 text-white placeholder:text-gray-600 focus:border-green-600"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white mb-2 block font-bold uppercase text-xs">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-black border-zinc-800 text-white placeholder:text-gray-600 focus:border-green-600"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="package" className="text-white mb-2 block font-bold uppercase text-xs">Room Package</Label>
                  <Select
                    value={formData.package}
                    onValueChange={(value) => setFormData({...formData, package: value})}
                  >
                    <SelectTrigger className="bg-black border-zinc-800 text-white focus:border-red-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior-suite">Junior Suite</SelectItem>
                      <SelectItem value="one-bed-ocean">One Bedroom Ocean View</SelectItem>
                      <SelectItem value="one-bed-penthouse">One Bedroom Penthouse</SelectItem>
                      <SelectItem value="two-bed-ocean">Two Bedroom Ocean View</SelectItem>
                      <SelectItem value="two-bed-oceanfront">Two Bedroom Oceanfront</SelectItem>
                      <SelectItem value="three-bed">Three Bedroom Oceanfront</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="guests" className="text-white mb-2 block font-bold uppercase text-xs">Number of Guests</Label>
                  <Select
                    value={formData.guests}
                    onValueChange={(value) => setFormData({...formData, guests: value})}
                  >
                    <SelectTrigger className="bg-black border-zinc-800 text-white focus:border-red-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Guest</SelectItem>
                      <SelectItem value="2">2 Guests</SelectItem>
                      <SelectItem value="3">3 Guests</SelectItem>
                      <SelectItem value="4">4 Guests</SelectItem>
                      <SelectItem value="5">5 Guests</SelectItem>
                      <SelectItem value="6">6 Guests</SelectItem>
                      <SelectItem value="8">8 Guests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message" className="text-white mb-2 block font-bold uppercase text-xs">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-black border-zinc-800 text-white placeholder:text-gray-600 h-32 focus:border-red-600"
                    placeholder="Any questions or special requests?"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-6 text-lg uppercase tracking-wide shadow-xl"
                >
                  {isSubmitting ? 'Submitting...' : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Register Now
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="bg-zinc-900 border-green-600/30 shadow-2xl">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="font-black text-lg mb-1 uppercase">Email</h3>
                    <p className="text-gray-400">info@lostinjamaica.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-green-600/30 shadow-2xl">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="font-black text-lg mb-1 uppercase">Phone</h3>
                    <p className="text-gray-400">+1 (876) 555-0123</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-green-600/30 shadow-2xl">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="font-black text-lg mb-1 uppercase">Social</h3>
                    <p className="text-gray-400">@lostinjamaica</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Info */}
            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-800 shadow-2xl">
              <CardContent className="pt-6">
                <h3 className="font-black text-2xl text-white mb-3 uppercase">Limited Spots</h3>
                <p className="text-white/90 mb-4">
                  This exclusive retreat sells out every year. Register early to guarantee your spot.
                </p>
                <ul className="space-y-2 text-white text-sm font-medium">
                  <li>✓ Payment plans available</li>
                  <li>✓ Group rates for 4+ guests</li>
                  <li>✓ Direct flights from major cities</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}