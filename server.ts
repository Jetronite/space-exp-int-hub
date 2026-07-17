import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialisation helper for GoogleGenAI
let ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// API Routes

// APOD proxy to prevent CORS or handle offline/rate-limit fallbacks
app.get("/api/nasa/apod", async (req, res) => {
  try {
    const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`);
    if (!response.ok) {
      throw new Error(`NASA API returned status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("APOD Error:", error.message);
    // Return standard fallback info if APOD fails (rate limits, etc)
    res.json({
      title: "The Pillars of Creation",
      date: new Date().toISOString().split('T')[0],
      explanation: "This majestic view of the Pillars of Creation was captured by the James Webb Space Telescope. It reveals star-forming regions of interstellar gas and dust in the Eagle Nebula, located roughly 6,500 light-years from Earth. The reddish, claw-like projections are areas of intense star creation where newborn stars burst from their dusty cocoons.",
      url: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=1200&auto=format&fit=crop",
      media_type: "image",
      copyright: "NASA/ESA/CSA/STScI"
    });
  }
});

// NASA Image library search proxy
app.get("/api/nasa/search", async (req, res) => {
  try {
    const query = req.query.q || "nebula";
    const response = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(query as string)}&media_type=image`);
    if (!response.ok) {
      throw new Error("NASA Image Library search failed");
    }
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("NASA Search Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Gemini Chat assistant endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const client = getGeminiClient();
    
    // System instruction to guide the persona
    const systemInstruction = `You are Astro-AI, the expert AI Space Captain and Astronomical Advisor of the Space Explorers Interactive Hub. 
Your tone is inspiring, enthusiastic, precise, and educational. Use a touch of sci-fi flavor, but remain mathematically and scientifically accurate.
Keep answers concise and well-structured, under 150 words. Speak to the user as a fellow space commander. Suggest interesting space search terms if they ask what to look for (like 'James Webb Orion', 'Hubble Deep Field', 'Cassini Saturn').`;

    // Reconstruct history if any
    const formattedHistory = (history || []).map((h: { role: string; content: string }) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }]
    }));

    // Start chat
    const chat = client.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.8,
      },
      history: formattedHistory
    });

    const response = await chat.sendMessage({ message });
    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error.message);
    res.status(500).json({ 
      error: error.message,
      isGeminiError: true,
      hint: "Ensure you have added your GEMINI_API_KEY in the Settings > Secrets menu."
    });
  }
});

// Start Vite middleware or static server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
