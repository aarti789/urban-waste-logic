export type UserRole = 'admin' | 'worker';

export type AreaType = 'Residential' | 'Commercial' | 'Industrial' | 'Institutional' | 'Mixed';
export type WasteType = 'Wet' | 'Dry' | 'Mixed';
export type Priority = 1 | 2 | 3;
export type Zone = 'Central' | 'West' | 'IT Corridor' | 'North' | 'East' | 'South';

export interface BinRecord {
  id: string;
  binId: string;
  subLocation: string;
  locationName: string;
  zone: Zone;
  areaType: AreaType;
  latitude: number;
  longitude: number;
  capacity: number;
  fillLevel: number;
  wasteType: WasteType;
  dateObserved: string;
  assignedTruck: string;
  remarks?: string;
  priority: Priority;
  collected: boolean;
  collectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionRecord {
  binId: string;
  binName: string;
  locationName: string;
  zone: Zone;
  fillLevel: number;
  priority: Priority;
  collectedAt: string;
  collectedBy: string;
}

export interface RouteInfo {
  routeId: string;
  truckNumber: string;
  zone: string;
  sourceBin: string;
  destination: string;
  binFlow: string;
  bins: string[];
  distanceKm: number;
  fuelUsed: number;
  fuelSaved: number;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface DailyStats {
  date: string;
  binsCollected: number;
  totalWasteKg: number;
  distanceKm: number;
  fuelUsed: number;
}
