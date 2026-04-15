import { useMemo, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
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
  selectedRouteId?: string;
}

const PRIORITY_COLORS: Record<number, string> = {
  3: '#ef4444',
  2: '#f59e0b',
  1: '#22c55e',
};

// Draws a single route with polyline + arrows + start/end markers, cleans up on unmount/change
const RouteLayer = ({ coords, routeId, truckNumber, zone }: { coords: [number, number][]; routeId: string; truckNumber: string; zone: string }) => {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (coords.length < 2) return;

    const polyline = L.polyline(coords, {
      color: '#3b82f6',
      weight: 5,
      opacity: 0.85,
    });

    const decorator = (L as any).polylineDecorator(polyline, {
      patterns: [
        {
          offset: '25%',
          repeat: 120,
          symbol: (L as any).Symbol.arrowHead({
            pixelSize: 12,
            pathOptions: { fillOpacity: 1, weight: 0, color: '#3b82f6' },
          }),
        },
      ],
    });

    polyline.bindTooltip(`${routeId} · ${truckNumber} · ${zone}`, { sticky: true });

    // Start & End markers
    const startMarker = L.circleMarker(L.latLng(coords[0][0], coords[0][1]), {
      radius: 10, fillColor: '#22c55e', color: '#fff', weight: 3, fillOpacity: 1,
    }).bindPopup(`<b>Start</b><br/>${routeId}`);

    const endMarker = L.circleMarker(L.latLng(coords[coords.length - 1][0], coords[coords.length - 1][1]), {
      radius: 10, fillColor: '#ef4444', color: '#fff', weight: 3, fillOpacity: 1,
    }).bindPopup(`<b>End</b><br/>${routeId}`);

    const group = L.layerGroup([polyline, decorator, startMarker, endMarker]).addTo(map);
    layerRef.current = group;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, coords, routeId, truckNumber, zone]);

  return null;
};

// Fit map to selected route bounds
const FitBounds = ({ coords }: { coords: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length >= 2) {
      map.fitBounds(L.latLngBounds(coords.map(c => L.latLng(c[0], c[1]))), { padding: [50, 50] });
    }
  }, [map, coords]);
  return null;
};

const BinMap = ({ bins, onSelectBin, selectedRouteId }: Props) => {
  const [selectedRoute, setSelectedRoute] = useState<string>(selectedRouteId || 'all');

  // Lookup: bin code → BinRecord
  const binCodeMap = useMemo(() => {
    const map: Record<string, BinRecord> = {};
    bins.forEach(b => {
      const code = b.binId.replace('HYD-', '');
      map[code] = b;
    });
    return map;
  }, [bins]);

  // Build per-route coordinate arrays (grouped, not global)
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

  // Show ONLY the selected route (or none when "all")
  const visibleRoutes = useMemo(() => {
    if (selectedRoute === 'all') return [];
    return routeLines.filter(r => r.routeId === selectedRoute);
  }, [routeLines, selectedRoute]);

  // Coords for fitting bounds
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

            {/* Zoom to selected route */}
            {selectedCoords.length >= 2 && <FitBounds coords={selectedCoords} />}

            {/* Draw ONLY the selected route — no spider web */}
            {visibleRoutes.map(route => (
              <RouteLayer
                key={route.routeId}
                coords={route.coords}
                routeId={route.routeId}
                truckNumber={route.truckNumber}
                zone={route.zone}
              />
            ))}

            {/* Bin markers always visible */}
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
