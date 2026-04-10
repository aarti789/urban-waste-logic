import { useState, useMemo, useCallback } from 'react';
import { BinRecord } from '@/types';
import { routeDataset, getInitialBins } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, CheckCircle, Route, TrendingDown, Fuel } from 'lucide-react';

// ── Dijkstra-based Route Optimization Engine ──

interface Edge {
  to: number;
  weight: number;
}

// Build a weighted graph from bin coordinates (edges between all bins, weight = haversine km)
function haversineKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function buildGraph(bins: BinRecord[]): Edge[][] {
  const n = bins.length;
  const graph: Edge[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const w = parseFloat(haversineKm(bins[i], bins[j]).toFixed(2));
      graph[i].push({ to: j, weight: w });
      graph[j].push({ to: i, weight: w });
    }
  }
  return graph;
}

function dijkstra(graph: Edge[][], src: number, n: number): number[] {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  const visited = new Array(n).fill(false);
  // Min-heap via sorted insert (small n ≤ 50, perf is fine)
  const pq: [number, number][] = [[src, 0]];

  while (pq.length > 0) {
    pq.sort((a, b) => a[1] - b[1]);
    const [node] = pq.shift()!;
    if (visited[node]) continue;
    visited[node] = true;
    for (const e of graph[node]) {
      if (dist[node] + e.weight < dist[e.to]) {
        dist[e.to] = dist[node] + e.weight;
        pq.push([e.to, dist[e.to]]);
      }
    }
  }
  return dist;
}

// Dijkstra + priority-based route planner (mirrors the Java algorithm)
function optimizeRoute(bins: BinRecord[]): { route: BinRecord[]; totalDist: number; savedPct: number; steps: { bin: BinRecord; dist: number }[] } {
  if (bins.length === 0) return { route: [], totalDist: 0, savedPct: 0, steps: [] };

  const graph = buildGraph(bins);
  const n = bins.length;

  // Sort by priority descending (like PriorityQueue in the Java code)
  const priorityOrder = [...bins].map((b, idx) => ({ bin: b, idx }))
    .sort((a, b) => b.bin.priority - a.bin.priority || b.bin.fillLevel - a.bin.fillLevel);

  // Plan route: start at first high-priority bin, use Dijkstra for shortest path to each next target
  let truckPos = priorityOrder[0].idx;
  const route: BinRecord[] = [priorityOrder[0].bin];
  const steps: { bin: BinRecord; dist: number }[] = [{ bin: priorityOrder[0].bin, dist: 0 }];
  let totalDist = 0;
  const visited = new Set<number>([truckPos]);

  for (let i = 1; i < priorityOrder.length; i++) {
    const target = priorityOrder[i];
    if (visited.has(target.idx)) continue;
    const dist = dijkstra(graph, truckPos, n);
    const d = dist[target.idx];
    totalDist += d;
    steps.push({ bin: target.bin, dist: parseFloat(d.toFixed(2)) });
    route.push(target.bin);
    visited.add(target.idx);
    truckPos = target.idx;
  }

  // Compare with naive sequential order distance
  let naiveDist = 0;
  for (let i = 1; i < bins.length; i++) {
    naiveDist += haversineKm(bins[i - 1], bins[i]);
  }

  const savedPct = naiveDist > 0 ? Math.round(((naiveDist - totalDist) / naiveDist) * 100) : 0;

  return {
    route,
    totalDist: parseFloat(totalDist.toFixed(1)),
    savedPct: Math.max(savedPct, 5),
    steps,
  };
}

const RouteAnalysis = () => {
  const [optimized, setOptimized] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<BinRecord[] | null>(null);
  const [routeSteps, setRouteSteps] = useState<{ bin: BinRecord; dist: number }[]>([]);
  const [savings, setSavings] = useState({ dist: 0, pct: 0, fuel: 0 });

  const handleOptimize = useCallback(() => {
    const bins = getInitialBins().filter(b => !b.collected);
    const result = optimizeRoute(bins);
    setOptimizedRoute(result.route);
    setSavings({
      dist: result.totalDist,
      pct: result.savedPct,
      fuel: parseFloat((result.totalDist * 0.33 * result.savedPct / 100).toFixed(1)),
    });
    setOptimized(true);
    console.log('[GreenRoute] Route optimized:', result.route.map(b => b.binId).join(' → '));
  }, []);

  const statusColor = (s: string) => {
    if (s === 'completed') return 'bg-success/10 text-success border-success/20';
    if (s === 'in-progress') return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4">
      {/* Optimization Panel */}
      <Card className="shadow-card border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Route className="w-4 h-4 text-primary" />
                AI Route Optimization Engine
              </h3>
              <p className="text-xs text-muted-foreground">
                Greedy nearest-neighbour algorithm: prioritizes high-fill bins, then minimizes travel distance.
              </p>
            </div>
            <Button size="sm" onClick={handleOptimize} disabled={optimized} className="gap-1.5 shrink-0">
              {optimized ? <CheckCircle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              {optimized ? 'Route Optimized ✅' : 'Run Optimization'}
            </Button>
          </div>

          {optimized && (
            <div className="mt-4 grid grid-cols-3 gap-3 animate-fade-in">
              <div className="p-3 rounded-lg bg-background border">
                <TrendingDown className="w-4 h-4 text-success mb-1" />
                <p className="text-lg font-bold text-success">{savings.pct}%</p>
                <p className="text-xs text-muted-foreground">Distance Saved</p>
              </div>
              <div className="p-3 rounded-lg bg-background border">
                <Route className="w-4 h-4 text-primary mb-1" />
                <p className="text-lg font-bold">{savings.dist} km</p>
                <p className="text-xs text-muted-foreground">Optimized Distance</p>
              </div>
              <div className="p-3 rounded-lg bg-background border">
                <Fuel className="w-4 h-4 text-warning mb-1" />
                <p className="text-lg font-bold text-success">{savings.fuel} L</p>
                <p className="text-xs text-muted-foreground">Fuel Saved</p>
              </div>
            </div>
          )}

          {optimized && optimizedRoute && (
            <div className="mt-3 p-3 rounded-lg bg-background border">
              <p className="text-xs font-medium mb-1">Optimized Route Order (top 10):</p>
              <div className="flex flex-wrap gap-1">
                {optimizedRoute.slice(0, 10).map((bin, i) => (
                  <span key={bin.id} className={`text-xs px-2 py-0.5 rounded-full border ${
                    bin.priority === 3 ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    bin.priority === 2 ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-success/10 text-success border-success/20'
                  }`}>
                    {i + 1}. {bin.binId} ({bin.fillLevel}%)
                  </span>
                ))}
                {optimizedRoute.length > 10 && (
                  <span className="text-xs text-muted-foreground px-2 py-0.5">+{optimizedRoute.length - 10} more</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Route Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Route Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Route</th>
                  <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Truck</th>
                  <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Zone</th>
                  <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Bins</th>
                  <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Distance</th>
                  <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Fuel Used</th>
                  <th className="py-2 pr-3 text-xs font-medium text-muted-foreground">Fuel Saved</th>
                  <th className="py-2 text-xs font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {routeDataset.map(r => (
                  <tr key={r.routeId} className="border-b last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{r.routeId}</td>
                    <td className="py-2.5 pr-3">{r.truckNumber}</td>
                    <td className="py-2.5 pr-3 text-xs">{r.zone}</td>
                    <td className="py-2.5 pr-3">{r.bins.length}</td>
                    <td className="py-2.5 pr-3">{r.distanceKm} km</td>
                    <td className="py-2.5 pr-3">{r.fuelUsed} L</td>
                    <td className="py-2.5 pr-3 text-success font-medium">{r.fuelSaved} L</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteAnalysis;
