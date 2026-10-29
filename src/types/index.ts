export type ShipmentStatus =
  | 'draft'
  | 'booking_confirmed'
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'awaiting_pickup'
  | 'rider_assigned'
  | 'collected'
  | 'at_sorting_facility'
  | 'in_transit'
  | 'arrived_at_destination_facility'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_attempted'
  | 'rescheduled'
  | 'return_in_progress'
  | 'returned_to_sender'
  | 'cancelled';

export type ServiceType =
  | 'same_day'
  | 'express_2hr'
  | 'standard'
  | 'scheduled'
  | 'b2b_corporate'
  | 'ecommerce_fulfilment'
  | 'document_secure'
  | 'intercity'
  | 'bulk_cargo';

export type PaymentMethod = 'mpesa_stk' | 'cash_on_delivery' | 'corporate_invoice' | 'bank_transfer';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface MilestoneEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  timestamp: string;
  actor: string;
  actorRole: string;
  location?: string;
  notes?: string;
}

export interface ProofOfDelivery {
  recipientName: string;
  recipientPhone?: string;
  recipientIdNumber?: string;
  signatureDataUrl?: string; // base64 canvas signature
  photoUrl?: string;
  timestamp: string;
  riderId: string;
  riderName: string;
  notes?: string;
}

export interface ShipmentItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  declaredValueKes?: number;
  isFragile?: boolean;
  requiresCooling?: boolean;
}

export interface PricingBreakdown {
  actualWeightKg: number;
  volumetricWeightKg: number;
  billableWeightKg: number;
  baseFareKes: number;
  weightChargeKes: number;
  zoneSurchargeKes: number;
  serviceMultiplier: number;
  insuranceFeeKes: number;
  subtotalKes: number;
  taxKes: number; // 16% VAT where applicable
  totalKes: number;
}

export interface Shipment {
  id: string;
  trackingNumber: string; // e.g. PFR-8492-KE
  createdAt: string;
  updatedAt: string;
  status: ShipmentStatus;
  serviceType: ServiceType;
  
  // Sender
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderAddress: string;
  senderZone: string;
  pickupWindow?: string;
  senderNotes?: string;

  // Recipient
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  recipientAddress: string;
  recipientZone: string;
  deliveryInstructions?: string;

  // Items & Pricing
  items: ShipmentItem[];
  pricing: PricingBreakdown;
  
  // Rider & Assignment
  assignedRiderId?: string;
  assignedRiderName?: string;
  assignedRiderPhone?: string;
  estimatedDeliveryWindow?: string;
  
  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  mpesaCheckoutRequestId?: string;
  mpesaReceiptNumber?: string;
  
  // Events & POD
  timeline: MilestoneEvent[];
  proofOfDelivery?: ProofOfDelivery;
  failureReason?: string;
  
  // Live coordinates (for map)
  pickupLat?: number;
  pickupLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
}

export interface Rider {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  vehicleType: 'motorcycle' | 'van' | 'pickup_truck' | 'bicycle';
  plateNumber: string;
  currentZone: string;
  status: 'available' | 'busy' | 'offline';
  rating: number;
  totalDeliveries: number;
  currentLat: number;
  currentLng: number;
  lastLocationUpdate: string;
  isGpsSharing: boolean;
}

export interface ServiceZone {
  id: string;
  name: string;
  county: string;
  hubBranch: string;
  baseRateMultiplier: number;
  estimatedHours: number;
  centerLat: number;
  centerLng: number;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  county: string;
  address: string;
  phone: string;
  manager: string;
}

export interface PricingSettings {
  volumetricDivisor: number; // typically 5000 (IATA standard)
  baseFareKes: number; // default base fare e.g. 250 KES
  perKgRateKes: number; // default 50 KES per billable kg above 1kg
  insurancePercentage: number; // e.g. 1% of declared value
  vatRate: number; // 0.16 (16%)
  serviceMultipliers: Record<ServiceType, number>;
}

export interface PaymentRecord {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  amountKes: number;
  method: PaymentMethod;
  status: PaymentStatus;
  mpesaReceiptNumber?: string;
  payerPhone: string;
  transactionDate: string;
  reconciled: boolean;
  notes?: string;
}

export interface NotificationRecord {
  id: string;
  recipient: string;
  channel: 'sms' | 'email' | 'whatsapp';
  eventType: string;
  trackingNumber: string;
  message: string;
  status: 'sent' | 'pending' | 'failed';
  timestamp: string;
  provider: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  trackingNumber?: string;
  category: 'delivery_delay' | 'damaged_parcel' | 'payment_issue' | 'pricing_query' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  subject: string;
  description: string;
  createdAt: string;
  resolutionNotes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  supportPhone: string;
  supportEmail: string;
  whatsappNumber: string;
  headOfficeAddress: string;
  workingHours: string;
  mpesaPaybill?: string;
  mpesaTillNumber: string;
  mpesaShortcode: string;
  currency: string;
  termsUrl: string;
  privacyUrl: string;
}

export type AppUserRole =
  | 'super_admin'
  | 'operations_manager'
  | 'dispatcher'
  | 'rider'
  | 'customer_service'
  | 'finance_officer'
  | 'customer';
