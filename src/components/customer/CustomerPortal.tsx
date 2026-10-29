import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Plus,
  Search,
  FileText,
  XCircle,
  MessageSquare,
  MapPin,
  Eye,
  Download,
  AlertTriangle,
  Mail,
} from 'lucide-react';
import { Shipment, SupportTicket } from '../../types';
import { StorageService } from '../../services/storageService';
import { ActiveView } from '../common/Header';

interface CustomerPortalProps {
  shipments: Shipment[];
  setActiveView: (view: ActiveView) => void;
  onTrack: (code: string) => void;
  onRefresh: () => void;
  onOpenGmailDesk?: (shipmentId?: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  shipments,
  setActiveView,
  onTrack,
  onRefresh,
  onOpenGmailDesk,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptShipment, setSelectedReceiptShipment] = useState<Shipment | null>(null);
  const [cancelModalShipment, setCancelModalShipment] = useState<Shipment | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of delivery plans');

  // Support ticket form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<SupportTicket['category']>('delivery_delay');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const filteredShipments = shipments.filter((s) => {
    if (filter === 'active' && (s.status === 'delivered' || s.status === 'cancelled')) return false;
    if (filter === 'delivered' && s.status !== 'delivered') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.trackingNumber.toLowerCase().includes(q) ||
        s.recipientName.toLowerCase().includes(q) ||
        s.recipientZone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCancelOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalShipment) return;

    StorageService.cancelShipment(cancelModalShipment.id, cancelReason, 'Customer Portal');
    setCancelModalShipment(null);
    onRefresh();
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) return;

    StorageService.createTicket({
      customerName: 'Sarah Wambui',
      customerPhone: '+254 722 334 455',
      customerEmail: 'sarah.wambui@gmail.com',
      category: ticketCategory,
      priority: 'medium',
      subject: ticketSubject,
      description: ticketDesc,
    });

    setTicketSubject('');
    setTicketDesc('');
    setTicketSuccess(true);
    setTimeout(() => setTicketSuccess(false), 4000);
  };

  const canCancel = (s: Shipment) => {
    return (
      s.status === 'draft' ||
      s.status === 'booking_confirmed' ||
      s.status === 'awaiting_payment' ||
      s.status === 'awaiting_pickup'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div>
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Customer Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">My Parcel Consignments</h1>
          <p className="text-xs text-slate-300 mt-1">
            Track active shipments, download official payment receipts, and submit customer service tickets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('customer_book')}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Delivery</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">Total Bookings</span>
          <span className="text-2xl font-black text-slate-900">{shipments.length}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">In-Transit / Active</span>
          <span className="text-2xl font-black text-amber-600">
            {
              shipments.filter(
                (s) => s.status !== 'delivered' && s.status !== 'cancelled'
              ).length
            }
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">Delivered Safely</span>
          <span className="text-2xl font-black text-emerald-600">
            {shipments.filter((s) => s.status === 'delivered').length}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block mb-1">Saved Addresses</span>
          <span className="text-2xl font-black text-slate-900">3 Saved</span>
        </div>
      </div>

      {/* Shipments Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({shipments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filter === 'active'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Active Shipments
            </button>
            <button
              type="button"
              onClick={() => setFilter('delivered')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                filter === 'delivered'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Delivered
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tracking, recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* List of Shipments */}
        <div className="divide-y divide-slate-100">
          {filteredShipments.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-sm text-slate-700">No shipments match your filter</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Book a parcel delivery now to start tracking live across Kenya.
              </p>
            </div>
          ) : (
            filteredShipments.map((s) => (
              <div
                key={s.id}
                className="p-5 sm:p-6 hover:bg-slate-50/70 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-black text-sm text-slate-900">
                      {s.trackingNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        s.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : s.status === 'out_for_delivery'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : s.status === 'cancelled'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {s.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{s.senderZone}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-semibold text-slate-800">{s.recipientZone}</span>
                    <span className="text-slate-300">•</span>
                    <span>Recipient: {s.recipientName}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    Service: {s.serviceType.replace(/_/g, ' ')} • Billed: KES {s.pricing.totalKes.toLocaleString()}{' '}
                    ({s.paymentStatus === 'completed' ? 'Paid ✓' : 'Payment Pending'})
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => onTrack(s.trackingNumber)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Track Live</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedReceiptShipment(s)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Receipt</span>
                  </button>

                  {onOpenGmailDesk && (
                    <button
                      type="button"
                      onClick={() => onOpenGmailDesk(s.id)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                      title="Send tracking details to email via Gmail"
                    >
                      <Mail className="w-3.5 h-3.5 text-red-500" />
                      <span>Email</span>
                    </button>
                  )}

                  {canCancel(s) && (
                    <button
                      type="button"
                      onClick={() => setCancelModalShipment(s)}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Saved Addresses & Quick Support Ticket Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Saved Locations */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Saved Pickup & Delivery Locations</span>
            </h3>
            <span className="text-xs text-slate-400">Quick-Fill Ready</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>🏢 Westlands Office (Primary Pickup)</span>
                <span className="text-amber-600 text-[10px] uppercase font-bold">Default</span>
              </div>
              <div className="text-slate-500">Delta Corner Annex, 4th Floor, Westlands</div>
              <div className="text-[11px] text-slate-400 font-mono">+254 722 334 455</div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1">
              <div className="font-bold text-slate-800">🏠 Kilimani Residence</div>
              <div className="text-slate-500">Lenana Road, Near Cedars, Apt 4C</div>
              <div className="text-[11px] text-slate-400 font-mono">+254 712 998 877</div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1">
              <div className="font-bold text-slate-800">🏭 Industrial Area Warehouse</div>
              <div className="text-slate-500">Enterprise Road, Godown 18, Nairobi</div>
              <div className="text-[11px] text-slate-400 font-mono">+254 733 445 566</div>
            </div>
          </div>
        </div>

        {/* Submit Complaint / Support Ticket */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span>Customer Helpdesk & Complaints Ticket</span>
            </h3>
          </div>

          {ticketSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Support ticket submitted! A customer agent will respond via SMS shortly.</span>
            </div>
          )}

          <form onSubmit={handleCreateTicket} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="delivery_delay">Delivery Delay Inquiry</option>
                <option value="damaged_parcel">Damaged / Missing Parcel</option>
                <option value="payment_issue">M-Pesa / Payment Discrepancy</option>
                <option value="pricing_query">Tariff & Volumetric Query</option>
                <option value="other">General Complaint / Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Inquire on courier arrival at Westlands"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Details & Context</label>
              <textarea
                required
                rows={2}
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                placeholder="Describe what happened or request specific assistance..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition cursor-pointer"
            >
              Submit Support Ticket
            </button>
          </form>
        </div>
      </div>

      {/* Official Receipt Modal */}
      {selectedReceiptShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">EFRICKEN EXPRESS</h3>
                  <div className="text-[10px] text-slate-500">Official Delivery Invoice / Receipt</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptShipment(null)}
                className="text-slate-400 hover:text-slate-800 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Ref:</span>
                  <span className="font-bold text-slate-900">
                    INV-{selectedReceiptShipment.trackingNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="text-slate-800">
                    {new Date(selectedReceiptShipment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">M-Pesa Receipt:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedReceiptShipment.mpesaReceiptNumber || 'PENDING'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sender:</span>
                  <span className="text-slate-800">{selectedReceiptShipment.senderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient:</span>
                  <span className="text-slate-800">{selectedReceiptShipment.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="text-slate-800 capitalize">
                    {selectedReceiptShipment.serviceType.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billable Weight:</span>
                  <span className="text-slate-800">
                    {selectedReceiptShipment.pricing.billableWeightKg} kg
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total Paid (KES):</span>
                  <span className="text-emerald-700">
                    KES {selectedReceiptShipment.pricing.totalKes.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
              {onOpenGmailDesk && (
                <button
                  type="button"
                  onClick={() => {
                    const sid = selectedReceiptShipment.id;
                    setSelectedReceiptShipment(null);
                    onOpenGmailDesk(sid);
                  }}
                  className="py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Mail className="w-4 h-4 text-slate-950" />
                  <span>Email via Gmail</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedReceiptShipment(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Cancel Delivery Booking</h3>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to cancel consignment{' '}
              <span className="font-mono font-bold text-slate-900">
                {cancelModalShipment.trackingNumber}
              </span>
              ? Once cancelled, the assigned rider will be released and any unfulfilled charges refunded according to terms.
            </p>

            <form onSubmit={handleCancelOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="Change of delivery plans">Change of delivery plans</option>
                  <option value="Recipient requested rescheduling">Recipient requested rescheduling</option>
                  <option value="Incorrect address provided">Incorrect address provided</option>
                  <option value="Alternative arrangement made">Alternative arrangement made</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalShipment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
