/**
 * Rota Hesaplama Modülü — Tip Tanımları
 * Tüm rota hesaplama bileşenleri bu tipleri kullanır.
 */

export type ConfidenceLevel = 'kesin' | 'yuksek' | 'tahmini';

export interface City {
  plaka: number;
  il: string;
  lat: number;
  lng: number;
  bolge: string;
}

export interface District {
  id: string;
  il: string;
  ilce: string;
  plaka: number;
  lat: number;
  lng: number;
  anchorId: string;
}

export interface AnchorNode {
  id: string;
  name: string;
  il: string;
  lat: number;
  lng: number;
  type: 'il-merkezi' | 'kavşak' | 'köprü-giriş' | 'tünel-giriş' | 'otoyol-düğüm';
}

export interface TollSegment {
  id: string;
  name: string;
  type: 'otoyol' | 'köprü' | 'tünel';
  effectiveDate: string;
  sourceLabel: string;
  sourceUrl: string;
  confidence: ConfidenceLevel;
  vehicleClassFees: {
    motosiklet?: number;
    '1': number;
    '2': number;
    '3'?: number;
    '4'?: number;
    '5'?: number;
  };
  nightDiscount?: {
    startHour: number;
    endHour: number;
    discountPercent: number;
  };
}

export interface RouteEdge {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  durationMin: number;
  roadType: 'serbest' | 'ücretli' | 'karma';
  tollSegmentIds: string[];
  confidence: ConfidenceLevel;
  bidirectional: boolean;
}

export interface TollBreakdownItem {
  segmentId: string;
  name: string;
  type: string;
  amount: number;
}

export interface RouteResult {
  startDistrict: District;
  endDistrict: District;
  oneWay: {
    distanceKm: number;
    durationMin: number;
    fuelLiters: number;
    fuelCost: number;
    tollCost: number;
    totalCost: number;
    costPerKm: number;
  };
  roundTrip: {
    distanceKm: number;
    durationMin: number;
    fuelLiters: number;
    fuelCost: number;
    tollCost: number;
    totalCost: number;
    costPerKm: number;
  };
  confidence: ConfidenceLevel;
  path: {
    nodeIds: string[];
    edges: RouteEdge[];
  };
  tollBreakdown: TollBreakdownItem[];
  tollAvoidanceNote?: string;
  metadata: {
    calculatedAt: string;
    fuelConsumption: number;
    fuelPrice: number;
    fuelType: string;
    vehicleClass: string;
  };
}

export interface RouteParams {
  startDistrictId: string;
  endDistrictId: string;
  vehicleClass: string;
  fuelConsumption: number;
  fuelPrice: number;
  fuelType: string;
  includeTolls: boolean;
  roundTrip: boolean;
}
