import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Box,
  Truck,
  ArrowRight,
  Shield,
  HelpCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { ServiceType, ServiceZone } from '../../types';
import { calculateDeliveryCost, DEFAULT_PRICING_SETTINGS } from '../../services/pricingEngine';
import { StorageService } from '../../services/storageService';
import { ActiveView } from '../common/Header';

interface RateCalculatorPageProps {
  zones: ServiceZone[];
  setActiveView: (view: ActiveView) => void;
  onSelectPreloadedBooking?: (bookingParams: any) => void;
}

export const RateCalculatorPage: React.FC<RateCalculatorPageProps> = ({
  zones,
  setActiveView,
  onSelectPreloadedBooking,
}) => {
  const pricingSettings = StorageService.getPricingSettings();

  const [senderZone, setSenderZone] = useState('Nairobi CBD');
  const [recipientZone, setRecipientZone] = useState('Westlands');
  const [serviceType, setServiceType] = useState<ServiceType>('same_day');
  const [actualWeight, setActualWeight] = useState<number>(1.5);
  const [lengthCm, setLengthCm] = useState<number>(30);
  const [widthCm, setWidthCm] = useState<number>(20);
  const [heightCm, setHeightCm] = useState<number>(15);
  const [quantity, setQuantity] = useState<number>(1);
  const [declaredValue, setDeclaredValue] = useState<number>(5000);
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(false);

  const breakdown = useMemo(() => {
    return calculateDeliveryCost({
      actualWeightKg: actualWeight,
      lengthCm,
      widthCm,
      heightCm,
      quantity,
      serviceType,
      senderZone,
      recipientZone,
      declaredValueKes: declaredValue,
      includeInsurance,
      settings: pricingSettings,
    });
  }, [
    actualWeight,
    lengthCm,
    widthCm,
    heightCm,
    quantity,
    serviceType,
    senderZone,
    recipientZone,
    declaredValue,
    includeInsurance,
    pricingSettings,
  ]);

  const handleBookWithRate = () => {
    if (onSelectPreloadedBooking) {
      onSelectPreloadedBooking({
        senderZone,
        recipientZone,
        serviceType,
        actualWeight,
        lengthCm,
        widthCm,
        heightCm,
        quantity,
        declaredValue,
        includeInsurance,
      });
    }
    setActiveView('customer_book');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold">
          <Calculator className="w-3.5 h-3.5" />
          <span>Transparent Logistics Pricing Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Delivery Tariff & Volumetric Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Calculate precise courier tariffs using our administrator-configured rate engine, zone matrices, and IATA dimensional weight standard.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Inputs */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
            <Box className="w-4 h-4 text-amber-500" />
            <span>Route & Consignment Dimensions</span>
          </h2>

          {/* Zones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Collection Zone (Sender)
              </label>
              <select
                value={senderZone}
                onChange={(e) => setSenderZone(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.name}>
                    {z.name} ({z.county})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Destination Zone (Recipient)
              </label>
              <select
                value={recipientZone}
                onChange={(e) => setRecipientZone(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.name}>
                    {z.name} ({z.county})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Delivery Service Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'same_day', label: 'Same-Day Local', sub: 'Guaranteed by 6pm' },
                { id: 'express_2hr', label: 'Express 2-Hour', sub: 'Urgent priority' },
                { id: 'standard', label: 'Standard Parcel', sub: 'Next business day' },
                { id: 'document_secure', label: 'Document Courier', sub: 'Legal & contracts' },
                { id: 'intercity', label: 'Intercity Linehaul', sub: 'Mombasa/Kisumu' },
                { id: 'b2b_corporate', label: 'B2B Corporate', sub: 'Agreed business rate' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setServiceType(s.id as ServiceType)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    serviceType === s.id
                      ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500 text-slate-900'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">{s.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{s.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions & Weight */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Actual Weight (kg)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(parseFloat(e.target.value) || 0.1)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Length (cm)</label>
                <input
                  type="number"
                  min="1"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Width (cm)</label>
                <input
                  type="number"
                  min="1"
                  value={widthCm}
                  onChange={(e) => setWidthCm(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="1"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Dimensional Divisor Formula Note */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-600 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">IATA Volumetric Weight Standard: </span>
                <span>
                  ({lengthCm} × {widthCm} × {heightCm}) ÷ {pricingSettings.volumetricDivisor} ={' '}
                  <span className="font-mono font-bold text-amber-600">
                    {breakdown.volumetricWeightKg} kg
                  </span>
                  . Billable weight charged is{' '}
                  <span className="font-mono font-bold text-slate-900">
                    {breakdown.billableWeightKg} kg
                  </span>{' '}
                  (greater of actual vs volumetric).
                </span>
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="calc-ins"
                  checked={includeInsurance}
                  onChange={(e) => setIncludeInsurance(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
                />
                <label htmlFor="calc-ins" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Add Goods-In-Transit Protection (1.5% of declared value)
                </label>
              </div>
              <Shield className="w-4 h-4 text-amber-500" />
            </div>

            {includeInsurance && (
              <div>
                <label className="block text-xs text-slate-600 mb-1">Declared Item Value (KES)</label>
                <input
                  type="number"
                  step="1000"
                  value={declaredValue}
                  onChange={(e) => setDeclaredValue(parseInt(e.target.value) || 0)}
                  className="w-full sm:w-1/2 p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Real-Time Pricing Breakdown & CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                Instant Quotation
              </div>
              <span className="text-xs font-mono text-slate-400">KES / Kenya Shillings</span>
            </div>

            {/* Big Total Price */}
            <div>
              <span className="text-xs text-slate-400">Estimated Total Charge (Incl. 16% VAT)</span>
              <div className="text-4xl font-black text-amber-400 mt-1">
                KES {breakdown.totalKes.toLocaleString()}
              </div>
            </div>

            {/* Itemized Breakdown List */}
            <div className="space-y-2.5 text-xs border-t border-slate-800 pt-4 font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Base Fare (First 1.0 kg):</span>
                <span>KES {breakdown.baseFareKes}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Extra Weight Charge:</span>
                <span>KES {breakdown.weightChargeKes}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Route Zone Surcharge:</span>
                <span>KES {breakdown.zoneSurchargeKes}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Service Type Multiplier:</span>
                <span className="text-amber-400 font-bold">{breakdown.serviceMultiplier}x</span>
              </div>

              {breakdown.insuranceFeeKes > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Declared Value Insurance:</span>
                  <span>KES {breakdown.insuranceFeeKes}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800/80">
                <span>Subtotal:</span>
                <span>KES {breakdown.subtotalKes.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>16% VAT Tax:</span>
                <span>KES {breakdown.taxKes.toLocaleString()}</span>
              </div>
            </div>

            {/* Billable Weight Pill */}
            <div className="bg-slate-800/90 rounded-2xl p-3 border border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-400">Billable Weight Charged:</span>
              <span className="font-bold text-white font-mono">{breakdown.billableWeightKg} kg</span>
            </div>

            {/* Action CTA */}
            <button
              type="button"
              onClick={handleBookWithRate}
              className="w-full py-4 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book Delivery with this Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Business Account Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-xs text-amber-900 space-y-2">
            <div className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Are you an E-commerce Business or Corporate?</span>
            </div>
            <p className="leading-relaxed">
              We offer volume discounts, customized rate cards, dedicated riders, and 30-day corporate credit terms.
              Contact our corporate accounts desk for a contracted courier agreement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
