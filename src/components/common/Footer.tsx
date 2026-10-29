import React from 'react';
import {
  Package,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  MessageSquare,
  ArrowUpRight,
  Truck,
} from 'lucide-react';
import { CompanySettings } from '../../types';
import { ActiveView } from './Header';

interface FooterProps {
  companySettings: CompanySettings;
  setActiveView: (view: ActiveView) => void;
}

export const Footer: React.FC<FooterProps> = ({ companySettings, setActiveView }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-sm">
      {/* Top CTA Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-950 text-amber-400 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl tracking-tight">
                Need an urgent delivery right now?
              </h3>
              <p className="text-xs font-semibold text-slate-900/80">
                Book in 60 seconds with instant M-Pesa checkout & live rider tracking.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveView('customer_book')}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Book Courier Pickup</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <a
              href={`https://wa.me/${companySettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Efricken%20Express,%20I%20need%20assistance%20with%20a%20delivery.`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand & Mission */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
              <Package className="w-4 h-4" />
            </div>
            <span className="font-black text-white text-base tracking-tight">
              EFRICKEN EXPRESS
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {companySettings.tagline}
          </p>
          <div className="pt-2 text-xs text-slate-400 space-y-1">
            <div>
              <span className="font-semibold text-slate-300">Buy Goods Till Number:</span>{' '}
              <span className="font-mono text-amber-400 font-bold">{companySettings.mpesaTillNumber}</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                type="button"
                onClick={() => setActiveView('public_home')}
                className="hover:text-amber-400 transition"
              >
                Home Overview
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveView('customer_book')}
                className="hover:text-amber-400 transition font-medium text-amber-400"
              >
                Book a Delivery
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveView('public_tracking')}
                className="hover:text-amber-400 transition"
              >
                Track a Parcel
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveView('public_calculator')}
                className="hover:text-amber-400 transition"
              >
                Rate & Volumetric Calculator
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveView('public_coverage')}
                className="hover:text-amber-400 transition"
              >
                Coverage Zones & Depots
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveView('customer_portal')}
                className="hover:text-amber-400 transition"
              >
                Customer Portal & History
              </button>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Delivery Services
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>Same-Day Nairobi Delivery</li>
            <li>Express 2-Hour Hot-Shot</li>
            <li>Standard Next-Day Parcel</li>
            <li>Document & Legal File Courier</li>
            <li>B2B & Corporate Logistics</li>
            <li>E-Commerce Fulfilment & COD</li>
            <li>Intercity Nairobi-Mombasa-Kisumu</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 text-xs">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Contact & Operations
          </h4>
          <div className="flex items-start gap-2.5 text-slate-400">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{companySettings.headOfficeAddress}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400">
            <Phone className="w-4 h-4 text-amber-400 shrink-0" />
            <a href={`tel:${companySettings.supportPhone}`} className="hover:text-white">
              {companySettings.supportPhone}
            </a>
          </div>
          <div className="flex items-center gap-2.5 text-slate-400">
            <Mail className="w-4 h-4 text-amber-400 shrink-0" />
            <a href={`mailto:${companySettings.supportEmail}`} className="hover:text-white">
              {companySettings.supportEmail}
            </a>
          </div>
          <div className="flex items-start gap-2.5 text-slate-400">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{companySettings.workingHours}</span>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Compliance */}
      <div className="border-t border-slate-900 bg-black/40 py-4 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              Compliant with the Kenya Data Protection Act, 2019 • Licensed Courier Operations
            </span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} {companySettings.companyName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
