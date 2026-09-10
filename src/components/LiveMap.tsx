"use client";

import { useEffect } from "react";
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
    estimatedBudgetRange?: string;
  };
}

interface LiveMapProps {
  issues: Issue[];
  center?: [number, number];
  zoom?: number;
}

// Custom Leaflet Pin Icon Generator by Severity Level
const createCustomIcon = (severity: string = "MEDIUM") => {
  const sev = severity.toUpperCase();

  let color = "#2563eb"; // Blue (Low)
  let bgGlow = "rgba(37, 99, 235, 0.4)";

  if (sev === "CRITICAL") {
    color = "#dc2626"; // Red
    bgGlow = "rgba(220, 38, 38, 0.5)";
  } else if (sev === "HIGH") {
    color = "#ea580c"; // Orange
    bgGlow = "rgba(234, 88, 12, 0.4)";
  } else if (sev === "MEDIUM") {
    color = "#d97706"; // Yellow/Amber
    bgGlow = "rgba(217, 119, 6, 0.4)";
  }

  const svgIcon = `
    <div style="
      position: relative;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: ${bgGlow};
        animation: pulse 2s infinite;
      "></div>
      <div style="
        position: relative;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: white;
        "></div>
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

// Map Auto-Bounds Controller (Fits map view to display all issue markers dynamically)
function MapBoundsController({
  issues,
  fallbackCenter,
}: {
  issues: Issue[];
  fallbackCenter: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (issues.length > 0) {
      const validCoords = issues
        .filter(
          (i) =>
            i.location &&
            !isNaN(Number(i.location.lat)) &&
            !isNaN(Number(i.location.lng))
        )
        .map(
          (i) =>
            [Number(i.location.lat), Number(i.location.lng)] as [number, number]
        );

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        return;
      }
    }
    map.setView(fallbackCenter);
  }, [issues, fallbackCenter, map]);

  return null;
}

export default function LiveMap({
  issues = [],
  center = [16.3067, 80.4365], // Default center on Vadlamudi / Guntur Area
  zoom = 12,
}: LiveMapProps) {
  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-200">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ height: "100%", width: "100%" }}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic Map Framing Controller */}
        <MapBoundsController issues={issues} fallbackCenter={center} />

        {/* Map Markers for Issues */}
        {issues.map((issue) => {
          if (!issue.location || !issue.location.lat || !issue.location.lng)
            return null;

          const lat = Number(issue.location.lat);
          const lng = Number(issue.location.lng);

          if (isNaN(lat) || isNaN(lng)) return null;

          const severity = (issue.vision?.severity || "MEDIUM").toUpperCase();
          const customIcon = createCustomIcon(severity);

          return (
            <Marker key={issue.id} position={[lat, lng]} icon={customIcon}>
              <Popup className="custom-map-popup" maxWidth={280}>
                <div className="p-1 text-slate-800 font-sans space-y-2">
                  {/* Photo Preview inside Popup */}
                  {issue.imageUrl && (
                    <div className="relative w-full h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 mb-2">
                      <Image
                        src={issue.imageUrl}
                        alt="Issue Photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Severity Badge & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase border ${
                        severity === "CRITICAL"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : severity === "HIGH"
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {severity} ({issue.priority?.score || 50}/100)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {issue.status || "REPORTED"}
                    </span>
                  </div>

                  {/* Issue Summary */}
                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {issue.executiveSummary?.summary ||
                      issue.vision?.issueType ||
                      "Reported Issue"}
                  </h4>

                  {/* Location Address */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate">
                    <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                    <span className="truncate">
                      {issue.location?.address || "Location Recorded"}
                    </span>
                  </div>

                  {/* Department & Cost Info */}
                  {issue.recommendation && (
                    <div className="pt-1 text-[10px] border-t border-slate-100 text-slate-600 font-medium flex justify-between items-center">
                      <span>
                        Dept:{" "}
                        <strong>
                          {issue.recommendation.department || "Public Works"}
                        </strong>
                      </span>
                      {issue.recommendation.estimatedBudgetRange && (
                        <span className="text-emerald-700 font-bold">
                          {issue.recommendation.estimatedBudgetRange.replace(
                            /\$/g,
                            "₹"
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}