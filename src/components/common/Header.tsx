import React, { useState } from 'react';
import {
  Package,
  Truck,
  Compass,
  Smartphone,
  ShieldCheck,
  User,
  Search,
  Menu,
  X,
  PhoneCall,
  ChevronDown,
  Sparkles,
  Mail,
} from 'lucide-react';
import { CompanySettings } from '../../types';
import { GoogleSignInButton } from './GoogleSignInButton';

export type ActiveView =
  | 'public_home'
  | 'public_services'
  | 'public_tracking'
  | 'public_calculator'
  | 'public_coverage'
  | 'public_contact'
  | 'customer_book'
  | 'customer_portal'
  | 'dispatch_console'
  | 'rider_app'
  | 'admin_dashboard';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  companySettings: CompanySettings;
  onQuickTrack: (trackingNumber: string) => void;
  onOpenGmailDesk?: (shipmentId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  companySettings,
  onQuickTrack,
  onOpenGmailDesk,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navTrackInput, setNavTrackInput] = useState('');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navTrackInput.trim()) {
      onQuickTrack(navTrackInput.trim());
      setNavTrackInput('');
      setMobileMenuOpen(false);
    }
  };

  const getPortalLabel = () => {
    switch (activeView) {
      case 'dispatch_console':
        return '🧭 Dispatch Console';
      case 'rider_app':
        return '🛵 Rider Mobile App';
      case 'admin_dashboard':
        return '⚙️ Admin Dashboard';
      case 'customer_portal':
      case 'customer_book':
        return '👤 Customer Portal';
      default:
        return '🌐 Public Website';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Banner: Quick Role Switcher & Phone Support */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 text-[11px]">
              <Sparkles className="w-3 h-3" />
              Live Operations Mode
            </span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              Fast Parcel Delivery Across Nairobi & Nationwide Kenya
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                <span>Current View:</span>
                <span className="font-bold text-amber-400">{getPortalLabel()}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs text-slate-200"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Switch Platform Role
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView('public_home')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <span>🌐</span>
                    <div>
                      <div className="font-medium text-white">Public Website</div>
                      <div className="text-[10px] text-slate-400">Marketing & services overview</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('customer_portal')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <span>👤</span>
                    <div>
                      <div className="font-medium text-white">Customer Portal</div>
                      <div className="text-[10px] text-slate-400">My deliveries & bookings</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('dispatch_console')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <span>🧭</span>
                    <div>
                      <div className="font-medium text-white">Dispatch Operations</div>
                      <div className="text-[10px] text-slate-400">Fleet routing & rider assignment</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('rider_app')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <span>🛵</span>
                    <div>
                      <div className="font-medium text-white">Rider Mobile App</div>
                      <div className="text-[10px] text-slate-400">Pickups, deliveries & POD capture</div>
                    </div>
                  </button>
                  <div className="my-1 border-t border-slate-800" />
                  <button
                    type="button"
                    onClick={() => setActiveView('admin_dashboard')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <span>⚙️</span>
                    <div>
                      <div className="font-medium text-amber-400">Admin Dashboard</div>
                      <div className="text-[10px] text-slate-400">Pricing, M-Pesa, logs & staff</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <a
              href={`tel:${companySettings.supportPhone}`}
              className="hidden md:inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition text-[11px]"
            >
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>{companySettings.supportPhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveView('public_home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
            <Package className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
              <span>EFRICKEN</span>
              <span className="text-amber-400 text-xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                EXPRESS
              </span>
            </div>
            <div className="text-[10px] tracking-wider text-slate-400 font-medium">
              COURIER & PARCEL LOGISTICS
            </div>
          </div>
        </div>

        {/* Public Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveView('public_home')}
            className={`px-3 py-2 rounded-lg transition cursor-pointer ${
              activeView === 'public_home'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setActiveView('public_services')}
            className={`px-3 py-2 rounded-lg transition cursor-pointer ${
              activeView === 'public_services'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Services
          </button>
          <button
            type="button"
            onClick={() => setActiveView('public_tracking')}
            className={`px-3 py-2 rounded-lg transition cursor-pointer ${
              activeView === 'public_tracking'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Track Parcel
          </button>
          <button
            type="button"
            onClick={() => setActiveView('public_calculator')}
            className={`px-3 py-2 rounded-lg transition cursor-pointer ${
              activeView === 'public_calculator'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Rate Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveView('public_coverage')}
            className={`px-3 py-2 rounded-lg transition cursor-pointer ${
              activeView === 'public_coverage'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Coverage
          </button>
          <button
            type="button"
            onClick={() => setActiveView('public_contact')}
            className={`px-3 py-2 rounded-lg transition cursor-pointer ${
              activeView === 'public_contact'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Action Controls */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Quick Track Input */}
          <form onSubmit={handleTrackSubmit} className="relative">
            <input
              type="text"
              placeholder="Track EFX-XXXX-KE"
              value={navTrackInput}
              onChange={(e) => setNavTrackInput(e.target.value)}
              className="w-40 xl:w-48 pl-3 pr-8 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:w-56 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Gmail Dispatch Hub Button */}
          {onOpenGmailDesk && (
            <button
              type="button"
              onClick={() => onOpenGmailDesk()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Open Gmail Delivery Desk"
            >
              <Mail className="w-3.5 h-3.5 text-red-400" />
              <span>Gmail Desk</span>
            </button>
          )}

          {/* Official Google Sign In Button */}
          <GoogleSignInButton compact />

          {/* Book Delivery CTA */}
          <button
            type="button"
            onClick={() => setActiveView('customer_book')}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Book Delivery</span>
          </button>

          {/* Customer Portal Button */}
          <button
            type="button"
            onClick={() => setActiveView('customer_portal')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">My Account</span>
          </button>
        </div>

        {/* Mobile Actions: Gmail & Menu */}
        <div className="flex lg:hidden items-center gap-2">
          {onOpenGmailDesk && (
            <button
              type="button"
              onClick={() => onOpenGmailDesk()}
              className="p-2 bg-slate-800 text-amber-400 rounded-lg border border-slate-700 text-xs flex items-center gap-1"
              title="Gmail Desk"
            >
              <Mail className="w-4 h-4 text-red-400" />
            </button>
          )}

          <GoogleSignInButton compact />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleTrackSubmit} className="relative">
            <input
              type="text"
              placeholder="Track reference e.g. EFX-9824-KE"
              value={navTrackInput}
              onChange={(e) => setNavTrackInput(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveView('customer_book');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              Book Delivery
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('public_tracking');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-slate-800 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              Track Parcel
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1 text-sm font-medium">
            <button
              onClick={() => {
                setActiveView('public_home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveView('public_services');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              Our Delivery Services
            </button>
            <button
              onClick={() => {
                setActiveView('public_calculator');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              Rate Calculator
            </button>
            <button
              onClick={() => {
                setActiveView('public_coverage');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              Coverage Areas & Branches
            </button>
            <button
              onClick={() => {
                setActiveView('customer_portal');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              Customer Portal
            </button>
            <button
              onClick={() => {
                setActiveView('dispatch_console');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              Dispatch Console
            </button>
            <button
              onClick={() => {
                setActiveView('rider_app');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
            >
              Rider Mobile App
            </button>
            <button
              onClick={() => {
                setActiveView('admin_dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-amber-400 hover:bg-slate-800 font-bold"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
