import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Locate, Loader2 } from "lucide-react";

const GOOGLE_MAPS_API_KEY = "AIzaSyCazL5Cqw90gNr2Kn28q3iXIfdwmI4Coss";

const tabs = [
  { label: "Buy", type: "sale" },
  { label: "Rent", type: "rent" },
  { label: "Short Let", type: "short_let" },
  { label: "Land", type: "land" },
  { label: "Bid", type: "bid" },
];

const placeholders: Record<string, string> = {
  Buy: "e.g. Lekki, Victoria Island, Ikoyi...",
  Rent: "e.g. Abuja, Wuse, Maitama...",
  "Short Let": "e.g. Ikeja GRA, Banana Island...",
  Land: "e.g. Epe, Ibeju-Lekki, Lugbe...",
  Bid: "e.g. Lekki, Banana Island, Abuja...",
};

const loadGoogleMaps = (): Promise<void> => {
  return new Promise((resolve) => {
    if ((window as any).google?.maps?.places) {
      resolve();
      return;
    }
    if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      const check = setInterval(() => {
        if ((window as any).google?.maps?.places) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
};

const HeroSearch = () => {
  const [activeTab, setActiveTab] = useState("Buy");
  const [query, setQuery] = useState("");
  const [detecting, setDetecting] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    loadGoogleMaps().then(() => {
      if (!mounted || !inputRef.current) return;
      const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
        types: ["(regions)"],
        componentRestrictions: { country: "ng" },
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place?.formatted_address) {
          setQuery(place.formatted_address);
        } else if (place?.name) {
          setQuery(place.name);
        }
      });
      autocompleteRef.current = autocomplete;
    });
    return () => { mounted = false; };
  }, []);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await loadGoogleMaps();
          const geocoder = new (window as any).google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: pos.coords.latitude, lng: pos.coords.longitude } },
            (results: any[], status: string) => {
              if (status === "OK" && results?.[0]) {
                // Find the locality or sublocality
                const locality = results.find((r: any) =>
                  r.types.includes("locality") || r.types.includes("sublocality")
                );
                setQuery((locality || results[0]).formatted_address);
              }
              setDetecting(false);
            }
          );
        } catch {
          setDetecting(false);
        }
      },
      () => setDetecting(false),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  // Auto-detect on first visit
  useEffect(() => {
    if (!query && navigator.geolocation) {
      detectLocation();
    }
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    const tab = tabs.find((t) => t.label === activeTab);
    const params = new URLSearchParams();
    if (query) params.set("q", query);

    // Route Bid tab to the dedicated bidding page
    if (tab?.type === "bid") {
      navigate(`/bid?${params.toString()}`);
      return;
    }

    if (tab) params.set("type", tab.type);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card rounded-t-xl border-b border-border overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`px-4 sm:px-6 py-4 font-body text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.label
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.label && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-b-xl p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={placeholders[activeTab]}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-body text-base"
          />
          <button
            onClick={detectLocation}
            disabled={detecting}
            className="text-muted-foreground hover:text-accent transition-colors shrink-0 p-1"
            title="Detect my location"
          >
            {detecting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Locate className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={handleSearch}
            className="bg-accent hover:bg-accent/90 text-accent-foreground p-3 rounded-lg transition-colors shrink-0"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;
