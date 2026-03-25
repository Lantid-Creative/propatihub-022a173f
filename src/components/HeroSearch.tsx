import { useState } from "react";
import { Search, MapPin } from "lucide-react";

const tabs = ["Buy", "Rent", "Short Let", "Land"];

const placeholders: Record<string, string> = {
  Buy: "e.g. Lekki, Victoria Island, Ikoyi...",
  Rent: "e.g. Abuja, Wuse, Maitama...",
  "Short Let": "e.g. Ikeja GRA, Banana Island...",
  Land: "e.g. Epe, Ibeju-Lekki, Lugbe...",
};

const HeroSearch = () => {
  const [activeTab, setActiveTab] = useState("Buy");

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card rounded-t-xl border-b border-border">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-body text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
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
            placeholder={placeholders[activeTab]}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none font-body text-base"
          />
          <button className="bg-accent hover:bg-accent/90 text-accent-foreground p-3 rounded-lg transition-colors shrink-0">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;
