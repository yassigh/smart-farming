"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
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

interface MapSelectorProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

// Sub-component to handle map click events and updates
function MapEventsHandler({
  onChange,
  setPosition,
  setHasSelected
}: {
  onChange: (lat: number, lng: number) => void;
  setPosition: (pos: [number, number]) => void;
  setHasSelected: (selected: boolean) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setHasSelected(true);
      onChange(lat, lng);
    },
  });
  return null;
}

// Sub-component to fly to the marker when position changes from outside
function MapRecenter({ position }: { position: [number, number] }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

export default function MapSelector({ latitude, longitude, onChange }: MapSelectorProps) {
  const defaultCenter: [number, number] = [36.4, 10.61]; // Hammamet, Tunisie (Default)
  const initialPosition: [number, number] = latitude && longitude ? [latitude, longitude] : defaultCenter;
  const [position, setPosition] = useState<[number, number]>(initialPosition);
  const [hasSelected, setHasSelected] = useState<boolean>(!!(latitude && longitude));

  // Sync state if props change (e.g., loaded initial edit data or manual input)
  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
      setHasSelected(true);
    }
  }, [latitude, longitude]);

  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden border-2 border-[#E8E3DC] shadow-inner relative z-0">
      <MapContainer
        center={position}
        zoom={hasSelected ? 14 : 10}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasSelected && <Marker position={position} />}
        <MapEventsHandler onChange={onChange} setPosition={setPosition} setHasSelected={setHasSelected} />
        <MapRecenter position={position} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm border border-[#E8E3DC] text-[11px] text-[#29453E] py-1 px-2.5 rounded-lg z-[400] font-medium shadow-sm pointer-events-none">
        Cliquez sur la carte pour définir l'emplacement
      </div>
    </div>
  );
}
