// Regional Map Datasets for Kibo World
// Provides geographic contexts: surrounding bodies of water, neighboring landmasses, and target highlights.

export const REGIONAL_MAPS = {
  // === US STATES (TIER 2) ===
  'Alaska': {
    viewBox: '0 0 200 140',
    title: 'Alaska & Northwest North America',
    waterBodies: [
      { name: 'Arctic Ocean', x: 100, y: 14 },
      { name: 'Bering Sea', x: 24, y: 80 },
      { name: 'Pacific Ocean', x: 130, y: 132 },
      { name: 'Bering Strait', x: 30, y: 46 }
    ],
    surroundingLand: [
      { name: 'Canada', d: 'M135,10 L195,10 L195,135 L142,135 L142,112 L148,92 L135,80 L135,28 L135,10 Z', labelPos: { x: 170, y: 70 } },
      { name: 'Russia', d: 'M5,25 L22,25 L28,45 L15,60 L5,60 Z', labelPos: { x: 14, y: 38 } }
    ],
    targetPath: 'M38,48 L135,28 L135,80 L148,92 L142,112 L125,92 L95,95 L68,82 L38,76 L22,90 L18,88 L28,75 Z M20,95 L12,100 L4,102 L2,104',
    targetCenter: { x: 82, y: 62 },
    compass: true
  },

  'California': {
    viewBox: '0 0 200 140',
    title: 'California & West Coast',
    waterBodies: [
      { name: 'Pacific Ocean', x: 30, y: 75 }
    ],
    surroundingLand: [
      { name: 'Oregon', d: 'M60,10 L140,10 L140,30 L60,30 Z', labelPos: { x: 100, y: 22 } },
      { name: 'Nevada', d: 'M102,30 L175,30 L175,95 L138,95 L102,30 Z', labelPos: { x: 145, y: 60 } },
      { name: 'Arizona', d: 'M138,95 L190,95 L190,135 L145,135 L145,130 L138,95 Z', labelPos: { x: 168, y: 115 } },
      { name: 'Mexico', d: 'M115,130 L145,130 L145,138 L115,138 Z', labelPos: { x: 130, y: 136 } }
    ],
    targetPath: 'M60,30 L102,30 L138,95 L145,130 L115,130 L95,115 L70,80 L52,50 Z',
    targetCenter: { x: 92, y: 78 },
    compass: true
  },

  'Colorado': {
    viewBox: '0 0 200 140',
    title: 'Colorado & Rocky Mountain States',
    waterBodies: [],
    surroundingLand: [
      { name: 'Wyoming', d: 'M55,10 L145,10 L145,35 L55,35 Z', labelPos: { x: 100, y: 24 } },
      { name: 'Nebraska', d: 'M145,15 L195,15 L195,55 L145,55 L145,35 Z', labelPos: { x: 170, y: 35 } },
      { name: 'Kansas', d: 'M145,55 L195,55 L195,105 L145,105 Z', labelPos: { x: 170, y: 80 } },
      { name: 'New Mexico', d: 'M55,105 L145,105 L145,135 L55,135 Z', labelPos: { x: 100, y: 122 } },
      { name: 'Utah', d: 'M10,35 L55,35 L55,105 L10,105 Z', labelPos: { x: 32, y: 70 } }
    ],
    targetPath: 'M55,35 L145,35 L145,105 L55,105 Z',
    targetCenter: { x: 100, y: 70 },
    compass: true
  },

  'Florida': {
    viewBox: '0 0 200 140',
    title: 'Florida & Southeast Region',
    waterBodies: [
      { name: 'Gulf of Mexico', x: 42, y: 90 },
      { name: 'Atlantic Ocean', x: 156, y: 65 },
      { name: 'Straits of Florida', x: 110, y: 135 }
    ],
    surroundingLand: [
      { name: 'Georgia', d: 'M50,10 L150,10 L150,38 L120,40 L85,38 L50,38 Z', labelPos: { x: 115, y: 25 } },
      { name: 'Alabama', d: 'M10,10 L50,10 L50,38 L35,38 L35,48 L10,48 Z', labelPos: { x: 30, y: 28 } },
      { name: 'Cuba', d: 'M80,132 L150,130 L160,138 L90,138 Z', labelPos: { x: 125, y: 136 } },
      { name: 'Bahamas', d: 'M165,85 L180,85 L182,105 L168,105 Z', labelPos: { x: 176, y: 95 } }
    ],
    targetPath: 'M35,38 L85,38 L120,40 L132,65 L140,105 L128,122 L118,120 L115,95 L105,65 L70,48 L35,48 Z',
    targetCenter: { x: 105, y: 68 },
    compass: true
  },

  'Hawaii': {
    viewBox: '0 0 200 140',
    title: 'Hawaii Archipelago',
    waterBodies: [
      { name: 'Pacific Ocean', x: 45, y: 30 },
      { name: 'Pacific Ocean', x: 150, y: 120 }
    ],
    surroundingLand: [],
    targetPath: 'M32,40 A6,6 0 1,0 44,40 A6,6 0 1,0 32,40 M68,52 A7,7 0 1,0 82,52 A7,7 0 1,0 68,52 M98,62 A5,5 0 1,0 108,62 A5,5 0 1,0 98,62 M118,72 A8,8 0 1,0 134,72 A8,8 0 1,0 118,72 M145,95 A14,14 0 1,0 173,95 A14,14 0 1,0 145,95',
    targetCenter: { x: 105, y: 70 },
    compass: true
  },

  'Michigan': {
    viewBox: '0 0 200 140',
    title: 'Michigan & Great Lakes Region',
    waterBodies: [
      { name: 'Lake Superior', x: 80, y: 20 },
      { name: 'Lake Michigan', x: 48, y: 85 },
      { name: 'Lake Huron', x: 160, y: 65 },
      { name: 'Lake Erie', x: 165, y: 118 }
    ],
    surroundingLand: [
      { name: 'Wisconsin', d: 'M10,35 L45,35 L50,45 L45,65 L45,120 L10,120 Z', labelPos: { x: 26, y: 80 } },
      { name: 'Indiana', d: 'M50,118 L100,118 L100,135 L50,135 Z', labelPos: { x: 78, y: 128 } },
      { name: 'Ohio', d: 'M100,118 L160,118 L160,135 L100,135 Z', labelPos: { x: 132, y: 128 } },
      { name: 'Canada', d: 'M120,10 L195,10 L195,50 L165,50 L165,30 Z M135,70 L195,70 L195,115 L135,115 Z', labelPos: { x: 180, y: 30 } }
    ],
    targetPath: 'M45,35 L118,30 L115,48 L80,50 L50,45 Z M78,65 L115,62 L128,82 L120,118 L80,118 L75,90 Z',
    targetCenter: { x: 100, y: 75 },
    compass: true
  },

  'New York': {
    viewBox: '0 0 200 140',
    title: 'New York & Northeast Region',
    waterBodies: [
      { name: 'Lake Ontario', x: 40, y: 35 },
      { name: 'Lake Erie', x: 18, y: 70 },
      { name: 'Atlantic Ocean', x: 165, y: 125 }
    ],
    surroundingLand: [
      { name: 'Canada', d: 'M40,10 L150,10 L150,30 L90,30 Z', labelPos: { x: 100, y: 20 } },
      { name: 'VT', d: 'M148,32 L175,32 L175,65 L148,65 Z', labelPos: { x: 162, y: 48 } },
      { name: 'MA', d: 'M148,65 L185,65 L185,88 L148,88 Z', labelPos: { x: 166, y: 76 } },
      { name: 'CT', d: 'M148,88 L180,88 L180,105 L148,105 Z', labelPos: { x: 164, y: 96 } },
      { name: 'Pennsylvania', d: 'M25,82 L132,82 L132,135 L25,135 Z', labelPos: { x: 78, y: 110 } },
      { name: 'NJ', d: 'M132,105 L148,105 L148,135 L132,135 Z', labelPos: { x: 140, y: 120 } }
    ],
    targetPath: 'M35,62 L85,42 L132,32 L148,32 L148,105 L135,105 L132,82 L35,82 Z M136,108 L170,112 L170,118 L136,114 Z',
    targetCenter: { x: 95, y: 60 },
    compass: true
  },

  'Texas': {
    viewBox: '0 0 200 140',
    title: 'Texas & South Central Region',
    waterBodies: [
      { name: 'Gulf of Mexico', x: 155, y: 118 }
    ],
    surroundingLand: [
      { name: 'New Mexico', d: 'M10,25 L55,25 L55,75 L10,75 Z', labelPos: { x: 32, y: 50 } },
      { name: 'Oklahoma', d: 'M55,10 L135,10 L135,38 L95,38 L95,25 L55,25 Z', labelPos: { x: 105, y: 25 } },
      { name: 'Louisiana', d: 'M135,38 L185,38 L185,95 L148,95 Z', labelPos: { x: 160, y: 65 } },
      { name: 'Mexico', d: 'M10,80 L65,80 L95,115 L125,135 L10,135 Z', labelPos: { x: 45, y: 115 } }
    ],
    targetPath: 'M55,25 L95,25 L95,38 L135,38 L148,80 L140,110 L115,132 L95,115 L65,80 L45,80 L45,55 L55,55 Z',
    targetCenter: { x: 95, y: 75 },
    compass: true
  },

  'Wyoming': {
    viewBox: '0 0 200 140',
    title: 'Wyoming & Mountain West',
    waterBodies: [],
    surroundingLand: [
      { name: 'Montana', d: 'M55,10 L145,10 L145,35 L55,35 Z', labelPos: { x: 100, y: 22 } },
      { name: 'South Dakota', d: 'M145,15 L195,15 L195,55 L145,55 Z', labelPos: { x: 170, y: 35 } },
      { name: 'Nebraska', d: 'M145,55 L195,55 L195,95 L145,95 Z', labelPos: { x: 170, y: 75 } },
      { name: 'Colorado', d: 'M55,95 L145,95 L145,135 L55,135 Z', labelPos: { x: 100, y: 118 } },
      { name: 'Utah', d: 'M10,75 L55,75 L55,135 L10,135 Z', labelPos: { x: 32, y: 105 } },
      { name: 'Idaho', d: 'M10,15 L55,15 L55,75 L10,75 Z', labelPos: { x: 32, y: 45 } }
    ],
    targetPath: 'M55,35 L145,35 L145,95 L55,95 Z',
    targetCenter: { x: 100, y: 65 },
    compass: true
  },

  // === COUNTRIES (TIER 4 & TIER 5) ===
  'Mexico': {
    viewBox: '0 0 200 140',
    title: 'Mexico & Central America',
    waterBodies: [
      { name: 'Pacific Ocean', x: 38, y: 124 },
      { name: 'Gulf of California', x: 34, y: 64 },
      { name: 'Gulf of Mexico', x: 148, y: 48 },
      { name: 'Caribbean Sea', x: 184, y: 74 }
    ],
    surroundingLand: [
      { name: 'United States', d: 'M15,6 L185,6 L185,44 L132,44 L112,34 L98,38 L80,26 L44,32 L40,32 L24,32 L15,32 Z', labelPos: { x: 100, y: 18 } },
      { name: 'Guatemala', d: 'M140,106 L148,102 L156,88 L168,88 L182,98 L175,120 L140,106 Z', labelPos: { x: 160, y: 106 } },
      { name: 'Belize', d: 'M170,84 L176,78 L178,88 L172,92 L168,88 L156,88 L170,84 Z', labelPos: { x: 174, y: 86 } },
      { name: 'Cuba', d: 'M174,46 L194,52 L192,58 L176,52 Z', labelPos: { x: 185, y: 50 } }
    ],
    targetPath: 'M24,32 L40,32 L48,54 L54,76 L48,92 L42,98 L38,96 L42,78 L34,56 L22,38 Z M44,32 L80,26 L98,38 L112,34 L132,44 L126,60 L134,78 L146,84 L155,80 L158,64 L172,58 L178,64 L176,78 L170,84 L156,88 L148,102 L140,106 L124,98 L105,92 L86,78 L68,62 L56,44 Z',
    targetCenter: { x: 96, y: 62 },
    compass: true
  },

  'Brazil': {
    viewBox: '0 0 200 140',
    title: 'Brazil & South America',
    waterBodies: [
      { name: 'Atlantic Ocean', x: 166, y: 32 },
      { name: 'Atlantic Ocean', x: 162, y: 105 },
      { name: 'Pacific Ocean', x: 16, y: 92 }
    ],
    surroundingLand: [
      { name: 'Venezuela', d: 'M56,10 L90,10 L95,24 L78,22 L64,28 L56,22 Z', labelPos: { x: 74, y: 17 } },
      { name: 'Guyanas', d: 'M90,10 L128,10 L122,22 L108,22 L95,24 Z', labelPos: { x: 108, y: 16 } },
      { name: 'Colombia', d: 'M32,18 L56,10 L56,22 L64,28 L52,38 L45,52 L32,44 Z', labelPos: { x: 44, y: 30 } },
      { name: 'Peru', d: 'M15,42 L32,44 L45,52 L36,62 L44,74 L30,78 L18,62 Z', labelPos: { x: 26, y: 58 } },
      { name: 'Bolivia', d: 'M30,78 L44,74 L58,76 L68,92 L56,98 L38,94 Z', labelPos: { x: 48, y: 86 } },
      { name: 'Paraguay', d: 'M56,98 L68,92 L78,98 L84,108 L70,112 L60,106 Z', labelPos: { x: 70, y: 103 } },
      { name: 'Argentina', d: 'M38,94 L56,98 L70,112 L84,108 L92,114 L88,122 L82,136 L42,136 Z', labelPos: { x: 58, y: 124 } },
      { name: 'Uruguay', d: 'M88,122 L92,114 L96,128 L105,128 L100,136 L86,136 Z', labelPos: { x: 94, y: 130 } }
    ],
    targetPath: 'M122,22 L108,22 L95,24 L78,22 L64,28 L52,38 L45,52 L36,62 L44,74 L58,76 L68,92 L78,98 L84,108 L92,114 L88,122 L96,128 L105,128 L115,120 L126,106 L138,94 L148,82 L155,68 L162,54 L148,38 L136,28 Z',
    targetCenter: { x: 105, y: 68 },
    compass: true
  },

  'Chile': {
    viewBox: '0 0 200 140',
    title: 'Chile & Southwestern South America',
    waterBodies: [
      { name: 'Pacific Ocean', x: 38, y: 70 },
      { name: 'Atlantic Ocean', x: 165, y: 92 },
      { name: 'Drake Passage', x: 100, y: 138 }
    ],
    surroundingLand: [
      { name: 'Peru', d: 'M50,6 L98,6 L90,14 L82,14 L62,12 Z', labelPos: { x: 78, y: 10 } },
      { name: 'Bolivia', d: 'M98,6 L145,6 L140,42 L95,42 L96,24 L90,14 Z', labelPos: { x: 118, y: 24 } },
      { name: 'Argentina', d: 'M95,42 L140,42 L148,65 L142,95 L132,120 L104,132 L98,118 L94,102 L92,80 L94,58 Z M104,132 L118,130 L114,138 L102,138 Z', labelPos: { x: 122, y: 82 } }
    ],
    targetPath: 'M82,14 L90,14 L96,24 L95,42 L94,58 L92,80 L94,102 L98,118 L104,132 L96,136 L88,134 L82,124 L86,114 L80,100 L82,82 L80,60 L78,38 L76,22 Z M92,136 L98,138 L94,140 Z',
    targetCenter: { x: 88, y: 70 },
    compass: true
  },

  'United Kingdom': {
    viewBox: '0 0 200 140',
    title: 'United Kingdom & British Isles',
    waterBodies: [
      { name: 'Atlantic Ocean', x: 42, y: 28 },
      { name: 'North Sea', x: 158, y: 48 },
      { name: 'Irish Sea', x: 78, y: 68 },
      { name: 'English Channel', x: 108, y: 112 }
    ],
    surroundingLand: [
      { name: 'Ireland', d: 'M62,48 L60,56 L68,62 L78,58 L76,70 L72,80 L64,86 L52,88 L42,84 L40,72 L46,60 L54,48 Z', labelPos: { x: 54, y: 72 } },
      { name: 'France', d: 'M70,128 L86,122 L102,126 L116,114 L138,112 L165,120 L195,124 L195,138 L70,138 Z', labelPos: { x: 155, y: 130 } },
      { name: 'Europe', d: 'M165,96 L195,96 L195,120 L165,112 Z', labelPos: { x: 182, y: 106 } }
    ],
    targetPath: 'M102,14 L94,16 L88,28 L98,26 L108,24 L114,30 L104,38 L112,48 L118,62 L132,70 L136,82 L126,92 L132,98 L120,102 L108,100 L96,104 L82,108 L84,102 L94,98 L98,92 L86,88 L82,78 L86,70 L94,68 L96,56 L90,44 L92,32 Z M62,48 L76,46 L78,58 L68,62 L60,56 Z M106,8 L112,8 L110,12 Z M82,20 L86,18 L84,26 Z',
    targetCenter: { x: 108, y: 65 },
    compass: true
  },

  'France': {
    viewBox: '0 0 200 140',
    title: 'France & Western Europe',
    waterBodies: [
      { name: 'English Channel', x: 62, y: 26 },
      { name: 'Bay of Biscay', x: 42, y: 84 },
      { name: 'Mediterranean Sea', x: 136, y: 122 }
    ],
    surroundingLand: [
      { name: 'UK', d: 'M65,8 L120,8 L115,18 L80,18 L65,14 Z', labelPos: { x: 92, y: 13 } },
      { name: 'Belgium', d: 'M105,22 L118,32 L138,22 L122,12 Z', labelPos: { x: 122, y: 22 } },
      { name: 'Germany', d: 'M118,32 L126,38 L132,48 L165,38 L160,16 L138,22 Z', labelPos: { x: 146, y: 32 } },
      { name: 'Switzerland', d: 'M132,48 L128,58 L134,66 L152,66 L156,52 L165,38 Z', labelPos: { x: 144, y: 58 } },
      { name: 'Italy', d: 'M134,66 L132,74 L138,84 L140,96 L175,96 L180,72 L152,66 Z', labelPos: { x: 160, y: 84 } },
      { name: 'Spain', d: 'M40,108 L76,108 L92,108 L108,110 L108,138 L40,138 Z', labelPos: { x: 74, y: 124 } }
    ],
    targetPath: 'M105,22 L94,28 L82,34 L84,42 L54,44 L46,50 L52,58 L66,58 L74,70 L78,92 L76,108 L92,108 L108,110 L122,104 L134,102 L140,96 L138,84 L132,74 L134,66 L128,58 L132,48 L126,38 L118,32 Z M154,104 L160,102 L162,116 L156,118 Z',
    targetCenter: { x: 98, y: 68 },
    compass: true
  },

  'Italy': {
    viewBox: '0 0 200 140',
    title: 'Italy & Mediterranean Basin',
    waterBodies: [
      { name: 'Adriatic Sea', x: 148, y: 48 },
      { name: 'Tyrrhenian Sea', x: 92, y: 92 },
      { name: 'Ionian Sea', x: 160, y: 122 },
      { name: 'Mediterranean Sea', x: 38, y: 110 }
    ],
    surroundingLand: [
      { name: 'France', d: 'M22,22 L64,32 L68,46 L22,46 Z', labelPos: { x: 42, y: 34 } },
      { name: 'Switzerland', d: 'M64,32 L74,24 L88,22 L102,22 L102,10 L64,10 Z', labelPos: { x: 82, y: 16 } },
      { name: 'Austria', d: 'M102,10 L140,10 L132,28 L126,22 L114,20 L102,22 Z', labelPos: { x: 120, y: 16 } },
      { name: 'Balkans', d: 'M140,10 L188,10 L188,120 L175,120 L168,95 L148,62 L132,28 Z', labelPos: { x: 166, y: 52 } },
      { name: 'Corsica', d: 'M56,56 L64,56 L62,72 L54,72 Z', labelPos: { x: 59, y: 64 } },
      { name: 'Tunisia', d: 'M24,124 L78,124 L72,138 L24,138 Z', labelPos: { x: 50, y: 131 } }
    ],
    targetPath: 'M68,46 L64,32 L74,24 L88,22 L102,22 L114,20 L126,22 L132,28 L128,34 L122,42 L134,60 L148,76 L156,78 L152,84 L166,92 L168,104 L158,106 L148,98 L142,104 L144,114 L136,122 L132,116 L134,106 L126,98 L118,86 L104,72 L92,58 L78,48 Z M112,120 L130,118 L132,128 L118,132 L108,126 Z M56,78 L66,78 L64,102 L54,102 Z',
    targetCenter: { x: 118, y: 72 },
    compass: true
  },

  'Japan': {
    viewBox: '0 0 200 140',
    title: 'Japan & East Asia',
    waterBodies: [
      { name: 'Sea of Japan', x: 88, y: 58 },
      { name: 'Pacific Ocean', x: 168, y: 88 },
      { name: 'Sea of Okhotsk', x: 172, y: 12 },
      { name: 'East China Sea', x: 44, y: 114 }
    ],
    surroundingLand: [
      { name: 'Russia', d: 'M15,8 L135,8 L130,24 L88,28 L74,42 L48,40 L15,30 Z M144,4 L156,4 L152,12 L142,12 Z', labelPos: { x: 62, y: 22 } },
      { name: 'Korea', d: 'M18,52 L46,52 L52,74 L46,94 L32,96 L22,78 Z', labelPos: { x: 34, y: 72 } },
      { name: 'China', d: 'M8,98 L26,98 L28,136 L8,136 Z', labelPos: { x: 18, y: 118 } }
    ],
    targetPath: 'M152,14 L172,20 L168,36 L148,38 L142,26 Z M142,40 L156,52 L152,68 L142,82 L132,90 L118,98 L98,104 L84,108 L96,96 L115,84 L132,64 L138,48 Z M96,102 L112,100 L108,112 L94,110 Z M74,104 L88,104 L84,122 L70,122 L68,112 Z M45,128 L52,130 L48,134 Z',
    targetCenter: { x: 125, y: 74 },
    compass: true
  },

  'India': {
    viewBox: '0 0 200 140',
    title: 'India & South Asia',
    waterBodies: [
      { name: 'Arabian Sea', x: 38, y: 92 },
      { name: 'Bay of Bengal', x: 162, y: 92 },
      { name: 'Indian Ocean', x: 96, y: 136 }
    ],
    surroundingLand: [
      { name: 'Pakistan', d: 'M15,14 L68,16 L62,38 L52,48 L58,56 L48,62 L15,62 Z', labelPos: { x: 36, y: 35 } },
      { name: 'China', d: 'M68,14 L82,14 L92,22 L102,28 L132,28 L148,28 L165,26 L188,10 L82,10 Z', labelPos: { x: 125, y: 16 } },
      { name: 'Nepal', d: 'M102,28 L126,30 L132,28 L128,22 L104,22 Z', labelPos: { x: 116, y: 26 } },
      { name: 'Bhutan', d: 'M138,30 L148,28 L148,24 L138,24 Z', labelPos: { x: 143, y: 26 } },
      { name: 'Bangladesh', d: 'M138,36 L150,36 L152,54 L138,54 Z', labelPos: { x: 145, y: 45 } },
      { name: 'Myanmar', d: 'M158,48 L168,38 L188,38 L188,85 L165,75 Z', labelPos: { x: 176, y: 58 } },
      { name: 'Sri Lanka', d: 'M106,122 L115,122 L114,134 L105,132 Z', labelPos: { x: 122, y: 128 } }
    ],
    targetPath: 'M68,16 L82,14 L92,22 L102,28 L126,30 L132,28 L138,30 L148,28 L165,26 L168,38 L158,48 L148,46 L142,42 L138,54 L132,68 L122,88 L108,112 L96,126 L88,114 L78,94 L70,74 L54,72 L48,62 L58,56 L52,48 L62,38 Z',
    targetCenter: { x: 96, y: 68 },
    compass: true
  },

  'Egypt': {
    viewBox: '0 0 200 140',
    title: 'Egypt & North Africa / Middle East',
    waterBodies: [
      { name: 'Mediterranean Sea', x: 88, y: 16 },
      { name: 'Red Sea', x: 172, y: 92 }
    ],
    surroundingLand: [
      { name: 'Libya', d: 'M10,30 L56,30 L56,120 L10,120 Z', labelPos: { x: 33, y: 75 } },
      { name: 'Sudan', d: 'M56,120 L156,120 L175,120 L175,138 L56,138 Z', labelPos: { x: 106, y: 130 } },
      { name: 'Saudi Arabia', d: 'M152,28 L192,28 L192,110 L170,110 L160,76 L150,48 Z', labelPos: { x: 175, y: 65 } },
      { name: 'Jordan', d: 'M138,24 L152,24 L152,40 L142,44 Z', labelPos: { x: 147, y: 20 } }
    ],
    targetPath: 'M56,30 L88,32 L98,24 L112,24 L122,30 L138,24 L142,44 L138,56 L130,48 L124,38 L132,60 L144,82 L152,104 L156,120 L56,120 Z',
    targetCenter: { x: 98, y: 75 },
    compass: true
  },

  'Madagascar': {
    viewBox: '0 0 200 140',
    title: 'Madagascar & East African Coast',
    waterBodies: [
      { name: 'Mozambique Channel', x: 65, y: 76 },
      { name: 'Indian Ocean', x: 156, y: 70 }
    ],
    surroundingLand: [
      { name: 'Mozambique', d: 'M10,10 L46,10 L42,28 L48,50 L38,76 L44,104 L36,134 L10,134 Z', labelPos: { x: 26, y: 72 } },
      { name: 'Comoros', d: 'M72,26 L78,26 L76,30 Z M84,32 L88,32 L86,36 Z', labelPos: { x: 78, y: 38 } }
    ],
    targetPath: 'M114,18 L124,28 L132,38 L126,44 L122,64 L114,92 L104,116 L94,124 L86,122 L88,102 L92,80 L98,54 L106,34 Z',
    targetCenter: { x: 108, y: 70 },
    compass: true
  },

  'Australia': {
    viewBox: '0 0 200 140',
    title: 'Australia & Oceania',
    waterBodies: [
      { name: 'Indian Ocean', x: 28, y: 70 },
      { name: 'Coral Sea', x: 164, y: 38 },
      { name: 'Pacific Ocean', x: 176, y: 64 },
      { name: 'Tasman Sea', x: 158, y: 122 },
      { name: 'Southern Ocean', x: 88, y: 128 }
    ],
    surroundingLand: [
      { name: 'Indonesia', d: 'M32,12 L86,12 L82,20 L32,20 Z', labelPos: { x: 58, y: 16 } },
      { name: 'PNG', d: 'M115,8 L162,8 L160,20 L138,20 L134,14 L115,14 Z', labelPos: { x: 140, y: 14 } },
      { name: 'New Zealand', d: 'M176,94 L184,98 L180,108 L174,104 Z M168,112 L176,110 L172,126 L164,128 Z', labelPos: { x: 176, y: 88 } }
    ],
    targetPath: 'M136,26 L126,38 L114,34 L104,28 L92,30 L78,38 L62,44 L42,54 L34,70 L40,90 L48,104 L62,104 L78,98 L96,98 L110,104 L114,102 L122,108 L134,112 L144,108 L152,94 L154,74 L148,54 L138,38 Z M134,120 L144,120 L142,132 L132,130 Z',
    targetCenter: { x: 96, y: 70 },
    compass: true
  }
};

export const getRegionalMap = (name) => {
  if (!name) return null;
  return REGIONAL_MAPS[name] || null;
};
