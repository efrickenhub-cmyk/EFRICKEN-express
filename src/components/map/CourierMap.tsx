import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: 'rider' | 'pickup' | 'delivery' | 'branch';
  details?: string;
  subtitle?: string;
  status?: string;
  isStale?: boolean;
}

interface CourierMapProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  showRouteLine?: boolean;
}

export const CourierMap: React.FC<CourierMapProps> = ({
  markers = [],
  center = [-1.286389, 36.817223], // Nairobi CBD default
  zoom = 12,
  height = '420px',
  showRouteLine = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map is already initialized on this container
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    if (layerGroup) {
      layerGroup.clearLayers();
    }

    const latLngBounds: [number, number][] = [];

    // Add markers
    markers.forEach((m) => {
      latLngBounds.push([m.lat, m.lng]);

      let iconHtml = '';
      if (m.type === 'rider') {
        const bg = m.isStale ? 'bg-amber-600' : 'bg-emerald-600';
        iconHtml = `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 ${bg} text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white font-bold text-xs">
              🏍️
            </div>
            ${m.isStale ? '<span class="absolute -top-1 -right-1 px-1 bg-red-600 text-[9px] text-white rounded font-bold">STALE</span>' : '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>'}
          </div>
        `;
      } else if (m.type === 'pickup') {
        iconHtml = `
          <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white text-xs font-bold">
            📍
          </div>
        `;
      } else if (m.type === 'delivery') {
        iconHtml = `
          <div class="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white text-xs font-bold">
            🏁
          </div>
        `;
      } else {
        iconHtml = `
          <div class="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white text-xs font-bold">
            🏢
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([m.lat, m.lng], { icon: customIcon });

      const popupContent = `
        <div class="p-2 text-slate-800 font-sans">
          <div class="font-bold text-sm text-slate-900">${m.title}</div>
          ${m.subtitle ? `<div class="text-xs text-slate-500">${m.subtitle}</div>` : ''}
          ${m.details ? `<div class="text-xs mt-1 text-slate-700 bg-slate-100 p-1 rounded">${m.details}</div>` : ''}
          ${m.isStale ? '<div class="text-[10px] text-amber-700 font-medium mt-1">⚠️ GPS signal stale (>5 mins)</div>' : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      if (layerGroup) {
        marker.addTo(layerGroup);
      }
    });

    // Draw route line if enabled and there are 2+ points
    if (showRouteLine && latLngBounds.length >= 2 && layerGroup) {
      const polyline = L.polyline(latLngBounds, {
        color: '#D97706',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8',
      });
      polyline.addTo(layerGroup);
    }

    // Fit bounds if multiple points
    if (latLngBounds.length > 1 && map) {
      map.fitBounds(latLngBounds, { padding: [40, 40], maxZoom: 14 });
    } else if (latLngBounds.length === 1 && map) {
      map.setView(latLngBounds[0], zoom);
    } else if (map) {
      map.setView(center, zoom);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Keep map instance alive across rerenders unless component unmounts
    };
  }, [markers, center, zoom, showRouteLine]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} style={{ width: '100%', height }} />
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] text-slate-600 font-medium shadow-xs border border-slate-200">
        🗺️ Efricken Express Live Logistics Map • OpenStreetMap
      </div>
    </div>
  );
};
