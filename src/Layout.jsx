import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import BookingWizard from './components/BookingWizard';

export default function Layout({ children, currentPageName }) {
  const [showBookingWizard, setShowBookingWizard] = useState(false);
  
  return (
    <div className="min-h-screen bg-black">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-green-600/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e8285d68c1a64ca6d3df7/3dc5c8969_gfX_logo.png" 
              alt="GFX Logo" 
              className="h-12"
            />
            <div>
              <div className="text-white text-xl font-black tracking-tight">LOST IN JAMAICA</div>
              <div className="text-yellow-400 text-[10px] font-bold tracking-widest">PRESENTED BY GFX</div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to={createPageUrl('Home')} 
              className={`text-sm font-bold tracking-wide transition-colors uppercase ${
                currentPageName === 'Home' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
            >
              Home
            </Link>
            <Link 
              to={createPageUrl('Packages')} 
              className={`text-sm font-bold tracking-wide transition-colors uppercase ${
                currentPageName === 'Packages' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
            >
              Packages
            </Link>
            <Link 
              to={createPageUrl('Events')} 
              className={`text-sm font-bold tracking-wide transition-colors uppercase ${
                currentPageName === 'Events' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
            >
              Events
            </Link>
            <Link 
              to={createPageUrl('Gallery')} 
              className={`text-sm font-bold tracking-wide transition-colors uppercase ${
                currentPageName === 'Gallery' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
            >
              Gallery
            </Link>
            <Link 
              to={createPageUrl('Contact')} 
              className={`text-sm font-bold tracking-wide transition-colors uppercase ${
                currentPageName === 'Contact' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Book Now Button */}
          <button
            onClick={() => setShowBookingWizard(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-black px-8 py-3 rounded transition-all shadow-lg hover:shadow-green-600/50 uppercase tracking-wide text-sm"
          >
            Book Now
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Booking Wizard Modal */}
      {showBookingWizard && (
        <BookingWizard onClose={() => setShowBookingWizard(false)} />
      )}
      </div>
      );
      }