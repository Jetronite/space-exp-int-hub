import { useState } from "react";
import DashboardHeader from "./components/DashboardHeader";
import APODSection from "./components/APODSection";
import StarChart from "./components/StarChart";
import NASAImageSearch from "./components/NASAImageSearch";
import OrbitalTelemetry from "./components/OrbitalTelemetry";
import AstroChat from "./components/AstroChat";
import { Telescope, Map, Globe, Orbit, Bot, Sparkles, Star } from "lucide-react";

const TABS = [
  { id: "apod", label: "APOD Downlink", icon: Telescope },
  { id: "starchart", label: "Stellar Charts", icon: Map },
  { id: "telemetry", label: "Orbital Telemetry", icon: Orbit },
  { id: "search", label: "Catalog Search", icon: Globe },
  { id: "chat", label: "Astro-AI Assistant", icon: Bot }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("apod");

  const renderActiveSection = () => {
    switch (activeTab) {
      case "apod":
        return <APODSection />;
      case "starchart":
        return <StarChart />;
      case "telemetry":
        return <OrbitalTelemetry />;
      case "search":
        return <NASAImageSearch />;
      case "chat":
        return <AstroChat />;
      default:
        return <APODSection />;
    }
  };

  return (
    <div className="min-h-screen nebula-bg text-slate-200 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200 antialiased overflow-x-hidden relative">
      <div className="scanline" />
      
      {/* Decorative background stars */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.1),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-20 left-10 h-[1px] w-[1px] bg-white rounded-full opacity-40 shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none" />
      <div className="absolute top-80 right-40 h-[2px] w-[2px] bg-blue-400 rounded-full opacity-30 shadow-[0_0_12px_rgba(59,130,246,0.8)] pointer-events-none" />
      <div className="absolute bottom-40 left-1/3 h-[1.5px] w-[1.5px] bg-purple-400 rounded-full opacity-25 shadow-[0_0_10px_rgba(192,132,252,0.8)] pointer-events-none" />

      {/* Futuristic Navigation Header */}
      <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 relative z-10">
        
        {/* Workspace banner descriptor */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-900/60 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              Current Sector /{" "}
              <strong className="text-cyan-400 font-bold">
                {TABS.find((t) => t.id === activeTab)?.label.toUpperCase()}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
            <span className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-ping" />
            <span>DOWNLINK TERMINAL SECURE</span>
          </div>
        </div>

        {/* Dynamic active screen */}
        <div className="animate-fadeIn transition-opacity duration-300">
          {renderActiveSection()}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 relative z-10 text-center font-mono text-[10px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3 text-cyan-500" />
            <span>STARCHART TELEMETRY CONSOLE &copy; 2026</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 transition-colors">DEEP SPACE NETWORK LEVEL 4</span>
            <span className="text-slate-700">|</span>
            <span className="hover:text-slate-300 transition-colors">SECURE SECRETS AUTHENTICATION</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
