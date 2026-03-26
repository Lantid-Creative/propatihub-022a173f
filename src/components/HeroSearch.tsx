import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";

const tabs = [
  { label: "Buy", type: "sale" },
  { label: "Rent", type: "rent" },
  { label: "Short Let", type: "short_let" },
  { label: "Land", type: "land" },
];

const placeholders: Record<string, string> = {
  Buy: "e.g. Lekki, Victoria Island, Ikoyi...",
  Rent: "e.g. Abuja, Wuse, Maitama...",
  "Short Let": "e.g. Ikeja GRA, Banana Island...",
  Land: "e.g. Epe, Ibeju-Lekki, Lugbe...",
};

const HeroSearch = () => {
  const [activeTab, setActiveTab] = useState("Buy");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const tab = tabs.find((t) => t.label === activeTab);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (tab) params.set("type", tab.type);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card rounded-t-xl border-b border-border">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`px-6 py-4 font-body text-sm font-medium transition-colors relative ${
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
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={placeholders[activeTab]}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-body text-base"
          />
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
