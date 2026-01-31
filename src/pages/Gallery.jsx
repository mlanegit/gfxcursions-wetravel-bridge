import React from 'react';
import { motion } from 'framer-motion';

export default function Gallery() {
  const images = [
    {
      url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      title: 'Sunset Paradise',
      category: 'Beach'
    },
    {
      url: 'https://images.unsplash.com/photo-1580721958134-2bfb8c6bb8da?w=800&h=600&fit=crop',
      title: 'Mountain Waterfalls',
      category: 'Nature'
    },
    {
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
      title: 'Crystal Waters',
      category: 'Beach'
    },
    {
      url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=600&fit=crop',
      title: 'Beachfront Relaxation',
      category: 'Resort'
    },
    {
      url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      title: 'Luxury Pool',
      category: 'Resort'
    },
    {
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
      title: 'Culinary Excellence',
      category: 'Dining'
    },
    {
      url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
      title: 'Resort Views',
      category: 'Resort'
    },
    {
      url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
      title: 'Caribbean Vibes',
      category: 'Culture'
    },
    {
      url: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&h=600&fit=crop',
      title: 'Tropical Paradise',
      category: 'Nature'
    },
  ];

  return (
    <div className="min-h-screen px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Gallery</h1>
          <p className="text-xl text-green-100">
            Get a glimpse of the unforgettable experiences that await you
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {images.map((image, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-yellow-400/20 transition-all cursor-pointer"
            >
              <img 
                src={image.url} 
                alt={image.title}
                className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div className="text-white">
                  <p className="text-sm text-yellow-400 font-medium mb-1">{image.category}</p>
                  <h3 className="text-xl font-bold">{image.title}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Instagram Banner */}
        <div className="mt-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
            Share Your Adventure
          </h2>
          <p className="text-lg text-green-800 mb-6">
            Tag us in your photos @lostinjamaica for a chance to be featured
          </p>
          <div className="inline-block bg-green-900 text-yellow-400 font-bold px-8 py-3 rounded-full text-xl">
            #LostInJamaica
          </div>
        </div>
      </div>
    </div>
  );
}