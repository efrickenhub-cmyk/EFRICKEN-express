import React, { useState } from 'react';
import {
  Compass,
  Truck,
  UserCheck,
  AlertTriangle,
  Clock,
  Search,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Phone,
  ArrowRight,
  Filter,
  Mail,
} from 'lucide-react';
import { Rider, ServiceZone, Shipment, ShipmentStatus } from '../../types';
import { StorageService } from '../../services/storageService';
import { CourierMap } from '../map/CourierMap';

interface DispatchConsoleProps {
  shipments: Shipment[];
  riders: Rider[];
  zones: ServiceZone[];
  onRefresh: () => void;
  onOpenGmailDesk?: (shipmentId?: string) => void;
}

export const DispatchConsole: React.FC<DispatchConsoleProps> = ({
  shipments,
  riders,
  zones,
  onRefresh,
  onOpenGmailDesk,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignModalShipment, setAssignModalShipment] = useState<Shipment | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string>(riders[0]?.id || '');
  const [statusUpdateModalShipment, setStatusUpdateModalShipment] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>('in_transit');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusLocation, setStatusLocation] = useState('Nairobi Sorting Hub');

  // Filter shipments
  const filteredShipments = shipments.filter((s) => {
    if (selectedZone !== 'all' && s.senderZone !== selectedZone && s.recipientZone !== selectedZone) {
      return false;
    }
    if (selectedStatus !== 'all' && s.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.trackingNumber.toLowerCase().includes(q) ||
        s.senderName.toLowerCase().includes(q) ||
        s.recipientName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate unassigned & overdue shipments
  const unassignedShipments = shipments.filter(
    (s) =>
      !s.assignedRiderId &&
      (s.status === 'booking_confirmed' ||
        s.status === 'payment_confirmed' ||
        s.status === 'awaiting_pickup')
  );

  const overdueDeliveries = shipments.filter(
    (s) =>
      s.status !== 'delivered' &&
      s.status !== 'cancelled' &&
      Date.now() - new Date(s.createdAt).getTime() > 6 * 3600 * 1000
  );

  const handleAssignRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalShipment || !selectedRiderId) return;

    StorageService.assignRider(assignModalShipment.id, selectedRiderId, 'Head Dispatcher');
    setAssignModalShipment(null);
    onRefresh();
  };

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusUpdateModalShipment) return;

    StorageService.updateShipmentStatus(
      statusUpdateModalShipment.id,
      newStatus,
      'Dispatch Supervisor',
      'Dispatcher',
      statusNotes,
      statusLocation
    );
    setStatusUpdateModalShipment(null);
    setStatusNotes('');
    onRefresh();
  };

  // Prepare dispatch map markers
  const mapMarkers = [
    // Riders
    ...riders.map((r) => {
      const isStale = Date.now() - new Date(r.lastLocationUpdate).getTime() > 5 * 60 * 1000;
      return {
        id: r.id,
        lat: r.currentLat,
        lng: r.currentLng,
        title: `Rider: ${r.fullName}`,
        subtitle: `${r.vehicleType.toUpperCase()} • ${r.plateNumber}`,
        type: 'rider' as const,
        details: `Status: ${r.status.toUpperCase()} • Zone: ${r.currentZone}`,
        isStale,
      };
    }),
    // Active deliveries
    ...shipments
      .filter((s) => s.status === 'out_for_delivery' && s.deliveryLat && s.deliveryLng)
      .map((s) => ({
        id: s.id,
        lat: s.deliveryLat!,
        lng: s.deliveryLng!,
        title: `Dropoff: ${s.trackingNumber}`,
        subtitle: s.recipientName,
        type: 'delivery' as const,
        details: `${s.recipientZone} • ${s.recipientAddress}`,
      })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Console Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Operational Dispatch Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Central Dispatch & Fleet Console
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time delivery routing, rider allocation, SLA compliance, and cross-depot coordination.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <span>Refresh Live Queue</span>
        </button>
      </div>

      {/* Overdue / Exception Alert Banner */}
      {overdueDeliveries.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block">
                {overdueDeliveries.length} Consignments Exceeding Standard SLA Window
              </span>
              <p className="text-amber-800 mt-0.5">
                Immediate dispatch review recommended for orders:{' '}
                {overdueDeliveries.map((s) => s.trackingNumber).join(', ')}.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-amber-200/80 rounded-md font-mono font-bold text-amber-900 shrink-0">
            Priority Action
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">Unassigned Bookings</span>
          <span className="text-2xl font-black text-amber-600 font-mono">
            {unassignedShipments.length}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">Active Fleet in Field</span>
          <span className="text-2xl font-black text-slate-900 font-mono">
            {riders.filter((r) => r.status !== 'offline').length} / {riders.length} Riders
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">Out For Delivery Right Now</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">
            {shipments.filter((s) => s.status === 'out_for_delivery').length}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">Daily Completion Rate</span>
          <span className="text-2xl font-black text-slate-900 font-mono">98.2%</span>
        </div>
      </div>

      {/* Operational Live Map */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Live Nairobi Fleet & Out-For-Delivery Map</h2>
            <p className="text-xs text-slate-500">
              Interactive GPS location pins for active motorcycle riders and current destination run points.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-slate-600 font-medium">Live Rider</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-600" />
              <span className="text-slate-600 font-medium">Dropoff Destination</span>
            </div>
          </div>
        </div>

        <CourierMap markers={mapMarkers} height="360px" zoom={12} />
      </div>

      {/* Unassigned Urgent Queue */}
      {unassignedShipments.length > 0 && (
        <div className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              <h3 className="font-bold text-base text-slate-900">
                Incoming Bookings Awaiting Rider Assignment ({unassignedShipments.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">Assign rider to start pickup</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unassignedShipments.map((s) => (
              <div
                key={s.id}
                className="bg-amber-50/40 rounded-2xl p-4 border border-amber-200 flex flex-col justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between font-mono font-bold">
                    <span className="text-slate-900">{s.trackingNumber}</span>
                    <span className="text-amber-700 uppercase bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                      {s.serviceType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="mt-2 text-slate-700 font-medium">
                    <div>
                      <span className="text-slate-400">From:</span> {s.senderZone} ({s.senderAddress})
                    </div>
                    <div>
                      <span className="text-slate-400">To:</span> {s.recipientZone} ({s.recipientName})
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    KES {s.pricing.totalKes.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignModalShipment(s);
                      setSelectedRiderId(riders[0]?.id || '');
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Assign Rider</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Shipments Dispatch Grid with Zone & Status Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters bar */}
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Zone Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">Filter Zone:</span>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Service Zones ({zones.length})</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.name}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="p-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Statuses</option>
                <option value="booking_confirmed">Booking Confirmed</option>
                <option value="awaiting_pickup">Awaiting Pickup</option>
                <option value="rider_assigned">Rider Assigned</option>
                <option value="collected">Collected</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out For Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tracking Code</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Route Band</th>
                <th className="py-3.5 px-4">Assigned Rider</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredShipments.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900">{s.trackingNumber}</span>
                    <span className="block text-[10px] text-slate-400 font-normal">
                      {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 capitalize text-slate-700">
                    {s.serviceType.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-800 font-semibold">{s.senderZone}</span>
                    <span className="text-slate-400 mx-1">→</span>
                    <span className="text-slate-800 font-semibold">{s.recipientZone}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    {s.assignedRiderName ? (
                      <div>
                        <span className="font-semibold text-slate-900">{s.assignedRiderName}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {s.assignedRiderPhone}
                        </span>
                      </div>
                    ) : (
                      <span className="text-amber-600 font-bold text-[11px]">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        s.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700'
                          : s.status === 'out_for_delivery'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {s.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    KES {s.pricing.totalKes.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {onOpenGmailDesk && (
                      <button
                        type="button"
                        onClick={() => onOpenGmailDesk(s.id)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1 border border-amber-200"
                        title="Send update via Gmail"
                      >
                        <Mail className="w-3 h-3 text-red-500" />
                        <span>Email</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setAssignModalShipment(s);
                        setSelectedRiderId(s.assignedRiderId || riders[0]?.id || '');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      {s.assignedRiderId ? 'Reassign' : 'Assign'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusUpdateModalShipment(s);
                        setNewStatus(s.status);
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Rider Modal */}
      {assignModalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-500" />
                <span>Assign Rider to Consignment</span>
              </h3>
              <button
                type="button"
                onClick={() => setAssignModalShipment(null)}
                className="text-slate-400 hover:text-slate-800 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1 font-mono">
              <div className="font-bold text-slate-900">
                Order: {assignModalShipment.trackingNumber}
              </div>
              <div className="text-slate-600">
                Route: {assignModalShipment.senderZone} → {assignModalShipment.recipientZone}
              </div>
              <div className="text-slate-500">Service: {assignModalShipment.serviceType}</div>
            </div>

            <form onSubmit={handleAssignRiderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Available Rider
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {riders.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRiderId(r.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        selectedRiderId === r.id
                          ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{r.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {r.vehicleType.toUpperCase()} ({r.plateNumber}) • Zone: {r.currentZone}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.status === 'available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">⭐ {r.rating}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalShipment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
                >
                  Confirm Rider Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Status Override Modal */}
      {statusUpdateModalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Manual Shipment Status Update</h3>
              <button
                type="button"
                onClick={() => setStatusUpdateModalShipment(null)}
                className="text-slate-400 hover:text-slate-800 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">New Milestone Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="awaiting_pickup">Awaiting Pickup</option>
                  <option value="rider_assigned">Rider Assigned</option>
                  <option value="collected">Collected</option>
                  <option value="at_sorting_facility">At Sorting Facility</option>
                  <option value="in_transit">In Transit</option>
                  <option value="arrived_at_destination_facility">Arrived at Destination Facility</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered Successfully</option>
                  <option value="delivery_attempted">Delivery Attempted (Failed)</option>
                  <option value="rescheduled">Rescheduled</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Facility / Location</label>
                <input
                  type="text"
                  value={statusLocation}
                  onChange={(e) => setStatusLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. Enterprise Road Sorting Bay 3"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operational Notes (Audited)</label>
                <textarea
                  rows={2}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. Transferred from night freight linehaul"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusUpdateModalShipment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Apply Status Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
