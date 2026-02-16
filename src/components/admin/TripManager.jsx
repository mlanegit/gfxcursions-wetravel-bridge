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