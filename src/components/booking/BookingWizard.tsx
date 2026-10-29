import React, { useState, useMemo } from 'react';
import {
  Package,
  Truck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Shield,
  Phone,
  Mail,
  User,
  Boxes,
  Smartphone,
  Banknote,
  Building,
} from 'lucide-react';
import { PaymentMethod, ServiceType, ServiceZone, Shipment } from '../../types';
import { calculateDeliveryCost } from '../../services/pricingEngine';
import { StorageService } from '../../services/storageService';
import { MpesaModal } from '../mpesa/MpesaModal';
import { ActiveView } from '../common/Header';

interface BookingWizardProps {
  zones: ServiceZone[];
  preloadedParams?: any;
  setActiveView: (view: ActiveView) => void;
  onBookingComplete: (shipment: Shipment) => void;
  onOpenGmailDesk?: (shipmentId?: string) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  zones,
  preloadedParams,
  setActiveView,
  onBookingComplete,
  onOpenGmailDesk,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  // Step 1: Sender
  const [senderName, setSenderName] = useState('Sarah Wambui');
  const [senderPhone, setSenderPhone] = useState('0722334455');
  const [senderEmail, setSenderEmail] = useState('sarah.wambui@gmail.com');
  const [senderAddress, setSenderAddress] = useState('Westlands Business Park, 3rd Floor');
  const [senderZone, setSenderZone] = useState(preloadedParams?.senderZone || 'Westlands');
  const [pickupWindow, setPickupWindow] = useState('Today 11:00 AM - 1:00 PM');
  const [senderNotes, setSenderNotes] = useState('');

  // Step 2: Recipient
  const [recipientName, setRecipientName] = useState('George Mwiti');
  const [recipientPhone, setRecipientPhone] = useState('0712998877');
  const [recipientEmail, setRecipientEmail] = useState('george.mwiti@outlook.com');
  const [recipientAddress, setRecipientAddress] = useState('Kilimani Ring Road, Plaza 2000, 2nd Floor');
  const [recipientZone, setRecipientZone] = useState(preloadedParams?.recipientZone || 'Kilimani / Kileleshwa');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Call 10 minutes prior to arrival');

  // Step 3: Parcel Details
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('Sony WH-1000XM5 Wireless Headphones (Boxed)');
  const [quantity, setQuantity] = useState(preloadedParams?.quantity || 1);
  const [weightKg, setWeightKg] = useState(preloadedParams?.actualWeight || 1.2);
  const [lengthCm, setLengthCm] = useState(preloadedParams?.lengthCm || 25);
  const [widthCm, setWidthCm] = useState(preloadedParams?.widthCm || 20);
  const [heightCm, setHeightCm] = useState(preloadedParams?.heightCm || 10);
  const [declaredValueKes, setDeclaredValueKes] = useState(preloadedParams?.declaredValue || 35000);
  const [includeInsurance, setIncludeInsurance] = useState(preloadedParams?.includeInsurance || true);
  const [isFragile, setIsFragile] = useState(true);

  // Step 4: Service & Payment
  const [serviceType, setServiceType] = useState<ServiceType>(preloadedParams?.serviceType || 'express_2hr');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa_stk');

  // M-Pesa Modal
  const [createdShipment, setCreatedShipment] = useState<Shipment | null>(null);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const pricingSettings = StorageService.getPricingSettings();

  const pricing = useMemo(() => {
    return calculateDeliveryCost({
      actualWeightKg: weightKg,
      lengthCm,
      widthCm,
      heightCm,
      quantity,
      serviceType,
      senderZone,
      recipientZone,
      declaredValueKes,
      includeInsurance,
      settings: pricingSettings,
    });
  }, [
    weightKg,
    lengthCm,
    widthCm,
    heightCm,
    quantity,
    serviceType,
    senderZone,
    recipientZone,
    declaredValueKes,
    includeInsurance,
    pricingSettings,
  ]);

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();

    // Coordinates mapping helper
    const originZoneObj = zones.find((z) => z.name === senderZone);
    const destZoneObj = zones.find((z) => z.name === recipientZone);

    const newShipment = StorageService.createShipment({
      status: paymentMethod === 'mpesa_stk' ? 'awaiting_payment' : 'booking_confirmed',
      serviceType,
      senderName,
      senderPhone,
      senderEmail,
      senderAddress,
      senderZone,
      pickupWindow,
      senderNotes,
      recipientName,
      recipientPhone,
      recipientEmail,
      recipientAddress,
      recipientZone,
      deliveryInstructions,
      items: [
        {
          id: `item-${Date.now()}`,
          category,
          description,
          quantity,
          weightKg,
          lengthCm,
          widthCm,
          heightCm,
          declaredValueKes,
          isFragile,
        },
      ],
      pricing,
      paymentMethod,
      paymentStatus: 'pending',
      pickupLat: originZoneObj?.centerLat,
      pickupLng: originZoneObj?.centerLng,
      deliveryLat: destZoneObj?.centerLat,
      deliveryLng: destZoneObj?.centerLng,
    });

    setCreatedShipment(newShipment);

    if (paymentMethod === 'mpesa_stk') {
      setShowMpesaModal(true);
    } else {
      setIsSuccess(true);
      onBookingComplete(newShipment);
    }
  };

  const handleMpesaSuccess = (receipt: string) => {
    setShowMpesaModal(false);
    setIsSuccess(true);
    if (createdShipment) {
      const refreshed = StorageService.getShipmentById(createdShipment.id);
      if (refreshed) {
        setCreatedShipment(refreshed);
        onBookingComplete(refreshed);
      }
    }
  };

  if (isSuccess && createdShipment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Booking Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Delivery Order Registered!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Your parcel request has been placed in the dispatch queue. A notification SMS has been dispatched to{' '}
              <span className="font-bold text-slate-900">{createdShipment.senderPhone}</span>.
            </p>
          </div>

          {/* Tracking Number Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 max-w-md mx-auto space-y-2">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Your Public Tracking Reference
            </span>
            <div className="text-3xl font-black font-mono text-white tracking-wider">
              {createdShipment.trackingNumber}
            </div>
            <p className="text-[11px] text-slate-400">
              Share this reference code with {createdShipment.recipientName} to track live delivery progress.
            </p>
          </div>

          {/* Summary grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs font-mono max-w-md mx-auto space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Service:</span>
              <span className="font-bold text-slate-800 capitalize">
                {createdShipment.serviceType.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Billed:</span>
              <span className="font-bold text-emerald-700">
                KES {createdShipment.pricing.totalKes.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment:</span>
              <span className="font-bold text-slate-800 capitalize">
                {createdShipment.paymentMethod.replace(/_/g, ' ')} ({createdShipment.paymentStatus})
              </span>
            </div>
            {createdShipment.mpesaReceiptNumber && (
              <div className="flex justify-between">
                <span className="text-slate-500">M-Pesa Receipt:</span>
                <span className="font-bold text-slate-900">
                  {createdShipment.mpesaReceiptNumber}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {onOpenGmailDesk && (
              <button
                type="button"
                onClick={() => onOpenGmailDesk(createdShipment.id)}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-2 border border-slate-700"
              >
                <Mail className="w-4 h-4 text-red-400" />
                <span>Email Waybill via Gmail</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveView('public_tracking')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span>Track this Parcel Live</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSuccess(false);
                setCreatedShipment(null);
                setStep(1);
              }}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Book Another Parcel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Stepper Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Book a Delivery
            </h1>
            <p className="text-xs text-slate-500">
              Complete the sender, recipient, and parcel details for instant doorstep pickup.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Step {step} of 4
          </span>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, label: '1. Sender' },
            { num: 2, label: '2. Recipient' },
            { num: 3, label: '3. Parcel' },
            { num: 4, label: '4. Service & Pay' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => {
                if (s.num < step) setStep(s.num as any);
              }}
              className={`h-2 rounded-full transition-all ${
                s.num <= step ? 'bg-amber-500' : 'bg-slate-200'
              } ${s.num < step ? 'cursor-pointer hover:bg-amber-600' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Main Wizard Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <form onSubmit={handleCreateBooking} className="space-y-6">
          {/* STEP 1: SENDER INFORMATION */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <User className="w-5 h-5 text-amber-500" />
                <span>Sender & Collection Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sender Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g. John Doe or Business Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sender Telephone (M-Pesa registered) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g. 0712 345 678"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sender Email Address
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g. sender@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Collection Service Zone *
                  </label>
                  <select
                    value={senderZone}
                    onChange={(e) => setSenderZone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.name}>
                        {z.name} ({z.county})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pickup Physical Address / Building / Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. Delta Corner Annex, Floor 4, Suite 12, Westlands"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Collection Window
                  </label>
                  <select
                    value={pickupWindow}
                    onChange={(e) => setPickupWindow(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Immediate Collection (Within 30 mins)">Immediate (Within 30 mins)</option>
                    <option value="Today 11:00 AM - 1:00 PM">Today 11:00 AM - 1:00 PM</option>
                    <option value="Today 2:00 PM - 5:00 PM">Today 2:00 PM - 5:00 PM</option>
                    <option value="Tomorrow Morning (8:00 AM - 11:00 AM)">Tomorrow Morning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Special Pickup Notes
                  </label>
                  <input
                    type="text"
                    value={senderNotes}
                    onChange={(e) => setSenderNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g. Ring reception bell on arrival"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition shadow"
                >
                  <span>Proceed to Recipient Details</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: RECIPIENT INFORMATION */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <MapPin className="w-5 h-5 text-amber-500" />
                <span>Recipient & Destination Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g. Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Recipient Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g. 0712 345 678"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Recipient Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="For delivery confirmation receipts"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Destination Service Zone *
                  </label>
                  <select
                    value={recipientZone}
                    onChange={(e) => setRecipientZone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.name}>
                        {z.name} ({z.county})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Address & Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. Lenana Road, Opposite Cedars, House No 4"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Instructions for Courier Rider
                </label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. Call before coming upstairs or leave with security"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition shadow"
                >
                  <span>Proceed to Parcel Details</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PARCEL DETAILS */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <Boxes className="w-5 h-5 text-amber-500" />
                <span>Parcel Classification & Dimensional Measurements</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category of Goods *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Electronics">Electronics & Gadgets</option>
                    <option value="Documents">Legal & Commercial Documents</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Food & Perishables">Food & Perishables</option>
                    <option value="Healthcare & Cosmetics">Healthcare & Cosmetics</option>
                    <option value="Spare Parts & Tools">Spare Parts & Tools</option>
                    <option value="General Cargo">General Cargo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parcel Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g. 2 boxes of organic coffee beans"
                  />
                </div>
              </div>

              {/* Weight & Size */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0.1)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Length (cm) *</label>
                  <input
                    type="number"
                    min="1"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Width (cm) *</label>
                  <input
                    type="number"
                    min="1"
                    value={widthCm}
                    onChange={(e) => setWidthCm(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm) *</label>
                  <input
                    type="number"
                    min="1"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Declared Value & Insurance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Declared Monetary Value (KES)
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={declaredValueKes}
                    onChange={(e) => setDeclaredValueKes(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="e.g. 10000"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="fragile-check"
                      checked={isFragile}
                      onChange={(e) => setIsFragile(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded border-slate-300"
                    />
                    <label htmlFor="fragile-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Handle with Care / Fragile Goods
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="insurance-check"
                      checked={includeInsurance}
                      onChange={(e) => setIncludeInsurance(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded border-slate-300"
                    />
                    <label htmlFor="insurance-check" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Protect with Insurance (1.5% premium)
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition shadow"
                >
                  <span>Proceed to Service & Payment</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SERVICE SELECTION & CHECKOUT */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <Truck className="w-5 h-5 text-amber-500" />
                <span>Service Urgency & Payment Method</span>
              </h2>

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Delivery Service SLA
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'express_2hr',
                      title: 'Express 2-Hour',
                      desc: 'Direct priority hot-shot',
                      sla: 'Within 2h',
                      multiplier: '1.85x',
                    },
                    {
                      id: 'same_day',
                      title: 'Same-Day Local',
                      desc: 'By 6:00 PM doorstep',
                      sla: 'Today',
                      multiplier: '1.25x',
                    },
                    {
                      id: 'standard',
                      title: 'Standard Parcel',
                      desc: 'Next business day',
                      sla: 'Tomorrow',
                      multiplier: '1.0x',
                    },
                  ].map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setServiceType(s.id as ServiceType)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                        serviceType === s.id
                          ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{s.title}</span>
                        <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-100/60 px-1.5 py-0.5 rounded">
                          {s.sla}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Choose Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setPaymentMethod('mpesa_stk')}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === 'mpesa_stk'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        M
                      </div>
                      <span className="font-bold text-xs text-slate-900">M-Pesa STK Push</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Instant prompt sent to your Safaricom mobile phone.
                    </p>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-amber-600" />
                      <span className="font-bold text-xs text-slate-900">Cash on Delivery</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Recipient pays cash or M-Pesa till to the rider on handover.
                    </p>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('corporate_invoice')}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === 'corporate_invoice'
                        ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-slate-800" />
                      <span className="font-bold text-xs text-slate-900">Corporate Invoice</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Charged to pre-approved monthly corporate logistics account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown Summary */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-amber-400 font-bold uppercase tracking-wider">
                    Official Delivery Quote Breakdown
                  </span>
                  <span className="text-slate-400">Billable: {pricing.billableWeightKg} kg</span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span>Base Fare & Weight:</span>
                    <span>KES {pricing.baseFareKes + pricing.weightChargeKes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Route Surcharge ({senderZone} → {recipientZone}):</span>
                    <span>KES {pricing.zoneSurchargeKes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service SLA Multiplier ({serviceType}):</span>
                    <span>{pricing.serviceMultiplier}x</span>
                  </div>
                  {pricing.insuranceFeeKes > 0 && (
                    <div className="flex justify-between">
                      <span>Transit Insurance Protection:</span>
                      <span>KES {pricing.insuranceFeeKes}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>16% VAT:</span>
                    <span>KES {pricing.taxKes}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-800 font-sans">
                  <div>
                    <span className="text-xs text-slate-400 block">Total Due</span>
                    <span className="text-3xl font-black text-amber-400 font-mono">
                      KES {pricing.totalKes.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 font-mono">
                    Estimated Time: Today within 2 hours
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition transform active:scale-95"
                >
                  <span>
                    {paymentMethod === 'mpesa_stk'
                      ? 'Confirm & Pay with M-Pesa STK'
                      : 'Confirm & Place Booking'}
                  </span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* M-Pesa STK Modal */}
      {createdShipment && showMpesaModal && (
        <MpesaModal
          shipment={createdShipment}
          isOpen={showMpesaModal}
          onClose={() => setShowMpesaModal(false)}
          onPaymentSuccess={handleMpesaSuccess}
        />
      )}
    </div>
  );
};
