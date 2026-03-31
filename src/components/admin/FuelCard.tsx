import { routeDataset } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Fuel } from 'lucide-react';

const FuelCard = () => {
  const totalFuelUsed = routeDataset.reduce((s, r) => s + r.fuelUsed, 0);
  const totalFuelSaved = routeDataset.reduce((s, r) => s + r.fuelSaved, 0);
  const fuelBefore = totalFuelUsed + totalFuelSaved;

  return (
    <Card className="shadow-card border-success/20 bg-success/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Fuel className="w-5 h-5 text-success" />
          <h3 className="text-sm font-semibold">Fuel Optimization Summary</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-background border">
            <p className="text-xs text-muted-foreground">Before Optimization</p>
            <p className="text-lg font-bold">{fuelBefore.toFixed(1)} L</p>
          </div>
          <div className="p-3 rounded-lg bg-background border">
            <p className="text-xs text-muted-foreground">After Optimization</p>
            <p className="text-lg font-bold">{totalFuelUsed.toFixed(1)} L</p>
          </div>
          <div className="p-3 rounded-lg bg-background border">
            <p className="text-xs text-muted-foreground">Total Saved</p>
            <p className="text-lg font-bold text-success">{totalFuelSaved.toFixed(1)} L ✅</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FuelCard;
