import React, { useState } from 'react';
import AdminOverview from '../components/admin/AdminOverview';
import TripManager from '../components/admin/TripManager';
import BookingManager from '../components/admin/BookingManager';
import PaymentManager from '../components/admin/PaymentManager';
import Reports from '../components/admin/Reports';
import Settings from '../components/admin/Settings';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 space-y-4">
        <h2 className="text-xl font-black uppercase mb-6">Admin</h2>

        <button onClick={() => setActiveTab("dashboard")} className="block w-full text-left hover:text-green-400">
          Dashboard
        </button>

        <button onClick={() => setActiveTab("trips")} className="block w-full text-left hover:text-green-400">
          Trips
        </button>

        <button onClick={() => setActiveTab("bookings")} className="block w-full text-left hover:text-green-400">
          Bookings
        </button>

        <button onClick={() => setActiveTab("payments")} className="block w-full text-left hover:text-green-400">
          Payments
        </button>

        <button onClick={() => setActiveTab("reports")} className="block w-full text-left hover:text-green-400">
          Reports
        </button>

        <button onClick={() => setActiveTab("settings")} className="block w-full text-left hover:text-green-400">
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        {activeTab === "dashboard" && <AdminOverview />}
        {activeTab === "trips" && <TripManager />}
        {activeTab === "bookings" && <BookingManager />}
        {activeTab === "payments" && <PaymentManager />}
        {activeTab === "reports" && <Reports />}
        {activeTab === "settings" && <Settings />}
      </div>

    </div>
  );
}