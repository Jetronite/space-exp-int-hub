import { useEffect, useState } from "react";
import { Compass, Radio, Sun, ShieldAlert } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { id: string; label: string; icon: any }[];
}

export default function DashboardHeader({ activeTab, setActiveTab, tabs }: HeaderProps) {
  const [utcTime, setUtcTime] = useState<string>("");
  const [utcDate, setUtcDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + " UTC");
      setUtcDate(now.toUTCString().slice(0, 16));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header id="dashboard-header" className="glass sticky top-0 z-40 border-b border-white/10 shadow-2xl backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title and Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-950/60 border border-blue-500/30 rounded-xl text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Compass className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-sans font-bold tracking-tight text-white flex items-center gap-2 uppercase glow-text">
              Space Explorers <span className="text-blue-400 font-mono text-sm tracking-widest uppercase px-2 py-0.5 bg-blue-950/40 border border-blue-500/20 rounded">Interactive Hub</span>
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Advanced astronomical cataloging & telemetry control platform</p>
          </div>
        </div>

        {/* Real-time Tickers & UTC clock */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 font-mono text-xs">
          {/* Cosmic Weather Ticker */}
          <div className="hidden lg:flex items-center gap-4 glass rounded-lg px-3 py-1.5 text-slate-300">
            <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
              <Sun className="h-3.5 w-3.5 text-amber-500 animate-spin" style={{ animationDuration: '10s' }} />
              <span>Solar Wind: <strong className="text-amber-400">412 km/s</strong></span>
            </div>
            <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
              <ShieldAlert className="h-3.5 w-3.5 text-violet-400" />
              <span>Solar Storm: <strong className="text-violet-400">Class M1</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-emerald-400" />
              <span>DSN Link: <strong className="text-emerald-400">SECURE</strong></span>
            </div>
          </div>

          {/* Atomic Clock */}
          <div className="glass rounded-lg px-4 py-1.5 text-right shadow-lg min-w-[180px]">
            <div className="text-blue-400 font-bold tracking-widest text-sm glow-text">{utcTime}</div>
            <div className="text-[10px] text-slate-400 tracking-wider uppercase mt-0.5">{utcDate}</div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto flex scrollbar-none">
          <nav className="flex space-x-1 py-1" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-sans font-medium border-b-2 whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? "border-blue-500 text-blue-400 bg-white/5"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
