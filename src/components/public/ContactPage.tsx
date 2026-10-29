import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle2,
  Send,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { CompanySettings, SupportTicket } from '../../types';
import { StorageService } from '../../services/storageService';

interface ContactPageProps {
  companySettings: CompanySettings;
  onTicketSubmitted?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  companySettings,
  onTicketSubmitted,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('delivery_delay');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketNum, setTicketNum] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !subject || !description) return;

    const tkt = StorageService.createTicket({
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      trackingNumber: trackingNumber.trim() || undefined,
      category,
      priority: 'medium',
      subject,
      description,
    });

    setTicketNum(tkt.ticketNumber);
    setIsSuccess(true);
    setName('');
    setPhone('');
    setEmail('');
    setTrackingNumber('');
    setSubject('');
    setDescription('');
    if (onTicketSubmitted) onTicketSubmitted();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">
          We&apos;re Here to Assist You
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Contact Customer Operations
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Get in touch with our customer service team, dispatch desk, or corporate logistics representatives.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-800">
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-white">Direct Contact Channels</h2>
            <p className="text-xs text-slate-300">
              Our support desk monitors active dispatches and responds within minutes during business hours.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 text-slate-300 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
              <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Customer Hotlines
                </span>
                <a
                  href={`tel:${companySettings.supportPhone}`}
                  className="font-bold text-sm text-white hover:text-amber-400"
                >
                  {companySettings.supportPhone}
                </a>
                <div className="text-[11px] text-slate-400 mt-0.5">Toll free on Safaricom lines</div>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-300 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
              <MessageSquare className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Official WhatsApp Desk
                </span>
                <a
                  href={`https://wa.me/${companySettings.whatsappNumber.replace(
                    /[^0-9]/g,
                    ''
                  )}?text=Hello%20Efricken%20Express`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-sm text-emerald-400 hover:underline"
                >
                  {companySettings.whatsappNumber}
                </a>
                <div className="text-[11px] text-slate-400 mt-0.5">Instant human courier support</div>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-300 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
              <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Electronic Mail
                </span>
                <a
                  href={`mailto:${companySettings.supportEmail}`}
                  className="font-bold text-sm text-white hover:text-amber-400"
                >
                  {companySettings.supportEmail}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-300 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  National Headquarters
                </span>
                <div className="text-slate-200">{companySettings.headOfficeAddress}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-300 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Operations & Dispatch Hours
                </span>
                <div className="text-slate-200">{companySettings.workingHours}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact / Helpdesk Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Submit an Enquiry or Feedback</h2>
            <p className="text-xs text-slate-500">
              A support ticket will be generated and assigned to a customer service agent immediately.
            </p>
          </div>

          {isSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ticket Generated: #{ticketNum}</span>
              </div>
              <p>
                Thank you for contacting Efricken Express. Our customer support team will contact you promptly.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Mutua"
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telephone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0722 123 456"
                  className="w-full p-3 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. david@mutua.co.ke"
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tracking Code (If enquiry is order-specific)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. PFR-9824-KE"
                  className="w-full p-3 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Enquiry Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="delivery_delay">Delivery Status & SLA Window</option>
                <option value="damaged_parcel">Damaged / Missing Parcel Report</option>
                <option value="payment_issue">M-Pesa STK & Billing Issue</option>
                <option value="pricing_query">Corporate Accounts & Volume Tariffs</option>
                <option value="other">General Customer Feedback</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your inquiry"
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Detailed Message *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe how we can assist you..."
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Submit Customer Ticket</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
