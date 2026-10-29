import React, { useState } from 'react';
import {
  Package,
  Search,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Phone,
  MessageSquare,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  User,
  Calendar,
  AlertCircle,
  Mail,
} from 'lucide-react';
import { CompanySettings, Shipment } from '../../types';
import { StorageService } from '../../services/storageService';
import { CourierMap } from '../map/CourierMap';

interface TrackingPageProps {
  initialCode?: string;
  companySettings: CompanySettings;
  onOpenTicket: (trackingNumber: string) => void;
  onOpenGmailDesk?: (shipmentId?: string) => void;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({
  initialCode = '',
  companySettings,
  onOpenTicket,
  onOpenGmailDesk,
}) => {
  const [searchInput, setSearchInput] = useState(initialCode);
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(() => {
    if (initialCode) {
      return StorageService.getShipmentByTrackingNumber(initialCode) || null;
    }
    // Default to the first active shipment for demo richness
    return StorageService.getShipments()[0] || null;
  });
  const [errorNotFound, setErrorNotFound] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const found = StorageService.getShipmentByTrackingNumber(searchInput.trim());
    if (found) {
      setActiveShipment(found);
      setErrorNotFound(false);
    } else {
      setActiveShipment(null);
      setErrorNotFound(true);
    }
  };

  const getStatusBadge = (status: Shipment['status']) => {
    switch (status) {
      case 'delivered':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Delivered Successfully',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        };
      case 'out_for_delivery':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          label: 'Out for Delivery (Live)',
          icon: <Truck className="w-4 h-4 text-amber-600 animate-bounce" />,
        };
      case 'in_transit':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'In Transit',
          icon: <Truck className="w-4 h-4 text-blue-600" />,
        };
      case 'collected':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'Collected from Sender',
          icon: <Package className="w-4 h-4 text-indigo-600" />,
        };
      case 'rider_assigned':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          label: 'Rider Assigned',
          icon: <User className="w-4 h-4 text-purple-600" />,
        };
      case 'awaiting_payment':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Awaiting Payment',
          icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
        };
      case 'cancelled':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          label: 'Cancelled',
          icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          label: status.replace(/_/g, ' ').toUpperCase(),
          icon: <Clock className="w-4 h-4 text-slate-500" />,
        };
    }
  };

  // Map markers preparation
  const getMapMarkers = () => {
    if (!activeShipment) return [];
    const markers: any[] = [];

    // Sender marker
    if (activeShipment.pickupLat && activeShipment.pickupLng) {
      markers.push({
        id: 'pickup',
        lat: activeShipment.pickupLat,
        lng: activeShipment.pickupLng,
        title: 'Pickup Location',
        subtitle: activeShipment.senderZone,
        type: 'pickup',
        details: activeShipment.senderAddress,
      });
    }

    // Delivery marker
    if (activeShipment.deliveryLat && activeShipment.deliveryLng) {
      markers.push({
        id: 'delivery',
        lat: activeShipment.deliveryLat,
        lng: activeShipment.deliveryLng,
        title: 'Delivery Destination',
        subtitle: activeShipment.recipientZone,
        type: 'delivery',
        details: activeShipment.recipientAddress,
      });
    }

    // Assigned Rider marker (if active assignment)
    if (
      activeShipment.assignedRiderId &&
      (activeShipment.status === 'out_for_delivery' ||
        activeShipment.status === 'collected' ||
        activeShipment.status === 'rider_assigned')
    ) {
      const riders = StorageService.getRiders();
      const rider = riders.find((r) => r.id === activeShipment.assignedRiderId);
      if (rider && rider.isGpsSharing) {
        const lastUpdated = new Date(rider.lastLocationUpdate).getTime();
        const isStale = Date.now() - lastUpdated > 5 * 60 * 1000;

        markers.push({
          id: rider.id,
          lat: rider.currentLat,
          lng: rider.currentLng,
          title: `Rider: ${rider.fullName}`,
          subtitle: `${rider.vehicleType} • ${rider.plateNumber}`,
          type: 'rider',
          details: `Current Zone: ${rider.currentZone} • Speed: Live GPS`,
          isStale,
        });
      }
    }

    return markers;
  };

  const sampleCodes = ['PFR-9824-KE', 'PFR-7419-KE', 'PFR-3108-KE', 'PFR-5321-KE'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Search Section */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold">
            <Package className="w-3.5 h-3.5" />
            <span>Real-Time Parcel Verification</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Track Your Consignment in Real Time
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Enter your unique Efricken Express tracking reference to check live status, milestone updates, and rider location.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto pt-2">
            <input
              type="text"
              required
              placeholder="e.g. PFR-9824-KE"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 text-white font-mono text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400"
            />
            <button
              type="submit"
              className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Search className="w-4 h-4" />
              <span>Track</span>
            </button>
          </form>

          {/* Quick Demo Pins */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span>Quick search:</span>
            {sampleCodes.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setSearchInput(c);
                  const s = StorageService.getShipmentByTrackingNumber(c);
                  if (s) {
                    setActiveShipment(s);
                    setErrorNotFound(false);
                  }
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-amber-500/20 text-amber-400 font-mono text-[11px] border border-slate-700 transition cursor-pointer"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {errorNotFound && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-2">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">Tracking Reference Not Found</h3>
          <p className="text-xs text-slate-600">
            No active or archived shipment was found matching{' '}
            <span className="font-mono font-bold text-slate-900">&ldquo;{searchInput}&rdquo;</span>.
            Please verify the number on your receipt or SMS confirmation.
          </p>
        </div>
      )}

      {/* Shipment Details Display */}
      {activeShipment && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Shipment Overview, Timeline, POD */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Status Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Consignment Reference
                  </div>
                  <div className="text-2xl font-black font-mono text-slate-900">
                    {activeShipment.trackingNumber}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenGmailDesk && (
                    <button
                      type="button"
                      onClick={() => onOpenGmailDesk(activeShipment.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition cursor-pointer shadow-xs"
                      title="Send tracking details to recipient or sender via Gmail"
                    >
                      <Mail className="w-3.5 h-3.5 text-red-500" />
                      <span>Email Updates</span>
                    </button>
                  )}
                  <div
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                      getStatusBadge(activeShipment.status).bg
                    }`}
                  >
                    {getStatusBadge(activeShipment.status).icon}
                    <span>{getStatusBadge(activeShipment.status).label}</span>
                  </div>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Service Type</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {activeShipment.serviceType.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Expected Delivery</span>
                  <span className="font-bold text-slate-800">
                    {activeShipment.estimatedDeliveryWindow || 'Today'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block mb-0.5">Payment Status</span>
                  <span
                    className={`font-bold ${
                      activeShipment.paymentStatus === 'completed'
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {activeShipment.paymentStatus === 'completed'
                      ? 'Paid (Verified ✓)'
                      : 'Pending Payment'}
                  </span>
                </div>
              </div>

              {/* Origin to Destination Route Band */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    Origin
                  </span>
                  <div className="font-bold text-sm text-white">{activeShipment.senderZone}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                    {activeShipment.senderAddress}
                  </div>
                </div>

                <div className="flex flex-col items-center px-2">
                  <ArrowRight className="w-5 h-5 text-amber-400" />
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">Doorstep Run</span>
                </div>

                <div className="text-right space-y-0.5">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Destination
                  </span>
                  <div className="font-bold text-sm text-white">{activeShipment.recipientZone}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                    {activeShipment.recipientAddress}
                  </div>
                </div>
              </div>

              {/* Parcel Items Breakdown */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Parcel Contents & Dimensions
                </h4>
                {activeShipment.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{item.description}</div>
                      <div className="text-[11px] text-slate-500">
                        Category: {item.category} • Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right font-mono text-slate-700">
                      <div>{item.weightKg} kg</div>
                      <div className="text-[11px] text-slate-400">
                        {item.lengthCm}×{item.widthCm}×{item.heightCm} cm
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proof of Delivery Card (If Delivered) */}
            {activeShipment.proofOfDelivery && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-base">Verified Proof of Delivery (POD)</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Received By:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {activeShipment.proofOfDelivery.recipientName}
                    </span>
                    {activeShipment.proofOfDelivery.recipientIdNumber && (
                      <div className="text-slate-600 font-mono text-[11px] mt-0.5">
                        ID: {activeShipment.proofOfDelivery.recipientIdNumber}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-500 block">Delivering Courier:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {activeShipment.proofOfDelivery.riderName}
                    </span>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      {new Date(activeShipment.proofOfDelivery.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                {activeShipment.proofOfDelivery.notes && (
                  <div className="text-xs text-slate-600 bg-white/70 p-3 rounded-xl border border-emerald-100">
                    <span className="font-semibold text-slate-800">Delivery Notes: </span>
                    {activeShipment.proofOfDelivery.notes}
                  </div>
                )}

                {/* Digital Signature Canvas Preview */}
                {activeShipment.proofOfDelivery.signatureDataUrl && (
                  <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-inner">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                      Digital Signature on Handheld Device
                    </div>
                    <img
                      src={activeShipment.proofOfDelivery.signatureDataUrl}
                      alt="Digital Delivery Signature"
                      className="max-h-24 mx-auto object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Milestone Audit Timeline */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Milestone Event History</h3>
                <span className="text-xs text-slate-400 font-mono">
                  {activeShipment.timeline.length} Updates
                </span>
              </div>

              <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 ml-2">
                {activeShipment.timeline.map((evt, idx) => (
                  <div key={evt.id} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-white shadow-xs group-first:bg-amber-500" />
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                        <span className="font-bold text-slate-900 capitalize">
                          {evt.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">{evt.notes}</div>
                      {evt.location && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Map & Support */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Map Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="font-bold text-sm text-slate-900">Live Delivery Route & Map</h3>
                </div>
                {activeShipment.status === 'out_for_delivery' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Rider in Motion
                  </span>
                )}
              </div>

              {/* Leaflet OpenStreetMap */}
              <CourierMap
                markers={getMapMarkers()}
                showRouteLine={true}
                height="340px"
              />

              {/* Assigned Rider Contact (when out for delivery) */}
              {activeShipment.assignedRiderName && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-xs">
                      🏍️
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{activeShipment.assignedRiderName}</div>
                      <div className="text-[11px] text-slate-500">
                        Assigned Courier Rider • Efricken Express Fleet
                      </div>
                    </div>
                  </div>

                  {activeShipment.assignedRiderPhone && (
                    <a
                      href={`tel:${activeShipment.assignedRiderPhone}`}
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition"
                      title="Call Rider"
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Need Assistance Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-sm text-white">Need Delivery Support?</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Have questions regarding delivery timing, address changes, or special instructions for consignment{' '}
                <span className="font-mono text-amber-400 font-bold">{activeShipment.trackingNumber}</span>?
              </p>

              <div className="space-y-2 pt-1">
                <a
                  href={`https://wa.me/${companySettings.whatsappNumber.replace(
                    /[^0-9]/g,
                    ''
                  )}?text=Hello%20Efricken%20Express%20Support,%20I%20have%20an%20enquiry%20regarding%20shipment%20${activeShipment.trackingNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Instant WhatsApp Enquiry</span>
                </a>

                <button
                  type="button"
                  onClick={() => onOpenTicket(activeShipment.trackingNumber)}
                  className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
                >
                  <span>Open Helpdesk Ticket</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
