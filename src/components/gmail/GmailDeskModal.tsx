import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  X,
  History,
  CheckCircle2,
  RefreshCw,
  FileText,
  Truck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Shipment, CompanySettings } from '../../types';
import {
  buildBookingEmailTemplate,
  buildStatusUpdateEmailTemplate,
  buildPaymentReceiptEmailTemplate,
  getSentEmailHistory,
  SentEmailLogItem,
  fetchGmailProfile,
  GmailProfile,
} from '../../services/gmailService';
import {
  auth,
  hasActiveGoogleToken,
  getValidAccessToken,
} from '../../services/googleAuth';
import { GoogleSignInButton } from '../common/GoogleSignInButton';
import { GmailSendConfirmModal } from './GmailSendConfirmModal';

interface GmailDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipments: Shipment[];
  companySettings: CompanySettings;
  selectedShipmentId?: string;
}

export const GmailDeskModal: React.FC<GmailDeskModalProps> = ({
  isOpen,
  onClose,
  shipments,
  companySettings,
  selectedShipmentId,
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [templateType, setTemplateType] = useState<
    'booking' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'receipt' | 'custom'
  >('booking');
  const [recipientType, setRecipientType] = useState<'sender' | 'recipient' | 'custom'>('recipient');
  const [customToEmail, setCustomToEmail] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // Confirmation modal state
  const [confirmModalData, setConfirmModalData] = useState<{
    recipient: string;
    subject: string;
    htmlBody: string;
    trackingNumber: string;
  } | null>(null);

  // Profile data
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [historyList, setHistoryList] = useState<SentEmailLogItem[]>([]);

  // Initialize selected shipment
  useEffect(() => {
    if (shipments.length > 0) {
      if (selectedShipmentId) {
        const found = shipments.find((s) => s.id === selectedShipmentId);
        if (found) {
          setSelectedShipment(found);
          return;
        }
      }
      setSelectedShipment(shipments[0]);
    }
  }, [shipments, selectedShipmentId]);

  // Refresh profile & history
  const loadProfile = async () => {
    const token = await getValidAccessToken();
    if (token) {
      setLoadingProfile(true);
      try {
        const data = await fetchGmailProfile(token);
        setProfile(data);
      } catch (e) {
        console.warn('Could not fetch Gmail profile:', e);
      } finally {
        setLoadingProfile(false);
      }
    }
    setHistoryList(getSentEmailHistory());
  };

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUser = auth.currentUser;
  const isConnected = Boolean(currentUser && hasActiveGoogleToken());

  // Compute recipient email based on selection
  const computedRecipient =
    recipientType === 'sender'
      ? selectedShipment?.senderEmail || ''
      : recipientType === 'recipient'
      ? selectedShipment?.recipientEmail || ''
      : customToEmail;

  // Build draft content based on current template selection
  const generateDraft = () => {
    if (!selectedShipment) {
      return {
        subject: customSubject || 'Efricken Express Delivery Update',
        htmlBody: `<p>${customMessage || 'Courier notification from Efricken Express.'}</p>`,
      };
    }

    switch (templateType) {
      case 'booking':
        return buildBookingEmailTemplate(selectedShipment, companySettings);

      case 'in_transit':
        return buildStatusUpdateEmailTemplate(
          selectedShipment,
          'In Transit / En Route to Hub',
          'Your consignment has been picked up and is safely en route to our central distribution facility on Tsavo Rd, Nairobi.',
          companySettings
        );

      case 'out_for_delivery':
        return buildStatusUpdateEmailTemplate(
          selectedShipment,
          'Out for Delivery',
          'Our field rider is currently dispatching your parcel to the consignee destination address. Please keep phone available.',
          companySettings
        );

      case 'delivered':
        return buildStatusUpdateEmailTemplate(
          selectedShipment,
          'Delivered Successfully',
          'Consignment has been handed over and signed for. Thank you for shipping with Efricken Express!',
          companySettings
        );

      case 'receipt':
        return buildPaymentReceiptEmailTemplate(
          selectedShipment,
          {
            id: `PAY-${Date.now()}`,
            shipmentId: selectedShipment.id,
            trackingNumber: selectedShipment.trackingNumber,
            amountKes: selectedShipment.pricing.totalKes,
            method: 'mpesa_stk',
            mpesaReceiptNumber: `TK9824${selectedShipment.trackingNumber.slice(-4)}`,
            payerPhone: selectedShipment.senderPhone,
            status: 'completed',
            transactionDate: new Date().toISOString(),
            reconciled: true,
          },
          companySettings
        );

      case 'custom':
      default:
        return {
          subject:
            customSubject ||
            `[Efricken Express] Consignment Notice - ${selectedShipment.trackingNumber}`,
          htmlBody: `
            <div style="font-family: sans-serif; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0f172a; margin-top: 0;">Efricken Express Logistics Update</h2>
              <p><strong>Tracking Number:</strong> ${selectedShipment.trackingNumber}</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
                ${(customMessage || 'Courier notification.').replace(/\n/g, '<br>')}
              </div>
              <p style="font-size: 12px; color: #64748b;">
                Headquarters: ${companySettings.headOfficeAddress || 'Nairobi, Tsavo Rd, Eliana Shoppers, Rm 5'}<br>
                Hotline: ${companySettings.supportPhone || '0796333235'} | Till: ${companySettings.mpesaTillNumber || '3020057'}
              </p>
            </div>
          `,
        };
    }
  };

  const handleOpenConfirm = () => {
    const draft = generateDraft();
    setConfirmModalData({
      recipient: computedRecipient,
      subject: draft.subject,
      htmlBody: draft.htmlBody,
      trackingNumber: selectedShipment?.trackingNumber || 'General Notice',
    });
  };

  const handleEmailSent = () => {
    setHistoryList(getSentEmailHistory());
    setActiveTab('history');
  };

  const currentDraft = generateDraft();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white">Gmail Logistics Communications Desk</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dispatch official waybill confirmations, tracking updates, and M-Pesa receipts via Gmail
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <GoogleSignInButton compact />
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('compose')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'compose'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose / Dispatch</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Sent History ({historyList.length})</span>
            </button>
          </div>

          <div className="text-slate-500 flex items-center gap-2 text-[11px]">
            {profile ? (
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected: {profile.emailAddress}</span>
              </span>
            ) : currentUser ? (
              <span className="text-slate-600">{currentUser.email}</span>
            ) : (
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Sign in with Google to send
              </span>
            )}
            <button
              type="button"
              onClick={loadProfile}
              className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
              title="Refresh profile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingProfile ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'compose' ? (
            <div className="space-y-4">
              {/* Select Shipment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Shipment / Consignment
                  </label>
                  <select
                    value={selectedShipment?.id || ''}
                    onChange={(e) => {
                      const found = shipments.find((s) => s.id === e.target.value);
                      if (found) setSelectedShipment(found);
                    }}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
                  >
                    {shipments.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.trackingNumber} — {s.senderName} ➔ {s.recipientName} ({s.status.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Logistics Template
                  </label>
                  <select
                    value={templateType}
                    onChange={(e: any) => setTemplateType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="booking">📋 Booking & Waybill Confirmation</option>
                    <option value="in_transit">🚚 Status: In Transit to Hub</option>
                    <option value="out_for_delivery">🛵 Status: Out for Delivery</option>
                    <option value="delivered">✅ Proof of Delivery (Signed POD)</option>
                    <option value="receipt">💰 M-Pesa Payment Receipt (Till 3020057)</option>
                    <option value="custom">✍️ Custom Dispatch Note</option>
                  </select>
                </div>
              </div>

              {/* Recipient Selector */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-slate-700">Dispatch Email Recipient:</span>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="recType"
                      checked={recipientType === 'recipient'}
                      onChange={() => setRecipientType('recipient')}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <span>
                      Consignee: <strong>{selectedShipment?.recipientName}</strong> (
                      {selectedShipment?.recipientEmail || 'no email'})
                    </span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="recType"
                      checked={recipientType === 'sender'}
                      onChange={() => setRecipientType('sender')}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <span>
                      Sender: <strong>{selectedShipment?.senderName}</strong> (
                      {selectedShipment?.senderEmail || 'no email'})
                    </span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="recType"
                      checked={recipientType === 'custom'}
                      onChange={() => setRecipientType('custom')}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <span>Other Email</span>
                  </label>
                </div>

                {recipientType === 'custom' && (
                  <div className="pt-2">
                    <input
                      type="email"
                      value={customToEmail}
                      onChange={(e) => setCustomToEmail(e.target.value)}
                      placeholder="Enter recipient email address..."
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Custom message field if template is custom */}
              {templateType === 'custom' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="e.g. Urgent Delivery Notification - Waybill #PFR-9824-KE"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Custom Message / Dispatch Instruction
                    </label>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={3}
                      placeholder="Type custom logistics message to client..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Preview card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <div className="bg-slate-200/70 px-4 py-2 flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Preview: {currentDraft.subject}
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Recipient: {computedRecipient || 'Please provide email'}
                  </span>
                </div>
                <div className="p-4 max-h-56 overflow-y-auto">
                  <div
                    className="prose prose-sm max-w-none pointer-events-none text-xs"
                    dangerouslySetInnerHTML={{ __html: currentDraft.htmlBody }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800">
                  Gmail Dispatch History ({historyList.length})
                </h3>
                <span className="text-xs text-slate-500">Live OAuth 2.0 Gmail Session Logs</span>
              </div>

              {historyList.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                  <Mail className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                  <p className="font-medium">No emails dispatched in this session yet.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Select a shipment and dispatch your first delivery notification via Gmail.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {historyList.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate">{item.subject}</span>
                          {item.trackingNumber && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                              {item.trackingNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          To: <strong className="text-slate-700">{item.to}</strong> &bull;{' '}
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {item.status === 'sent' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Dispatched
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-[11px]" title={item.errorMessage}>
                            Failed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isConnected ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Google Workspace account authenticated
              </span>
            ) : (
              <span className="text-amber-700">Please sign in with Google to send actual emails.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              Close
            </button>

            {activeTab === 'compose' && (
              <button
                type="button"
                onClick={handleOpenConfirm}
                disabled={!computedRecipient || !computedRecipient.includes('@')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Review & Dispatch via Gmail</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory confirmation modal before actual send */}
      {confirmModalData && (
        <GmailSendConfirmModal
          isOpen={Boolean(confirmModalData)}
          onClose={() => setConfirmModalData(null)}
          onSuccess={handleEmailSent}
          defaultRecipient={confirmModalData.recipient}
          defaultSubject={confirmModalData.subject}
          defaultHtmlBody={confirmModalData.htmlBody}
          trackingNumber={confirmModalData.trackingNumber}
        />
      )}
    </div>
  );
};
