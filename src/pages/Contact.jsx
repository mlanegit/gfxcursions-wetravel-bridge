import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    package: '4days',
    guests: '2',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await base44.entities.Booking.create(formData);
      toast.success('Booking request submitted! We\'ll contact you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        package: '4days',
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
    <div className="min-h-screen px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-green-100">
            Ready to book your adventure? Fill out the form below and we'll get back to you shortly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Book Your Spot</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white mb-2 block">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder:text-green-200"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="bg-white/20 border-white/30 text-white placeholder:text-green-200"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white mb-2 block">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-white/20 border-white/30 text-white placeholder:text-green-200"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="package" className="text-white mb-2 block">Package Selection</Label>
                  <Select
                    value={formData.package}
                    onValueChange={(value) => setFormData({...formData, package: value})}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4days">4 Days / 3 Nights</SelectItem>
                      <SelectItem value="5days">5 Days / 4 Nights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="guests" className="text-white mb-2 block">Number of Guests</Label>
                  <Select
                    value={formData.guests}
                    onValueChange={(value) => setFormData({...formData, guests: value})}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Guest</SelectItem>
                      <SelectItem value="2">2 Guests</SelectItem>
                      <SelectItem value="3">3 Guests</SelectItem>
                      <SelectItem value="4">4 Guests</SelectItem>
                      <SelectItem value="5+">5+ Guests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message" className="text-white mb-2 block">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-white/20 border-white/30 text-white placeholder:text-green-200 h-32"
                    placeholder="Any questions or special requests?"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-6 text-lg rounded-lg shadow-xl"
                >
                  {isSubmitting ? 'Submitting...' : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Reserve Your Spot
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-400 p-3 rounded-xl">
                    <Mail className="w-6 h-6 text-green-900" />
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold text-lg mb-1">Email Us</h3>
                    <p className="text-green-100">info@lostinjamaica.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-400 p-3 rounded-xl">
                    <Phone className="w-6 h-6 text-green-900" />
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold text-lg mb-1">Call Us</h3>
                    <p className="text-green-100">+1 (876) 555-0123</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-yellow-400 p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-green-900" />
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold text-lg mb-1">Location</h3>
                    <p className="text-green-100">St. Lucia, Caribbean</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Info */}
            <Card className="bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-600 shadow-2xl">
              <CardContent className="pt-6">
                <h3 className="font-bold text-xl text-green-900 mb-3">Limited Availability</h3>
                <p className="text-green-800 mb-4">
                  Spaces are filling up fast! Book now to secure your spot for this exclusive retreat.
                </p>
                <ul className="space-y-2 text-green-900 text-sm">
                  <li>✓ Early bird pricing available</li>
                  <li>✓ Group discounts for 4+ guests</li>
                  <li>✓ Payment plans accepted</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}