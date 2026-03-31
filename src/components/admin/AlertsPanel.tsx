import { useMemo } from 'react';
import { BinRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, TrendingDown, CheckCircle2, Flame } from 'lucide-react';
import { mockDailyStats } from '@/data/mockData';

interface Props {
  bins: BinRecord[];
}

const AlertsPanel = ({ bins }: Props) => {
  const alerts = useMemo(() => {
    const items: { id: string; severity: 'critical' | 'warning' | 'info'; icon: typeof AlertTriangle; title: string; description: string }[] = [];

    const uncollected = bins.filter(b => !b.collected);
    const highPriority = uncollected.filter(b => b.fillLevel >= 80);
    const overflowing = uncollected.filter(b => b.fillLevel >= 95);
    const todayStats = mockDailyStats[mockDailyStats.length - 1];
    const collected = bins.filter(b => b.collected).length;
    const efficiency = bins.length > 0 ? (collected / bins.length) * 100 : 0;

    // Critical: overflowing bins
    if (overflowing.length > 0) {
      items.push({
        id: 'overflow',
        severity: 'critical',
        icon: Flame,
        title: `${overflowing.length} bins near overflow`,
        description: `Bins at 95%+ capacity: ${overflowing.slice(0, 3).map(b => b.binId).join(', ')}${overflowing.length > 3 ? ` +${overflowing.length - 3} more` : ''}. Immediate collection required.`,
      });
    }

    // Warning: high priority bins
    if (highPriority.length > 5) {
      items.push({
        id: 'high-priority',
        severity: 'warning',
        icon: AlertTriangle,
        title: `${highPriority.length} high-priority bins pending`,
        description: 'Multiple bins above 80% fill level. Consider dispatching additional trucks.',
      });
    }

    // Warning: low efficiency
    if (efficiency < 30 && bins.length > 0) {
      items.push({
        id: 'low-efficiency',
        severity: 'warning',
        icon: TrendingDown,
        title: `Collection efficiency at ${efficiency.toFixed(1)}%`,
        description: 'Efficiency is below target. Review route assignments and truck availability.',
      });
    }

    // Warning: high fuel usage
    if (todayStats.fuelUsed > 35) {
      items.push({
        id: 'fuel',
        severity: 'warning',
        icon: Clock,
        title: 'Fuel usage above threshold',
        description: `Today's fuel usage: ${todayStats.fuelUsed}L. Route optimization could reduce consumption by ~12%.`,
      });
    }

    // Info: all clear
    if (items.length === 0) {
      items.push({
        id: 'all-clear',
        severity: 'info',
        icon: CheckCircle2,
        title: 'All systems operational',
        description: 'No critical alerts. Collection is running smoothly across all zones.',
      });
    }

    return items;
  }, [bins]);

  const severityStyles = {
    critical: 'border-destructive/50 bg-destructive/5 [&>svg]:text-destructive',
    warning: 'border-warning/50 bg-warning/5 [&>svg]:text-warning',
    info: 'border-success/50 bg-success/5 [&>svg]:text-success',
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Live Alerts
          {alerts.filter(a => a.severity === 'critical').length > 0 && (
            <span className="text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full animate-pulse">
              {alerts.filter(a => a.severity === 'critical').length} critical
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map(alert => (
          <Alert key={alert.id} className={severityStyles[alert.severity]}>
            <alert.icon className="h-4 w-4" />
            <AlertTitle className="text-sm">{alert.title}</AlertTitle>
            <AlertDescription className="text-xs">{alert.description}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
