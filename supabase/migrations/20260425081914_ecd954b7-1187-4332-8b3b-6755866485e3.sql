-- Bins table: live state of every bin
CREATE TABLE public.bins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bin_id TEXT UNIQUE NOT NULL,
  bin_code TEXT NOT NULL,
  sub_location TEXT NOT NULL,
  location_name TEXT NOT NULL,
  zone TEXT NOT NULL,
  area_type TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  capacity INTEGER NOT NULL,
  fill_level INTEGER NOT NULL DEFAULT 0,
  waste_type TEXT NOT NULL,
  date_observed DATE NOT NULL DEFAULT CURRENT_DATE,
  assigned_truck TEXT NOT NULL,
  remarks TEXT,
  priority INTEGER NOT NULL DEFAULT 1,
  collected BOOLEAN NOT NULL DEFAULT FALSE,
  collected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Collections log: every collection event
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bin_id TEXT NOT NULL,
  bin_name TEXT NOT NULL,
  location_name TEXT NOT NULL,
  zone TEXT NOT NULL,
  fill_level INTEGER NOT NULL,
  priority INTEGER NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  collected_by TEXT NOT NULL
);

-- Indexes for fast lookups
CREATE INDEX idx_bins_bin_id ON public.bins(bin_id);
CREATE INDEX idx_bins_zone ON public.bins(zone);
CREATE INDEX idx_collections_bin_id ON public.collections(bin_id);
CREATE INDEX idx_collections_collected_at ON public.collections(collected_at DESC);

-- Auto-bump updated_at on row updates
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

CREATE TRIGGER bins_touch_updated_at
BEFORE UPDATE ON public.bins
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS: public read/write for demo (mock auth, no real users)
ALTER TABLE public.bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bins" ON public.bins FOR SELECT USING (true);
CREATE POLICY "Anyone can insert bins" ON public.bins FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bins" ON public.bins FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete bins" ON public.bins FOR DELETE USING (true);

CREATE POLICY "Anyone can read collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Anyone can insert collections" ON public.collections FOR INSERT WITH CHECK (true);

-- Realtime: emit full row on changes
ALTER TABLE public.bins REPLICA IDENTITY FULL;
ALTER TABLE public.collections REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collections;