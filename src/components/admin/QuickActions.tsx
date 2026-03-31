import { Button } from '@/components/ui/button';
import { Play, Route, FileText } from 'lucide-react';
import { toast } from 'sonner';

const QuickActions = () => {
  const handleStartCollection = () => {
    toast.success('Collection started for all high-priority bins');
  };

  const handleOptimizeRoute = () => {
    toast.success('Route optimization triggered — recalculating paths...');
  };

  const handleGenerateReport = () => {
    toast.success('Report generated successfully ✅');
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={handleStartCollection} className="gap-2">
        <Play className="w-4 h-4" />
        Start Collection
      </Button>
      <Button onClick={handleOptimizeRoute} variant="secondary" className="gap-2 bg-primary/10 text-primary hover:bg-primary/20">
        <Route className="w-4 h-4" />
        Optimize Route
      </Button>
      <Button onClick={handleGenerateReport} variant="outline" className="gap-2">
        <FileText className="w-4 h-4" />
        Generate Report
      </Button>
    </div>
  );
};

export default QuickActions;
