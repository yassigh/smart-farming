"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet icon issue
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface Terrain {
  id: number;
  nom: string;
  superficie: number;
  typeSol: string;
  localisation?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  ferme: {
    id: number;
    nom: string;
  };
}

interface TerrainsMapViewProps {
  terrains: Terrain[];
  centerOnTerrainId?: number | null;
  onClearCenter?: () => void;
}

// Controller component to center/fly map when requested
function MapController({ centerPosition }: { centerPosition: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (centerPosition) {
      map.flyTo(centerPosition, 15, { duration: 1.5 });
    }
  }, [centerPosition, map]);
  return null;
}

export default function TerrainsMapView({
  terrains,
  centerOnTerrainId,
  onClearCenter,
}: TerrainsMapViewProps) {
  // Filter terrains that have both latitude and longitude
  const mappedTerrains = terrains.filter(
    (t) => typeof t.latitude === "number" && typeof t.longitude === "number"
  ) as Array<Terrain & { latitude: number; longitude: number }>;

  const defaultCenter: [number, number] = [36.4, 10.61]; // Hammamet
  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [zoom, setZoom] = useState(10);
  const [flyPosition, setFlyPosition] = useState<[number, number] | null>(null);

  // Compute map center based on terrains or selection
  useEffect(() => {
    if (centerOnTerrainId) {
      const selected = mappedTerrains.find((t) => t.id === centerOnTerrainId);
      if (selected) {
        setFlyPosition([selected.latitude, selected.longitude]);
        if (onClearCenter) {
          // Clear after applying so clicking again triggers effect
          setTimeout(onClearCenter, 2000);
        }
      }
    }
  }, [centerOnTerrainId, terrains]);

  useEffect(() => {
    if (mappedTerrains.length > 0 && !centerOnTerrainId) {
      // Calculate average coordinates
      const sumLat = mappedTerrains.reduce((acc, t) => acc + t.latitude, 0);
      const sumLng = mappedTerrains.reduce((acc, t) => acc + t.longitude, 0);
      setCenter([sumLat / mappedTerrains.length, sumLng / mappedTerrains.length]);
      setZoom(11);
    }
  }, [terrains]); // run only when terrains list changes

  if (mappedTerrains.length === 0) {
    return (
      <div className="bg-[#FFF3DA]/30 border-2 border-dashed border-[#FFC490]/40 rounded-3xl p-8 text-center text-[#3C6C5F]/70 text-sm font-medium mb-6">
        Aucune coordonnée GPS enregistrée. Ajoutez des coordonnées aux terrains pour les afficher sur la carte.
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-3xl overflow-hidden border-2 border-[#FFC490]/20 shadow-md relative z-0 mb-6">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappedTerrains.map((terrain) => (
          <Marker
            key={terrain.id}
            position={[terrain.latitude, terrain.longitude]}
          >
            <Popup>
              <div className="p-1 min-w-[200px] font-sans">
                <h3 className="font-bold text-base text-[#29453E] border-b border-[#FFC490]/20 pb-1 mb-1">
                  {terrain.nom}
                </h3>
                <div className="space-y-1 text-xs text-[#3C6C5F]">
                  <p>
                    <span className="font-semibold">Ferme :</span> {terrain.ferme.nom}
                  </p>
                  <p>
                    <span className="font-semibold">Superficie :</span> {terrain.superficie} ha
                  </p>
                  <p>
                    <span className="font-semibold">Sol :</span> {terrain.typeSol}
                  </p>
                  {terrain.localisation && (
                    <p>
                      <span className="font-semibold">Localisation :</span> {terrain.localisation}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-500 font-mono mt-1">
                    GPS : {terrain.latitude.toFixed(6)}, {terrain.longitude.toFixed(6)}
                  </p>
                </div>
                <div className="mt-3 text-right">
                  <Link
                    href={`/dashboard/terrains/${terrain.id}/edit`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#3C6C5F] hover:bg-[#29453E] text-white py-1.5 px-3 rounded-lg transition-colors"
                  >
                    Modifier
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapController centerPosition={flyPosition} />
      </MapContainer>
    </div>
  );
}
