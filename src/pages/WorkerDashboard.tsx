import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BinRecord, AreaType, WasteType, Zone, CollectionRecord } from '@/types';
import { getInitialBins, saveBins, getCollectionHistory, saveCollectionHistory, fuseFillLevel, BIN_UPDATE_EVENT } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Recycle, LogOut, Plus, Pencil, Check, X, CheckCircle2, History, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Tab = 'bins' | 'history';

const WorkerDashboard = () => {
  const { username, logout } = useAuth();
  const { toast } = useToast();
  const [bins, setBins] = useState<BinRecord[]>(getInitialBins);
  const [history, setHistory] = useState<CollectionRecord[]>(getCollectionHistory);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('bins');

  const emptyForm = {
    binId: '', subLocation: '', locationName: '', zone: 'Central' as BinRecord['zone'],
    areaType: 'Residential' as AreaType, latitude: '', longitude: '', capacity: '', fillLevel: '',
    wasteType: 'Mixed' as WasteType, dateObserved: new Date().toISOString().split('T')[0],
    assignedTruck: '', remarks: '',
  };
  const [form, setForm] = useState(emptyForm);

  const getPriority = (fl: number): 1 | 2 | 3 => fl >= 80 ? 3 : fl >= 50 ? 2 : 1;

  const collectBin = (bin: BinRecord) => {
    const now = new Date().toISOString();
    const updatedBins = bins.map(b =>
      b.id === bin.id ? { ...b, collected: true, collectedAt: now, fillLevel: 0, priority: 1 as const, updatedAt: now } : b
    );
    setBins(updatedBins);
    saveBins(updatedBins);

    const record: CollectionRecord = {
      binId: bin.id,
      binName: bin.binId,
      locationName: bin.locationName,
      zone: bin.zone,
      fillLevel: bin.fillLevel,
      priority: bin.priority,
      collectedAt: now,
      collectedBy: username || 'worker',
    };
    const updatedHistory = [record, ...history];
    setHistory(updatedHistory);
    saveCollectionHistory(updatedHistory);

    toast({ title: 'Bin collected', description: `${bin.binId} marked as collected` });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fillLevel = parseInt(form.fillLevel);
    const newRecord: BinRecord = {
      id: editingId || `rec-${Date.now()}`,
      binId: form.binId,
      subLocation: form.subLocation,
      locationName: form.locationName,
      zone: form.zone,
      areaType: form.areaType,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      capacity: parseFloat(form.capacity),
      fillLevel,
      wasteType: form.wasteType,
      dateObserved: form.dateObserved,
      assignedTruck: form.assignedTruck,
      remarks: form.remarks || undefined,
      priority: getPriority(fillLevel),
      collected: false,
      createdAt: editingId ? bins.find(b => b.id === editingId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updated: BinRecord[];
    if (editingId) {
      updated = bins.map(b => b.id === editingId ? newRecord : b);
    } else {
      updated = [...bins, newRecord];
    }
    setBins(updated);
    saveBins(updated);
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    toast({ title: editingId ? 'Record updated' : 'Bin added', description: `${form.binId} saved successfully` });
  };

  const startEdit = (bin: BinRecord) => {
    setForm({
      binId: bin.binId, subLocation: bin.subLocation, locationName: bin.locationName, zone: bin.zone,
      areaType: bin.areaType, latitude: String(bin.latitude), longitude: String(bin.longitude),
      capacity: String(bin.capacity), fillLevel: String(bin.fillLevel), wasteType: bin.wasteType,
      dateObserved: bin.dateObserved, assignedTruck: bin.assignedTruck, remarks: bin.remarks || '',
    });
    setEditingId(bin.id);
    setShowForm(true);
  };

  // Sort: uncollected first, then by priority desc
  const sortedBins = useMemo(() =>
    [...bins]
      .filter(b => !b.collected)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 20),
    [bins]
  );

  const priorityLabel = (p: number) => p === 3 ? 'high' : p === 2 ? 'medium' : 'low';
  const priorityBadge = (p: number) => {
    const cls = p === 3 ? 'bg-destructive/10 text-destructive' : p === 2 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success';
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{priorityLabel(p)}</span>;
  };

  const collectedCount = bins.filter(b => b.collected).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Recycle className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">GreenRoute</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{username}</span>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Tab switcher */}
        {!showForm && (
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setActiveTab('bins')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'bins' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Bins ({bins.length - collectedCount})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'history' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History ({history.length})
            </button>
          </div>
        )}

        {showForm ? (
          <Card className="shadow-card animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{editingId ? 'Update Record' : 'New Bin Record'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Bin ID</Label>
                    <Input value={form.binId} onChange={e => setForm(f => ({ ...f, binId: e.target.value }))} placeholder="BIN-001" required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Assigned Truck</Label>
                    <Input value={form.assignedTruck} onChange={e => setForm(f => ({ ...f, assignedTruck: e.target.value }))} placeholder="TRK-001" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Sub-location</Label>
                    <Input value={form.subLocation} onChange={e => setForm(f => ({ ...f, subLocation: e.target.value }))} placeholder="Near Park" required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Location / Area</Label>
                    <Input value={form.locationName} onChange={e => setForm(f => ({ ...f, locationName: e.target.value }))} placeholder="Koramangala" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Zone</Label>
                    <Select value={form.zone} onValueChange={v => setForm(f => ({ ...f, zone: v as Zone }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Central', 'West', 'IT Corridor', 'North', 'East', 'South'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Area Type</Label>
                    <Select value={form.areaType} onValueChange={v => setForm(f => ({ ...f, areaType: v as AreaType }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Residential', 'Commercial', 'Industrial', 'Institutional', 'Mixed'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Waste Type</Label>
                    <Select value={form.wasteType} onValueChange={v => setForm(f => ({ ...f, wasteType: v as WasteType }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Wet', 'Dry', 'Mixed'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Latitude</Label>
                    <Input type="number" step="any" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Longitude</Label>
                    <Input type="number" step="any" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Capacity (kg)</Label>
                    <Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Fill Level (%)</Label>
                    <Input type="number" min="0" max="100" value={form.fillLevel} onChange={e => setForm(f => ({ ...f, fillLevel: e.target.value }))} required />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date of Observation</Label>
                  <Input type="date" value={form.dateObserved} onChange={e => setForm(f => ({ ...f, dateObserved: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Remarks (optional)</Label>
                  <Textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} rows={2} />
                </div>
                <Button type="submit" className="w-full">
                  <Check className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Record' : 'Submit Record'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : activeTab === 'bins' ? (
          <>
            <Button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add New Bin Record
            </Button>

            {collectedCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-success/10 px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                {collectedCount} bin{collectedCount > 1 ? 's' : ''} collected today
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Pending Collection · sorted by priority
              </h2>
              {sortedBins.map(bin => (
                <Card key={bin.id} className="shadow-card">
                  <CardContent className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{bin.binId}</span>
                        {priorityBadge(bin.priority)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{bin.subLocation}, {bin.locationName}</p>
                      <p className="text-xs text-muted-foreground">Fill: {bin.fillLevel}% · {bin.wasteType} · {bin.assignedTruck}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(bin)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => collectBin(bin)}
                        className="text-success border-success/30 hover:bg-success/10"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {sortedBins.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">All bins collected! 🎉</p>
              )}
            </div>
          </>
        ) : (
          /* History tab */
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Collection History</h2>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No collections yet</p>
            ) : (
              history.map((rec, i) => (
                <Card key={`${rec.binId}-${i}`} className="shadow-card">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                          <span className="font-medium text-sm">{rec.binName}</span>
                          {priorityBadge(rec.priority)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{rec.locationName} · {rec.zone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{rec.fillLevel}% fill</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(rec.collectedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkerDashboard;
