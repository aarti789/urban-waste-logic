import { useMemo, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-polylinedecorator';
import { BinRecord } from '@/types';
import { routeDataset } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

// Component to draw a decorated polyline with arrows
const ArrowPolyline = ({ coords, routeId, truckNumber, zone }: { coords: [number, number][]; routeId: string; truckNumber: string; zone: string }) => {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (coords.length < 2) return;

    const polyline = L.polyline(coords, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.8,
    });

    const decorator = (L as any).polylineDecorator(polyline, {
      patterns: [
        {
          offset: '30%',
          repeat: 100,
          symbol: (L as any).Symbol.arrowHead({
            pixelSize: 12,
            pathOptions: { fillOpacity: 1, weight: 0, color: '#3b82f6' },
          }),
        },
      ],
    });

    const group = L.layerGroup([polyline, decorator]).addTo(map);
    polyline.bindTooltip(`${routeId} · ${truckNumber} · ${zone}`, { sticky: true });

    layerRef.current = group;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, coords, routeId, truckNumber, zone]);

  return null;
};

// Component to fit map bounds to selected route
const FitBounds = ({ coords }: { coords: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length >= 2) {
      map.fitBounds(L.latLngBounds(coords.map(c => L.latLng(c[0], c[1]))), { padding: [40, 40] });
    }
  }, [map, coords]);
  return null;
};

const BinMap = ({ bins, onSelectBin }: Props) => {
  const [selectedRoute, setSelectedRoute] = useState<string>('all');

  const binCodeMap = useMemo(() => {
    const map: Record<string, BinRecord> = {};
    bins.forEach(b => {
      const code = b.binId.replace('HYD-', '');
      map[code] = b;
    });
    return map;
  }, [bins]);

  const routeLines = useMemo(() => {
    return routeDataset.map(route => {
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

  const visibleRoutes = useMemo(() => {
    if (selectedRoute === 'all') return routeLines;
    return routeLines.filter(r => r.routeId === selectedRoute);
  }, [routeLines, selectedRoute]);

  const selectedCoords = useMemo(() => {
    if (selectedRoute !== 'all') {
      const route = routeLines.find(r => r.routeId === selectedRoute);
      return route?.coords || [];
    }
    return [];
  }, [selectedRoute, routeLines]);

  const center: [number, number] = [17.4100, 78.4800];

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm">Hyderabad Bin Map</CardTitle>
          <div className="flex items-center gap-3">
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger className="w-[200px] h-8 text-xs">
                <SelectValue placeholder="Select Route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routes</SelectItem>
                {routeDataset.map(route => (
                  <SelectItem key={route.routeId} value={route.routeId}>
                    {route.routeId} · {route.zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

            {/* Fit bounds when a specific route is selected */}
            {selectedCoords.length >= 2 && <FitBounds coords={selectedCoords} />}

            {/* Route lines with arrows */}
            {visibleRoutes.map(route => (
              <ArrowPolyline
                key={route.routeId}
                coords={route.coords}
                routeId={route.routeId}
                truckNumber={route.truckNumber}
                zone={route.zone}
              />
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
