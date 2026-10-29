import {
  AuditLog,
  Branch,
  CompanySettings,
  MilestoneEvent,
  NotificationRecord,
  PaymentRecord,
  PricingSettings,
  ProofOfDelivery,
  Rider,
  ServiceZone,
  Shipment,
  ShipmentStatus,
  SupportTicket,
} from '../types';
import {
  INITIAL_BRANCHES,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_RIDERS,
  INITIAL_SERVICE_ZONES,
  INITIAL_SHIPMENTS,
  INITIAL_TICKETS,
} from './mockData';
import { DEFAULT_PRICING_SETTINGS } from './pricingEngine';

const KEYS = {
  SHIPMENTS: 'pefricken_shipments_v1',
  RIDERS: 'pefricken_riders_v1',
  ZONES: 'pefricken_zones_v1',
  BRANCHES: 'pefricken_branches_v2',
  PAYMENTS: 'pefricken_payments_v1',
  NOTIFICATIONS: 'pefricken_notifications_v1',
  TICKETS: 'pefricken_tickets_v1',
  PRICING: 'pefricken_pricing_v1',
  COMPANY: 'efricken_company_v4',
  AUDIT: 'pefricken_audit_v1',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading storage key:', key, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed writing storage key:', key, err);
  }
}

export const StorageService = {
  // Shipments
  getShipments(): Shipment[] {
    return getStored<Shipment[]>(KEYS.SHIPMENTS, INITIAL_SHIPMENTS);
  },

  getShipmentByTrackingNumber(tracking: string): Shipment | undefined {
    const all = this.getShipments();
    const clean = tracking.trim().toUpperCase();
    return all.find((s) => s.trackingNumber.toUpperCase() === clean);
  },

  getShipmentById(id: string): Shipment | undefined {
    return this.getShipments().find((s) => s.id === id);
  },

  createShipment(shipmentData: Omit<Shipment, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'timeline'>): Shipment {
    const shipments = this.getShipments();
    const id = `ship-${Date.now()}`;
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const trackingNumber = `EFX-${randCode}-KE`;
    const now = new Date().toISOString();

    const initialEvent: MilestoneEvent = {
      id: `ev-${Date.now()}`,
      shipmentId: id,
      status: 'booking_confirmed',
      timestamp: now,
      actor: shipmentData.senderName || 'Customer Portal',
      actorRole: 'Customer',
      location: shipmentData.senderZone || 'Kenya Online Booking',
      notes: 'Delivery booking registered successfully.',
    };

    const newShipment: Shipment = {
      ...shipmentData,
      id,
      trackingNumber,
      createdAt: now,
      updatedAt: now,
      timeline: [initialEvent],
    };

    shipments.unshift(newShipment);
    setStored(KEYS.SHIPMENTS, shipments);

    // Add audit log
    this.addAuditLog({
      user: shipmentData.senderName || 'Customer',
      role: 'Customer',
      action: 'BOOKING_CREATED',
      entityType: 'Shipment',
      entityId: trackingNumber,
      details: `New booking created for ${shipmentData.recipientName} (${shipmentData.serviceType}), Billable KES ${shipmentData.pricing.totalKes}`,
    });

    // Send confirmation SMS simulation
    this.logNotification({
      recipient: shipmentData.senderPhone,
      channel: 'sms',
      eventType: 'booking_confirmed',
      trackingNumber,
      message: `Habari! Efricken Express delivery confirmed. Tracking: ${trackingNumber}. View status at efricken.co.ke/track/${trackingNumber}`,
      status: 'sent',
      provider: 'Safaricom SMS Gateway',
    });

    return newShipment;
  },

  updateShipmentStatus(
    shipmentId: string,
    newStatus: ShipmentStatus,
    actorName: string,
    actorRole: string,
    notes?: string,
    location?: string
  ): Shipment | undefined {
    const shipments = this.getShipments();
    const idx = shipments.findIndex((s) => s.id === shipmentId);
    if (idx === -1) return undefined;

    const shipment = shipments[idx];
    const now = new Date().toISOString();

    const event: MilestoneEvent = {
      id: `ev-${Date.now()}`,
      shipmentId,
      status: newStatus,
      timestamp: now,
      actor: actorName,
      actorRole,
      notes: notes || `Status updated to ${newStatus.replace(/_/g, ' ')}`,
      location: location || shipment.recipientZone,
    };

    const updated: Shipment = {
      ...shipment,
      status: newStatus,
      updatedAt: now,
      timeline: [...shipment.timeline, event],
    };

    shipments[idx] = updated;
    setStored(KEYS.SHIPMENTS, shipments);

    this.addAuditLog({
      user: actorName,
      role: actorRole,
      action: 'STATUS_UPDATE',
      entityType: 'Shipment',
      entityId: shipment.trackingNumber,
      details: `Status shifted from ${shipment.status} to ${newStatus}. Note: ${notes || 'none'}`,
    });

    // Event notifications
    let notifMsg = `Efricken Express Alert: Shipment ${shipment.trackingNumber} status is now ${newStatus.replace(/_/g, ' ').toUpperCase()}.`;
    if (newStatus === 'out_for_delivery') {
      notifMsg = `Good news! Your delivery ${shipment.trackingNumber} is OUT FOR DELIVERY with rider ${shipment.assignedRiderName || 'our courier'}. Track live on efricken.co.ke/track/${shipment.trackingNumber}`;
    } else if (newStatus === 'delivered') {
      notifMsg = `Delivered! Package ${shipment.trackingNumber} has been received safely. Thank you for choosing Efricken Express!`;
    }

    this.logNotification({
      recipient: shipment.recipientPhone,
      channel: 'sms',
      eventType: newStatus,
      trackingNumber: shipment.trackingNumber,
      message: notifMsg,
      status: 'sent',
      provider: 'Safaricom SMS Gateway',
    });

    return updated;
  },

  assignRider(shipmentId: string, riderId: string, dispatcherName: string): Shipment | undefined {
    const shipments = this.getShipments();
    const riders = this.getRiders();
    const rider = riders.find((r) => r.id === riderId);
    const shipmentIdx = shipments.findIndex((s) => s.id === shipmentId);

    if (shipmentIdx === -1 || !rider) return undefined;

    const shipment = shipments[shipmentIdx];
    const now = new Date().toISOString();

    const event: MilestoneEvent = {
      id: `ev-${Date.now()}`,
      shipmentId,
      status: 'rider_assigned',
      timestamp: now,
      actor: dispatcherName,
      actorRole: 'Dispatcher',
      notes: `Assigned to rider ${rider.fullName} (${rider.vehicleType} - ${rider.plateNumber}).`,
    };

    const updatedShipment: Shipment = {
      ...shipment,
      assignedRiderId: rider.id,
      assignedRiderName: rider.fullName,
      assignedRiderPhone: rider.phone,
      status: 'rider_assigned',
      updatedAt: now,
      timeline: [...shipment.timeline, event],
    };

    shipments[shipmentIdx] = updatedShipment;
    setStored(KEYS.SHIPMENTS, shipments);

    // Update rider state to busy if available
    const rIdx = riders.findIndex((r) => r.id === riderId);
    if (rIdx !== -1) {
      riders[rIdx].status = 'busy';
      setStored(KEYS.RIDERS, riders);
    }

    this.addAuditLog({
      user: dispatcherName,
      role: 'Dispatcher',
      action: 'RIDER_ASSIGNED',
      entityType: 'Shipment',
      entityId: shipment.trackingNumber,
      details: `Assigned to ${rider.fullName} (${rider.plateNumber})`,
    });

    // Notify Rider
    this.logNotification({
      recipient: rider.phone,
      channel: 'sms',
      eventType: 'assignment_new',
      trackingNumber: shipment.trackingNumber,
      message: `NEW ASSIGNMENT: Pick up at ${shipment.senderZone} for ${shipment.recipientName} (${shipment.serviceType}). Ref: ${shipment.trackingNumber}`,
      status: 'sent',
      provider: 'Efricken Dispatch Gateway',
    });

    return updatedShipment;
  },

  recordProofOfDelivery(shipmentId: string, pod: ProofOfDelivery): Shipment | undefined {
    const shipments = this.getShipments();
    const idx = shipments.findIndex((s) => s.id === shipmentId);
    if (idx === -1) return undefined;

    const shipment = shipments[idx];
    const now = new Date().toISOString();

    const event: MilestoneEvent = {
      id: `ev-${Date.now()}`,
      shipmentId,
      status: 'delivered',
      timestamp: now,
      actor: pod.riderName,
      actorRole: 'Rider',
      location: shipment.recipientAddress,
      notes: `Delivered to ${pod.recipientName}. Proof of delivery confirmed.`,
    };

    const updated: Shipment = {
      ...shipment,
      status: 'delivered',
      proofOfDelivery: pod,
      updatedAt: now,
      timeline: [...shipment.timeline, event],
    };

    shipments[idx] = updated;
    setStored(KEYS.SHIPMENTS, shipments);

    // Free up rider if they have no other active deliveries
    const riders = this.getRiders();
    const rIdx = riders.findIndex((r) => r.id === pod.riderId);
    if (rIdx !== -1) {
      riders[rIdx].totalDeliveries += 1;
      riders[rIdx].status = 'available';
      setStored(KEYS.RIDERS, riders);
    }

    this.addAuditLog({
      user: pod.riderName,
      role: 'Rider',
      action: 'DELIVERY_COMPLETED_POD',
      entityType: 'Shipment',
      entityId: shipment.trackingNumber,
      details: `Delivered to ${pod.recipientName} with signature and notes.`,
    });

    return updated;
  },

  recordDeliveryAttemptFailure(shipmentId: string, reason: string, riderName: string): Shipment | undefined {
    const shipments = this.getShipments();
    const idx = shipments.findIndex((s) => s.id === shipmentId);
    if (idx === -1) return undefined;

    const shipment = shipments[idx];
    const now = new Date().toISOString();

    const event: MilestoneEvent = {
      id: `ev-${Date.now()}`,
      shipmentId,
      status: 'delivery_attempted',
      timestamp: now,
      actor: riderName,
      actorRole: 'Rider',
      notes: `Delivery attempt failed: ${reason}`,
      location: shipment.recipientZone,
    };

    const updated: Shipment = {
      ...shipment,
      status: 'delivery_attempted',
      failureReason: reason,
      updatedAt: now,
      timeline: [...shipment.timeline, event],
    };

    shipments[idx] = updated;
    setStored(KEYS.SHIPMENTS, shipments);

    this.addAuditLog({
      user: riderName,
      role: 'Rider',
      action: 'DELIVERY_ATTEMPT_FAILED',
      entityType: 'Shipment',
      entityId: shipment.trackingNumber,
      details: `Failed attempt reason: ${reason}`,
    });

    this.logNotification({
      recipient: shipment.recipientPhone,
      channel: 'sms',
      eventType: 'delivery_attempted',
      trackingNumber: shipment.trackingNumber,
      message: `Efricken Express: Courier was unable to complete delivery (${reason}). We will re-attempt or contact you shortly.`,
      status: 'sent',
      provider: 'Safaricom SMS Gateway',
    });

    return updated;
  },

  cancelShipment(shipmentId: string, reason: string, actor: string): Shipment | undefined {
    const shipments = this.getShipments();
    const idx = shipments.findIndex((s) => s.id === shipmentId);
    if (idx === -1) return undefined;

    const shipment = shipments[idx];
    const now = new Date().toISOString();

    const event: MilestoneEvent = {
      id: `ev-${Date.now()}`,
      shipmentId,
      status: 'cancelled',
      timestamp: now,
      actor,
      actorRole: 'Customer',
      notes: `Order cancelled. Reason: ${reason}`,
    };

    const updated: Shipment = {
      ...shipment,
      status: 'cancelled',
      updatedAt: now,
      timeline: [...shipment.timeline, event],
    };

    shipments[idx] = updated;
    setStored(KEYS.SHIPMENTS, shipments);

    this.addAuditLog({
      user: actor,
      role: 'Customer',
      action: 'ORDER_CANCELLED',
      entityType: 'Shipment',
      entityId: shipment.trackingNumber,
      details: `Cancellation reason: ${reason}`,
    });

    return updated;
  },

  // Riders
  getRiders(): Rider[] {
    return getStored<Rider[]>(KEYS.RIDERS, INITIAL_RIDERS);
  },

  updateRiderLocation(riderId: string, lat: number, lng: number): void {
    const riders = this.getRiders();
    const idx = riders.findIndex((r) => r.id === riderId);
    if (idx !== -1) {
      riders[idx].currentLat = lat;
      riders[idx].currentLng = lng;
      riders[idx].lastLocationUpdate = new Date().toISOString();
      setStored(KEYS.RIDERS, riders);
    }
  },

  toggleRiderGps(riderId: string, isSharing: boolean): void {
    const riders = this.getRiders();
    const idx = riders.findIndex((r) => r.id === riderId);
    if (idx !== -1) {
      riders[idx].isGpsSharing = isSharing;
      setStored(KEYS.RIDERS, riders);
    }
  },

  // Zones & Branches
  getZones(): ServiceZone[] {
    return getStored<ServiceZone[]>(KEYS.ZONES, INITIAL_SERVICE_ZONES);
  },

  getBranches(): Branch[] {
    return getStored<Branch[]>(KEYS.BRANCHES, INITIAL_BRANCHES);
  },

  // Pricing & Settings
  getPricingSettings(): PricingSettings {
    return getStored<PricingSettings>(KEYS.PRICING, DEFAULT_PRICING_SETTINGS);
  },

  savePricingSettings(settings: PricingSettings, actor: string): void {
    setStored(KEYS.PRICING, settings);
    this.addAuditLog({
      user: actor,
      role: 'Super Administrator',
      action: 'PRICING_RULES_UPDATED',
      entityType: 'PricingSettings',
      entityId: 'global',
      details: `Base fare KES ${settings.baseFareKes}, Per kg KES ${settings.perKgRateKes}, Divisor ${settings.volumetricDivisor}`,
    });
  },

  getCompanySettings(): CompanySettings {
    return getStored<CompanySettings>(KEYS.COMPANY, INITIAL_COMPANY_SETTINGS);
  },

  saveCompanySettings(settings: CompanySettings, actor: string): void {
    setStored(KEYS.COMPANY, settings);
    this.addAuditLog({
      user: actor,
      role: 'Super Administrator',
      action: 'COMPANY_SETTINGS_UPDATED',
      entityType: 'CompanySettings',
      entityId: 'global',
      details: `Updated company branding and contact configurations.`,
    });
  },

  // Payments & M-Pesa
  getPayments(): PaymentRecord[] {
    return getStored<PaymentRecord[]>(KEYS.PAYMENTS, INITIAL_PAYMENTS);
  },

  recordMpesaPayment(params: {
    shipmentId: string;
    trackingNumber: string;
    amountKes: number;
    phone: string;
    mpesaReceiptNumber?: string;
  }): PaymentRecord {
    const payments = this.getPayments();
    const receipt = params.mpesaReceiptNumber || `QG${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      shipmentId: params.shipmentId,
      trackingNumber: params.trackingNumber,
      amountKes: params.amountKes,
      method: 'mpesa_stk',
      status: 'completed',
      mpesaReceiptNumber: receipt,
      payerPhone: params.phone,
      transactionDate: new Date().toISOString(),
      reconciled: true,
    };

    payments.unshift(newRecord);
    setStored(KEYS.PAYMENTS, payments);

    // Also update shipment payment status
    const shipments = this.getShipments();
    const sIdx = shipments.findIndex((s) => s.id === params.shipmentId);
    if (sIdx !== -1) {
      shipments[sIdx].paymentStatus = 'completed';
      shipments[sIdx].mpesaReceiptNumber = receipt;
      // Add event
      const event: MilestoneEvent = {
        id: `ev-${Date.now()}`,
        shipmentId: params.shipmentId,
        status: 'payment_confirmed',
        timestamp: new Date().toISOString(),
        actor: 'M-Pesa Daraja Callback',
        actorRole: 'System',
        notes: `STK push verified. Receipt: ${receipt} for KES ${params.amountKes}`,
      };
      shipments[sIdx].timeline.push(event);
      setStored(KEYS.SHIPMENTS, shipments);
    }

    this.addAuditLog({
      user: params.phone,
      role: 'Customer',
      action: 'MPESA_PAYMENT_VERIFIED',
      entityType: 'Payment',
      entityId: receipt,
      details: `Payment of KES ${params.amountKes} received for order ${params.trackingNumber}`,
    });

    return newRecord;
  },

  // Notifications
  getNotifications(): NotificationRecord[] {
    return getStored<NotificationRecord[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  logNotification(notif: Omit<NotificationRecord, 'id' | 'timestamp'>): NotificationRecord {
    const list = this.getNotifications();
    const record: NotificationRecord = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(record);
    setStored(KEYS.NOTIFICATIONS, list);
    return record;
  },

  // Support Tickets
  getTickets(): SupportTicket[] {
    return getStored<SupportTicket[]>(KEYS.TICKETS, INITIAL_TICKETS);
  },

  createTicket(ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>): SupportTicket {
    const list = this.getTickets();
    const tktNum = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const record: SupportTicket = {
      ...ticket,
      id: `tkt-${Date.now()}`,
      ticketNumber: tktNum,
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    list.unshift(record);
    setStored(KEYS.TICKETS, list);

    this.addAuditLog({
      user: ticket.customerName,
      role: 'Customer',
      action: 'TICKET_OPENED',
      entityType: 'SupportTicket',
      entityId: tktNum,
      details: `Support ticket opened: ${ticket.subject}`,
    });

    return record;
  },

  updateTicketStatus(ticketId: string, status: SupportTicket['status'], resolutionNotes?: string): void {
    const list = this.getTickets();
    const idx = list.findIndex((t) => t.id === ticketId);
    if (idx !== -1) {
      list[idx].status = status;
      if (resolutionNotes) {
        list[idx].resolutionNotes = resolutionNotes;
      }
      setStored(KEYS.TICKETS, list);
    }
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getStored<AuditLog[]>(KEYS.AUDIT, [
      {
        id: 'aud-1',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        user: 'Super Admin',
        role: 'super_admin',
        action: 'SYSTEM_BOOTSTRAP',
        entityType: 'System',
        entityId: 'pefricken-core',
        details: 'Initial system boot and security perimeter verification.',
      },
    ]);
  },

  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      ...entry,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    });
    setStored(KEYS.AUDIT, logs.slice(0, 200)); // retain last 200 logs
  },

  // Reset to initial demo state
  resetAllToDefaults(): void {
    localStorage.removeItem(KEYS.SHIPMENTS);
    localStorage.removeItem(KEYS.RIDERS);
    localStorage.removeItem(KEYS.ZONES);
    localStorage.removeItem(KEYS.BRANCHES);
    localStorage.removeItem(KEYS.PAYMENTS);
    localStorage.removeItem(KEYS.NOTIFICATIONS);
    localStorage.removeItem(KEYS.TICKETS);
    localStorage.removeItem(KEYS.PRICING);
    localStorage.removeItem(KEYS.COMPANY);
    localStorage.removeItem(KEYS.AUDIT);
  },
};
