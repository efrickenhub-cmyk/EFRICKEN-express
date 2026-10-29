import React, { useState, useEffect } from 'react';
import { X, Smartphone, CheckCircle2, AlertCircle, Loader2, Receipt, ShieldCheck } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { Shipment } from '../../types';

interface MpesaModalProps {
  shipment: Shipment;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (receipt: string) => void;
}

export const MpesaModal: React.FC<MpesaModalProps> = ({
  shipment,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(
    shipment.senderPhone || '0712345678'
  );
  const [stage, setStage] = useState<'input' | 'pushing' | 'prompt_displayed' | 'success' | 'failed'>('input');
  const [countdown, setCountdown] = useState(30);
  const [mpesaPin, setMpesaPin] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === 'prompt_displayed' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (stage === 'prompt_displayed' && countdown === 0) {
      setStage('failed');
      setErrorMessage('M-Pesa STK prompt timed out. Please retry.');
    }
    return () => clearTimeout(timer);
  }, [stage, countdown]);

  if (!isOpen) return null;

  const handleInitiateStk = (e: React.FormEvent) => {
    e.preventDefault();
    setStage('pushing');
    setErrorMessage('');

    // Simulate Daraja API STK Push initiation
    setTimeout(() => {
      setStage('prompt_displayed');
      setCountdown(30);
    }, 1500);
  };

  const handleAuthorizePayment = () => {
    // Generate valid looking Daraja receipt
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const randLetters = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const randNums = Math.floor(1000000 + Math.random() * 9000000);
    const receipt = `Q${randLetters}${randNums}`;

    const record = StorageService.recordMpesaPayment({
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber,
      amountKes: shipment.pricing.totalKes,
      phone: phoneNumber,
      mpesaReceiptNumber: receipt,
    });

    setReceiptNumber(receipt);
    setStage('success');
    onPaymentSuccess(receipt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg">
              M
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Safaricom M-Pesa</h3>
              <p className="text-xs text-emerald-100">Daraja STK Push Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Amount banner */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-700 uppercase font-semibold tracking-wider">Amount Due</span>
              <div className="text-2xl font-black text-emerald-950">
                KES {shipment.pricing.totalKes.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Order Reference</span>
              <div className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-emerald-200">
                {shipment.trackingNumber}
              </div>
            </div>
          </div>

          {stage === 'input' && (
            <form onSubmit={handleInitiateStk} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Enter Safaricom M-Pesa Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                    🇰🇪
                  </span>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 0712 345 678 or 0110 123 456"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 font-mono font-medium text-sm"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  An automatic STK prompt will appear on your phone asking you to enter your M-Pesa PIN.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  Request M-Pesa STK Push
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secured via Safaricom Daraja 2.0 API & SSL 256-bit</span>
              </div>
            </form>
          )}

          {stage === 'pushing' && (
            <div className="py-8 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
              <div>
                <h4 className="font-bold text-slate-900 text-base">Connecting to Safaricom Daraja...</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Transmitting payment push request to <span className="font-mono font-medium">{phoneNumber}</span>
                </p>
              </div>
            </div>
          )}

          {stage === 'prompt_displayed' && (
            <div className="space-y-5">
              {/* Phone STK Push Mockup */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl border border-slate-800 text-center relative overflow-hidden">
                <div className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold tracking-wide uppercase mb-3">
                  STK Push Sent to Mobile
                </div>

                <div className="text-xs text-slate-300 leading-relaxed font-mono">
                  &ldquo;Do you want to pay KES {shipment.pricing.totalKes.toLocaleString()} to{' '}
                  <span className="text-emerald-400 font-bold">EFRICKEN EXPRESS</span> Buy Goods Till 3020057 Acc:{' '}
                  {shipment.trackingNumber}?&rdquo;
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400 mb-2">Simulate entering M-Pesa PIN:</div>
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      value={mpesaPin}
                      onChange={(e) => setMpesaPin(e.target.value)}
                      placeholder="••••"
                      className="w-28 text-center tracking-[0.5em] py-2 bg-slate-800 border border-slate-700 text-white font-mono rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-amber-400">
                  <span>Awaiting phone confirmation:</span>
                  <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                    {countdown}s
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleAuthorizePayment}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm / Authorize STK Push (Simulate)
                </button>
                <button
                  type="button"
                  onClick={() => setStage('input')}
                  className="w-full py-2 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 text-center cursor-pointer"
                >
                  Change phone number or cancel
                </button>
              </div>
            </div>
          )}

          {stage === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900">Payment Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  M-Pesa transaction was verified and matched to order {shipment.trackingNumber}.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">M-Pesa Receipt:</span>
                  <span className="font-bold text-slate-900">{receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-emerald-700">KES {shipment.pricing.totalKes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payer Phone:</span>
                  <span className="text-slate-800">{phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-800">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow transition-all cursor-pointer"
              >
                Close & View Updated Shipment
              </button>
            </div>
          )}

          {stage === 'failed' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Payment Incomplete</h4>
                <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setStage('input')}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
