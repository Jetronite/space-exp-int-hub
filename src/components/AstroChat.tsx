import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../types";
import { Sparkles, Send, Trash2, HelpCircle, Radio, Compass } from "lucide-react";

export default function AstroChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const local = localStorage.getItem("astro_ai_chats");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        id: "welcome",
        role: "assistant",
        content: "Greetings, Commander! I am Astro-AI, your scientific space captain and cosmic advisor. I can decipher gravity equations, break down complex stellar classifications (like O-type giants), or formulate perfect search queries for NASA's databases. What celestial coordinate shall we explore today?",
        timestamp: new Date()
      }
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Persist messages
  useEffect(() => {
    localStorage.setItem("astro_ai_chats", JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Reconstruct conversation history for Gemini (excluding the system welcome)
      const chatHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role,
          content: m.content
        }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Astro-AI connection lost. Ensure your Gemini API Key is configured in Settings.");
      }

      const botMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setError(err.message || "An error occurred while transmitting to Astro-AI.");
      
      // Fallback response so user experience is smooth even without a key configured
      const fallbackReplies: { [key: string]: string } = {
        "black hole": "A black hole is a region of spacetime where gravity is so strong that nothing, not even light, has enough energy to escape. This boundary of no escape is called the Event Horizon.",
        "gravity": "Gravity is the curvature of spacetime caused by mass and energy, as described by Einstein's General Relativity. In our orbital widget, you can see how massive objects warp gravity to govern orbital velocities!",
        "stellar": "Stars are classified by their spectral characteristics: O, B, A, F, G, K, M (from hottest blue stars to coolest red dwarfs). Betelgeuse is an M-type Red Supergiant, whereas Rigel is a B-type Blue Supergiant!",
        "nasa": "You can use our Catalog tab to search real NASA images! Try keywords like 'James Webb Deep Field' or 'Cassini Saturn' to retrieve historical assets."
      };

      let reply = "Downlink failed: Connection to Astro-AI was interrupted. Please configure your GEMINI_API_KEY in the Settings > Secrets menu.";
      
      const matchedKeyword = Object.keys(fallbackReplies).find(kw => textToSend.toLowerCase().includes(kw));
      if (matchedKeyword) {
        reply = `[DOWNLINK LIMIT / NO API KEY CONFIGURED] Here is a backup database briefing: ${fallbackReplies[matchedKeyword]}`;
      }

      const botMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Telemetry logs purged. Greetings, Commander! Astro-AI is online and ready for catalog queries.",
        timestamp: new Date()
      }
    ]);
  };

  const handleSuggest = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div id="astro-chat-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto py-4 px-1">
      
      {/* Suggestions Sidebar */}
      <div className="lg:col-span-3 flex flex-col gap-5">
        <div className="glass rounded-3xl p-6 shadow-2xl">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5 uppercase glow-text">
            <HelpCircle className="h-4 w-4 text-blue-400" />
            <span>Astro Query Guides</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
            Activate preset macro queries to test Gemini's knowledge of astrophysics and space missions:
          </p>

          <div className="space-y-2 font-mono text-xs">
            {[
              "Explain how a black hole bends light",
              "What is Kepler's Second Law of planetary motion?",
              "What are the spectral differences between Betelgeuse and Rigel?",
              "How does the James Webb Telescope look back in time?"
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggest(prompt)}
                disabled={loading}
                className="w-full text-left p-3 bg-slate-950/40 hover:bg-slate-900/30 border border-white/5 hover:border-blue-500/40 rounded-xl transition-all text-[11px] leading-snug text-slate-400 hover:text-blue-300 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Console Health card */}
        <div className="glass rounded-3xl p-6 shadow-2xl font-mono text-xs">
          <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2.5">AI Node Health</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">ENGINE:</span>
              <span className="text-slate-300">GEMINI-3.5-FLASH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">BEHAVIOR:</span>
              <span className="text-slate-300">ASTROPHYSICS EXTRA</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">SIGNAL LATENCY:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Radio className="h-3 w-3 animate-pulse" />
                <span>ONLINE</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-9 flex flex-col h-[560px] glass rounded-3xl overflow-hidden shadow-2xl">
        {/* Chat header */}
        <div className="bg-slate-900/40 border-b border-white/5 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">Downlink Feed: Astro-AI Captain</span>
          </div>
          <button
            onClick={clearChat}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-850 border border-transparent hover:border-white/10 rounded-lg transition-all cursor-pointer"
            title="Purge logs"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Message scroll container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
          {messages.map((m) => {
            const isBot = m.role === "assistant";
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* Visual Avatar */}
                <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold border font-mono ${
                  isBot 
                    ? "bg-blue-950/40 border-blue-500/30 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.3)]" 
                    : "bg-slate-900 border-slate-700 text-slate-300"
                }`}>
                  {isBot ? "A" : "C"}
                </div>

                {/* Bubble content */}
                <div className="space-y-1">
                  <div className={`rounded-2xl px-4 py-3 text-xs md:text-sm font-sans leading-relaxed ${
                    isBot 
                      ? "bg-slate-950/40 border border-white/5 text-slate-200" 
                      : "bg-blue-600 border border-blue-500 text-slate-950 font-medium"
                  }`}>
                    {m.content}
                  </div>
                  <div className={`text-[9px] font-mono text-slate-600 ${!isBot && "text-right"}`}>
                    {m.timestamp.toUTCString().slice(17, 25)}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 mr-auto items-center">
              <div className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center bg-blue-950/40 border border-blue-500/30 text-blue-400">
                <Compass className="h-4 w-4 animate-spin" />
              </div>
              <div className="flex space-x-1.5 px-4 py-3.5 bg-slate-950/40 border border-white/5 rounded-2xl items-center">
                <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input box */}
        <div className="border-t border-white/5 p-4 bg-slate-950/30">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={loading ? "Waiting for transmission..." : "Transmit queries to Astro-AI..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              disabled={loading}
              className="flex-1 bg-slate-900/40 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={loading || !input.trim()}
              className={`p-3 rounded-xl border transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                loading || !input.trim()
                  ? "bg-slate-900 border-white/10 text-slate-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 border-blue-500 text-slate-950 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
