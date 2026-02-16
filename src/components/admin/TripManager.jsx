import React, { useState } from 'react';

export default function TripManager() {
  const [tripForm, setTripForm] = useState({
    name: "",
    slug: "",
    location: "",
    start_date: "",
    end_date: "",
    active: true,
    currency: "USD",
    payment_plan_enabled: true,
    plan_cutoff_date: "",
    plan_dates: [],
    deposit_per_person: 250,
    installment_count: 4,
    processing_fee_enabled: true
  });

  return (
    <div>
      <h1 className="text-2xl font-black uppercase mb-6">Trip Manager</h1>
      <p className="text-gray-400">Trip management content coming soon...</p>
    </div>
  );
}