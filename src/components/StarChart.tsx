import { useState, useMemo, FormEvent } from "react";
import { STARS_DATA, CONSTELLATIONS_DATA } from "../data/spaceData";
import { Star } from "../types";
import { Search, Eye, EyeOff, Compass, Filter, Sparkles, BookOpen } from "lucide-react";

export default function StarChart() {
  const [selectedStar, setSelectedStar] = useState<Star | null>(STARS_DATA.find(s => s.id === "rigel") || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [constellationFilter, setConstellationFilter] = useState("all");
  const [showConstellationLines, setShowConstellationLines] = useState(true);
  const [showStarNames, setShowStarNames] = useState(true);

  // List of unique constellations for filtering
  const constellationsList = useMemo(() => {
    const list = new Set(STARS_DATA.map((s) => s.constellation));
    return Array.from(list);
  }, []);

  // Filter stars based on search and constellation filter
  const filteredStars = useMemo(() => {
    return STARS_DATA.filter((star) => {
      const matchesSearch = star.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            star.constellation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesConstellation = constellationFilter === "all" || star.constellation === constellationFilter;
      return matchesSearch && matchesConstellation;
    });
  }, [searchQuery, constellationFilter]);

  // Compute SVG lines for constellations
  const constellationLines = useMemo(() => {
    if (!showConstellationLines) return [];
    
    const lines: { x1: number; y1: number; x2: number; y2: number; id: string; constellation: string }[] = [];
    
    CONSTELLATIONS_DATA.forEach((constellation) => {
      // If we filter, only draw for that constellation
      if (constellationFilter !== "all" && constellation.name !== constellationFilter) return;

      constellation.connections.forEach(([starId1, starId2]) => {
        const star1 = STARS_DATA.find((s) => s.id === starId1);
        const star2 = STARS_DATA.find((s) => s.id === starId2);
        
        if (star1 && star2) {
          lines.push({
            // Transform coordinates from -100..100 to 0..400 SVG space
            x1: ((star1.x + 100) / 200) * 360 + 20,
            y1: ((star1.y + 100) / 200) * 360 + 20,
            x2: ((star2.x + 100) / 200) * 360 + 20,
            y2: ((star2.y + 100) / 200) * 360 + 20,
            id: `${starId1}-${starId2}`,
            constellation: constellation.name
          });
        }
      });
    });
    
    return lines;
  }, [showConstellationLines, constellationFilter]);

  // Select a star when searched and exact match or click
  const handleSelectStar = (star: Star) => {
    setSelectedStar(star);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (filteredStars.length > 0) {
      setSelectedStar(filteredStars[0]);
    }
  };

  return (
    <div id="star-chart-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto py-4 px-1">
      
      {/* Control Panel (left side on large screen) */}
      <div className="lg:col-span-3 flex flex-col gap-5">
        <div className="glass rounded-3xl p-6 shadow-2xl">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 uppercase glow-text">
            <Compass className="h-4 w-4 text-blue-400" />
            <span>Navigation Controls</span>
          </h3>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder="Search star or constellation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/40 border border-white/10 focus:border-blue-500 rounded-lg py-2 pl-9 pr-4 text-xs font-mono text-slate-300 focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          </form>

          {/* Constellation filter */}
          <div className="mb-5">
            <label className="text-[10px] font-mono tracking-wider uppercase text-slate-500 block mb-2">Constellation</label>
            <div className="relative">
              <select
                value={constellationFilter}
                onChange={(e) => setConstellationFilter(e.target.value)}
                className="w-full bg-slate-950/40 border border-white/10 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-mono text-slate-300 focus:outline-none appearance-none"
              >
                <option value="all" className="bg-slate-950">All Sectors</option>
                {constellationsList.map((c) => (
                  <option key={c} value={c} className="bg-slate-950">{c}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* View Toggles */}
          <div className="space-y-3 border-t border-white/5 pt-4">
            <button
              onClick={() => setShowConstellationLines(!showConstellationLines)}
              className="flex items-center justify-between w-full text-left text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>CONSTELLATION CONNECTIONS</span>
              {showConstellationLines ? (
                <Eye className="h-4 w-4 text-blue-400" />
              ) : (
                <EyeOff className="h-4 w-4 text-slate-600" />
              )}
            </button>
            <button
              onClick={() => setShowStarNames(!showStarNames)}
              className="flex items-center justify-between w-full text-left text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>LABEL IDENTIFIERS</span>
              {showStarNames ? (
                <Eye className="h-4 w-4 text-blue-400" />
              ) : (
                <EyeOff className="h-4 w-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Star Selector Grid */}
        <div className="glass rounded-3xl p-6 shadow-2xl">
          <h4 className="text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-3 block">Target Catalog Index</h4>
          <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {filteredStars.map((star) => (
              <button
                key={star.id}
                onClick={() => handleSelectStar(star)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono border transition-all flex items-center justify-between cursor-pointer ${
                  selectedStar?.id === star.id
                    ? "bg-blue-950/40 border-blue-500/50 text-blue-300"
                    : "bg-slate-950/40 border-white/5 hover:border-white/20 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: star.color, boxShadow: `0 0 6px ${star.color}` }} />
                  <span className="truncate font-sans font-medium">{star.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">m: {star.magnitude}</span>
              </button>
            ))}
            {filteredStars.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">NO STARS FOUND IN SECTOR</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Star Chart (Center) */}
      <div className="lg:col-span-6 flex flex-col items-center">
        <div className="w-full aspect-square max-w-[500px] glass rounded-full relative p-6 shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden">
          {/* Radial grids */}
          <div className="absolute inset-4 border border-dashed border-white/5 rounded-full pointer-events-none" />
          <div className="absolute inset-16 border border-dashed border-white/5 rounded-full pointer-events-none" />
          <div className="absolute inset-32 border border-dashed border-white/5 rounded-full pointer-events-none" />
          
          {/* Celestial Axes */}
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/5 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-white/5 pointer-events-none" />
          
          {/* Degree Markers */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[9px] text-slate-500 tracking-wider">000° N</div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] text-slate-500 tracking-wider">180° S</div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-slate-500 tracking-wider">090° E</div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-slate-500 tracking-wider">270° W</div>

          {/* SVG Canvas for Stars & Constellations */}
          <svg viewBox="0 0 400 400" className="w-full h-full relative z-10 overflow-visible">
            {/* Draw Constellation lines first so they render under stars */}
            {constellationLines.map((line) => (
              <line
                key={line.id}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#3b82f6"
                strokeWidth="1.2"
                strokeOpacity="0.4"
                strokeDasharray="2,2"
                className="transition-all duration-500"
              />
            ))}

            {/* Draw Stars */}
            {STARS_DATA.map((star) => {
              // Map coordinates -100..100 -> 20..380 SVG Space
              const svgX = ((star.x + 100) / 200) * 360 + 20;
              const svgY = ((star.y + 100) / 200) * 360 + 20;
              
              // Scale size inversely with magnitude (brighter star = smaller magnitude = bigger circle)
              // magnitude spans around 0 to 3.5. Size formula:
              const size = Math.max(3, 8 - star.magnitude * 1.5);
              
              const isSelected = selectedStar?.id === star.id;
              const matchesFilter = constellationFilter === "all" || star.constellation === constellationFilter;

              return (
                <g key={star.id} className="cursor-pointer group select-none">
                  {/* Outer selection ring */}
                  {isSelected && (
                    <circle
                      cx={svgX}
                      cy={svgY}
                      r={size + 6}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                      className="animate-spin"
                      style={{ transformOrigin: `${svgX}px ${svgY}px`, animationDuration: '8s' }}
                    />
                  )}

                  {/* Soft star glow */}
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r={size + 4}
                    fill={star.color}
                    fillOpacity={isSelected ? 0.35 : 0.15}
                    className="transition-all duration-300 group-hover:fill-opacity-40"
                  />

                  {/* Core Star Body */}
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r={size}
                    fill={matchesFilter ? star.color : "#475569"}
                    className="transition-all duration-300"
                    onClick={() => handleSelectStar(star)}
                  />

                  {/* Star Name Label */}
                  {showStarNames && matchesFilter && (
                    <text
                      x={svgX + size + 4}
                      y={svgY + 3}
                      fill={isSelected ? "#3b82f6" : "#94a3b8"}
                      fontSize="9"
                      fontWeight={isSelected ? "bold" : "normal"}
                      fontFamily="sans-serif"
                      className="opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none"
                    >
                      {star.name}
                    </text>
                  )}
                  
                  {/* Micro Tooltip */}
                  <title>{`${star.name} (${star.constellation}) - Distance: ${star.distance} ly`}</title>
                </g>
              );
            })}
          </svg>
        </div>
        
        <p className="text-[10px] text-slate-500 font-mono mt-4 text-center">
          Interactive star sphere is mapped using equirectangular projection coordinates. Use controls to filter sectors.
        </p>
      </div>

      {/* Star Detail Dossier (Right side) */}
      <div className="lg:col-span-3">
        {selectedStar ? (
          <div className="glass rounded-3xl p-6 shadow-2xl h-full flex flex-col justify-between">
            <div className="space-y-5">
              {/* Dossier Header */}
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase glow-text">Stellar Dossier</span>
                </div>
                <h3 className="text-xl font-bold text-white font-sans glow-text">{selectedStar.name}</h3>
                <span className="inline-block px-2 py-0.5 mt-1 bg-slate-950/60 border border-white/5 text-[10px] font-mono text-slate-300 rounded-md">
                  CONSTELLATION: {selectedStar.constellation.toUpperCase()}
                </span>
              </div>

              {/* Physical Parameters List */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-500">APPARENT MAGNITUDE</span>
                  <span className="text-slate-300 font-bold">{selectedStar.magnitude}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-500">DISTANCE TO CORE</span>
                  <span className="text-blue-400 font-bold">{selectedStar.distance} light-years</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-500">SPECTRAL CLASS</span>
                  <span className="text-slate-300 font-bold truncate max-w-[140px]" title={selectedStar.spectralType}>{selectedStar.spectralType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-500">RIGHT ASCENSION</span>
                  <span className="text-slate-300">{selectedStar.ra}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">DECLINATION</span>
                  <span className="text-slate-300">{selectedStar.dec}</span>
                </div>
              </div>

              {/* Scientific Description */}
              <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3.5 mt-4">
                <p className="text-xs text-slate-300 opacity-90 leading-relaxed font-sans">{selectedStar.description}</p>
              </div>
            </div>

            {/* Scientific disclaimer */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <Sparkles className="h-3 w-3 text-blue-500 shrink-0" />
              <span>Data curated from SIMBAD astronomical database archives.</span>
            </div>
          </div>
        ) : (
          <div className="glass rounded-3xl p-6 shadow-2xl h-full flex items-center justify-center text-center">
            <p className="text-xs font-mono text-slate-500">SELECT A TARGET STAR FROM CHART TO ENGAGE SPECTRAL PROFILE DOWNLINK</p>
          </div>
        )}
      </div>
    </div>
  );
}
