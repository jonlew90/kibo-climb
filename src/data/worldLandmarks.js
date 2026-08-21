// World Landmarks & Physical Wonders Vector Dataset for Kibo World
// 100% Free Public Domain Vectors with zero network load.

export const WORLD_LANDMARK_VISUALS = {
  'Eiffel Tower': {
    name: 'Eiffel Tower',
    country: 'France',
    city: 'Paris',
    category: 'Architecture',
    badge: '🏛️ Iconic Landmark',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="eiffelSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#bae6fd"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#eiffelSky)"/>
<rect y="68" width="100" height="12" fill="#86efac"/>
<!-- Eiffel Tower silhouette -->
<path d="M48,8 L52,8 L51,28 L55,42 L58,68 L53,68 L51,52 Q50,48 49,52 L47,68 L42,68 L45,42 L49,28 Z" fill="#475569" stroke="#1e293b" stroke-width="1"/>
<path d="M46,42 L54,42 M47,28 L53,28 M49.5,8 L49.5,4" stroke="#1e293b" stroke-width="1.2"/>
<circle cx="50" cy="4" r="1" fill="#f59e0b"/>`
  },

  'Colosseum': {
    name: 'Colosseum',
    country: 'Italy',
    city: 'Rome',
    category: 'Ancient Wonder',
    badge: '🏛️ Ancient Arena',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="romeSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#fef08a"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#romeSky)"/>
<rect y="64" width="100" height="16" fill="#fde047"/>
<!-- Colosseum silhouette -->
<path d="M15,64 L15,35 L22,35 L22,25 L45,25 L55,30 L85,38 L85,64 Z" fill="#d97706" stroke="#78350f" stroke-width="1.2"/>
<!-- Arches -->
<g fill="#78350f">
  <path d="M22,32 A3,3 0 0,1 28,32 L28,42 L22,42 Z"/>
  <path d="M32,32 A3,3 0 0,1 38,32 L38,42 L32,42 Z"/>
  <path d="M42,32 A3,3 0 0,1 48,32 L48,42 L42,42 Z"/>
  <path d="M22,48 A3.5,3.5 0 0,1 29,48 L29,60 L22,60 Z"/>
  <path d="M33,48 A3.5,3.5 0 0,1 40,48 L40,60 L33,60 Z"/>
  <path d="M44,48 A3.5,3.5 0 0,1 51,48 L51,60 L44,60 Z"/>
  <path d="M55,48 A3.5,3.5 0 0,1 62,48 L62,60 L55,60 Z"/>
  <path d="M66,48 A3.5,3.5 0 0,1 73,48 L73,60 L66,60 Z"/>
</g>`
  },

  'Taj Mahal': {
    name: 'Taj Mahal',
    country: 'India',
    city: 'Agra',
    category: 'Architecture',
    badge: '🕌 Marble Wonder',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="tajSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#bae6fd"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#tajSky)"/>
<rect y="62" width="100" height="18" fill="#38bdf8"/>
<!-- Minarets -->
<rect x="14" y="24" width="4" height="42" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
<polygon points="16,18 13,24 19,24" fill="#f8fafc"/>
<rect x="82" y="24" width="4" height="42" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
<polygon points="84,18 81,24 87,24" fill="#f8fafc"/>
<!-- Main Dome & Palace -->
<rect x="28" y="40" width="44" height="26" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
<path d="M40,40 Q40,16 50,14 Q60,16 60,40 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
<!-- Side domes -->
<path d="M32,40 Q32,28 37,28 Q42,28 42,40 Z" fill="#ffffff"/>
<path d="M58,40 Q58,28 63,28 Q68,28 68,40 Z" fill="#ffffff"/>
<!-- Central Arch -->
<path d="M43,66 L43,50 Q50,44 57,50 L57,66 Z" fill="#1e293b"/>`
  },

  'Pyramids of Giza': {
    name: 'Pyramids of Giza',
    country: 'Egypt',
    city: 'Cairo',
    category: 'Ancient Wonder',
    badge: '🏜️ Desert Monument',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="gizaSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fb923c"/><stop offset="100%" stop-color="#fde047"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#gizaSky)"/>
<circle cx="85" cy="22" r="10" fill="#fef08a" opacity="0.85"/>
<rect y="58" width="100" height="22" fill="#d97706"/>
<!-- Great Pyramid -->
<polygon points="45,18 10,65 52,65" fill="#f59e0b" stroke="#78350f" stroke-width="1"/>
<polygon points="45,18 52,65 78,65" fill="#b45309" stroke="#78350f" stroke-width="1"/>
<!-- Second Pyramid -->
<polygon points="72,28 50,65 76,65" fill="#f59e0b"/>
<polygon points="72,28 76,65 95,65" fill="#92400e"/>`
  },

  'Statue of Liberty': {
    name: 'Statue of Liberty',
    country: 'United States',
    city: 'New York',
    category: 'Sculpture',
    badge: '🗽 Freedom Beacon',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="libertySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#7dd3fc"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#libertySky)"/>
<rect y="64" width="100" height="16" fill="#0284c7"/>
<!-- Pedestal -->
<polygon points="38,68 62,68 58,52 42,52" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
<!-- Statue -->
<path d="M46,52 L45,30 L48,22 L52,22 L55,30 L54,52 Z" fill="#5eead4" stroke="#0f766e" stroke-width="1"/>
<!-- Crown rays -->
<polygon points="50,14 46,22 54,22" fill="#5eead4"/>
<line x1="44" y1="18" x2="48" y2="20" stroke="#0f766e" stroke-width="1"/>
<line x1="56" y1="18" x2="52" y2="20" stroke="#0f766e" stroke-width="1"/>
<!-- Raised Torch Arm -->
<path d="M54,32 L64,15 L66,16 L56,34 Z" fill="#5eead4"/>
<circle cx="65" cy="12" r="3" fill="#f59e0b"/>`
  },

  'Great Wall of China': {
    name: 'Great Wall of China',
    country: 'China',
    category: 'Ancient Wonder',
    badge: '🏯 Historic Fortress',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="wallSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#bae6fd"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#wallSky)"/>
<!-- Mountains -->
<polygon points="0,50 30,25 65,55" fill="#475569"/>
<polygon points="40,55 75,18 100,50" fill="#334155"/>
<!-- Winding Wall -->
<path d="M0,60 Q30,42 50,45 T100,32" stroke="#d97706" stroke-width="7" fill="none"/>
<path d="M0,58 Q30,40 50,43 T100,30" stroke="#78350f" stroke-width="1" stroke-dasharray="2,2" fill="none"/>
<!-- Watchtowers -->
<rect x="44" y="34" width="10" height="12" fill="#b45309" stroke="#78350f" stroke-width="1"/>
<rect x="88" y="24" width="10" height="10" fill="#b45309" stroke="#78350f" stroke-width="1"/>`
  },

  'Mount Everest': {
    name: 'Mount Everest',
    continent: 'Asia',
    mountainRange: 'Himalayas',
    category: 'Natural Wonder',
    badge: '🏔️ Earth\'s Highest Peak',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="everestSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#93c5fd"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#everestSky)"/>
<!-- Mountain Peak -->
<polygon points="50,12 10,75 90,75" fill="#334155"/>
<!-- Snow Cap -->
<polygon points="50,12 36,36 44,38 50,30 58,40 64,34" fill="#ffffff"/>
<!-- Ridge Shadow -->
<polygon points="50,12 50,75 90,75" fill="#1e293b" opacity="0.4"/>
<!-- Side Peaks -->
<polygon points="20,40 0,75 45,75" fill="#475569"/>
<polygon points="80,35 55,75 100,75" fill="#475569"/>
<polygon points="80,35 72,48 88,48" fill="#ffffff"/>`
  },

  'Christ the Redeemer': {
    name: 'Christ the Redeemer',
    country: 'Brazil',
    city: 'Rio de Janeiro',
    category: 'Monument',
    badge: '⛰️ Mountain Summit',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="rioSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#bae6fd"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#rioSky)"/>
<!-- Corcovado Mountain Peak -->
<path d="M20,80 Q50,35 50,35 Q50,35 80,80 Z" fill="#166534"/>
<!-- Statue Base -->
<rect x="47" y="32" width="6" height="4" fill="#64748b"/>
<!-- Statue of Christ -->
<rect x="48" y="16" width="4" height="16" fill="#f8fafc"/>
<circle cx="50" cy="14" r="2.2" fill="#f8fafc"/>
<!-- Open Arms -->
<rect x="36" y="18" width="28" height="3" rx="1.5" fill="#f8fafc"/>`
  },

  'Sydney Opera House': {
    name: 'Sydney Opera House',
    country: 'Australia',
    city: 'Sydney',
    category: 'Architecture',
    badge: '🎭 Harbor Icon',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="sydneySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#fef08a"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#sydneySky)"/>
<rect y="58" width="100" height="22" fill="#0284c7"/>
<!-- Podium -->
<rect x="15" y="52" width="70" height="8" fill="#cbd5e1" stroke="#64748b" stroke-width="1"/>
<!-- Shells -->
<path d="M25,52 Q35,22 48,52 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
<path d="M38,52 Q48,28 58,52 Z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>
<path d="M52,52 Q62,34 72,52 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
<path d="M64,52 Q72,38 80,52 Z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1"/>`
  },

  'Big Ben': {
    name: 'Big Ben',
    country: 'United Kingdom',
    city: 'London',
    category: 'Historic Clock Tower',
    badge: '🕰️ London Landmark',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="londonSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#64748b"/><stop offset="100%" stop-color="#cbd5e1"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#londonSky)"/>
<rect y="68" width="100" height="12" fill="#0369a1"/>
<!-- Parliament base -->
<rect x="10" y="52" width="80" height="16" fill="#78350f" stroke="#451a03" stroke-width="1"/>
<!-- Elizabeth Tower -->
<rect x="42" y="18" width="16" height="34" fill="#b45309" stroke="#451a03" stroke-width="1"/>
<!-- Spire -->
<polygon points="50,4 42,18 58,18" fill="#475569" stroke="#1e293b" stroke-width="1"/>
<!-- Clock Face -->
<circle cx="50" cy="26" r="5" fill="#fef08a" stroke="#451a03" stroke-width="1"/>
<line x1="50" y1="26" x2="50" y2="23" stroke="#000" stroke-width="0.8"/>
<line x1="50" y1="26" x2="52.5" y2="26" stroke="#000" stroke-width="0.8"/>`
  },

  'Chichen Itza': {
    name: 'Chichen Itza',
    country: 'Mexico',
    category: 'Ancient Wonder',
    badge: '🏛️ Mayan Pyramid',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="mayaSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#7dd3fc"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#mayaSky)"/>
<rect y="64" width="100" height="16" fill="#15803d"/>
<!-- El Castillo Stepped Pyramid -->
<polygon points="38,28 62,28 80,64 20,64" fill="#d97706" stroke="#78350f" stroke-width="1"/>
<!-- Temple on top -->
<rect x="44" y="20" width="12" height="8" fill="#b45309" stroke="#78350f" stroke-width="1"/>
<!-- Central Staircase -->
<polygon points="46,28 54,28 58,64 42,64" fill="#92400e"/>`
  },

  'Machu Picchu': {
    name: 'Machu Picchu',
    country: 'Peru',
    category: 'Ancient Citadel',
    badge: '🏔️ Incan Sanctuary',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="incaSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#bae6fd"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#incaSky)"/>
<!-- Huayna Picchu Peak -->
<polygon points="35,10 5,68 65,68" fill="#15803d"/>
<polygon points="70,22 45,72 95,72" fill="#166534"/>
<!-- Stone Terraces -->
<rect x="25" y="52" width="50" height="4" fill="#78350f"/>
<rect x="20" y="58" width="60" height="4" fill="#92400e"/>
<rect x="15" y="64" width="70" height="5" fill="#78350f"/>`
  },

  'Great Wall of China': {
    name: 'Great Wall of China',
    country: 'China',
    category: 'Ancient Wonder',
    badge: '🏯 Historic Fortress Wall',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="chinaSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#fef08a"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#chinaSky)"/>
<!-- Mountain Ridge -->
<polygon points="0,50 30,30 65,42 100,28 100,80 0,80" fill="#15803d"/>
<!-- Wall Structure winding across hills -->
<path d="M0,54 Q25,36 50,44 T100,32" stroke="#78350f" stroke-width="6" fill="none"/>
<path d="M0,53 Q25,35 50,43 T100,31" stroke="#d97706" stroke-width="4" fill="none"/>
<!-- Watchtower -->
<rect x="44" y="32" width="14" height="16" fill="#92400e" stroke="#451a03" stroke-width="1"/>
<polygon points="42,32 51,24 60,32" fill="#78350f"/>`
  },

  'Mount Fuji': {
    name: 'Mount Fuji',
    country: 'Japan',
    category: 'Volcanic Peak',
    badge: '🌋 Sacred Volcano',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="fujiSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#fde047"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#fujiSky)"/>
<circle cx="50" cy="35" r="22" fill="#ef4444" opacity="0.3"/>
<!-- Volcano cone -->
<polygon points="50,22 10,75 90,75" fill="#1e293b"/>
<!-- Snow cap -->
<polygon points="50,22 34,42 42,46 50,38 58,46 66,42" fill="#ffffff"/>
<rect y="70" width="100" height="10" fill="#065f46"/>`
  },

  'Parthenon': {
    name: 'Parthenon',
    country: 'Greece',
    city: 'Athens',
    category: 'Ancient Wonder',
    badge: '🏛️ Acropolis Temple',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="athensSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#bae6fd"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#athensSky)"/>
<rect y="64" width="100" height="16" fill="#a16207"/>
<!-- Pediment & Roof -->
<polygon points="50,22 15,34 85,34" fill="#fef08a" stroke="#78350f" stroke-width="1.2"/>
<!-- Entablature -->
<rect x="18" y="34" width="64" height="6" fill="#fde047" stroke="#78350f" stroke-width="1"/>
<!-- Columns -->
<g fill="#fef08a" stroke="#78350f" stroke-width="0.8">
  <rect x="20" y="40" width="5" height="24"/>
  <rect x="29" y="40" width="5" height="24"/>
  <rect x="38" y="40" width="5" height="24"/>
  <rect x="47" y="40" width="5" height="24"/>
  <rect x="56" y="40" width="5" height="24"/>
  <rect x="65" y="40" width="5" height="24"/>
  <rect x="74" y="40" width="5" height="24"/>
</g>`
  },

  'Burj Khalifa': {
    name: 'Burj Khalifa',
    country: 'United Arab Emirates',
    city: 'Dubai',
    category: 'Skyscraper',
    badge: '🏙️ Tallest Building on Earth',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="dubaiSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#dubaiSky)"/>
<rect y="72" width="100" height="8" fill="#d97706"/>
<!-- Burj Khalifa stepped spire -->
<polygon points="50,6 48,20 52,20" fill="#f8fafc"/>
<polygon points="50,18 46,36 54,36" fill="#cbd5e1"/>
<polygon points="50,34 44,52 56,52" fill="#94a3b8"/>
<polygon points="50,50 41,72 59,72" fill="#64748b"/>
<line x1="50" y1="2" x2="50" y2="72" stroke="#ffffff" stroke-width="0.8"/>`
  },

  'Golden Gate Bridge': {
    name: 'Golden Gate Bridge',
    country: 'United States',
    city: 'San Francisco',
    category: 'Bridge / Engineering',
    badge: '🌉 Pacific Strait Bridge',
    viewBox: '0 0 100 80',
    svg: `<defs>
  <linearGradient id="sfSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#fed7aa"/></linearGradient>
</defs>
<rect width="100" height="80" fill="url(#sfSky)"/>
<rect y="58" width="100" height="22" fill="#0369a1"/>
<!-- Suspension Cables -->
<path d="M0,28 Q28,52 50,52 Q72,52 100,28" stroke="#dc2626" stroke-width="1.8" fill="none"/>
<!-- Bridge Deck -->
<rect y="50" width="100" height="4" fill="#ef4444" stroke="#991b1b" stroke-width="0.6"/>
<!-- Towers -->
<rect x="25" y="16" width="6" height="42" fill="#dc2626"/>
<rect x="69" y="16" width="6" height="42" fill="#dc2626"/>`
  }
};

export const getLandmarkVisual = (landmarkName) => {
  if (!landmarkName) return null;
  return WORLD_LANDMARK_VISUALS[landmarkName] || null;
};
