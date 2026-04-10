import { useState, useCallback } from 'react';
import { BinRecord } from '@/types';
import { getInitialBins } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, CheckCircle } from 'lucide-react';

interface Edge {
  to: number;
  weight: number;
}

function haversineKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function buildDirectedGraph(bins: BinRecord[]): Edge[][] {
  const n = bins.length;
  const graph: Edge[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        const w = parseFloat(haversineKm(bins[i], bins[j]).toFixed(2));
        graph[i].push({ to: j, weight: w });
      }
    }
  }
  return graph;
}

// Reverse Dijkstra: compute shortest distance FROM all nodes TO destination
// Mirrors the Java multiPathToOne logic — run Dijkstra from dest on reversed edges
function multiPathToOne(graph: Edge[][], dest: number, n: number): number[] {
  const dist = new Array(n).fill(Infinity);
  dist[dest] = 0;
  const pq: [number, number][] = [[dest, 0]];
  const visited = new Array(n).fill(false);

  while (pq.length > 0) {
    pq.sort((a, b) => a[1] - b[1]);
    const [node] = pq.shift()!;
    if (visited[node]) continue;
    visited[node] = true;

    // Reverse edge search: find all edges that point TO current node
    for (let i = 0; i < n; i++) {
      for (const e of graph[i]) {
        if (e.to === node) {
          if (dist[node] + e.weight < dist[i]) {
            dist[i] = dist[node] + e.weight;
            pq.push([i, dist[i]]);
          }
        }
      }
    }
  }

  return dist;
}

interface DepotResult {
  binId: string;
  binName: string;
  zone: string;
  fillLevel: number;
  distToDepot: number;
}

const DepotReturnAnalysis = () => {
  const [computed, setComputed] = useState(false);
  const [results, setResults] = useState<DepotResult[]>([]);
  const [depotName, setDepotName] = useState('');

  const handleCompute = useCallback(() => {
    const bins = getInitialBins().filter(b => !b.collected);
    if (bins.length === 0) return;

    const graph = buildDirectedGraph(bins);
    const n = bins.length;

    // Use the first bin (index 0) as the "depot/disposal facility"
    const depotIdx = 0;
    setDepotName(bins[depotIdx].binId);

    const dist = multiPathToOne(graph, depotIdx, n);

    const depotResults: DepotResult[] = bins.map((bin, i) => ({
      binId: bin.binId,
      binName: bin.locationName,
      zone: bin.zone,
      fillLevel: bin.fillLevel,
      distToDepot: parseFloat(dist[i].toFixed(2)),
    })).sort((a, b) => a.distToDepot - b.distToDepot);

    setResults(depotResults);
    setComputed(true);

    console.log('[GreenRoute] Reverse Dijkstra (multiPathToOne):', depotResults.map(r => `${r.binId}→Depot:${r.distToDepot}km`).join(', '));
  }, []);

  return (
    <Card className="shadow-card border-accent/20 bg-accent/5">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Navigation className="w-4 h-4 text-accent-foreground" />
              Return-to-Depot Analysis
            </h3>
            <p className="text-xs text-muted-foreground">
              Reverse Dijkstra: computes shortest return path from every bin to the disposal facility.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleCompute} disabled={computed} className="gap-1.5 shrink-0">
            {computed ? <CheckCircle className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            {computed ? 'Computed ✅' : 'Compute Return Paths'}
          </Button>
        </div>

        {computed && results.length > 0 && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div className="p-3 rounded-lg bg-background border">
              <p className="text-xs font-medium mb-1">
                Depot: <span className="text-primary font-bold">{depotName}</span>
                <span className="text-muted-foreground ml-2">({results.length} bins analyzed)</span>
              </p>
            </div>

            <div className="p-3 rounded-lg bg-background border">
              <p className="text-xs font-medium mb-2">All Bins → Depot (sorted by distance):</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {results.slice(0, 12).map((r) => (
                  <div key={r.binId} className="flex items-center gap-2 text-xs">
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="font-medium min-w-[60px]">{r.binId}</span>
                    <span className="text-muted-foreground truncate flex-1">{r.binName}</span>
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] ${
                      r.distToDepot < 2 ? 'bg-success/10 text-success border-success/20' :
                      r.distToDepot < 5 ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                      {r.distToDepot} km
                    </span>
                  </div>
                ))}
                {results.length > 12 && (
                  <p className="text-xs text-muted-foreground">+{results.length - 12} more bins</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-background border text-center">
                <p className="text-sm font-bold text-success">
                  {results.filter(r => r.distToDepot < 2).length}
                </p>
                <p className="text-[10px] text-muted-foreground">Near (&lt;2km)</p>
              </div>
              <div className="p-2 rounded-lg bg-background border text-center">
                <p className="text-sm font-bold text-warning">
                  {results.filter(r => r.distToDepot >= 2 && r.distToDepot < 5).length}
                </p>
                <p className="text-[10px] text-muted-foreground">Medium (2-5km)</p>
              </div>
              <div className="p-2 rounded-lg bg-background border text-center">
                <p className="text-sm font-bold text-destructive">
                  {results.filter(r => r.distToDepot >= 5).length}
                </p>
                <p className="text-[10px] text-muted-foreground">Far (&gt;5km)</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepotReturnAnalysis;
