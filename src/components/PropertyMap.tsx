import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const GOOGLE_MAPS_API_KEY = "AIzaSyCazL5Cqw90gNr2Kn28q3iXIfdwmI4Coss";

interface PropertyMapProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  title?: string;
}

const PropertyMap = ({ latitude, longitude, address, title }: PropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const loadScript = () => {
      if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
        initMap();
        return;
      }
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || !(window as any).google) return;

      if (latitude && longitude) {
        renderMap(latitude, longitude);
      } else if (address) {
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            const loc = results[0].geometry.location;
            renderMap(loc.lat(), loc.lng());
          }
        });
      }
    };

    const renderMap = (lat: number, lng: number) => {
      if (!mapRef.current) return;
      const pos = { lat, lng };
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: pos,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
        ],
      });
      new (window as any).google.maps.Marker({ position: pos, map, title: title || "Property" });
      mapInstanceRef.current = map;
    };

    loadScript();
  }, [latitude, longitude, address, title]);

  if (!latitude && !longitude && !address) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} className="w-full h-56 rounded-lg bg-muted" />
        {address && (
          <p className="text-xs text-muted-foreground font-body mt-2">{address}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyMap;
