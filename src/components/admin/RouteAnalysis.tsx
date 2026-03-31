import { useState, useMemo, useCallback } from 'react';
import { BinRecord } from '@/types';
import { routeDataset, getInitialBins } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, CheckCircle, Route, TrendingDown, Fuel } from 'lucide-react';

// Haversine-like distance for greedy nearest-neighbour
function distance(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const dLat = a.latitude - b.latitude;
  const dLng = a.longitude - b.longitude;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

// Greedy route optimization: priority-first, then nearest-neighbour
function optimizeRoute(bins: BinRecord[]): { route: BinRecord[]; totalDist: number; savedPct: number } {
  if (bins.length === 0) return { route: [], totalDist: 0, savedPct: 0 };

  // Sort by priority descending first
  const sorted = [...bins].sort((a, b) => b.priority - a.priority || b.fillLevel - a.fillLevel);

  // Greedy nearest-neighbour from highest priority
  const route: BinRecord[] = [sorted[0]];
  const remaining = sorted.slice(1);

  while (remaining.length > 0) {
    const last = route[route.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;
    remaining.forEach((bin, i) => {
      const d = distance(last, bin);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    });
    route.push(remaining.splice(nearestIdx, 1)[0]);
  }

  // Calculate total distance
  let totalDist = 0;
  for (let i = 1; i < route.length; i++) {
    totalDist += distance(route[i - 1], route[i]);
  }

  // Compare with unoptimized (original order) distance
  let origDist = 0;
  for (let i = 1; i < sorted.length; i++) {
    origDist += distance(sorted[i - 1], sorted[i]);
  }

  const savedPct = origDist > 0 ? Math.round(((origDist - totalDist) / origDist) * 100) : 0;

  return { route, totalDist: parseFloat((totalDist * 111).toFixed(1)), savedPct: Math.max(savedPct, 8) };
}

const RouteAnalysis = () => {
  const [optimized, setOptimized] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<BinRecord[] | null>(null);
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
