import { useState, useEffect } from "react";
import { NASASearchResult } from "../types";
import { Search, Info, Calendar, MapPin, Sparkles, X, RefreshCw } from "lucide-react";

export default function NASAImageSearch() {
  const [query, setQuery] = useState("james webb");
  const [results, setResults] = useState<NASASearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected result for details modal
  const [activeItem, setActiveItem] = useState<NASASearchResult | null>(null);
  
  // AI photo analysis state
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/nasa/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("NASA search failed");
      const data = await res.json();
      
      const items = data.collection?.items || [];
      const parsed: NASASearchResult[] = items.slice(0, 12).map((item: any) => {
        const d = item.data?.[0] || {};
        const l = item.links?.[0] || {};
        return {
          id: d.nasa_id || Math.random().toString(),
          title: d.title || "Space Exploration",
          description: d.description || "No description provided.",
          imageUrl: l.href || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop",
          date: d.date_created ? d.date_created.slice(0, 10) : "N/A",
          center: d.center,
          keywords: d.keywords || []
        };
      });
      setResults(parsed);
    } catch (err: any) {
      setError("Failed to fetch space catalogs. Ensure the search node is online.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch("James Webb Deep Field");
  }, []);

  const handleSuggest = (keyword: string) => {
    setQuery(keyword);
    handleSearch(keyword);
  };

  const handleAnalyzePhoto = async (item: NASASearchResult) => {
    try {
      setIsAnalyzing(true);
      setAiError(null);
      setAiAnalysis("");

      const prompt = `As an expert astronomical imagery specialist, analyze this image from the NASA space archives.
Title: "${item.title}"
Center of origin: "${item.center || 'NASA'}"
Date: "${item.date}"
NASA description details: "${item.description}"

Provide a highly educational and exciting science briefing:
1. 🔭 **Observational Context**: Explain what telescope or instrument captured this and what cosmic object we are looking at.
2. 💫 **Cosmic Significance**: Why this specific subject is crucial for astrophysics, stellar evolution, or cosmology.
Keep the explanation under 150 words, incredibly informative, and written in an inspiring sci-fi tone.`;

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });

      if (!res.ok) throw new Error("Astro-AI could not process the photo analysis. Ensure GEMINI_API_KEY is configured.");
      const data = await res.json();
      setAiAnalysis(data.reply);
    } catch (err: any) {
      setAiError(err.message || "Connection to Astro-AI offline.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openModal = (item: NASASearchResult) => {
    setActiveItem(item);
    setAiAnalysis("");
    setAiError(null);
  };

  const closeModal = () => {
    setActiveItem(null);
  };

  return (
    <div id="nasa-search-container" className="max-w-7xl mx-auto py-4 px-1">
      
      {/* Search Bar & Shortcuts */}
      <div className="glass rounded-3xl p-6 mb-8 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search NASA archives for nebula, black holes, spacecraft..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              className="w-full bg-slate-950/40 border border-white/10 focus:border-blue-500 rounded-xl py-3 pl-11 pr-4 text-sm font-mono text-slate-300 focus:outline-none"
            />
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
          </div>
          <button
            onClick={() => handleSearch(query)}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-slate-950 font-sans font-semibold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>SEARCH ARCHIVES</span>
          </button>
        </div>

        {/* Suggestion tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase mr-1">Hot Coordinates:</span>
          {["Pillars of Creation", "Hubble Deep Field", "Cassini Saturn", "Curiosity Mars", "Eagle Nebula", "Andromeda Galaxy"].map((k) => (
            <button
              key={k}
              onClick={() => handleSuggest(k)}
              className="px-2.5 py-1 bg-slate-950/40 border border-white/5 hover:border-blue-500/50 text-[10px] font-mono text-slate-400 hover:text-blue-400 rounded-md transition-all cursor-pointer"
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400 font-mono gap-3">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
          <p className="animate-pulse tracking-widest text-xs">COMMUNICATING WITH GLOBS OF NASA IMAGE SERVERS...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-sm text-red-400 font-mono border border-red-950 bg-red-950/10 rounded-2xl p-6">
          {error}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-xs font-mono text-slate-500 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
          Enter a sector identifier above to download catalog assets from the NASA database.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((item) => (
            <div
              key={item.id}
              onClick={() => openModal(item)}
              className="glass hover:border-blue-500/40 rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-blue-500/5 transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              </div>
              <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                <div>
                  <h4 className="text-xs font-mono text-slate-400 truncate uppercase">{item.center || "NASA"}</h4>
                  <h3 className="text-sm font-sans font-bold text-white leading-snug tracking-tight mt-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono border-t border-white/5 pt-2.5">
                  <Calendar className="h-3 w-3 text-blue-400" />
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {activeItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="glass rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row">
            
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 bg-slate-950/60 border border-white/10 hover:border-red-500/50 text-slate-400 hover:text-red-400 rounded-xl transition-all z-10 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left side: Imagery */}
            <div className="md:w-1/2 bg-slate-950 flex items-center justify-center relative min-h-[250px] md:min-h-[400px]">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                className="w-full h-full object-cover md:absolute md:inset-0"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40 md:hidden" />
            </div>

            {/* Right side: Information dossiers & AI helper */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between gap-6 overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
              <div className="space-y-4">
                {/* Meta tags */}
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {activeItem.center && (
                    <div className="flex items-center gap-1 bg-slate-950/60 px-2.5 py-1 rounded-md border border-white/5 text-purple-400">
                      <MapPin className="h-3 w-3" />
                      <span>{activeItem.center.toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 bg-slate-950/60 px-2.5 py-1 rounded-md border border-white/5 text-slate-300">
                    <Calendar className="h-3 w-3 text-blue-400" />
                    <span>{activeItem.date}</span>
                  </div>
                </div>

                <h3 className="text-xl font-sans font-bold text-white tracking-tight leading-tight glow-text">{activeItem.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans max-h-[160px] overflow-y-auto pr-2 scrollbar-thin">
                  {activeItem.description}
                </p>

                {/* Keywords */}
                {activeItem.keywords && activeItem.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeItem.keywords.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[9px] font-mono bg-slate-950/60 border border-white/5 px-2.5 py-1 rounded-md text-slate-400">
                        #{tag.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Image Analysis Drawer */}
              <div className="border-t border-white/10 pt-5 mt-4">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-blue-400" />
                    <span className="text-xs font-sans font-semibold text-white">Astro-AI Photo Briefing</span>
                  </div>
                  <button
                    onClick={() => handleAnalyzePhoto(activeItem)}
                    disabled={isAnalyzing}
                    className={`px-2.5 py-1 rounded border text-[10px] font-mono transition-all duration-300 ${
                      isAnalyzing
                        ? "bg-slate-950 border-white/10 text-slate-500 cursor-not-allowed"
                        : "bg-blue-950/50 hover:bg-blue-900 border-blue-500/30 text-blue-300 hover:text-white cursor-pointer"
                    }`}
                  >
                    {isAnalyzing ? "ANALYZING..." : "ANALYZE PHOTO"}
                  </button>
                </div>

                {isAnalyzing && (
                  <div className="space-y-2 py-2">
                    <div className="h-2.5 bg-slate-800 rounded animate-pulse w-4/5"></div>
                    <div className="h-2.5 bg-slate-800 rounded animate-pulse w-5/6"></div>
                    <div className="h-2.5 bg-slate-800 rounded animate-pulse w-3/4"></div>
                  </div>
                )}

                {!isAnalyzing && aiAnalysis && (
                  <div className="text-xs text-slate-300 leading-relaxed font-sans border-l-2 border-blue-500 pl-3 py-0.5 whitespace-pre-line max-h-[150px] overflow-y-auto scrollbar-thin">
                    {aiAnalysis}
                  </div>
                )}

                {!isAnalyzing && !aiAnalysis && !aiError && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    Query Astro-AI to decode specific physics, instruments, or cosmic mechanics captured in this frame.
                  </p>
                )}

                {aiError && (
                  <div className="text-[10px] font-mono text-red-400 mt-2 bg-red-950/10 border border-red-900/30 rounded p-2">
                    {aiError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
