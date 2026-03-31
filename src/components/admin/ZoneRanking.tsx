import { useMemo } from 'react';
import { BinRecord, Zone } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface Props {
  bins: BinRecord[];
}

const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣'];

const ZoneRanking = ({ bins }: Props) => {
  const rankings = useMemo(() => {
    const zoneMap: Record<string, { total: number; collected: number }> = {};

    bins.forEach(bin => {
      if (!zoneMap[bin.zone]) zoneMap[bin.zone] = { total: 0, collected: 0 };
      zoneMap[bin.zone].total++;
      if (bin.collected) zoneMap[bin.zone].collected++;
    });

    return Object.entries(zoneMap)
      .map(([zone, data]) => ({
        zone,
        efficiency: data.total > 0 ? Math.round((data.collected / data.total) * 100) : 0,
        total: data.total,
        collected: data.collected,
      }))
      .sort((a, b) => b.efficiency - a.efficiency);
  }, [bins]);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4 text-warning" />
          Zone Performance Ranking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rankings.map((r, i) => (
          <div
            key={r.zone}
            className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:shadow-card-hover transition-all duration-200"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{medals[i] || '▪️'}</span>
              <div>
                <p className="text-sm font-medium">{r.zone}</p>
                <p className="text-xs text-muted-foreground">{r.collected}/{r.total} bins collected</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${r.efficiency}%`,
                    backgroundColor: r.efficiency >= 70
                      ? 'hsl(var(--success))'
                      : r.efficiency >= 40
                        ? 'hsl(var(--warning))'
                        : 'hsl(var(--destructive))',
                  }}
                />
              </div>
              <span className={`text-sm font-bold min-w-[3ch] text-right ${
                r.efficiency >= 70 ? 'text-success' : r.efficiency >= 40 ? 'text-warning' : 'text-destructive'
              }`}>
                {r.efficiency}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ZoneRanking;
