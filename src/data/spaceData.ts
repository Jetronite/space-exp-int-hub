import { Star, Constellation } from "../types";

export const CELESTIAL_BODIES = {
  Earth: {
    name: "Earth",
    mass: "5.972e24",
    radiusKm: 6371,
    mu: 398600, // km^3 / s^2
    color: "from-blue-600 to-indigo-900",
    highlight: "text-blue-400",
    description: "Our cradle. Low Earth Orbit provides highly stable telemetry feeds."
  },
  Mars: {
    name: "Mars",
    mass: "6.417e23",
    radiusKm: 3389,
    mu: 42828,
    color: "from-red-600 to-amber-950",
    highlight: "text-red-400",
    description: "The red planet. Telemetry orbits reveal dynamic gravity anomalies."
  },
  Jupiter: {
    name: "Jupiter",
    mass: "1.898e27",
    radiusKm: 69911,
    mu: 126686000,
    color: "from-amber-600 to-yellow-950",
    highlight: "text-amber-400",
    description: "Gas Giant. Massive gravity wells induce extreme orbital velocities."
  },
  Moon: {
    name: "Moon",
    mass: "7.342e22",
    radiusKm: 1737,
    mu: 4902.8,
    color: "from-slate-400 to-slate-700",
    highlight: "text-slate-300",
    description: "Luna. Low gravity allows slow, majestic orbits around ancient craters."
  }
};

export const STARS_DATA: Star[] = [
  // Orion
  {
    id: "betelgeuse",
    name: "Betelgeuse",
    constellation: "Orion",
    magnitude: 0.5,
    distance: 640,
    spectralType: "M1-M2Ia-ab (Red Supergiant)",
    ra: "05h 55m 10.3s",
    dec: "+07° 24′ 25″",
    color: "#ff6b4a",
    x: 10,
    y: -30,
    description: "A colossal red supergiant near the end of its life, expected to go supernova in astronomical terms. One of the largest stars visible to the naked eye."
  },
  {
    id: "rigel",
    name: "Rigel",
    constellation: "Orion",
    magnitude: 0.13,
    distance: 860,
    spectralType: "B8Ia (Blue Supergiant)",
    ra: "05h 14m 32.3s",
    dec: "-08° 12′ 06″",
    color: "#80b3ff",
    x: -25,
    y: 35,
    description: "The brightest star in Orion and a prominent blue-white supergiant. It is actually a multiple star system consisting of at least four stars."
  },
  {
    id: "bellatrix",
    name: "Bellatrix",
    constellation: "Orion",
    magnitude: 1.64,
    distance: 250,
    spectralType: "B2III (Blue Giant)",
    ra: "05h 25m 07.9s",
    dec: "+06° 20′ 59″",
    color: "#a6ccff",
    x: -20,
    y: -25,
    description: "Known as the 'Amazon Star', Bellatrix is a massive blue-white giant. It serves as Orion's left shoulder."
  },
  {
    id: "alnilam",
    name: "Alnilam",
    constellation: "Orion",
    magnitude: 1.69,
    distance: 1340,
    spectralType: "B0Ia (Blue Supergiant)",
    ra: "05h 36m 12.8s",
    dec: "-01° 12′ 07″",
    color: "#80b3ff",
    x: -5,
    y: 5,
    description: "The middle star of Orion's Belt. A highly luminous blue supergiant, radiating hundreds of thousands of times more light than the Sun."
  },
  {
    id: "alnitak",
    name: "Alnitak",
    constellation: "Orion",
    magnitude: 1.74,
    distance: 700,
    spectralType: "O9.7Ib",
    ra: "05h 40m 45.5s",
    dec: "-01° 56′ 34″",
    color: "#4da6ff",
    x: 5,
    y: 7,
    description: "The easternmost star of Orion's belt. It is a triple star system, with the primary star being an extremely hot blue supergiant."
  },
  {
    id: "mintaka",
    name: "Mintaka",
    constellation: "Orion",
    magnitude: 2.23,
    distance: 900,
    spectralType: "B0.5III",
    ra: "05h 32m 00.4s",
    dec: "-00° 17′ 57″",
    color: "#80b3ff",
    x: -15,
    y: 3,
    description: "The westernmost star of Orion's Belt. Mintaka is a multiple star system that lies close to the celestial equator."
  },
  {
    id: "saiph",
    name: "Saiph",
    constellation: "Orion",
    magnitude: 2.06,
    distance: 720,
    spectralType: "B0.5Ia (Blue Supergiant)",
    ra: "05h 47m 45.4s",
    dec: "-09° 40′ 11″",
    color: "#80b3ff",
    x: 15,
    y: 32,
    description: "Serving as Orion's right knee, Saiph is a hot blue supergiant that has a similar distance and size to Rigel."
  },

  // Ursa Major (Big Dipper part)
  {
    id: "dubhe",
    name: "Dubhe",
    constellation: "Ursa Major",
    magnitude: 1.8,
    distance: 123,
    spectralType: "K0III (Orange Giant)",
    ra: "11h 03m 43.7s",
    dec: "+61° 45′ 03″",
    color: "#ffcc66",
    x: 60,
    y: -75,
    description: "The second-brightest star in Ursa Major. Together with Merak, it acts as one of the 'Pointer Stars' used to locate Polaris (the North Star)."
  },
  {
    id: "merak",
    name: "Merak",
    constellation: "Ursa Major",
    magnitude: 2.34,
    distance: 79,
    spectralType: "A1V (White Main Sequence)",
    ra: "11h 01m 50.5s",
    dec: "+56° 22′ 57″",
    color: "#ffffff",
    x: 58,
    y: -55,
    description: "An A-type main-sequence star. Merak lies at the outer corner of the Big Dipper's bowl."
  },
  {
    id: "phecda",
    name: "Phecda",
    constellation: "Ursa Major",
    magnitude: 2.41,
    distance: 83,
    spectralType: "A0V (White)",
    ra: "11h 53m 49.8s",
    dec: "+53° 41′ 41″",
    color: "#ffffff",
    x: 42,
    y: -54,
    description: "A white main-sequence star, forming the inner bottom corner of the Big Dipper's bowl."
  },
  {
    id: "megrez",
    name: "Megrez",
    constellation: "Ursa Major",
    magnitude: 3.32,
    distance: 81,
    spectralType: "A3V",
    ra: "12h 15m 25.6s",
    dec: "+57° 01′ 57″",
    color: "#ffffff",
    x: 44,
    y: -70,
    description: "The dimmest of the seven stars of the Big Dipper, connecting the bowl to the handle."
  },
  {
    id: "alioth",
    name: "Alioth",
    constellation: "Ursa Major",
    magnitude: 1.76,
    distance: 81,
    spectralType: "A1p (Magnetic Ap)",
    ra: "12h 54m 01.7s",
    dec: "+55° 57′ 35″",
    color: "#e6f2ff",
    x: 32,
    y: -72,
    description: "The brightest star in Ursa Major. It exhibits strong magnetic fluctuations and is the star in the handle closest to the bowl."
  },
  {
    id: "mizar",
    name: "Mizar",
    constellation: "Ursa Major",
    magnitude: 2.23,
    distance: 83,
    spectralType: "A2V",
    ra: "13h 23m 55.5s",
    dec: "+54° 55′ 31″",
    color: "#ffffff",
    x: 22,
    y: -75,
    description: "Famous binary star system, paired with Alcor. Testing one's eyesight by distinguishing Mizar and Alcor is an ancient visual test."
  },
  {
    id: "alkaid",
    name: "Alkaid",
    constellation: "Ursa Major",
    magnitude: 1.85,
    distance: 104,
    spectralType: "B3V (Blue Main Sequence)",
    ra: "13h 47m 32.4s",
    dec: "+49° 18′ 48″",
    color: "#99ccff",
    x: 10,
    y: -80,
    description: "Located at the tip of the Big Dipper's handle, Alkaid is a hot blue star and one of the most distant main-sequence stars visible."
  },

  // Cassiopeia (W shape)
  {
    id: "caph",
    name: "Caph",
    constellation: "Cassiopeia",
    magnitude: 2.28,
    distance: 54,
    spectralType: "F2III (Yellow-White Giant)",
    ra: "00h 09m 10.7s",
    dec: "+59° 08′ 59″",
    color: "#ffffcc",
    x: -80,
    y: -50,
    description: "A giant star undergoing stellar transition, caph sits at the western end of Cassiopeia's iconic 'W' shape."
  },
  {
    id: "schedar",
    name: "Schedar",
    constellation: "Cassiopeia",
    magnitude: 2.24,
    distance: 228,
    spectralType: "K0IIIa (Orange Giant)",
    ra: "00h 40m 30.4s",
    dec: "+56° 32′ 14″",
    color: "#ffcc66",
    x: -70,
    y: -42,
    description: "An orange giant star, slightly brighter than Caph, marking one of the central vertices of Cassiopeia."
  },
  {
    id: "cih",
    name: "Gamma Cassiopeiae (Cih)",
    constellation: "Cassiopeia",
    magnitude: 2.15,
    distance: 610,
    spectralType: "B0IV:e (Blue Shell Star)",
    ra: "00h 56m 42.5s",
    dec: "+60° 43′ 00″",
    color: "#66b2ff",
    x: -62,
    y: -52,
    description: "An eruptive variable star spinning so rapidly that it throws off rings of gas. The central peak of the W shape."
  },
  {
    id: "ruchbah",
    name: "Ruchbah",
    constellation: "Cassiopeia",
    magnitude: 2.68,
    distance: 99,
    spectralType: "A5V (White Giant)",
    ra: "01h 25m 48.6s",
    dec: "+60° 14′ 07″",
    color: "#ffffff",
    x: -52,
    y: -48,
    description: "An eclipsing binary system. The name Ruchbah translates to 'the knee' in Arabic."
  },
  {
    id: "segin",
    name: "Segin",
    constellation: "Cassiopeia",
    magnitude: 3.35,
    distance: 440,
    spectralType: "B9III (Blue-White Giant)",
    ra: "01h 54m 23.7s",
    dec: "+63° 40′ 12″",
    color: "#ccd9ff",
    x: -42,
    y: -58,
    description: "A bright blue-white giant star forming the easternmost point of Cassiopeia's W."
  },

  // Southern Cross (Crux)
  {
    id: "acrux",
    name: "Acrux",
    constellation: "Crux",
    magnitude: 0.77,
    distance: 320,
    spectralType: "B0.5IV + B1V (Multiple Blue)",
    ra: "12h 26m 35.9s",
    dec: "-63° 05′ 57″",
    color: "#3385ff",
    x: -50,
    y: 80,
    description: "The southernmost first-magnitude star, Acrux is a beautiful multiple star system and the brightest star of the Southern Cross."
  },
  {
    id: "mimosa",
    name: "Mimosa (Becrux)",
    constellation: "Crux",
    magnitude: 1.25,
    distance: 280,
    spectralType: "B0.5III (Beta Cephei Variable)",
    ra: "12h 47m 43.3s",
    dec: "-59° 41′ 19″",
    color: "#66a3ff",
    x: -65,
    y: 72,
    description: "The second-brightest star in the Southern Cross and one of the hottest visible stars. It is a Beta Cephei variable star."
  },
  {
    id: "gacrux",
    name: "Gacrux",
    constellation: "Crux",
    magnitude: 1.59,
    distance: 88,
    spectralType: "M3.5III (Red Giant)",
    ra: "12h 31m 10.0s",
    dec: "-57° 06′ 48″",
    color: "#ff8080",
    x: -51,
    y: 60,
    description: "The nearest red giant star to our solar system. Gacrux sits at the top peak of the Southern Cross."
  },
  {
    id: "imalay",
    name: "Imai (Delta Crucis)",
    constellation: "Crux",
    magnitude: 2.79,
    distance: 360,
    spectralType: "B2IV",
    ra: "12h 15m 08.7s",
    dec: "-58° 44′ 56″",
    color: "#99c2ff",
    x: -36,
    y: 71,
    description: "A subgiant star on the right arm of the Southern Cross, displaying high-frequency stellar vibrations."
  }
];

export const CONSTELLATIONS_DATA: Constellation[] = [
  {
    id: "orion",
    name: "Orion",
    description: "The Hunter. One of the most recognizable constellations in the night sky, named after a giant hunter in Greek mythology.",
    connections: [
      ["betelgeuse", "alnitak"],
      ["alnitak", "alnilam"],
      ["alnilam", "mintaka"],
      ["mintaka", "rigel"],
      ["rigel", "saiph"],
      ["saiph", "alnitak"],
      ["mintaka", "bellatrix"],
      ["bellatrix", "betelgeuse"]
    ]
  },
  {
    id: "ursa_major",
    name: "Ursa Major",
    description: "The Great Bear. It contains the Big Dipper asterism, one of the primary signposts of the northern sky.",
    connections: [
      ["dubhe", "merak"],
      ["merak", "phecda"],
      ["phecda", "megrez"],
      ["megrez", "dubhe"],
      ["megrez", "alioth"],
      ["alioth", "mizar"],
      ["mizar", "alkaid"]
    ]
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    description: "The Queen. Formed of 5 brilliant stars in a prominent zigzag 'W' shape in the high northern sky.",
    connections: [
      ["caph", "schedar"],
      ["schedar", "cih"],
      ["cih", "ruchbah"],
      ["ruchbah", "segin"]
    ]
  },
  {
    id: "crux",
    name: "Crux",
    description: "The Southern Cross. The smallest of all 88 constellations, yet historically vital for stellar navigation in the southern hemisphere.",
    connections: [
      ["gacrux", "acrux"],
      ["mimosa", "imalay"]
    ]
  }
];
