import { useMemo, useState } from 'react';
import { BinRecord } from '@/types';
import { mockDailyStats, getZoneSummary, routeDataset } from '@/data/mockData';
import { exportCSV, exportPDF } from '@/lib/exportReport';
import WeeklyMonthlyAnalysis from './WeeklyMonthlyAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, CalendarDays, BarChart3, Lightbulb, Route, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface Props {
  bins: BinRecord[];
}

const COLORS = {
  high: 'hsl(0, 72%, 51%)',
  medium: 'hsl(38, 92%, 50%)',
  low: 'hsl(142, 71%, 45%)',
  primary: 'hsl(152, 60%, 32%)',
  accent: 'hsl(80, 50%, 50%)',
  blue: 'hsl(217, 91%, 60%)',
};

const AnalyticsCharts = ({ bins }: Props) => {
  // ===== WEEKLY ANALYSIS =====
  const weeklyData = useMemo(() => {
    const last7 = mockDailyStats.slice(-7);
    return last7.map(d => {
      const efficiency = Math.round((d.binsCollected / (d.binsCollected + 15)) * 100);
      return {
        day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
        collected: d.binsCollected,
        efficiency,
        fuel: d.fuelUsed,
      };
    });
  }, []);

  const weeklyInsight = useMemo(() => {
    const total = weeklyData.reduce((s, d) => s + d.collected, 0);
    const avgEff = Math.round(weeklyData.reduce((s, d) => s + d.efficiency, 0) / weeklyData.length);
    const totalFuel = parseFloat(weeklyData.reduce((s, d) => s + d.fuel, 0).toFixed(1));
    const first = weeklyData[0]?.collected || 1;
    const last = weeklyData[weeklyData.length - 1]?.collected || 0;
    const trendPct = Math.round(((last - first) / first) * 100);
    return { total, avgEff, totalFuel, trendPct };
  }, [weeklyData]);

  // ===== MONTHLY ANALYSIS =====
  const monthlyData = useMemo(() => {
    // Group 14 days into 2-week blocks, simulate 4 weeks
    const weeks = [];
    for (let w = 0; w < 4; w++) {
      const start = w * 3;
      const end = Math.min(start + 3, mockDailyStats.length);
      const slice = mockDailyStats.slice(start, end);
      const collected = slice.reduce((s, d) => s + d.binsCollected, 0);
      const fuel = parseFloat(slice.reduce((s, d) => s + d.fuelUsed, 0).toFixed(1));
      const distance = parseFloat(slice.reduce((s, d) => s + d.distanceKm, 0).toFixed(1));
      const efficiency = Math.round((collected / (collected + 40)) * 100);
      weeks.push({ week: `Week ${w + 1}`, collected, fuel, distance, efficiency });
    }
    return weeks;
  }, []);

  const monthlyInsight = useMemo(() => {
    const totalCollected = monthlyData.reduce((s, d) => s + d.collected, 0);
    const avgEff = Math.round(monthlyData.reduce((s, d) => s + d.efficiency, 0) / monthlyData.length);
    const totalFuel = parseFloat(monthlyData.reduce((s, d) => s + d.fuel, 0).toFixed(1));
    const totalFuelSaved = parseFloat(routeDataset.reduce((s, r) => s + r.fuelSaved, 0).toFixed(1));
    const first = monthlyData[0]?.collected || 1;
    const last = monthlyData[monthlyData.length - 1]?.collected || 0;
    const growthPct = Math.round(((last - first) / first) * 100);
    return { totalCollected, avgEff, totalFuel, totalFuelSaved, growthPct };
  }, [monthlyData]);

  // ===== EXISTING CHARTS DATA =====
  const priorityData = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    bins.forEach(b => {
      if (b.priority === 3) counts.high++;
      else if (b.priority === 2) counts.medium++;
      else counts.low++;
    });
    return [
      { name: 'High', value: counts.high, color: COLORS.high },
      { name: 'Medium', value: counts.medium, color: COLORS.medium },
      { name: 'Low', value: counts.low, color: COLORS.low },
    ];
  }, [bins]);

  const zoneData = useMemo(() => getZoneSummary(bins), [bins]);

  const areaData = useMemo(() => {
    return zoneData.map(z => ({ name: z.zone, waste: z.totalWaste })).sort((a, b) => b.waste - a.waste);
  }, [zoneData]);

  const routeFuelData = useMemo(() => {
    const zoneMap: Record<string, { optimized: number; estimated: number }> = {};
    routeDataset.forEach(r => {
      const key = r.zone.split('–')[0].split(' ')[0];
      if (!zoneMap[key]) zoneMap[key] = { optimized: 0, estimated: 0 };
      zoneMap[key].optimized += r.fuelUsed;
      zoneMap[key].estimated += r.fuelUsed + r.fuelSaved;
    });
    return Object.entries(zoneMap).map(([label, d]) => ({ label, before: parseFloat(d.estimated.toFixed(1)), after: parseFloat(d.optimized.toFixed(1)) }));
  }, []);

  const heatData = useMemo(() => {
    return zoneData.map(z => ({ area: z.zone, intensity: z.avgFill, total: z.total, high: z.high })).sort((a, b) => b.intensity - a.intensity);
  }, [zoneData]);

  const bestWeekIndex = useMemo(() => {
    let maxIdx = 0;
    monthlyData.forEach((w, i) => {
      if (w.collected > monthlyData[maxIdx].collected) maxIdx = i;
    });
    return maxIdx;
  }, [monthlyData]);

  const [routeOptimized, setRouteOptimized] = useState(false);

  return (
    <div className="space-y-6">
      {/* ========== WEEKLY ANALYSIS ========== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Weekly Analysis
          </h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setRouteOptimized(true)}
              disabled={routeOptimized}
              className={routeOptimized ? 'bg-success hover:bg-success' : ''}
            >
              <Route className="w-3.5 h-3.5 mr-1.5" />
              {routeOptimized ? 'Route Optimized ✅' : 'Optimize Route'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 right-4 bg-card border shadow-lg rounded-lg px-4 py-3 z-50 text-sm font-medium animate-fade-in';
                toast.textContent = 'Report Downloaded ✅';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2500);
              }}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Report
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Weekly Line Chart */}
          <Card className="shadow-card md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Daily Collection & Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="collected" stroke={COLORS.primary} strokeWidth={2} name="Bins Collected" dot={{ r: 4 }} />
                  <Line yAxisId="left" type="monotone" dataKey="efficiency" stroke={COLORS.blue} strokeWidth={2} name="Efficiency %" dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="fuel" stroke={COLORS.medium} strokeWidth={2} name="Fuel (L)" dot={{ r: 4 }} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0" />
                💡 Fuel usage peaks on weekends — consider optimizing routes from Fri–Sun.
              </p>
            </CardContent>
          </Card>

          {/* Weekly Summary with Trend Indicators */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Collected</span>
                <div className="text-right">
                  <span className="text-lg font-bold">{weeklyInsight.total}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Efficiency</span>
                <div className="text-right">
                  <span className="text-lg font-bold">{weeklyInsight.avgEff}%</span>
                  <p className={`text-xs font-semibold ${weeklyInsight.trendPct >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {weeklyInsight.trendPct >= 0 ? '↑' : '↓'} {weeklyInsight.trendPct >= 0 ? '+' : ''}{weeklyInsight.trendPct}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Fuel</span>
                <div className="text-right">
                  <span className="text-lg font-bold">{weeklyInsight.totalFuel} L</span>
                  <p className="text-xs font-semibold text-destructive">↓ -5%</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trend</span>
                <span className={`flex items-center gap-1 font-semibold text-sm ${weeklyInsight.trendPct >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {weeklyInsight.trendPct >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {weeklyInsight.trendPct >= 0 ? '+' : ''}{weeklyInsight.trendPct}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span>
                    {weeklyInsight.trendPct >= 10
                      ? `📈 Weekly collection increased by ${weeklyInsight.trendPct}%. Efficiency trending upward across all zones.`
                      : weeklyInsight.trendPct >= 0
                      ? '📊 Steady week. Minor improvements in collection rates detected.'
                      : `⚠️ Collection dropped by ${Math.abs(weeklyInsight.trendPct)}%. Consider route rebalancing.`}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========== MONTHLY ANALYSIS ========== */}
      <div>
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          Monthly Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Monthly Bar Chart */}
          <Card className="shadow-card md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Weekly Collection Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="collected" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Bins Collected" />
                  <Bar dataKey="fuel" fill={COLORS.medium} radius={[4, 4, 0, 0]} name="Fuel (L)" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
              <p className="mt-2 text-sm font-semibold text-success flex items-center gap-1.5">
                🥇 Best Performance: {monthlyData[bestWeekIndex]?.week}
              </p>
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Collected</span>
                <span className="text-lg font-bold">{monthlyInsight.totalCollected}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Efficiency</span>
                <span className="text-lg font-bold">{monthlyInsight.avgEff}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Fuel Used</span>
                <span className="text-lg font-bold">{monthlyInsight.totalFuel} L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fuel Saved</span>
                <span className="text-xl font-bold text-success">{monthlyInsight.totalFuelSaved} L ✅</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Growth</span>
                <span className={`flex items-center gap-1 font-semibold text-sm ${monthlyInsight.growthPct >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {monthlyInsight.growthPct >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {monthlyInsight.growthPct >= 0 ? '+' : ''}{monthlyInsight.growthPct}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span>
                    📊 Total {monthlyInsight.totalCollected} bins collected this month with {monthlyInsight.avgEff}% avg efficiency. {monthlyInsight.totalFuelSaved}L fuel saved via route optimization.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========== EXISTING ZONE & PRIORITY CHARTS ========== */}
      <div>
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          Zone & Priority Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority Pie */}
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Bins by Priority</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {priorityData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Waste per Area Bar */}
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Waste by Area (kg)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={areaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="waste" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Fuel Comparison */}
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Fuel: Before vs After Optimization</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={routeFuelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="before" fill={COLORS.medium} name="Estimated (L)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="after" fill={COLORS.primary} name="Optimized (L)" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Heat-style waste zones */}
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Waste Intensity by Zone</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {heatData.map((d) => {
                  const maxIntensity = heatData[0]?.intensity || 1;
                  const ratio = d.intensity / maxIntensity;
                  const bg = ratio > 0.7 ? 'bg-destructive/20 border-destructive/30' : ratio > 0.4 ? 'bg-warning/20 border-warning/30' : 'bg-success/20 border-success/30';
                  return (
                    <div key={d.area} className={`p-3 rounded-lg border ${bg}`}>
                      <p className="text-xs font-medium truncate">{d.area}</p>
                      <p className="text-lg font-bold">{d.intensity}%</p>
                      <p className="text-xs text-muted-foreground">avg fill · {d.total} bins · {d.high} critical</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========== WEEKLY & MONTHLY WASTE ANALYSIS ========== */}
      <WeeklyMonthlyAnalysis bins={bins} />
    </div>
  );
};

export default AnalyticsCharts;
