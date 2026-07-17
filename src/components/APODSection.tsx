import { useEffect, useState } from "react";
import { APODData } from "../types";
import { Image, Award, Calendar, Sparkles, RefreshCw, ZoomIn } from "lucide-react";

export default function APODSection() {
  const [apod, setApod] = useState<APODData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gemini explanation states
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchAPOD = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/nasa/apod");
      if (!res.ok) throw new Error("Failed to load Astronomy Picture of the Day");
      const data = await res.json();
      setApod(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAPOD();
  }, []);

  const handleExplainWithAI = async () => {
    if (!apod) return;
    try {
      setIsExplaining(true);
      setAiError(null);
      setAiExplanation("");

      const prompt = `As an expert astrophysicist, provide an exciting, deep science briefing about this Astronomy Picture of the Day. 
Title: "${apod.title}"
Date: "${apod.date}"
Original NASA description: "${apod.explanation}"

Structure your answer with:
1. 🌌 **The Cosmic Blueprint**: Why this phenomenon is spectacular and its scientific mechanics.
2. 🔬 **Observer's Insight**: A fascinating detail or hidden fact that casual observers might miss.
Keep it strictly under 180 words, highly educational, and written with sci-fi flair.`;

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Astro-AI could not process this image explanation.");
      }

      const data = await res.json();
      setAiExplanation(data.reply);
    } catch (err: any) {
      setAiError(err.message || "Could not connect to Astro-AI. Please check if your Gemini API key is configured.");
    } finally {
      setIsExplaining(false);
    }
  };

  if (loading) {
    return (
      <div id="apod-loading" className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 font-mono gap-4">
        <RefreshCw className="h-10 w-10 text-cyan-400 animate-spin" />
        <p className="animate-pulse tracking-widest text-sm">RETRIEVING APOD DATA FROM NASA OUTPOST...</p>
      </div>
    );
  }

  if (error || !apod) {
    return (
      <div id="apod-error" className="flex flex-col items-center justify-center min-h-[400px] border border-red-950 bg-red-950/20 rounded-2xl p-6 text-center text-red-400 max-w-xl mx-auto my-12">
        <Image className="h-12 w-12 mb-3 opacity-60" />
        <h3 className="font-sans font-bold text-lg text-white">APOD Link Offline</h3>
        <p className="text-sm text-slate-400 mt-2 mb-4">
          Could not communicate with NASA server node. Please review your internet connection or NASA API rate limits.
        </p>
        <button
          onClick={fetchAPOD}
          className="px-4 py-2 bg-red-900/40 hover:bg-red-900 border border-red-500/30 text-white rounded-lg transition-all text-xs font-mono"
        >
          RETRY DOWNLINK
        </button>
      </div>
    );
  }

  return (
    <div id="apod-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto py-4 px-1">
      {/* Media column */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="relative group overflow-hidden glass rounded-3xl shadow-2xl">
          {apod.media_type === "image" ? (
            <>
              <img
                src={apod.url}
                alt={apod.title}
                className="w-full h-[320px] md:h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
              
              {/* Actions/Overlay buttons */}
              {apod.hdurl && (
                <a
                  href={apod.hdurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-4 right-4 p-2 glass hover:border-blue-400 text-slate-300 hover:text-blue-400 rounded-xl transition-all duration-300 flex items-center gap-1.5 text-xs font-mono shadow-lg"
                >
                  <ZoomIn className="h-4 w-4 text-blue-400" />
                  <span>VIEW HD</span>
                </a>
              )}
            </>
          ) : (
            <div className="aspect-video w-full">
              <iframe
                src={apod.url}
                title={apod.title}
                className="w-full h-full border-none rounded-2xl"
                allowFullScreen
              />
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 right-4">
            <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-mono rounded-full mb-3 inline-block">
              APOD / {apod.date}
            </span>
          </div>
        </div>

        {/* Media info tags */}
        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 px-1">
          <div className="flex items-center gap-1.5 glass rounded-lg px-3 py-1.5">
            <Calendar className="h-3.5 w-3.5 text-blue-400" />
            <span>SOL: {apod.date}</span>
          </div>
          {apod.copyright && (
            <div className="flex items-center gap-1.5 glass rounded-lg px-3 py-1.5">
              <Award className="h-3.5 w-3.5 text-purple-400" />
              <span className="truncate max-w-[200px]">CREDIT: {apod.copyright}</span>
            </div>
          )}
        </div>
      </div>

      {/* Narrative & AI Column */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-sans font-bold text-white tracking-tight leading-tight glow-text">{apod.title}</h2>
          <p className="text-sm text-slate-300 mt-4 leading-relaxed font-sans opacity-90">{apod.explanation}</p>
        </div>

        <div className="border-t border-white/10 pt-6">
          {/* AI Trigger Card */}
          <div className="glass rounded-3xl p-6 relative overflow-hidden group shadow-xl">
            {/* Background cyber grid detail */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-500" />
            
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
                <h3 className="text-sm font-sans font-semibold text-white tracking-wide uppercase">Astro-AI Deep Briefing</h3>
              </div>
              <button
                onClick={handleExplainWithAI}
                disabled={isExplaining}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-300 flex items-center gap-1.5 ${
                  isExplaining
                    ? "bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-blue-950/40 hover:bg-blue-900/60 border-blue-500/30 hover:border-blue-400 text-blue-300 hover:text-white cursor-pointer"
                }`}
              >
                {isExplaining ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>ANALYZING...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    <span>DECODING APOD</span>
                  </>
                )}
              </button>
            </div>

            {isExplaining && (
              <div className="space-y-2 py-4">
                <div className="h-3 bg-slate-800 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-slate-800 rounded animate-pulse w-5/6"></div>
                <div className="h-3 bg-slate-800 rounded animate-pulse w-2/3"></div>
              </div>
            )}

            {!isExplaining && aiExplanation && (
              <div className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans mt-3 border-l-2 border-blue-500/40 pl-4 space-y-3 whitespace-pre-line animate-fadeIn">
                {aiExplanation}
              </div>
            )}

            {!isExplaining && !aiExplanation && !aiError && (
              <p className="text-xs text-slate-300 opacity-80 font-sans leading-relaxed">
                Unlock specialized cosmological insights. Ask our Astro-AI system to analyze NASA's telemetry notes for this image and explain the astrophysics.
              </p>
            )}

            {aiError && (
              <div className="mt-3 text-xs font-mono text-red-400 bg-red-950/10 border border-red-900/30 rounded-lg p-3">
                {aiError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
