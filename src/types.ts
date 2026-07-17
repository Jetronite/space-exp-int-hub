export interface APODData {
  title: string;
  date: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  copyright?: string;
}

export interface Star {
  id: string;
  name: string;
  constellation: string;
  magnitude: number;
  distance: number; // in light years
  spectralType: string;
  ra: string; // Right Ascension
  dec: string; // Declination
  color: string; // Color class/code for star glow
  x: number; // coordinates for 2D star chart (-100 to 100)
  y: number;
  description: string;
}

export interface Constellation {
  id: string;
  name: string;
  connections: [string, string][]; // Star IDs connected
  description: string;
}

export interface TelemetryConfig {
  altitudeKm: number;
  eccentricity: number; // 0 to 0.7
  centralBody: "Earth" | "Mars" | "Jupiter" | "Moon";
  speedScale: number; // time dilation factor
}

export interface TelemetryMetrics {
  currentVelocity: number; // km/s
  orbitalPeriod: number; // minutes
  apogeeKm: number;
  perigeeKm: number;
  escapeVelocity: number; // km/s
  gForce: number; // Earth g's
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface NASASearchResult {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  center?: string;
  keywords?: string[];
}
