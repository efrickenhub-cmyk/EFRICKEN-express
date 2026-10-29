import React, { useState, useEffect, useCallback } from 'react';
import { ActiveView, Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './components/public/HomePage';
import { ServicesPage } from './components/public/ServicesPage';
import { TrackingPage } from './components/public/TrackingPage';
import { RateCalculatorPage } from './components/public/RateCalculatorPage';
import { CoveragePage } from './components/public/CoveragePage';
import { ContactPage } from './components/public/ContactPage';
import { BookingWizard } from './components/booking/BookingWizard';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { DispatchConsole } from './components/dispatch/DispatchConsole';
import { RiderPortal } from './components/rider/RiderPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GmailDeskModal } from './components/gmail/GmailDeskModal';
import { StorageService } from './services/storageService';
import {
  AuditLog,
  Branch,
  CompanySettings,
  NotificationRecord,
  PaymentRecord,
  PricingSettings,
  Rider,
  ServiceZone,
  Shipment,
  SupportTicket,
} from './types';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('public_home');
  const [activeTrackingCode, setActiveTrackingCode] = useState<string>('PFR-9824-KE');
  const [preloadedBookingParams, setPreloadedBookingParams] = useState<any>(null);

  // Gmail Hub State
  const [gmailDeskOpen, setGmailDeskOpen] = useState(false);
  const [selectedGmailShipmentId, setSelectedGmailShipmentId] = useState<string | undefined>(
    undefined
  );

  // Core state from storage
  const [shipments, setShipments] = useState<Shipment[]>(() => StorageService.getShipments());
  const [riders, setRiders] = useState<Rider[]>(() => StorageService.getRiders());
  const [zones, setZones] = useState<ServiceZone[]>(() => StorageService.getZones());
  const [branches, setBranches] = useState<Branch[]>(() => StorageService.getBranches());
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() =>
    StorageService.getCompanySettings()
  );
  const [pricingSettings, setPricingSettings] = useState<PricingSettings>(() =>
    StorageService.getPricingSettings()
  );
  const [payments, setPayments] = useState<PaymentRecord[]>(() => StorageService.getPayments());
  const [notifications, setNotifications] = useState<NotificationRecord[]>(() =>
    StorageService.getNotifications()
  );
  const [tickets, setTickets] = useState<SupportTicket[]>(() => StorageService.getTickets());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());

  const refreshAllState = useCallback(() => {
    setShipments(StorageService.getShipments());
    setRiders(StorageService.getRiders());
    setZones(StorageService.getZones());
    setBranches(StorageService.getBranches());
    setCompanySettings(StorageService.getCompanySettings());
    setPricingSettings(StorageService.getPricingSettings());
    setPayments(StorageService.getPayments());
    setNotifications(StorageService.getNotifications());
    setTickets(StorageService.getTickets());
    setAuditLogs(StorageService.getAuditLogs());
  }, []);

  // Quick track helper
  const handleQuickTrack = (trackingNumber: string) => {
    setActiveTrackingCode(trackingNumber);
    setActiveView('public_tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingComplete = (shipment: Shipment) => {
    refreshAllState();
    setActiveTrackingCode(shipment.trackingNumber);
  };

  const handleOpenGmailDesk = (shipmentId?: string) => {
    setSelectedGmailShipmentId(shipmentId);
    setGmailDeskOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Header & Role Switcher */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        companySettings={companySettings}
        onQuickTrack={handleQuickTrack}
        onOpenGmailDesk={handleOpenGmailDesk}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {activeView === 'public_home' && (
          <HomePage
            companySettings={companySettings}
            zones={zones}
            setActiveView={setActiveView}
            onTrack={handleQuickTrack}
          />
        )}

        {activeView === 'public_services' && (
          <ServicesPage setActiveView={setActiveView} />
        )}

        {activeView === 'public_tracking' && (
          <TrackingPage
            key={activeTrackingCode}
            initialCode={activeTrackingCode}
            companySettings={companySettings}
            onOpenTicket={(code) => {
              setActiveView('public_contact');
            }}
            onOpenGmailDesk={handleOpenGmailDesk}
          />
        )}

        {activeView === 'public_calculator' && (
          <RateCalculatorPage
            zones={zones}
            setActiveView={setActiveView}
            onSelectPreloadedBooking={(params) => setPreloadedBookingParams(params)}
          />
        )}

        {activeView === 'public_coverage' && (
          <CoveragePage zones={zones} branches={branches} />
        )}

        {activeView === 'public_contact' && (
          <ContactPage
            companySettings={companySettings}
            onTicketSubmitted={refreshAllState}
          />
        )}

        {activeView === 'customer_book' && (
          <BookingWizard
            zones={zones}
            preloadedParams={preloadedBookingParams}
            setActiveView={setActiveView}
            onBookingComplete={handleBookingComplete}
            onOpenGmailDesk={handleOpenGmailDesk}
          />
        )}

        {activeView === 'customer_portal' && (
          <CustomerPortal
            shipments={shipments}
            setActiveView={setActiveView}
            onTrack={handleQuickTrack}
            onRefresh={refreshAllState}
            onOpenGmailDesk={handleOpenGmailDesk}
          />
        )}

        {activeView === 'dispatch_console' && (
          <DispatchConsole
            shipments={shipments}
            riders={riders}
            zones={zones}
            onRefresh={refreshAllState}
            onOpenGmailDesk={handleOpenGmailDesk}
          />
        )}

        {activeView === 'rider_app' && (
          <RiderPortal
            shipments={shipments}
            riders={riders}
            onRefresh={refreshAllState}
          />
        )}

        {activeView === 'admin_dashboard' && (
          <AdminDashboard
            shipments={shipments}
            riders={riders}
            zones={zones}
            branches={branches}
            companySettings={companySettings}
            pricingSettings={pricingSettings}
            payments={payments}
            notifications={notifications}
            tickets={tickets}
            auditLogs={auditLogs}
            onRefresh={refreshAllState}
            onCompanySettingsUpdated={(newSettings) => {
              setCompanySettings(newSettings);
              refreshAllState();
            }}
            onPricingSettingsUpdated={(newPricing) => {
              setPricingSettings(newPricing);
              refreshAllState();
            }}
            onOpenGmailDesk={handleOpenGmailDesk}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer companySettings={companySettings} setActiveView={setActiveView} />

      {/* Gmail Communications Desk Modal */}
      {gmailDeskOpen && (
        <GmailDeskModal
          isOpen={gmailDeskOpen}
          onClose={() => setGmailDeskOpen(false)}
          shipments={shipments}
          companySettings={companySettings}
          selectedShipmentId={selectedGmailShipmentId}
        />
      )}
    </div>
  );
}
