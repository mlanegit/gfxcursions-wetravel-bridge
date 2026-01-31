import React from 'react';
import { motion } from 'framer-motion';

export default function Gallery() {
  const images = [
    {
      url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      title: 'Pool Parties',
      category: 'Events'
    },
    {
      url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
      title: 'Beach Sessions',
      category: 'Lifestyle'
    },
    {
      url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=600&fit=crop',
      title: 'Oceanfront Luxury',
      category: 'Resort'
    },
    {
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
      title: 'Island Vibes',
      category: 'Beach'
    },
    {
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
      title: 'Fine Dining',
      category: 'Culinary'
    },
    {
      url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
      title: 'Sunset Views',
      category: 'Resort'
    },
    {
      url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      title: 'Paradise Found',
      category: 'Beach'
    },
    {
      url: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&h=600&fit=crop',
      title: 'Tropical Nights',
      category: 'Lifestyle'
    },
    {
      url: 'https://images.unsplash.com/photo-1580721958134-2bfb8c6bb8da?w=800&h=600&fit=crop',
      title: 'Adventure Awaits',
      category: 'Excursions'
    },
    {
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      title: 'Luxury Living',
      category: 'Resort'
    },
    {
      url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
      title: 'Beach Bliss',
      category: 'Beach'
    },
    {
      url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
      title: 'Pool Paradise',
      category: 'Resort'
    },
  ];

  return (
    <div className="min-h-screen bg-black px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter">
            THE <span className="text-yellow-400">GALLERY</span>
          </h1>
          <p className="text-xl text-gray-300">
            Relive the moments from Lost in Jamaica retreats
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {images.map((image, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative overflow-hidden rounded-lg cursor-pointer"
            >
              <img 
                src={image.url} 
                alt={image.title}
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div className="text-white">
                  <p className="text-sm text-yellow-400 font-black mb-1 uppercase tracking-wide">{image.category}</p>
                  <h3 className="text-2xl font-black uppercase">{image.title}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Banner */}
        <div className="mt-20 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-12 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase">
            Share The Vibe
          </h2>
          <p className="text-xl text-white/90 mb-6">
            Tag us in your photos @lostinjamaica for a chance to be featured
          </p>
          <div className="inline-block bg-black text-yellow-400 font-black px-10 py-4 rounded text-2xl tracking-wider uppercase">
            #LostInJamaica2026
          </div>
        </div>
      </div>
    </div>
  );
}