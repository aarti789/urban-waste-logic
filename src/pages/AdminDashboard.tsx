import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BinRecord } from '@/types';
import { useBinsLive } from '@/hooks/useBinsLive';
import OverviewCards from '@/components/admin/OverviewCards';
import AlertsPanel from '@/components/admin/AlertsPanel';
import BinMap from '@/components/admin/BinMap';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import RouteAnalysis from '@/components/admin/RouteAnalysis';
import WeeklyChart from '@/components/admin/WeeklyChart';
import QuickActions from '@/components/admin/QuickActions';
import FuelCard from '@/components/admin/FuelCard';
import AlertCard from '@/components/admin/AlertCard';
import ZoneRanking from '@/components/admin/ZoneRanking';
import { Button } from '@/components/ui/button';
import { Recycle, LogOut, LayoutDashboard, Map, BarChart3, Route, RefreshCw, Sun, Moon, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Tab = 'overview' | 'map' | 'analytics' | 'routes';

const AdminDashboard = () => {
  const { username, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const { bins, loading, refresh } = useBinsLive();
  const [selectedBin, setSelectedBin] = useState<BinRecord | null>(null);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'routes', label: 'Routes', icon: Route },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Recycle className="w-5 h-5 text-primary" />
              <span className="font-semibold">GreenRoute</span>
            </div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs" title="Live backend sync active">
              <Wifi className="w-3 h-3 text-success" />
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-muted-foreground hidden sm:block">Live · synced</span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDark(!dark)}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={refresh} title="Refresh data"><RefreshCw className="w-4 h-4" /></Button>
            <span className="text-sm text-muted-foreground hidden sm:block">{username}</span>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 px-4 lg:px-6 pb-2 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4 animate-fade-in">
        {loading && bins.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading live bin data from backend…</CardContent></Card>
        ) : (
          <>
            {tab === 'overview' && (
              <>
                <QuickActions />
                <OverviewCards bins={bins} />
                <FuelCard />
                <WeeklyChart bins={bins} />
                <AlertsPanel bins={bins} />
                <AlertCard bins={bins} />
                <ZoneRanking bins={bins} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <BinMap bins={bins} onSelectBin={setSelectedBin} />
                  </div>
                  <div>
                    {selectedBin ? (
                      <Card className="shadow-card">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Bin Details</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                          <div className="flex justify-between"><span className="text-muted-foreground">ID</span><span className="font-medium">{selectedBin.binId}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{selectedBin.locationName}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Fill Level</span><span className="font-medium">{selectedBin.fillLevel}%</span></div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${selectedBin.fillLevel}%`,
                                backgroundColor: selectedBin.priority === 3 ? 'hsl(0,72%,51%)' : selectedBin.priority === 2 ? 'hsl(38,92%,50%)' : 'hsl(142,71%,45%)',
                              }}
                            />
                          </div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Waste Type</span><span>{selectedBin.wasteType}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Capacity</span><span>{selectedBin.capacity} kg</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Truck</span><span>{selectedBin.assignedTruck}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Last Observed</span><span>{selectedBin.dateObserved}</span></div>
                          {selectedBin.remarks && <p className="text-xs text-muted-foreground bg-muted p-2 rounded">{selectedBin.remarks}</p>}
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="shadow-card">
                        <CardContent className="p-8 text-center text-muted-foreground text-sm">
                          Click a bin on the map to view details
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            )}
            {tab === 'map' && <BinMap bins={bins} onSelectBin={setSelectedBin} />}
            {tab === 'analytics' && <AnalyticsCharts bins={bins} />}
            {tab === 'routes' && <RouteAnalysis />}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
