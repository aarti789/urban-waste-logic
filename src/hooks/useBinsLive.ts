// Realtime hook: subscribes to Supabase bins + collections tables.
// Any insert/update/delete from any device instantly updates local state.
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BinRecord, CollectionRecord } from '@/types';
import { fetchAllBins, fetchCollections, seedBins } from '@/lib/binsApi';
import { generateInitialBinsForSeed } from '@/data/mockData';

let seedPromise: Promise<void> | null = null;

async function ensureSeeded(): Promise<BinRecord[]> {
  let bins = await fetchAllBins();
  if (bins.length === 0) {
    if (!seedPromise) {
      console.log('[useBinsLive] Empty database — seeding with initial Hyderabad bins...');
      seedPromise = seedBins(generateInitialBinsForSeed());
    }
    await seedPromise;
    bins = await fetchAllBins();
  }
  return bins;
}

export function useBinsLive() {
  const [bins, setBins] = useState<BinRecord[]>([]);
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [b, c] = await Promise.all([fetchAllBins(), fetchCollections()]);
    setBins(b);
    setCollections(c);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const initial = await ensureSeeded();
      if (!active) return;
      setBins(initial);
      const c = await fetchCollections();
      if (!active) return;
      setCollections(c);
      setLoading(false);
    })();

    const channel = supabase
      .channel('bins-and-collections')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bins' },
        () => { fetchAllBins().then(setBins); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'collections' },
        () => { fetchCollections().then(setCollections); }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { bins, collections, loading, refresh };
}
