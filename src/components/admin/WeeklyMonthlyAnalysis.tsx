import { useMemo } from 'react';
import { BinRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, BarChart3 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface Props {
  bins: BinRecord[];
}

// Convert fill percentage to category
function fillToCategory(fill: number): string {
  if (fill >= 90) return 'Overflow';
  if (fill >= 70) return 'High';
  if (fill >= 40) return 'Medium';
  if (fill >= 20) return 'Low';
  return 'Very Low';
}

// Convert category to numeric value
const categoryToNumeric: Record<string, number> = {
  'Very Low': 1,
  'Low': 2,
  'Medium': 3,
  'High': 4,
  'Overflow': 5,
};

// Seeded random for reproducible day-wise simulation
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const COLORS = {
  primary: 'hsl(152, 60%, 32%)',
  accent: 'hsl(80, 50%, 50%)',
  blue: 'hsl(217, 91%, 60%)',
  medium: 'hsl(38, 92%, 50%)',
};

const WeeklyMonthlyAnalysis = ({ bins }: Props) => {
  // Simulate Day_1 to Day_8 fill levels per bin
  const dayWiseData = useMemo(() => {
    const days = 8;
    const rand = createSeededRandom(123);

    // For each bin, simulate fill levels for 8 days with slight variation
    const binDayLevels: { day: number; date: string; values: number[] }[] = [];

    for (let d = 0; d < days; d++) {
      const date = new Date(Date.now() - (days - 1 - d) * 86400000);
      const dateStr = date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
      const values: number[] = [];

      for (const bin of bins) {
        // Vary fill level by ±15% around current fill, clamped 0-100
        const variation = (rand() - 0.5) * 30;
        const dayFill = Math.max(0, Math.min(100, bin.fillLevel + variation - (days - 1 - d) * 2));
        const category = fillToCategory(dayFill);
        values.push(categoryToNumeric[category]);
      }

      binDayLevels.push({ day: d + 1, date: dateStr, values });
    }

    return binDayLevels;
  }, [bins]);

  // FEATURE 1: Weekly Chart — average fill level (numeric) per day for Day 1-7
  const weeklyChartData = useMemo(() => {
    return dayWiseData.slice(0, 7).map(d => {
      const avg = d.values.reduce((s, v) => s + v, 0) / d.values.length;
      return {
        day: `Day ${d.day}`,
        date: d.date,
        avgFill: parseFloat(avg.toFixed(2)),
      };
    });
  }, [dayWiseData]);

  // FEATURE 2: Monthly Chart — group 8 days into 4 "weeks" (2 days each to simulate)
  const monthlyChartData = useMemo(() => {
    const allDays = dayWiseData;
    const weeks: { week: string; avgFill: number }[] = [];

    for (let w = 0; w < 4; w++) {
      const start = w * 2;
      const end = Math.min(start + 2, allDays.length);
      const slice = allDays.slice(start, end);

      if (slice.length === 0) continue;

      const allValues = slice.flatMap(d => d.values);
      const avg = allValues.reduce((s, v) => s + v, 0) / allValues.length;

      weeks.push({
        week: `Week ${w + 1}`,
        avgFill: parseFloat(avg.toFixed(2)),
      });
    }

    return weeks;
  }, [dayWiseData]);

  const CustomTooltipWeekly = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    const levelNames = ['', 'Very Low', 'Low', 'Medium', 'High', 'Overflow'];
    const rounded = Math.round(data.avgFill);
    return (
      <div className="bg-card border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium">{data.date}</p>
        <p className="text-muted-foreground">Avg Fill Level: <span className="font-semibold text-foreground">{data.avgFill}</span></p>
        <p className="text-muted-foreground">Category: <span className="font-semibold text-foreground">{levelNames[rounded] || 'N/A'}</span></p>
      </div>
    );
  };

  const CustomTooltipMonthly = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    const levelNames = ['', 'Very Low', 'Low', 'Medium', 'High', 'Overflow'];
    const rounded = Math.round(data.avgFill);
    return (
      <div className="bg-card border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium">{data.week}</p>
        <p className="text-muted-foreground">Avg Fill Level: <span className="font-semibold text-foreground">{data.avgFill}</span></p>
        <p className="text-muted-foreground">Category: <span className="font-semibold text-foreground">{levelNames[rounded] || 'N/A'}</span></p>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-primary" />
        Weekly &amp; Monthly Waste Analysis
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {/* WEEKLY: Smooth Line Chart */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Weekly Waste Trend (Avg Fill Level)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Scale: Very Low (1) → Low (2) → Medium (3) → High (4) → Overflow (5)
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tickFormatter={(v) => ['', 'V.Low', 'Low', 'Med', 'High', 'Over'][v] || ''}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltipWeekly />} />
                <Line
                  type="monotone"
                  dataKey="avgFill"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ r: 5, fill: COLORS.primary, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                  name="Avg Fill Level"
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* MONTHLY: Bar Chart */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly Analysis (Avg Fill Level per Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Simulated 4-week breakdown from dataset observations
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tickFormatter={(v) => ['', 'V.Low', 'Low', 'Med', 'High', 'Over'][v] || ''}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltipMonthly />} />
                <Bar
                  dataKey="avgFill"
                  fill={COLORS.blue}
                  radius={[6, 6, 0, 0]}
                  name="Avg Fill Level"
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyMonthlyAnalysis;
