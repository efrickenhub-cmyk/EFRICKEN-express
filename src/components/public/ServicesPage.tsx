import React from 'react';
import {
  Zap,
  Clock,
  Building2,
  FileText,
  Boxes,
  Truck,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { ActiveView } from '../common/Header';

interface ServicesPageProps {
  setActiveView: (view: ActiveView) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ setActiveView }) => {
  const services = [
    {
      id: 'express_2hr',
      title: 'Express 2-Hour Hot-Shot',
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      sla: 'Within 120 Minutes',
      description: 'Dedicated immediate collection and priority direct routing without sorting delays across Nairobi.',
      suitableFor: 'Urgent medical specimens, critical spare parts, urgent documents, forgotten passports',
      pricing: 'From KES 450 (base)',
    },
    {
      id: 'same_day',
      title: 'Same-Day Local Delivery',
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      sla: 'Same Business Day (by 6:00 PM)',
      description: 'Book before 2:00 PM for doorstep collection and guaranteed arrival the same afternoon.',
      suitableFor: 'Retail purchases, gifts, business letters, corporate samples',
      pricing: 'From KES 250 (base)',
    },
    {
      id: 'standard',
      title: 'Standard Parcel Delivery',
      icon: <Truck className="w-6 h-6 text-emerald-500" />,
      sla: 'Next Business Day',
      description: 'Cost-effective consolidated courier service with end-to-end milestone scans and digital POD.',
      suitableFor: 'Non-urgent items, personal goods, bulk shipments',
      pricing: 'From KES 200 (base)',
    },
    {
      id: 'document_secure',
      title: 'Secure Legal & Document Courier',
      icon: <FileText className="w-6 h-6 text-purple-500" />,
      sla: 'Priority Same-Day',
      description: 'Hand-to-hand delivery with tamper-proof security seals, recipient ID verification, and signed manifests.',
      suitableFor: 'Court pleadings, land deeds, bank guarantees, commercial tenders',
      pricing: 'From KES 350',
    },
    {
      id: 'b2b_corporate',
      title: 'Business-to-Business (B2B) Logistics',
      icon: <Building2 className="w-6 h-6 text-slate-800" />,
      sla: 'Scheduled or On-Demand',
      description: 'Scheduled inter-branch mailbags, daily accounting pickups, monthly statements, and SLA reporting.',
      suitableFor: 'Banks, law firms, healthcare systems, insurance companies, government agencies',
      pricing: 'Contracted Corporate Tariffs',
    },
    {
      id: 'ecommerce_fulfilment',
      title: 'E-Commerce Delivery & COD',
      icon: <Boxes className="w-6 h-6 text-pink-500" />,
      sla: 'Same-Day / Next-Day',
      description: 'Reliable Cash on Delivery (COD) collection, automated M-Pesa remittance, return logistics, and exchange runs.',
      suitableFor: 'Online boutiques, electronics sellers, cosmetics brands, social commerce merchants',
      pricing: 'Volume Discount Tariffs',
    },
    {
      id: 'intercity',
      title: 'Intercity Linehaul Freight',
      icon: <Truck className="w-6 h-6 text-indigo-500" />,
      sla: 'Overnight (12 - 24 Hours)',
      description: 'Night freight trunk vehicles moving consignments between Nairobi, Mombasa, Kisumu, Nakuru, and Eldoret.',
      suitableFor: 'Commercial goods, agricultural parcels, machinery parts, cross-county trade',
      pricing: 'From KES 650',
    },
    {
      id: 'scheduled',
      title: 'Scheduled & Recurring Pickups',
      icon: <Calendar className="w-6 h-6 text-teal-500" />,
      sla: 'Custom Configured Windows',
      description: 'Set recurring weekly or daily courier visits so your dispatch team never has to re-book manually.',
      suitableFor: 'Laboratories, dental clinics, daily payroll delivery, subscription boxes',
      pricing: 'Fixed Monthly Retainer / Per-Run',
    },
    {
      id: 'bulk_cargo',
      title: 'Bulk Shipments & Pallet Cargo',
      icon: <Layers className="w-6 h-6 text-orange-500" />,
      sla: '24 - 48 Hours',
      description: 'Vans and pickup trucks dispatched for heavy commercial cargo exceeding standard motorbike limits.',
      suitableFor: 'Office relocations, exhibition booths, palletized FMCG goods',
      pricing: 'Distance & Ton-Rate Based',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          Comprehensive Logistics Solutions
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Tailored Courier Services Across Kenya
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Efricken Express provides a full suite of delivery solutions with dynamic pricing, verified riders, and real-time tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc) => (
          <div
            key={svc.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs hover:shadow-lg transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                {svc.icon}
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900">{svc.title}</h3>
                <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                  SLA: {svc.sla}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{svc.description}</p>

              <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700 block">Best suited for:</span>
                <span className="text-slate-500 text-[11px]">{svc.suitableFor}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs text-amber-600">{svc.pricing}</span>
              <button
                type="button"
                onClick={() => setActiveView('customer_book')}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
