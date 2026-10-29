import React, { useState } from 'react';
import {
  Package,
  Search,
  Truck,
  Clock,
  ShieldCheck,
  MapPin,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Smartphone,
  PhoneCall,
  Zap,
  Building2,
  FileText,
  Boxes,
} from 'lucide-react';
import { CompanySettings, ServiceZone } from '../../types';
import { ActiveView } from '../common/Header';

interface HomePageProps {
  companySettings: CompanySettings;
  zones: ServiceZone[];
  setActiveView: (view: ActiveView) => void;
  onTrack: (code: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  companySettings,
  zones,
  setActiveView,
  onTrack,
}) => {
  const [trackingInput, setTrackingInput] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      onTrack(trackingInput.trim());
    }
  };

  const sampleTrackingNumbers = ['PFR-9824-KE', 'PFR-7419-KE', 'PFR-3108-KE', 'PFR-5321-KE'];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>Next-Gen Logistics Across Kenya</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Swift, Secure Parcel Delivery in <span className="text-amber-400">Kenya</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                From urgent 2-hour documents in Nairobi to intercity freight across Mombasa, Nakuru, and Kisumu.
                Enjoy real-time parcel tracking, instant M-Pesa STK push checkout, and verified digital proof of delivery.
              </p>

              {/* Direct Tracking Box in Hero */}
              <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/15 shadow-2xl max-w-xl">
                <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter Tracking Number (e.g. PFR-9824-KE)"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-xl font-mono text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>Track Parcel</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick test tracking pills */}
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/10 text-xs text-slate-300">
                  <span className="text-slate-400 font-medium">Try demo orders:</span>
                  {sampleTrackingNumbers.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => onTrack(code)}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-amber-500/20 hover:text-amber-300 font-mono text-[11px] text-amber-400 transition cursor-pointer"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveView('customer_book')}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Book a Delivery Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('public_calculator')}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Calculate Delivery Cost</span>
                </button>
              </div>
            </div>

            {/* Right Card / Visual Status */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Fleet Status: Active Dispatch
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Nairobi Core</span>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Average Local Delivery</div>
                      <div className="text-2xl font-black text-white">42 Minutes</div>
                    </div>
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">On-Time SLA Guarantee</div>
                      <div className="text-2xl font-black text-emerald-400">99.4%</div>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">M-Pesa STK Push Settlement</div>
                      <div className="text-2xl font-black text-white">Instant API</div>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                      <Smartphone className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-400 text-center">
                  Protected under the Kenya Data Protection Act 2019 • Secure Digital POD
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            Simple 4-Step Process
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            How Efricken Express Works
          </h2>
          <p className="text-sm text-slate-600">
            Book in less than 2 minutes and let our professional fleet handle the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative space-y-4 hover:border-amber-400 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900">Book Online</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter sender and recipient locations, package dimensions, and choose your preferred delivery service.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative space-y-4 hover:border-amber-400 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900">Instant Collection</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our assigned verified rider collects the parcel right from your doorstep or office within minutes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative space-y-4 hover:border-amber-400 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900">Live GPS Tracking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Monitor milestones and watch the rider move live on the map as the parcel journeys to its destination.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative space-y-4 hover:border-amber-400 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-lg">
              4
            </div>
            <h3 className="font-bold text-base text-slate-900">Digital Signature & POD</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Recipient signs digitally on the rider&apos;s phone. Instant SMS confirmation & downloadable proof of delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              Tailored Logistics
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Courier Services We Offer
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('public_services')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
          >
            <span>Explore all 10 services</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Express 2-Hour Delivery</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Ultra-urgent priority hot-shot deliveries across Nairobi CBD, Westlands, Kilimani, and Upper Hill.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Delivery SLA: Within 2 Hours</span>
              <span className="text-amber-600">From KES 450</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Same-Day Local Delivery</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Book before 2:00 PM and get guaranteed doorstep arrival anywhere in Nairobi and Kiambu county by 6:00 PM.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Delivery SLA: Same Business Day</span>
              <span className="text-amber-600">From KES 250</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">B2B & Corporate Logistics</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Monthly invoicing, multi-stop mail runs, bank documents, tenders, and dedicated rider contracts for businesses.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Account Billing Available</span>
              <span className="text-emerald-600">Custom Tariff</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Secure Document Courier</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tamper-evident satchels for confidential legal contracts, land titles, tender bids, and passport deliveries.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Tamper-Sealed Bags</span>
              <span className="text-amber-600">From KES 350</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">E-Commerce Delivery & COD</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Cash On Delivery (COD) collection, automated M-Pesa remittance, customer returns, and Shopify/WooCommerce support.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>COD Remittance: 24h</span>
              <span className="text-pink-600">Merchant Friendly</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Intercity Kenya Freight</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Overnight linehaul connecting Nairobi, Mombasa, Kisumu, Nakuru, and Eldoret through our regional sorting hubs.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Delivery SLA: Next Morning</span>
              <span className="text-indigo-600">From KES 650</span>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Teaser & Zones */}
      <section className="bg-slate-100 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                Extensive Network
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Operating Across 15+ Strategic Zones in Kenya
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Whether you are dispatching a single envelope in Nairobi CBD or multi-carton cargo to Mombasa, our
                interlinked branch network ensures seamless tracking and predictable delivery timeframes.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveView('public_coverage')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>View Full Hub Directory</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Major Service Zones</span>
                  <span className="text-emerald-600 font-semibold text-[11px]">All Hubs Operational ✓</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {zones.slice(0, 9).map((z) => (
                    <div
                      key={z.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs hover:border-amber-400 transition"
                    >
                      <div className="font-bold text-slate-800">{z.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {z.county} • ~{z.estimatedHours}h ETA
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            Common Inquiries
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900">
              How does the M-Pesa STK Push payment work?
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              When booking your delivery, enter your Safaricom mobile phone number. Our Daraja payment integration triggers an instant prompt on your phone screen. Enter your M-Pesa PIN, and once confirmed, your booking status automatically updates to Payment Confirmed with an official receipt.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900">
              How is volumetric weight calculated for bulky parcels?
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              In courier logistics, light but large packages take up vehicle space. We use the IATA standard volumetric formula: (Length × Width × Height in cm) ÷ 5,000. Your billable weight is simply the greater of the parcel&apos;s actual weight and its volumetric weight.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900">
              Can I track the delivery rider in real time?
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Yes! Once your parcel is assigned and marked as &ldquo;Out for Delivery&rdquo;, you can open the tracking link to view the rider&apos;s live coordinates on an interactive map. If GPS signals stop, a clear stale-location warning is displayed for total transparency.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900">
              Do you offer Cash on Delivery (COD) for e-commerce stores?
            </h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Yes, our riders can collect payment upon delivery and remit funds directly to your M-Pesa Till or bank account within 24 hours of successful handover.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
