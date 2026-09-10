"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Image from "next/image";
import { MapPin } from "lucide-react";

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface Issue {
  id: string;
  imageUrl?: string;
  location: Location;
  status?: string;
  vision?: {
    issueType?: string;
    severity?: string;
  };
  priority?: {
    score?: number;
  };
  executiveSummary?: {
    summary?: string;
  };
  recommendation?: {
    department?: string;
  };
}

interface LiveMapProps {
  issues: Issue[];
  center?: [number, number];
  zoom?: number;
}

// Custom Leaflet Pin
const createCustomIcon = (severity: string = "MEDIUM") => {
  const sev = severity.toUpperCase();
  let color = "#2563eb"; 
  let bgGlow = "rgba(37, 99, 235, 0.4)";

  if (sev === "CRITICAL") {
    color = "#dc2626"; 
    bgGlow = "rgba(220, 38, 38, 0.5)";
  } else if (sev === "HIGH") {
    color = "#ea580c"; 
    bgGlow = "rgba(234, 88, 12, 0.4)";
  } else if (sev === "MEDIUM") {
    color = "#d97706"; 
    bgGlow = "rgba(217, 119, 6, 0.4)";
  }

  const svgIcon = `
    <div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center;">
      <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:${bgGlow}; animation:pulse 2s infinite;"></div>
      <div style="position:relative; width:26px; height:26px; border-radius:50%; background:${color}; border:3px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;">
        <div style="width:8px; height:8px; border-radius:50%; background:white;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgIcon,
    className: "custom-map-pin",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

// ✅ CRITICAL FIX: This frames all the pins on the screen automatically!
function MapBoundsController({ issues }: { issues: Issue[] }) {
  const map = useMap();
  useEffect(() => {
    if (issues.length > 0) {
      const validCoords = issues
        .filter((i) => i.location && !isNaN(i.location.lat) && !isNaN(i.location.lng))
        .map((i) => [i.location.lat, i.location.lng] as [number, number]);
        
      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [issues, map]);
  return null;
}

export default function LiveMap({ issues = [], center = [16.3067, 80.4365], zoom = 12 }: LiveMapProps) {
  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-200">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsController issues={issues} />

        {issues.map((issue) => {
          if (!issue.location?.lat || !issue.location?.lng) return null;
          const lat = Number(issue.location.lat);
          const lng = Number(issue.location.lng);
          if (isNaN(lat) || isNaN(lng)) return null;

          const severity = (issue.vision?.severity || "MEDIUM").toUpperCase();
          const customIcon = createCustomIcon(severity);

          return (
            <Marker key={issue.id} position={[lat, lng]} icon={customIcon}>
              <Popup className="custom-map-popup" maxWidth={280}>
                <div className="p-1 text-slate-800 font-sans space-y-2">
                  {issue.imageUrl && (
                    <div className="relative w-full h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 mb-2">
                      <Image src={issue.imageUrl} alt="Issue" fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase border bg-slate-100">
                      {severity} ({issue.priority?.score || 0}/100)
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {issue.executiveSummary?.summary || issue.vision?.issueType || "Reported Issue"}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate">
                    <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                    <span className="truncate">{issue.location.address || "Location Recorded"}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}