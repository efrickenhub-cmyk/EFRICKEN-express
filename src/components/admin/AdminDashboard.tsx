import React, { useState } from 'react';
import {
  BarChart3,
  Package,
  Truck,
  DollarSign,
  Settings,
  ShieldAlert,
  Users,
  MapPin,
  Bell,
  MessageSquare,
  CheckCircle2,
  Clock,
  Download,
  Save,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Check,
  Building2,
  Sliders,
  History,
  Mail,
} from 'lucide-react';
import {
  AuditLog,
  Branch,
  CompanySettings,
  NotificationRecord,
  PaymentRecord,
  PricingSettings,
  Rider,
  ServiceZone,
  Shipment,
  SupportTicket,
} from '../../types';
import { StorageService } from '../../services/storageService';

interface AdminDashboardProps {
  shipments: Shipment[];
  riders: Rider[];
  zones: ServiceZone[];
  branches: Branch[];
  companySettings: CompanySettings;
  pricingSettings: PricingSettings;
  payments: PaymentRecord[];
  notifications: NotificationRecord[];
  tickets: SupportTicket[];
  auditLogs: AuditLog[];
  onRefresh: () => void;
  onCompanySettingsUpdated: (newSettings: CompanySettings) => void;
  onPricingSettingsUpdated: (newSettings: PricingSettings) => void;
  onOpenGmailDesk?: (shipmentId?: string) => void;
}

type AdminTab =
  | 'overview'
  | 'orders'
  | 'riders'
  | 'pricing'
  | 'branches'
  | 'mpesa'
  | 'notifications'
  | 'support'
  | 'company'
  | 'audit';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  shipments,
  riders,
  zones,
  branches,
  companySettings,
  pricingSettings,
  payments,
  notifications,
  tickets,
  auditLogs,
  onRefresh,
  onCompanySettingsUpdated,
  onPricingSettingsUpdated,
  onOpenGmailDesk,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchOrders, setSearchOrders] = useState('');

  // Editable Company Settings state
  const [companyForm, setCompanyForm] = useState<CompanySettings>({ ...companySettings });
  const [companySaved, setCompanySaved] = useState(false);

  // Editable Pricing Settings state
  const [pricingForm, setPricingForm] = useState<PricingSettings>({ ...pricingSettings });
  const [pricingSaved, setPricingSaved] = useState(false);

  // Support ticket resolution note state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Calculate Overview Financials & Analytics
  const totalBookings = shipments.length;
  const deliveredCount = shipments.filter((s) => s.status === 'delivered').length;
  const inTransitCount = shipments.filter(
    (s) => s.status === 'out_for_delivery' || s.status === 'in_transit' || s.status === 'collected'
  ).length;
  const failedCount = shipments.filter((s) => s.status === 'delivery_attempted').length;

  const totalCollectedRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amountKes, 0);

  const outstandingPayments = shipments
    .filter((s) => s.paymentStatus !== 'completed' && s.status !== 'cancelled')
    .reduce((sum, s) => sum + s.pricing.totalKes, 0);

  const handleSaveCompanySettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveCompanySettings(companyForm, 'Super Administrator');
    onCompanySettingsUpdated(companyForm);
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 3000);
  };

  const handleSavePricingSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.savePricingSettings(pricingForm, 'Super Administrator');
    onPricingSettingsUpdated(pricingForm);
    setPricingSaved(true);
    setTimeout(() => setPricingSaved(false), 3000);
  };

  const handleExportCsv = () => {
    const headers = 'TrackingNumber,Sender,Recipient,FromZone,ToZone,Service,TotalKes,PaymentStatus,Status,CreatedAt\n';
    const rows = shipments
      .map(
        (s) =>
          `"${s.trackingNumber}","${s.senderName}","${s.recipientName}","${s.senderZone}","${s.recipientZone}","${s.serviceType}",${s.pricing.totalKes},"${s.paymentStatus}","${s.status}","${s.createdAt}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Efricken_Express_Shipments_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Super Administrator & Executive Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Logistics Management & Auditing Portal
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real database metrics, pricing configuration, M-Pesa Daraja reconciliation, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export CSV Report</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition cursor-pointer"
            title="Refresh All Records"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'overview', label: '📊 Executive Analytics' },
          { id: 'orders', label: `📦 Consignments (${shipments.length})` },
          { id: 'riders', label: `🏍️ Fleet & Riders (${riders.length})` },
          { id: 'pricing', label: '⚙️ Pricing Engine' },
          { id: 'branches', label: `🏢 Branches & Zones (${branches.length})` },
          { id: 'mpesa', label: `💳 M-Pesa (${payments.length})` },
          { id: 'notifications', label: `🔔 Notifications (${notifications.length})` },
          { id: 'support', label: `💬 Support Tickets (${tickets.length})` },
          { id: 'company', label: '🏛️ Company Branding' },
          { id: 'audit', label: `🛡️ Security Audit Logs (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-amber-400 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: EXECUTIVE ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block mb-1">Total Booked Consignments</span>
              <span className="text-2xl font-black text-slate-900 font-mono">{totalBookings}</span>
              <div className="text-[11px] text-emerald-600 mt-1 font-semibold">100% Verified Database</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block mb-1">Delivered Successfully</span>
              <span className="text-2xl font-black text-emerald-600 font-mono">{deliveredCount}</span>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                {totalBookings ? Math.round((deliveredCount / totalBookings) * 100) : 0}% Success Rate
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block mb-1">In-Transit / Live Runs</span>
              <span className="text-2xl font-black text-amber-600 font-mono">{inTransitCount}</span>
              <div className="text-[11px] text-slate-400 mt-1">Real-time GPS monitored</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block mb-1">Total M-Pesa Revenue</span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                KES {totalCollectedRevenue.toLocaleString()}
              </span>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">
                KES {outstandingPayments.toLocaleString()} Outstanding
              </div>
            </div>
          </div>

          {/* Detailed Performance Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Delivery SLAs */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Delivery Service SLA Distribution
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { label: 'Express 2-Hour Hot-Shot', count: shipments.filter((s) => s.serviceType === 'express_2hr').length, pct: 40 },
                  { label: 'Same-Day Local Nairobi', count: shipments.filter((s) => s.serviceType === 'same_day').length, pct: 35 },
                  { label: 'Standard Next-Day', count: shipments.filter((s) => s.serviceType === 'standard').length, pct: 15 },
                  { label: 'Intercity Linehaul & Cargo', count: shipments.filter((s) => s.serviceType === 'intercity').length, pct: 10 },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-slate-700">
                      <span>{item.label}</span>
                      <span className="font-mono font-bold">{item.count} orders</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.max(10, item.count * 25)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rider Productivity */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Rider Productivity & Fleet Ranking
              </h3>
              <div className="space-y-3 text-xs">
                {riders.map((r) => (
                  <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{r.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {r.plateNumber} • Zone: {r.currentZone}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">{r.totalDeliveries} runs</span>
                      <div className="text-[10px] text-amber-600 font-bold">⭐ {r.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Hub Activity */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Sorting Hub Throughput
              </h3>
              <div className="space-y-3 text-xs">
                {branches.map((b) => (
                  <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{b.name}</div>
                      <div className="text-[11px] text-slate-400">{b.county} County</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Operational
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONSIGNMENTS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-base font-bold text-slate-900">All Registered Parcel Consignments</h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchOrders}
                onChange={(e) => setSearchOrders(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total (KES)</th>
                  <th className="py-3 px-4">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {s.trackingNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{s.senderName}</td>
                    <td className="py-3 px-4 text-slate-700">{s.recipientName}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.senderZone} → {s.recipientZone}
                    </td>
                    <td className="py-3 px-4 capitalize">{s.serviceType.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                        {s.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      KES {s.pricing.totalKes.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold ${
                          s.paymentStatus === 'completed' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {s.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FLEET & RIDERS */}
      {activeTab === 'riders' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Registered Delivery Riders & Vehicles</h2>
            <span className="text-xs text-slate-500 font-mono">Active Count: {riders.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riders.map((r) => (
              <div key={r.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
                      🏍️
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{r.fullName}</div>
                      <div className="text-[11px] text-slate-500">{r.email}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    {r.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600 bg-white p-3 rounded-xl border border-slate-100 font-mono text-[11px]">
                  <div>Vehicle: {r.vehicleType.toUpperCase()}</div>
                  <div>Plate: {r.plateNumber}</div>
                  <div>Phone: {r.phone}</div>
                  <div>Primary Zone: {r.currentZone}</div>
                  <div>Rating: ⭐ {r.rating}</div>
                  <div>Total Runs: {r.totalDeliveries}</div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>GPS Telemetry: {r.isGpsSharing ? 'Active ✓' : 'Disabled'}</span>
                  <span>Last Seen: {new Date(r.lastLocationUpdate).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PRICING ENGINE CONFIGURATION */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Configurable Delivery Tariff Engine</h2>
              <p className="text-xs text-slate-500">
                Modify base tariffs, per-kg rates, volumetric divisor (IATA 5,000 standard), and SLA multipliers.
              </p>
            </div>
            {pricingSaved && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Pricing Settings Saved & Audited ✓
              </span>
            )}
          </div>

          <form onSubmit={handleSavePricingSettings} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Volumetric Divisor (IATA Standard) *
                </label>
                <input
                  type="number"
                  required
                  value={pricingForm.volumetricDivisor}
                  onChange={(e) =>
                    setPricingForm({ ...pricingForm, volumetricDivisor: parseInt(e.target.value) || 5000 })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Formula: (L × W × H in cm) ÷ Divisor
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Base Fare (KES) *</label>
                <input
                  type="number"
                  required
                  value={pricingForm.baseFareKes}
                  onChange={(e) =>
                    setPricingForm({ ...pricingForm, baseFareKes: parseInt(e.target.value) || 250 })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Applies to first 1.0 kg
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Per Additional kg Rate (KES) *
                </label>
                <input
                  type="number"
                  required
                  value={pricingForm.perKgRateKes}
                  onChange={(e) =>
                    setPricingForm({ ...pricingForm, perKgRateKes: parseInt(e.target.value) || 60 })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Charge for each billable kg above 1.0 kg
                </span>
              </div>
            </div>

            {/* Service Multipliers */}
            <div className="pt-2">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3">
                Service Urgency Multipliers
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(pricingForm.serviceMultipliers).map(([svc, mult]) => (
                  <div key={svc} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="block font-semibold text-slate-700 capitalize">
                      {svc.replace(/_/g, ' ')}
                    </span>
                    <input
                      type="number"
                      step="0.05"
                      value={mult}
                      onChange={(e) =>
                        setPricingForm({
                          ...pricingForm,
                          serviceMultipliers: {
                            ...pricingForm.serviceMultipliers,
                            [svc]: parseFloat(e.target.value) || 1.0,
                          },
                        })
                      }
                      className="mt-1 w-full p-1.5 rounded-lg border border-slate-300 font-mono text-xs bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>Save Pricing Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: BRANCHES & ZONES */}
      {activeTab === 'branches' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Physical Sorting Hubs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {branches.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-amber-700">{b.code}</span>
                    <span className="text-slate-500">{b.county}</span>
                  </div>
                  <div className="font-bold text-slate-900">{b.name}</div>
                  <div className="text-slate-500">{b.address}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Manager: {b.manager} • {b.phone}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: M-PESA RECONCILIATIONS */}
      {activeTab === 'mpesa' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">M-Pesa Daraja STK Push Transactions</h2>
              <p className="text-xs text-slate-500">
                Authoritative transaction ledger matching Safaricom receipt IDs with consignment orders.
              </p>
            </div>
            <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Total: KES {totalCollectedRevenue.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Receipt Reference</th>
                  <th className="py-3 px-4">Order Code</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Reconciled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium font-mono">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-emerald-700">{p.mpesaReceiptNumber || 'PENDING'}</td>
                    <td className="py-3 px-4 text-slate-900">{p.trackingNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{p.payerPhone}</td>
                    <td className="py-3 px-4 font-bold">KES {p.amountKes.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(p.transactionDate).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {p.reconciled ? (
                        <span className="text-emerald-700 font-sans font-bold text-[11px]">✓ Matched</span>
                      ) : (
                        <span className="text-amber-700 font-sans font-bold text-[11px]">Pending COD</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: EVENT-DRIVEN NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 animate-in fade-in duration-150">
          {/* Gmail Communications Hub Feature Card */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-700 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                <Mail className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  Gmail Official Logistics Communications Hub
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Active
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Send authentic waybill confirmations, dispatch notices, and M-Pesa receipts via Google Workspace / Gmail API (efrickenhub@gmail.com).
                </p>
              </div>
            </div>

            {onOpenGmailDesk && (
              <button
                type="button"
                onClick={() => onOpenGmailDesk()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2 shadow shrink-0"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Launch Gmail Desk</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Event-Driven Notifications Log</h2>
              <p className="text-xs text-slate-500">
                Real outbound SMS, WhatsApp, and email dispatch audit history.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{notifications.length} logged</span>
          </div>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 uppercase text-[10px] bg-slate-200 px-2 py-0.5 rounded">
                      {n.channel}
                    </span>
                    <span className="font-mono text-slate-600">{n.recipient}</span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {new Date(n.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-800 font-medium mt-1">{n.message}</p>
                <div className="text-[10px] text-slate-400">
                  Ref: {n.trackingNumber} • Provider: {n.provider} • Status: {n.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: CUSTOMER SUPPORT DESK */}
      {activeTab === 'support' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Customer Support & Complaints Desk</h2>
              <p className="text-xs text-slate-500">
                Resolve enquiries, delayed delivery tickets, and customer complaints.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {tickets.map((t) => (
              <div key={t.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{t.ticketNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase text-[10px]">
                      {t.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <div className="font-bold text-slate-900 text-sm">{t.subject}</div>
                  <p className="text-slate-600 mt-1">{t.description}</p>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Customer: {t.customerName} ({t.customerPhone})
                  </div>
                </div>

                {t.resolutionNotes && (
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900">
                    <span className="font-bold">Resolution Notes: </span>
                    {t.resolutionNotes}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="font-bold uppercase text-[10px] text-slate-500">
                    Status: {t.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      StorageService.updateTicketStatus(
                        t.id,
                        'resolved',
                        'Case resolved via customer service telephone call.'
                      );
                      onRefresh();
                    }}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Mark Resolved ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: COMPANY BRANDING & PROFILE */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Company Identity & Credentials</h2>
              <p className="text-xs text-slate-500">
                Editable business parameters, contact phone numbers, M-Pesa Buy Goods Till, and physical address.
              </p>
            </div>
            {companySaved && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Company Profile Saved Successfully ✓
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCompanySettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Registered Name</label>
                <input
                  type="text"
                  required
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={companyForm.tagline}
                  onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Support Phone</label>
                <input
                  type="text"
                  required
                  value={companyForm.supportPhone}
                  onChange={(e) => setCompanyForm({ ...companyForm, supportPhone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Business Number</label>
                <input
                  type="text"
                  required
                  value={companyForm.whatsappNumber}
                  onChange={(e) => setCompanyForm({ ...companyForm, whatsappNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Support Email</label>
                <input
                  type="email"
                  required
                  value={companyForm.supportEmail}
                  onChange={(e) => setCompanyForm({ ...companyForm, supportEmail: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Operating Hours</label>
                <input
                  type="text"
                  value={companyForm.workingHours}
                  onChange={(e) => setCompanyForm({ ...companyForm, workingHours: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">M-Pesa Buy Goods Till Number</label>
                <input
                  type="text"
                  value={companyForm.mpesaTillNumber}
                  onChange={(e) => setCompanyForm({ ...companyForm, mpesaTillNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Headquarters Physical Address</label>
              <input
                type="text"
                value={companyForm.headOfficeAddress}
                onChange={(e) => setCompanyForm({ ...companyForm, headOfficeAddress: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>Save Company Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 10: IMMUTABLE AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">System Security & Audit Trail</h2>
              <p className="text-xs text-slate-500">
                Chronological record of status changes, price overrides, rider assignments, and logins.
              </p>
            </div>
            <span className="font-mono text-xs text-slate-400">{auditLogs.length} events logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4 font-sans">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{log.user}</td>
                    <td className="py-2.5 px-4 text-amber-700">{log.role}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{log.action}</td>
                    <td className="py-2.5 px-4 text-slate-600">{log.entityId}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-700">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
