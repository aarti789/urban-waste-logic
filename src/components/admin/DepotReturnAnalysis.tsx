import { useState, useCallback } from 'react';
import { BinRecord } from '@/types';
import { getInitialBins } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, CheckCircle, AlertTriangle } from 'lucide-react';

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

// Dijkstra from source — mirrors Java dijkstra(graph, src) returning dist[]
function dijkstraFromSource(graph: Edge[][], src: number, n: number): number[] {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  const pq: [number, number][] = [[src, 0]];
  const visited = new Array(n).fill(false);

  while (pq.length > 0) {
    pq.sort((a, b) => a[1] - b[1]);
    const [node] = pq.shift()!;
    if (visited[node]) continue;
    visited[node] = true;

    for (const e of graph[node]) {
      const newDist = dist[node] + e.weight;
      if (newDist < dist[e.to]) {
        dist[e.to] = newDist;
        pq.push([e.to, dist[e.to]]);
      }
    }
  }

  return dist;
}

// Reverse Dijkstra: compute shortest distance FROM all nodes TO destination
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

// Dynamic rank-based priority: sort by distance, assign P1 (closest) → PN (farthest)
// Mirrors Java Collections.sort + sequential priority assignment
function assignDynamicPriorities(items: { idx: number; dist: number }[]): Map<number, { label: string; rank: number }> {
  const sorted = [...items].sort((a, b) => a.dist - b.dist);
  const map = new Map<number, { label: string; rank: number }>();
  sorted.forEach((item, i) => {
    map.set(item.idx, { label: `P${i + 1}`, rank: i + 1 });
  });
  return map;
}

function priorityStyle(rank: number, total: number) {
  const pct = rank / total;
  if (pct <= 0.33) return 'bg-destructive/10 text-destructive border-destructive/20';
  if (pct <= 0.66) return 'bg-warning/10 text-warning border-warning/20';
  return 'bg-success/10 text-success border-success/20';
}

interface DepotResult {
  binId: string;
  binName: string;
  zone: string;
  fillLevel: number;
  distToDepot: number;
  distFromDepot: number;
  priority: { label: string; rank: number };
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
    const depotIdx = 0;
    setDepotName(bins[depotIdx].binId);

    // Forward Dijkstra from depot (Java-style dijkstra from source)
    const distFromDepot = dijkstraFromSource(graph, depotIdx, n);
    // Reverse Dijkstra to depot
    const distToDepot = multiPathToOne(graph, depotIdx, n);

    // Dynamic rank-based priority assignment (Java: sort by dist, assign P1..PN)
    const priorityMap = assignDynamicPriorities(
      bins.map((_, i) => ({ idx: i, dist: distFromDepot[i] }))
    );

    const depotResults: DepotResult[] = bins.map((bin, i) => {
      const dFrom = parseFloat(distFromDepot[i].toFixed(2));
      const dTo = parseFloat(distToDepot[i].toFixed(2));
      return {
        binId: bin.binId,
        binName: bin.locationName,
        zone: bin.zone,
        fillLevel: bin.fillLevel,
        distToDepot: dTo,
        distFromDepot: dFrom,
        priority: priorityMap.get(i) || { label: 'P?', rank: 999 },
      };
    }).sort((a, b) => a.priority.rank - b.priority.rank);

    setResults(depotResults);
    setComputed(true);

    console.log('[GreenRoute] Dijkstra distance-priority classification:',
      depotResults.map(r => `${r.binId}(${r.distFromDepot}km→${r.priority.label})`).join(', '));
  }, []);

  const third = Math.ceil(results.length / 3);
  const highCount = results.filter((_, i) => i < third).length;
  const medCount = results.filter((_, i) => i >= third && i < third * 2).length;
  const lowCount = results.length - highCount - medCount;

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
              Dijkstra forward + reverse: ranks bins by distance, assigns dynamic priority P1→PN (closest first).
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
                <span className="text-muted-foreground ml-2">({results.length} bins ranked by Dijkstra distance)</span>
              </p>
            </div>

            {/* Dynamic Priority Distribution */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-background border text-center">
                <p className="text-sm font-bold text-destructive">{highCount}</p>
                <p className="text-[10px] text-muted-foreground">High Priority (top ⅓)</p>
              </div>
              <div className="p-2 rounded-lg bg-background border text-center">
                <p className="text-sm font-bold text-warning">{medCount}</p>
                <p className="text-[10px] text-muted-foreground">Medium Priority (mid ⅓)</p>
              </div>
              <div className="p-2 rounded-lg bg-background border text-center">
                <p className="text-sm font-bold text-success">{lowCount}</p>
                <p className="text-[10px] text-muted-foreground">Low Priority (bottom ⅓)</p>
              </div>
            </div>

            {/* Bin list with priority badges */}
            <div className="p-3 rounded-lg bg-background border">
              <p className="text-xs font-medium mb-2">All Bins — Dijkstra Distance & Priority:</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {results.slice(0, 12).map((r) => (
                  <div key={r.binId} className="flex items-center gap-2 text-xs">
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="font-medium min-w-[60px]">{r.binId}</span>
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${priorityStyle(r.priority.rank, results.length)}`}>
                      {r.priority.label}
                    </span>
                    <span className="text-muted-foreground truncate flex-1">{r.binName}</span>
                    <span className="text-[10px] text-muted-foreground">{r.distFromDepot}km→</span>
                    <span className="text-[10px] text-muted-foreground">←{r.distToDepot}km</span>
                  </div>
                ))}
                {results.length > 12 && (
                  <p className="text-xs text-muted-foreground">+{results.length - 12} more bins</p>
                )}
              </div>
            </div>

            {/* Warning for low-priority (far) bins */}
            {lowCount > 0 && (
              <div className="p-2 rounded-lg bg-warning/10 border border-warning/20 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                <p className="text-xs text-warning">
                  {lowCount} bin{lowCount > 1 ? 's' : ''} ranked as low priority (farthest from depot) — consider relay points or reassignment.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepotReturnAnalysis;
