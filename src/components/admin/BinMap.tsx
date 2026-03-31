import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Tooltip } from 'react-leaflet';
import { BinRecord } from '@/types';
import { routeDataset } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import 'leaflet/dist/leaflet.css';

interface Props {
  bins: BinRecord[];
  onSelectBin?: (bin: BinRecord) => void;
}

const PRIORITY_COLORS: Record<number, string> = {
  3: '#ef4444',
  2: '#f59e0b',
  1: '#22c55e',
};

const BinMap = ({ bins, onSelectBin }: Props) => {
  // Build a lookup from bin code (e.g. "C01") to BinRecord
  const binCodeMap = useMemo(() => {
    const map: Record<string, BinRecord> = {};
    bins.forEach(b => {
      // binId is like "HYD-C01", extract code after "HYD-"
      const code = b.binId.replace('HYD-', '');
      map[code] = b;
    });
    return map;
  }, [bins]);

  // Build route polylines from routeDataset
  const routeLines = useMemo(() => {
    return routeDataset.map(route => {
      // Parse binFlow to get ordered bin codes
      const flowStr = route.binFlow.replace(/\s*\(.*?\)\s*/g, '');
      const codes = flowStr.split('→').map(s => s.trim()).filter(Boolean);
      const coords: [number, number][] = [];
      codes.forEach(code => {
        const bin = binCodeMap[code];
        if (bin) coords.push([bin.latitude, bin.longitude]);
      });
      return { routeId: route.routeId, truckNumber: route.truckNumber, zone: route.zone, coords };
    }).filter(r => r.coords.length >= 2);
  }, [binCodeMap]);

  // Hyderabad center
  const center: [number, number] = [17.4100, 78.4800];

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Hyderabad Bin Map</CardTitle>
          <div className="flex items-center gap-3 text-xs">
            {[
              { color: PRIORITY_COLORS[3], label: 'High' },
              { color: PRIORITY_COLORS[2], label: 'Medium' },
              { color: PRIORITY_COLORS[1], label: 'Low' },
              { color: '#3b82f6', label: 'Route' },
            ].map(item => (
              <span key={item.label} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="rounded-lg overflow-hidden" style={{ height: 500 }}>
          <MapContainer
            center={center}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Route lines */}
            {routeLines.map(route => (
              <Polyline
                key={route.routeId}
                positions={route.coords}
                pathOptions={{ color: '#3b82f6', weight: 2.5, opacity: 0.6, dashArray: '6 4' }}
              >
                <Tooltip sticky>
                  {route.routeId} · {route.truckNumber} · {route.zone}
                </Tooltip>
              </Polyline>
            ))}

            {/* Bin markers */}
            {bins.map(bin => (
              <CircleMarker
                key={bin.id}
                center={[bin.latitude, bin.longitude]}
                radius={7}
                pathOptions={{
                  fillColor: PRIORITY_COLORS[bin.priority],
                  color: '#ffffff',
                  weight: 2,
                  fillOpacity: 0.9,
                }}
                eventHandlers={{ click: () => onSelectBin?.(bin) }}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[140px]">
                    <p className="font-bold">{bin.binId}</p>
                    <p>{bin.locationName} · {bin.subLocation}</p>
                    <p>Fill: <strong>{bin.fillLevel}%</strong> · {bin.wasteType}</p>
                    <p>Zone: {bin.zone} · {bin.assignedTruck}</p>
                    <p>Capacity: {bin.capacity} kg</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BinMap;
