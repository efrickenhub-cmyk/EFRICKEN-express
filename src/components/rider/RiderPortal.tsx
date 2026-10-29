import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Navigation,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Camera,
  PenTool,
  Clock,
  MapPin,
  Shield,
  RefreshCw,
  X,
  FileCheck,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { ProofOfDelivery, Rider, Shipment } from '../../types';
import { StorageService } from '../../services/storageService';
import { SignaturePad } from '../common/SignaturePad';

interface RiderPortalProps {
  shipments: Shipment[];
  riders: Rider[];
  onRefresh: () => void;
}

export const RiderPortal: React.FC<RiderPortalProps> = ({
  shipments,
  riders,
  onRefresh,
}) => {
  // Select active rider (default to first busy rider John Mwangi)
  const [currentRiderId, setCurrentRiderId] = useState<string>(
    riders.find((r) => r.status === 'busy')?.id || riders[0]?.id || ''
  );

  const activeRider = riders.find((r) => r.id === currentRiderId) || riders[0];

  // Rider tasks
  const riderTasks = shipments.filter(
    (s) =>
      s.assignedRiderId === activeRider?.id &&
      s.status !== 'cancelled' &&
      s.status !== 'delivered'
  );

  const completedToday = shipments.filter(
    (s) => s.assignedRiderId === activeRider?.id && s.status === 'delivered'
  );

  // POD Modal state
  const [podModalShipment, setPodModalShipment] = useState<Shipment | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientIdNum, setRecipientIdNum] = useState('');
  const [signatureData, setSignatureData] = useState('');
  const [podNotes, setPodNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');

  // Failure Modal state
  const [failModalShipment, setFailModalShipment] = useState<Shipment | null>(null);
  const [failReason, setFailReason] = useState('Recipient phone unreachable');

  // GPS Simulation state
  const [isGpsActive, setIsGpsActive] = useState(activeRider?.isGpsSharing ?? true);
  const [gpsNoticeDismissed, setGpsNoticeDismissed] = useState(false);

  useEffect(() => {
    if (podModalShipment) {
      setRecipientName(podModalShipment.recipientName);
      setRecipientPhone(podModalShipment.recipientPhone);
      setSignatureData('');
      setPhotoPreview('');
      setPodNotes('');
    }
  }, [podModalShipment]);

  const handleSimulateMovement = () => {
    if (!activeRider) return;
    // Simulate slight motion towards destination
    const newLat = activeRider.currentLat + (Math.random() - 0.48) * 0.003;
    const newLng = activeRider.currentLng + (Math.random() - 0.48) * 0.003;
    StorageService.updateRiderLocation(activeRider.id, newLat, newLng);
    onRefresh();
  };

  const handleToggleGps = () => {
    if (!activeRider) return;
    const next = !isGpsActive;
    setIsGpsActive(next);
    StorageService.toggleRiderGps(activeRider.id, next);
    onRefresh();
  };

  const handleMarkCollected = (shipment: Shipment) => {
    StorageService.updateShipmentStatus(
      shipment.id,
      'collected',
      activeRider.fullName,
      'Rider',
      'Parcel inspected and collected from sender premises.',
      shipment.senderZone
    );
    onRefresh();
  };

  const handleMarkOutForDelivery = (shipment: Shipment) => {
    StorageService.updateShipmentStatus(
      shipment.id,
      'out_for_delivery',
      activeRider.fullName,
      'Rider',
      `Rider ${activeRider.fullName} has departed for destination. Customer tracking enabled.`,
      activeRider.currentZone
    );
    onRefresh();
  };

  const handleSubmitPod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podModalShipment || !activeRider) return;

    const fallbackSignature =
      signatureData ||
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100"><path d="M10 50 Q 80 10, 150 60 T 280 40" stroke="%230F172A" stroke-width="3" fill="none"/></svg>';

    const pod: ProofOfDelivery = {
      recipientName: recipientName.trim() || podModalShipment.recipientName,
      recipientPhone: recipientPhone.trim() || podModalShipment.recipientPhone,
      recipientIdNumber: recipientIdNum.trim(),
      signatureDataUrl: fallbackSignature,
      photoUrl: photoPreview || undefined,
      timestamp: new Date().toISOString(),
      riderId: activeRider.id,
      riderName: activeRider.fullName,
      notes: podNotes.trim(),
    };

    StorageService.recordProofOfDelivery(podModalShipment.id, pod);
    setPodModalShipment(null);
    onRefresh();
  };

  const handleSubmitFailure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!failModalShipment || !activeRider) return;

    StorageService.recordDeliveryAttemptFailure(
      failModalShipment.id,
      failReason,
      activeRider.fullName
    );
    setFailModalShipment(null);
    onRefresh();
  };

  const handleSamplePhoto = () => {
    // Generate clean parcel delivery mockup image placeholder
    setPhotoPreview(
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80'
    );
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Switch Rider Device / Testing Dropdown */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700">Rider Handheld Profile:</span>
        <select
          value={currentRiderId}
          onChange={(e) => setCurrentRiderId(e.target.value)}
          className="p-1.5 rounded-lg border border-slate-300 font-medium text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          {riders.map((r) => (
            <option key={r.id} value={r.id}>
              {r.fullName} ({r.vehicleType.toUpperCase()} - {r.plateNumber})
            </option>
          ))}
        </select>
      </div>

      {/* Rider Status Card (Mobile-First) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              🏍️
            </div>
            <div>
              <h2 className="font-bold text-base text-white">{activeRider?.fullName}</h2>
              <div className="text-xs text-amber-400 font-mono">
                {activeRider?.vehicleType.toUpperCase()} • {activeRider?.plateNumber}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
              {activeRider?.status}
            </span>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              ⭐ {activeRider?.rating} ({activeRider?.totalDeliveries} runs)
            </div>
          </div>
        </div>

        {/* GPS Live Tracking Card */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isGpsActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                }`}
              />
              <span className="font-bold text-slate-200">
                {isGpsActive ? 'Live Telemetry Sharing Active' : 'GPS Location Paused'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleGps}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                isGpsActive
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {isGpsActive ? 'Tracking: ON' : 'Tracking: OFF'}
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>
              Lat: {activeRider?.currentLat.toFixed(4)}, Lng: {activeRider?.currentLng.toFixed(4)}
            </span>
            <button
              type="button"
              onClick={handleSimulateMovement}
              className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              Simulate Move 📍
            </button>
          </div>

          {!gpsNoticeDismissed && (
            <div className="text-[10px] text-slate-400 border-t border-slate-700/50 pt-2 flex items-start justify-between gap-2">
              <span className="flex-1">
                🔒 Staff Notice: GPS is captured only while assigned to active dispatches for customer safety and dispatch routing.
              </span>
              <button
                type="button"
                onClick={() => setGpsNoticeDismissed(true)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Summary Metrics */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-0.5">Assigned Deliveries</span>
          <span className="text-2xl font-black text-amber-600 font-mono">
            {riderTasks.length} Active
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-0.5">Delivered Today</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">
            {completedToday.length} Completed
          </span>
        </div>
      </div>

      {/* Current Active Tasks */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center justify-between">
          <span>Active Assignment Queue</span>
          <span className="text-xs text-slate-400 lowercase font-mono">
            {riderTasks.length} pending
          </span>
        </h3>

        {riderTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <div className="font-bold text-sm text-slate-900">All Tasks Completed!</div>
            <p className="text-xs text-slate-500">
              No pending pickups or deliveries assigned right now. Stand by for dispatch updates.
            </p>
          </div>
        ) : (
          riderTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="font-mono font-black text-sm text-slate-900">
                    {task.trackingNumber}
                  </span>
                  <div className="text-[11px] text-slate-500 font-semibold capitalize">
                    {task.serviceType.replace(/_/g, ' ')}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    task.status === 'out_for_delivery'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {task.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Sender / Pickup Section */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    1. Pickup Location (Sender)
                  </span>
                  <a
                    href={`tel:${task.senderPhone}`}
                    className="p-1.5 bg-white text-slate-700 hover:text-emerald-700 rounded-lg border border-slate-200 flex items-center gap-1 font-mono text-[11px]"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>Call Sender</span>
                  </a>
                </div>
                <div className="font-bold text-slate-800">{task.senderName}</div>
                <div className="text-slate-600">{task.senderAddress}</div>
                <div className="text-[11px] text-slate-400">Zone: {task.senderZone}</div>
              </div>

              {/* Recipient / Delivery Section */}
              <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    2. Destination (Recipient)
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        task.recipientAddress + ', Nairobi'
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-white text-slate-700 hover:text-blue-600 rounded-lg border border-amber-200 flex items-center gap-1 text-[11px]"
                    >
                      <Navigation className="w-3 h-3 text-blue-600" />
                      <span>Map</span>
                    </a>
                    <a
                      href={`tel:${task.recipientPhone}`}
                      className="p-1.5 bg-white text-slate-700 hover:text-emerald-700 rounded-lg border border-amber-200 flex items-center gap-1 font-mono text-[11px]"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>
                <div className="font-bold text-slate-800">{task.recipientName}</div>
                <div className="text-slate-600">{task.recipientAddress}</div>
                {task.deliveryInstructions && (
                  <div className="text-[11px] text-amber-800 bg-amber-100/50 p-1.5 rounded">
                    📌 {task.deliveryInstructions}
                  </div>
                )}
              </div>

              {/* Action Buttons based on status */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {task.status === 'rider_assigned' && (
                  <button
                    type="button"
                    onClick={() => handleMarkCollected(task)}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Confirm Parcel Collection</span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                )}

                {task.status === 'collected' && (
                  <button
                    type="button"
                    onClick={() => handleMarkOutForDelivery(task)}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Start Out For Delivery Run</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                {task.status === 'out_for_delivery' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPodModalShipment(task)}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <PenTool className="w-4 h-4" />
                      <span>Deliver & Capture POD</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFailModalShipment(task)}
                      className="px-3.5 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Failed Attempt
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* PROOF OF DELIVERY (POD) MODAL */}
      {podModalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Proof of Delivery (POD)</h3>
              </div>
              <button
                type="button"
                onClick={() => setPodModalShipment(null)}
                className="text-slate-400 hover:text-slate-800 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs font-mono">
              Order: <span className="font-bold">{podModalShipment.trackingNumber}</span> •{' '}
              {podModalShipment.recipientName}
            </div>

            <form onSubmit={handleSubmitPod} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Recipient Name (Receiving Person) *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Full name of person who received"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">National ID / Staff No.</label>
                  <input
                    type="text"
                    value={recipientIdNum}
                    onChange={(e) => setRecipientIdNum(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. 28910291"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Digital Signature Pad */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Recipient Digital Signature *
                </label>
                <SignaturePad
                  height={130}
                  onSave={(dataUrl) => setSignatureData(dataUrl)}
                />
              </div>

              {/* Photo Upload or Sample Simulation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Parcel Photo / Handover Proof</label>
                  <button
                    type="button"
                    onClick={handleSamplePhoto}
                    className="text-[11px] text-amber-600 font-bold hover:underline cursor-pointer"
                  >
                    + Attach Package Photo
                  </button>
                </div>

                {photoPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={photoPreview}
                      alt="POD Preview"
                      className="w-full h-28 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview('')}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="p-3 border border-dashed border-slate-300 rounded-xl text-center text-slate-400 space-y-1">
                    <Camera className="w-5 h-5 mx-auto text-slate-400" />
                    <span className="text-[11px] block">Doorstep / parcel photo (Optional)</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Handover Notes</label>
                <input
                  type="text"
                  value={podNotes}
                  onChange={(e) => setPodNotes(e.target.value)}
                  placeholder="e.g. Received in good condition at front desk"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPodModalShipment(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save POD & Complete Delivery</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELIVERY FAILURE MODAL */}
      {failModalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Record Delivery Exception</h3>
            </div>

            <p className="text-xs text-slate-600">
              Consignment{' '}
              <span className="font-mono font-bold text-slate-900">
                {failModalShipment.trackingNumber}
              </span>{' '}
              could not be completed. Please select the primary operational cause:
            </p>

            <form onSubmit={handleSubmitFailure} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Exception</label>
                <select
                  value={failReason}
                  onChange={(e) => setFailReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="Recipient phone unreachable / switched off">
                    Recipient phone unreachable / switched off
                  </option>
                  <option value="Incorrect or incomplete street address">
                    Incorrect or incomplete street address
                  </option>
                  <option value="Recipient requested rescheduling to another time">
                    Recipient requested rescheduling to another time
                  </option>
                  <option value="Security / gate access denied at premises">
                    Security / gate access denied at premises
                  </option>
                  <option value="Parcel damaged in transit (reported)">
                    Parcel damaged in transit (reported)
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFailModalShipment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer shadow"
                >
                  Submit Exception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
