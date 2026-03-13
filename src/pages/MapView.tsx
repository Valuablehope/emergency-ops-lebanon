import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Layers as LayersIcon, 
  AlertTriangle, 
  Crosshair, 
  CheckCircle2, 
  Circle,
  Building2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const INITIAL_CENTER: [number, number] = [35.5018, 33.8938]; // Beirut
const INITIAL_ZOOM = 8;

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  
  const facilities = useQuery(api.facilities.getFacilities, {});
  const dangerZones = useQuery(api.mapping.getDangerZones);

  const [layers, setLayers] = useState({
    facilities: true,
    dangerZones: true,
  });

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (layers.facilities && facilities) {
      facilities.forEach((f: any) => {
        const el = document.createElement("div");
        el.className = "marker";
        el.style.backgroundColor = f.type === "Shelter" ? "#3b82f6" : f.type === "PHCC" ? "#10b981" : "#ef4444";
        el.style.width = "12px";
        el.style.height = "12px";
        el.style.borderRadius = "50%";
        el.style.border = "2px solid white";
        el.style.cursor = "pointer";

        const marker = new maplibregl.Marker(el)
          .setLngLat([f.lng, f.lat])
          .setPopup(new maplibregl.Popup({ offset: 10 }).setHTML(`
            <div class="p-2">
              <h3 class="font-bold text-sm">${f.name}</h3>
              <p class="text-xs text-slate-500">${f.type} • ${f.status}</p>
            </div>
          `))
          .addTo(map.current!);
        
        markersRef.current.push(marker);
      });
    }

    // Add Danger Zones as Markers for now (simpler than GeoJSON layers for this MVP)
    if (layers.dangerZones && dangerZones) {
      dangerZones.forEach((z: any) => {
        // Only if it has geometry coordinates in [lng, lat] format
        if (z.geometry && z.geometry.coordinates && z.geometry.coordinates.length > 0) {
          const coords = z.geometry.coordinates[0]; // Assuming first point for marker
          if (Array.isArray(coords)) {
            const el = document.createElement("div");
            el.className = "danger-marker";
            el.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
            el.style.width = "40px";
            el.style.height = "40px";
            el.style.borderRadius = "50%";
            el.style.border = "2px solid #ef4444";
            el.style.display = "flex";
            el.style.alignItems = "center";
            el.style.justifyContent = "center";

            const marker = new maplibregl.Marker(el)
              .setLngLat([coords[0], coords[1]])
              .setPopup(new maplibregl.Popup().setHTML(`<strong>${z.name}</strong><br/>Risk: ${z.riskLevel}`))
              .addTo(map.current!);
            
            markersRef.current.push(marker);
          }
        }
      });
    }
  }, [facilities, dangerZones, layers]);

  const handleRecenter = () => {
    map.current?.flyTo({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      essential: true
    });
  };

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex h-[calc(100vh-160px)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Situational Map</h2>
          <p className="text-muted-foreground">National operational view with facilities and active danger zones.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><LayersIcon className="mr-2 h-4 w-4" /> Layers</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xs">
              <DialogHeader>
                <DialogTitle>Map Layers</DialogTitle>
                <DialogDescription>Toggle visibility of map features.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between" 
                  onClick={() => toggleLayer('facilities')}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Facilities
                  </span>
                  {layers.facilities ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-slate-300" />}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between" 
                  onClick={() => toggleLayer('dangerZones')}
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" /> Danger Zones
                  </span>
                  {layers.dangerZones ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-slate-300" />}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm" onClick={handleRecenter}><Crosshair className="mr-2 h-4 w-4" /> Recenter</Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="relative flex-1 rounded-xl border bg-slate-100 overflow-hidden">
          <div ref={mapContainer} className="h-full w-full" />
          
          {/* Legend Overlay */}
          <Card className="absolute bottom-4 right-4 w-48 shadow-lg">
            <CardHeader className="p-3">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Legend</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Collective Shelters</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span>Health Facilities</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Protection Units</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-3 w-3 bg-red-500/20 border border-red-500" />
                <span>Danger Zones</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Overlay (Alerts/Info) */}
        <aside className="hidden w-80 space-y-4 lg:block overflow-y-auto">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-2 text-xs text-red-900">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <div>
                  <p className="font-bold">Access Restricted</p>
                  <p>Nabatieh area: Significant movement constraints reported.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 p-2 text-xs text-amber-900">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="font-bold">Shelter Full</p>
                  <p>Al-Amal School (Saida) has reached 100% capacity.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Nearby Facilities</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {facilities?.slice(0, 5).map((f: any) => (
                  <div key={f._id} className="p-3 text-sm hover:bg-slate-50 cursor-pointer">
                    <div className="font-medium">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{f.type} • {f.status}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
