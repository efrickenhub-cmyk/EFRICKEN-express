import { PricingBreakdown, PricingSettings, ServiceType } from '../types';

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  volumetricDivisor: 5000,
  baseFareKes: 250,
  perKgRateKes: 60,
  insurancePercentage: 0.015, // 1.5% of declared value if requested
  vatRate: 0.16,
  serviceMultipliers: {
    same_day: 1.25,
    express_2hr: 1.85,
    standard: 1.0,
    scheduled: 1.1,
    b2b_corporate: 0.95,
    ecommerce_fulfilment: 0.9,
    document_secure: 1.15,
    intercity: 2.2,
    bulk_cargo: 1.5,
  },
};

export const ZONE_SURCHARGES: Record<string, number> = {
  'Nairobi CBD': 0,
  'Westlands': 50,
  'Kilimani / Kileleshwa': 60,
  'Upper Hill': 40,
  'Industrial Area': 50,
  'Karen / Langata': 150,
  'Eastleigh': 60,
  'Kasarani / Roysambu': 120,
  'Embakasi / Airport': 140,
  'Kiambu / Ruiru': 200,
  'Machakos / Athi River': 350,
  'Mombasa Island': 550,
  'Kisumu Central': 600,
  'Nakuru Town': 400,
  'Eldoret': 550,
};

export function calculateDeliveryCost(params: {
  actualWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  quantity?: number;
  serviceType: ServiceType;
  senderZone: string;
  recipientZone: string;
  declaredValueKes?: number;
  includeInsurance?: boolean;
  settings?: PricingSettings;
}): PricingBreakdown {
  const settings = params.settings || DEFAULT_PRICING_SETTINGS;
  const qty = Math.max(1, params.quantity || 1);
  const actualWeight = Math.max(0.2, (params.actualWeightKg || 0.5) * qty);

  // Volumetric weight = (L * W * H) / Divisor
  const volumeCm3 = (params.lengthCm || 20) * (params.widthCm || 15) * (params.heightCm || 10) * qty;
  const volumetricWeight = Math.round((volumeCm3 / settings.volumetricDivisor) * 100) / 100;

  const billableWeight = Math.max(actualWeight, volumetricWeight);

  // Base fare covers up to 1.0 kg
  const baseFare = settings.baseFareKes;
  const extraKg = Math.max(0, billableWeight - 1.0);
  const weightCharge = Math.ceil(extraKg) * settings.perKgRateKes;

  // Zone surcharge
  const senderSurcharge = ZONE_SURCHARGES[params.senderZone] ?? 50;
  const recipientSurcharge = ZONE_SURCHARGES[params.recipientZone] ?? 50;
  const isIntercity = params.senderZone !== params.recipientZone && 
    (params.senderZone.includes('Mombasa') || params.recipientZone.includes('Mombasa') ||
     params.senderZone.includes('Kisumu') || params.recipientZone.includes('Kisumu') ||
     params.senderZone.includes('Nakuru') || params.recipientZone.includes('Nakuru') ||
     params.senderZone.includes('Eldoret') || params.recipientZone.includes('Eldoret'));

  let zoneSurcharge = senderSurcharge + recipientSurcharge;
  if (isIntercity && !params.serviceType.includes('intercity')) {
    zoneSurcharge += 300;
  }

  // Service multiplier
  const multiplier = settings.serviceMultipliers[params.serviceType] ?? 1.0;
  const serviceBaseCharge = (baseFare + weightCharge + zoneSurcharge) * multiplier;

  // Insurance fee
  let insuranceFee = 0;
  if (params.includeInsurance && params.declaredValueKes && params.declaredValueKes > 0) {
    insuranceFee = Math.max(100, Math.round(params.declaredValueKes * settings.insurancePercentage));
  }

  const subtotal = Math.round(serviceBaseCharge + insuranceFee);
  const tax = Math.round(subtotal * settings.vatRate);
  const total = subtotal + tax;

  return {
    actualWeightKg: Math.round(actualWeight * 100) / 100,
    volumetricWeightKg: Math.round(volumetricWeight * 100) / 100,
    billableWeightKg: Math.round(billableWeight * 100) / 100,
    baseFareKes: baseFare,
    weightChargeKes: weightCharge,
    zoneSurchargeKes: zoneSurcharge,
    serviceMultiplier: multiplier,
    insuranceFeeKes: insuranceFee,
    subtotalKes: subtotal,
    taxKes: tax,
    totalKes: total,
  };
}
