import { useMemo } from 'react';
import { BinRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  bins: BinRecord[];
}

const AlertCard = ({ bins }: Props) => {
  const alerts = useMemo(() => {
    const uncollected = bins.filter(b => !b.collected);
    const overflowing = uncollected.filter(b => b.fillLevel >= 90);
    return overflowing.slice(0, 4).map(bin => ({
      id: bin.id,
      message: `🚨 Overflow risk: ${bin.binId} at ${bin.locationName} (${bin.fillLevel}%)`,
      zone: bin.zone,
    }));
  }, [bins]);

  if (alerts.length === 0) return null;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          Actionable Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5"
          >
            <span className="text-sm">{alert.message}</span>
            <div className="flex gap-2 shrink-0 ml-3">
              <Button
                size="sm"
                variant="outline"
                className="gap-1 h-7 text-xs"
                onClick={() => toast.success(`Resolved alert for ${alert.zone}`)}
              >
                <CheckCircle className="w-3 h-3" />
                Resolve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 h-7 text-xs"
                onClick={() => toast.success(`Truck assigned to ${alert.zone}`)}
              >
                <Truck className="w-3 h-3" />
                Assign Truck
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AlertCard;
