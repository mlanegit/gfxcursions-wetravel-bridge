import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { MapPin } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="bg-white rounded-full p-1.5">
              <MapPin className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-white text-xl font-bold">Lost in Jamaica</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to={createPageUrl('Home')} 
              className={`text-sm font-medium transition-colors ${
                currentPageName === 'Home' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
            >
              Home
            </Link>
            <Link 
              to={createPageUrl('Experience')} 
              className={`text-sm font-medium transition-colors ${
                currentPageName === 'Experience' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
            >
              Experience
            </Link>
            <Link 
              to={createPageUrl('Gallery')} 
              className={`text-sm font-medium transition-colors ${
                currentPageName === 'Gallery' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
            >
              Gallery
            </Link>
            <Link 
              to={createPageUrl('Contact')} 
              className={`text-sm font-medium transition-colors ${
                currentPageName === 'Contact' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Book Now Button */}
          <Link 
            to={createPageUrl('Contact')}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Book Now
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}