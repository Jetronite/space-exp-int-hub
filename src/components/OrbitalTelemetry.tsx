import { useState, useEffect, useRef, useMemo } from "react";
import { CELESTIAL_BODIES } from "../data/spaceData";
import { TelemetryConfig, TelemetryMetrics } from "../types";
import { Orbit, Activity, ShieldCheck, Gauge, Zap } from "lucide-react";

export default function OrbitalTelemetry() {
  const [config, setConfig] = useState<TelemetryConfig>({
    altitudeKm: 800,
    eccentricity: 0.15,
    centralBody: "Earth",
    speedScale: 1
  });

  const [metrics, setMetrics] = useState<TelemetryMetrics>({
    currentVelocity: 0,
    orbitalPeriod: 0,
    apogeeKm: 0,
    perigeeKm: 0,
    escapeVelocity: 0,
    gForce: 0
  });

  const [isPlaying, setIsPlaying] = useState(true);

  // Satellite animation variables
  const requestRef = useRef<number | null>(null);
  const trueAnomalyRef = useRef<number>(0); // theta in radians
  const [satellitePos, setSatellitePos] = useState({ x: 200, y: 200 });
  const [orbitPathD, setOrbitPathD] = useState("");

  // Rolling chart states (stores past 40 points)
  const [velocityHistory, setVelocityHistory] = useState<number[]>(Array(40).fill(0));
  const [distanceHistory, setDistanceHistory] = useState<number[]>(Array(40).fill(0));

  // Physics Calculations
  const body = CELESTIAL_BODIES[config.centralBody];

  // Recalculate metrics whenever config or body changes
  useEffect(() => {
    const r_planet = body.radiusKm;
    const mu = body.mu;
    const h = config.altitudeKm;
    const e = config.eccentricity;

    // Perigee distance (closest point to center)
    const r_p = r_planet + h;
    
    // Semi-major axis (a) from r_p = a(1 - e)
    const a = r_p / (1 - e);
    
    // Apogee distance (furthest point to center)
    const r_a = a * (1 + e);

    const apogeeKm = r_a - r_planet;
    const perigeeKm = r_p - r_planet;

    // Orbital Period T = 2 * pi * sqrt(a^3 / mu) seconds
    const periodSeconds = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / mu);
    const orbitalPeriod = periodSeconds / 60; // in minutes

    // Escape Velocity from surface = sqrt(2 * mu / r_planet)
    const escapeVelocity = Math.sqrt((2 * mu) / r_planet);

    // Surface gravity: g = (mu / r_planet^2) * 1000 m/s^2. In Gs:
    const surfaceG = (mu / Math.pow(r_planet, 2)) * 1000;
    const gForce = surfaceG / 9.80665;

    // Estimate initial velocity for metric display (velocity at perigee)
    const currentVelocity = Math.sqrt(mu * (2 / r_p - 1 / a));

    setMetrics({
      currentVelocity,
      orbitalPeriod,
      apogeeKm,
      perigeeKm,
      escapeVelocity,
      gForce
    });

    // Draw the static orbital ellipse in SVG coordinates
    // SVG center is (200, 200). Focus (center of planet) is placed at (200, 200).
    // Let's establish a drawing scale. Planet radius should be drawn reasonably.
    // Scale: let's map maximum apogee to 160 pixels on SVG canvas.
    const max_r = r_a;
    const scale = 140 / max_r; // pixels per km

    // Ellipse semi-major axis (a_px) and semi-minor axis (b_px) in pixels
    const a_px = a * scale;
    const b_px = a * Math.sqrt(1 - e * e) * scale;
    // Distance from center of ellipse to focus: c = a * e
    const c_px = a * e * scale;

    // Since focus is at (200, 200) and apogee is on the left or right,
    // the ellipse center is shifted by c_px to the left: (200 - c_px, 200)
    const cx = 200 - c_px;
    const cy = 200;

    // Construct SVG Ellipse path (M x y a rx ry x-axis-rotation large-arc-flag sweep-flag dx dy)
    setOrbitPathD(`
      M ${cx + a_px} ${cy}
      A ${a_px} ${b_px} 0 1 1 ${cx - a_px} ${cy}
      A ${a_px} ${b_px} 0 1 1 ${cx + a_px} ${cy}
    `);

    // Reset anomaly reference so it doesn't jump wildly
    trueAnomalyRef.current = 0;
  }, [config.centralBody, config.altitudeKm, config.eccentricity]);

  // Satellite orbital ticking animation (Kepler's Second Law)
  useEffect(() => {
    const tick = () => {
      if (!isPlaying) return;

      const r_planet = body.radiusKm;
      const mu = body.mu;
      const h = config.altitudeKm;
      const e = config.eccentricity;
      const r_p = r_planet + h;
      const a = r_p / (1 - e);

      // Distance from center of focus (km) for current theta:
      const cosTheta = Math.cos(trueAnomalyRef.current);
      const r = (a * (1 - e * e)) / (1 + e * cosTheta);

      // Orbital velocity at this point: v = sqrt(mu * (2/r - 1/a))
      const velocity = Math.sqrt(mu * (2 / r - 1 / a));

      // Speed scale factor to adjust visual animation pace
      // Angular velocity dTheta/dt = sqrt(mu * a(1-e^2)) / r^2
      // We scale it for visual playability
      const h_angular = Math.sqrt(mu * a * (1 - e * e));
      const dTheta = (h_angular / (r * r)) * 500 * config.speedScale;

      trueAnomalyRef.current = (trueAnomalyRef.current + dTheta) % (2 * Math.PI);

      // Map polar coordinates (r, theta) to pixel coordinate space
      const max_r = a * (1 + e);
      const scale = 140 / max_r;
      const r_px = r * scale;

      const satX = 200 + r_px * Math.cos(trueAnomalyRef.current);
      const satY = 200 + r_px * Math.sin(trueAnomalyRef.current);

      setSatellitePos({ x: satX, y: satY });

      // Update scrolling history
      setVelocityHistory((prev) => [...prev.slice(1), velocity]);
      setDistanceHistory((prev) => [...prev.slice(1), r - r_planet]);

      // Update current instantaneous velocity in the active metrics
      setMetrics((prev) => ({
        ...prev,
        currentVelocity: velocity
      }));

      requestRef.current = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      requestRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, config.centralBody, config.altitudeKm, config.eccentricity, config.speedScale]);

  // Generate scrolling points for the SVG graphs
  const velocityPoints = useMemo(() => {
    const maxVal = Math.max(...velocityHistory) || 1;
    const minVal = Math.min(...velocityHistory) || 0;
    const diff = maxVal - minVal || 1;
    return velocityHistory.map((v, i) => {
      const x = (i / 39) * 260;
      const y = 50 - ((v - minVal) / diff) * 40; // fit inside 50px vertical height
      return `${x},${y}`;
    }).join(" ");
  }, [velocityHistory]);

  const energyPoints = useMemo(() => {
    // Distance mimics potential energy (higher altitude = more PE)
    const maxVal = Math.max(...distanceHistory) || 1;
    const minVal = Math.min(...distanceHistory) || 0;
    const diff = maxVal - minVal || 1;
    return distanceHistory.map((d, i) => {
      const x = (i / 39) * 260;
      const y = 50 - ((d - minVal) / diff) * 40;
      return `${x},${y}`;
    }).join(" ");
  }, [distanceHistory]);

  return (
    <div id="telemetry-widget" className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto py-4 px-1">
      
      {/* Parameters Panel (Left Side) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass rounded-3xl p-6 shadow-2xl">
          <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2 uppercase glow-text">
            <Orbit className="h-4 w-4 text-blue-400" />
            <span>Orbit Configuration</span>
          </h3>

          <div className="space-y-5 font-mono text-xs">
            {/* Body Selector */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-2 tracking-wider uppercase">Attractor Primary</label>
              <div className="grid grid-cols-4 gap-1">
                {(Object.keys(CELESTIAL_BODIES) as Array<keyof typeof CELESTIAL_BODIES>).map((k) => (
                  <button
                    key={k}
                    onClick={() => setConfig((prev) => ({ ...prev, centralBody: k }))}
                    className={`px-1 py-2 text-[10px] text-center border rounded-lg transition-all cursor-pointer ${
                      config.centralBody === k
                        ? "bg-blue-950/40 border-blue-500 text-blue-300 font-bold"
                        : "bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {k.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Altitude Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] text-slate-500 tracking-wider uppercase">Perigee Altitude</span>
                <span className="text-blue-400 font-bold glow-text">{config.altitudeKm} km</span>
              </div>
              <input
                type="text"
                className="hidden"
                readOnly
              />
              <input
                type="range"
                min="300"
                max="5000"
                step="50"
                value={config.altitudeKm}
                onChange={(e) => setConfig((prev) => ({ ...prev, altitudeKm: parseInt(e.target.value) }))}
                className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[8px] text-slate-600 mt-1">
                <span>300 km (LEO)</span>
                <span>5000 km (MEO)</span>
              </div>
            </div>

            {/* Eccentricity Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] text-slate-500 tracking-wider uppercase">Orbital Eccentricity</span>
                <span className="text-amber-400 font-bold">{config.eccentricity} <span className="text-[9px] text-slate-500">({config.eccentricity === 0 ? "Circular" : "Elliptical"})</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="0.65"
                step="0.05"
                value={config.eccentricity}
                onChange={(e) => setConfig((prev) => ({ ...prev, eccentricity: parseFloat(e.target.value) }))}
                className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[8px] text-slate-600 mt-1">
                <span>0.0 (Circular)</span>
                <span>0.65 (Highly Elliptical)</span>
              </div>
            </div>

            {/* Time Warp / speed scale */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] text-slate-500 tracking-wider uppercase">Time Compression</span>
                <span className="text-slate-300 font-bold">{config.speedScale}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="4"
                step="0.2"
                value={config.speedScale}
                onChange={(e) => setConfig((prev) => ({ ...prev, speedScale: parseFloat(e.target.value) }))}
                className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-slate-400"
              />
            </div>

            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3">
              <span className="text-[9px] font-bold text-slate-400 block mb-1">DYNAMICS REPORT</span>
              <p className="text-[10px] text-slate-300 leading-normal font-sans opacity-80">
                {body.description} Keplerian orbits automatically govern velocity based on angular momentum conservation.
              </p>
            </div>
          </div>
        </div>

        {/* Realtime Metrics Board */}
        <div className="glass rounded-3xl p-6 shadow-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/30 border border-white/5 rounded-xl p-3 shadow-inner">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1.5 font-mono text-[9px] tracking-wider uppercase">
                <Gauge className="h-3.5 w-3.5 text-blue-500" />
                <span>Velocity</span>
              </div>
              <div className="text-base font-bold text-white font-mono glow-text">{metrics.currentVelocity.toFixed(3)} <span className="text-[10px] text-slate-400 font-normal">km/s</span></div>
            </div>

            <div className="bg-slate-950/30 border border-white/5 rounded-xl p-3 shadow-inner">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1.5 font-mono text-[9px] tracking-wider uppercase">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span>Period</span>
              </div>
              <div className="text-base font-bold text-white font-mono">{metrics.orbitalPeriod.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">min</span></div>
            </div>

            <div className="bg-slate-950/30 border border-white/5 rounded-xl p-3 shadow-inner">
              <div className="text-slate-500 mb-1.5 font-mono text-[9px] tracking-wider uppercase">Apogee Alt</div>
              <div className="text-sm font-bold text-white font-mono">{Math.round(metrics.apogeeKm)} <span className="text-[9px] text-slate-400 font-normal">km</span></div>
            </div>

            <div className="bg-slate-950/30 border border-white/5 rounded-xl p-3 shadow-inner">
              <div className="text-slate-500 mb-1.5 font-mono text-[9px] tracking-wider uppercase">Perigee Alt</div>
              <div className="text-sm font-bold text-white font-mono">{Math.round(metrics.perigeeKm)} <span className="text-[9px] text-slate-400 font-normal">km</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Physics Canvas (Center) */}
      <div className="lg:col-span-5 flex flex-col items-center">
        <div className="w-full aspect-square max-w-[400px] glass rounded-3xl relative shadow-2xl overflow-hidden">
          
          {/* Controls overlaid */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute top-4 left-4 z-20 px-3 py-1 glass hover:border-blue-500/50 text-slate-300 hover:text-blue-400 rounded-lg text-[10px] font-mono transition-all cursor-pointer"
          >
            {isPlaying ? "HALT SYSTEM" : "RESUME FEED"}
          </button>

          {/* Central Body Sphere */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${body.color} shadow-2xl border border-white/5 z-0`}
            style={{
              width: `${Math.max(40, Math.min(100, body.radiusKm * (140 / (config.altitudeKm + body.radiusKm + 100)) * 2))}px`,
              aspectRatio: "1/1"
            }}
          >
            {/* Atmospheric glow ring */}
            <div className={`absolute inset-0 rounded-full blur-[8px] opacity-30 bg-blue-400`} />
          </div>

          {/* Keplerian SVG stage */}
          <svg viewBox="0 0 400 400" className="w-full h-full relative z-10 pointer-events-none">
            {/* Ellipse path of the orbit */}
            {orbitPathD && (
              <path
                d={orbitPathD}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.2"
                strokeOpacity="0.4"
                strokeDasharray={config.eccentricity === 0 ? "none" : "3,3"}
              />
            )}

            {/* Perigee Marker (Close point) */}
            {/* Apogee Marker (Far point) */}
            
            {/* Satellite Core and trail */}
            {satellitePos && (
              <g>
                {/* Visual pulse glow */}
                <circle
                  cx={satellitePos.x}
                  cy={satellitePos.y}
                  r="8"
                  fill="#3b82f6"
                  fillOpacity="0.3"
                  className="animate-pulse"
                />
                {/* Satellite center dot */}
                <circle
                  cx={satellitePos.x}
                  cy={satellitePos.y}
                  r="4"
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                />
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Ticker Graphs (Right Side) */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="glass rounded-3xl p-6 shadow-2xl h-full flex flex-col justify-between gap-6">
          <div className="space-y-6">
            <h3 className="text-xs font-semibold font-sans text-white border-b border-white/5 pb-3 flex items-center gap-1.5 uppercase glow-text">
              <Zap className="h-4 w-4 text-blue-400" />
              <span>Realtime Telemetry Plots</span>
            </h3>

            {/* Velocity plot */}
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-slate-500 uppercase">Velocity Profile</span>
                <span className="text-blue-400 font-bold">{metrics.currentVelocity.toFixed(2)} km/s</span>
              </div>
              <div className="bg-slate-950/40 border border-white/5 rounded-lg p-2 h-16 relative flex items-center">
                <svg viewBox="0 0 260 50" className="w-full h-full overflow-visible">
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    points={velocityPoints}
                  />
                </svg>
              </div>
            </div>

            {/* Altitude / Potential Energy Plot */}
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-slate-500 uppercase">Altitude Ticker</span>
                <span className="text-emerald-400 font-bold">{Math.round(distanceHistory[distanceHistory.length - 1] || 0)} km</span>
              </div>
              <div className="bg-slate-950/40 border border-white/5 rounded-lg p-2 h-16 relative flex items-center">
                <svg viewBox="0 0 260 50" className="w-full h-full overflow-visible">
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    points={energyPoints}
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 font-mono text-[9px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
              <span className="text-slate-300 font-bold uppercase">PHYSICS DECODER</span>
            </div>
            <p className="leading-relaxed font-sans text-[10px] opacity-80">
              Escape Velocity for this primary body is <strong className="text-slate-300 font-mono text-[9px]">{metrics.escapeVelocity.toFixed(1)} km/s</strong>. Surface gravity matches <strong className="text-slate-300 font-mono text-[9px]">{metrics.gForce.toFixed(2)} Earth Gs</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
