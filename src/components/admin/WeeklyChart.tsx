import { useMemo } from 'react';
import { BinRecord } from '@/types';
import { mockDailyStats } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  bins: BinRecord[];
}

const WeeklyChart = ({ bins }: Props) => {
  const weeklyData = useMemo(() => {
    const last7 = mockDailyStats.slice(-7);
    return last7.map(d => ({
      day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
      collected: d.binsCollected,
      waste: Math.round(d.totalWasteKg / 100),
      fuel: d.fuelUsed,
    }));
  }, []);

  const stats = useMemo(() => {
    const total = weeklyData.reduce((s, d) => s + d.collected, 0);
    const avg = Math.round(total / weeklyData.length);
    const first = weeklyData[0]?.collected || 0;
    const last = weeklyData[weeklyData.length - 1]?.collected || 0;
    const trend = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
    return { total, avg, trend };
  }, [weeklyData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Weekly Collections Bar Chart */}
      <Card className="shadow-card md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Weekly Collection Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="collected" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Bins Collected" />
              <Bar dataKey="waste" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Waste (×100kg)" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Collected</span>
              <span className="text-lg font-bold">{stats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Daily Avg</span>
              <span className="text-lg font-bold">{stats.avg}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trend</span>
              <span className={`flex items-center gap-1 text-sm font-semibold ${stats.trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                {stats.trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {stats.trend >= 0 ? '+' : ''}{stats.trend}%
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground">
              {stats.trend >= 10
                ? '📈 Weekly efficiency improved significantly. Collection rates are trending upward across zones.'
                : stats.trend >= 0
                ? '📊 Steady performance this week. Minor improvements detected in collection rates.'
                : '⚠️ Collection efficiency dropped this week. Consider route rebalancing.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyChart;
