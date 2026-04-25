// Backend API layer — Supabase as source of truth.
// Replaces localStorage persistence with multi-device realtime sync.
import { supabase } from '@/integrations/supabase/client';
import { BinRecord, CollectionRecord, Zone, AreaType, WasteType, Priority } from '@/types';

type BinRow = {
  id: string;
  bin_id: string;
  bin_code: string;
  sub_location: string;
  location_name: string;
  zone: string;
  area_type: string;
  latitude: number;
  longitude: number;
  capacity: number;
  fill_level: number;
  waste_type: string;
  date_observed: string;
  assigned_truck: string;
  remarks: string | null;
  priority: number;
  collected: boolean;
  collected_at: string | null;
  created_at: string;
  updated_at: string;
};

const rowToBin = (r: BinRow): BinRecord => ({
  id: r.id,
  binId: r.bin_id,
  subLocation: r.sub_location,
  locationName: r.location_name,
  zone: r.zone as Zone,
  areaType: r.area_type as AreaType,
  latitude: r.latitude,
  longitude: r.longitude,
  capacity: r.capacity,
  fillLevel: r.fill_level,
  wasteType: r.waste_type as WasteType,
  dateObserved: r.date_observed,
  assignedTruck: r.assigned_truck,
  remarks: r.remarks ?? undefined,
  priority: r.priority as Priority,
  collected: r.collected,
  collectedAt: r.collected_at ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const binToRow = (b: BinRecord) => ({
  bin_id: b.binId,
  bin_code: b.binId.replace(/^HYD-/, ''),
  sub_location: b.subLocation,
  location_name: b.locationName,
  zone: b.zone,
  area_type: b.areaType,
  latitude: b.latitude,
  longitude: b.longitude,
  capacity: b.capacity,
  fill_level: b.fillLevel,
  waste_type: b.wasteType,
  date_observed: b.dateObserved,
  assigned_truck: b.assignedTruck,
  remarks: b.remarks ?? null,
  priority: b.priority,
  collected: b.collected,
  collected_at: b.collectedAt ?? null,
});

export async function fetchAllBins(): Promise<BinRecord[]> {
  const { data, error } = await supabase
    .from('bins')
    .select('*')
    .order('bin_id', { ascending: true });
  if (error) {
    console.error('[binsApi] fetchAllBins error', error);
    return [];
  }
  return (data as BinRow[]).map(rowToBin);
}

export async function seedBins(bins: BinRecord[]): Promise<void> {
  // Insert in chunks to avoid row-size limits.
  const rows = bins.map(binToRow);
  const chunkSize = 50;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from('bins').insert(chunk);
    if (error) console.error('[binsApi] seedBins chunk error', error);
  }
}

export async function upsertBin(bin: BinRecord): Promise<void> {
  const { error } = await supabase
    .from('bins')
    .upsert(binToRow(bin), { onConflict: 'bin_id' });
  if (error) console.error('[binsApi] upsertBin error', error);
}

export async function updateBinFill(
  binDbId: string,
  patch: Partial<Pick<BinRecord, 'fillLevel' | 'priority' | 'remarks' | 'collected' | 'collectedAt' | 'dateObserved'>>
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.fillLevel !== undefined) row.fill_level = patch.fillLevel;
  if (patch.priority !== undefined) row.priority = patch.priority;
  if (patch.remarks !== undefined) row.remarks = patch.remarks;
  if (patch.collected !== undefined) row.collected = patch.collected;
  if (patch.collectedAt !== undefined) row.collected_at = patch.collectedAt;
  if (patch.dateObserved !== undefined) row.date_observed = patch.dateObserved;
  const { error } = await supabase.from('bins').update(row).eq('id', binDbId);
  if (error) console.error('[binsApi] updateBinFill error', error);
}

// ===== Collection history =====
type CollectionRow = {
  id: string;
  bin_id: string;
  bin_name: string;
  location_name: string;
  zone: string;
  fill_level: number;
  priority: number;
  collected_at: string;
  collected_by: string;
};

const collectionRowToRecord = (r: CollectionRow): CollectionRecord => ({
  binId: r.bin_id,
  binName: r.bin_name,
  locationName: r.location_name,
  zone: r.zone as Zone,
  fillLevel: r.fill_level,
  priority: r.priority as Priority,
  collectedAt: r.collected_at,
  collectedBy: r.collected_by,
});

export async function fetchCollections(): Promise<CollectionRecord[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('collected_at', { ascending: false });
  if (error) {
    console.error('[binsApi] fetchCollections error', error);
    return [];
  }
  return (data as CollectionRow[]).map(collectionRowToRecord);
}

export async function addCollection(record: CollectionRecord): Promise<void> {
  const { error } = await supabase.from('collections').insert({
    bin_id: record.binId,
    bin_name: record.binName,
    location_name: record.locationName,
    zone: record.zone,
    fill_level: record.fillLevel,
    priority: record.priority,
    collected_at: record.collectedAt,
    collected_by: record.collectedBy,
  });
  if (error) console.error('[binsApi] addCollection error', error);
}
