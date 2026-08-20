// Regional Map Datasets for Kibo World
// High-fidelity cartographic vectors with accurate coastal geometry, realistic surrounding landmasses, and zero network load.

export const REGIONAL_MAPS = {
  // === US STATES (TIER 2) ===
  'Alaska': {
    viewBox: '0 0 200 140',
    title: 'Alaska & Northwest North America',
    waterBodies: [
      { name: 'Arctic Ocean', x: 105, y: 12 },
      { name: 'Bering Sea', x: 26, y: 78 },
      { name: 'Gulf of Alaska', x: 110, y: 110 },
      { name: 'Bering Strait', x: 36, y: 38 }
    ],
    surroundingLand: [
      {
        name: 'Canada',
        // Yukon/BC coast following Alaska's eastern border south and east
        d: 'M128,18 L200,18 L200,140 L144,140 L144,112 L148,92 L136,78 L128,68 Z',
        labelPos: { x: 170, y: 70 }
      },
      {
        name: 'Russia',
        // Chukotka Peninsula — hooked shape pointing southeast across Bering Strait
        d: 'M0,0 L32,0 L34,8 L28,18 L22,28 L18,42 L16,56 L8,60 L0,56 Z',
        labelPos: { x: 16, y: 26 }
      }
    ],
    targetPath: 'M72,18 L128,22 L128,68 L136,78 L148,92 L144,112 L136,94 L126,78 L116,84 L104,78 L96,86 L92,80 L82,84 L68,96 L54,106 L38,114 L24,118 L12,122 L14,118 L26,114 L42,108 L56,98 L60,84 L48,72 L58,62 L46,52 L58,44 L48,38 L58,32 L62,22 Z M100,92 A4,3 0 1,0 108,92 A4,3 0 1,0 100,92',
    targetCenter: { x: 92, y: 54 },
    compass: true
  },

  'California': {
    viewBox: '0 0 200 140',
    title: 'California & West Coast',
    waterBodies: [
      { name: 'Pacific Ocean', x: 32, y: 75 }
    ],
    surroundingLand: [
      { name: 'Oregon', d: 'M0,0 L200,0 L200,18 L145,18 L108,18 L56,18 L0,18 Z', labelPos: { x: 30, y: 10 } },
      { name: 'Nevada', d: 'M108,18 L200,18 L200,96 L146,96 L98,48 Z', labelPos: { x: 162, y: 56 } },
      { name: 'Arizona', d: 'M146,96 L200,96 L200,140 L150,140 L150,124 Z', labelPos: { x: 178, y: 118 } },
      { name: 'Mexico', d: 'M114,124 L150,140 L0,140 L0,124 Z', labelPos: { x: 60, y: 133 } }
    ],
    targetPath: 'M56,18 L108,18 L98,48 L146,96 L150,124 L114,124 L104,114 L88,102 L74,76 L68,62 L50,36 Z M76,108 A2.5,2.5 0 1,0 81,108 A2.5,2.5 0 1,0 76,108 M84,114 A2,2 0 1,0 88,114 A2,2 0 1,0 84,114',
    targetCenter: { x: 92, y: 76 },
    compass: true
  },

  'Colorado': {
    viewBox: '0 0 200 140',
    title: 'Colorado & Rocky Mountain States',
    waterBodies: [],
    surroundingLand: [
      { name: 'Wyoming', d: 'M0,0 L200,0 L200,35 L145,35 L55,35 L0,35 Z', labelPos: { x: 100, y: 18 } },
      { name: 'Nebraska', d: 'M145,0 L200,0 L200,55 L145,55 Z', labelPos: { x: 172, y: 28 } },
      { name: 'Kansas', d: 'M145,55 L200,55 L200,105 L145,105 Z', labelPos: { x: 172, y: 80 } },
      { name: 'New Mexico', d: 'M0,105 L200,105 L200,140 L0,140 Z', labelPos: { x: 100, y: 124 } },
      { name: 'Utah', d: 'M0,35 L55,35 L55,105 L0,105 Z', labelPos: { x: 26, y: 70 } }
    ],
    targetPath: 'M55,35 L145,35 L145,105 L55,105 Z',
    targetCenter: { x: 100, y: 70 },
    compass: true
  },

  'Florida': {
    viewBox: '0 0 200 140',
    title: 'Florida & Southeast Region',
    waterBodies: [
      { name: 'Gulf of Mexico', x: 46, y: 88 },
      { name: 'Atlantic Ocean', x: 166, y: 52 },
      { name: 'Straits of Florida', x: 106, y: 134 }
    ],
    surroundingLand: [
      { name: 'Georgia', d: 'M0,0 L200,0 L200,36 L155,36 L124,36 L86,36 L54,38 L34,38 L0,38 Z', labelPos: { x: 115, y: 20 } },
      { name: 'Alabama', d: 'M0,0 L54,0 L54,38 L34,38 L34,48 L0,48 Z', labelPos: { x: 24, y: 22 } },
      { name: 'Cuba', d: 'M50,140 L200,136 L200,140 Z', labelPos: { x: 140, y: 138 } },
      { name: 'Bahamas', d: 'M164,76 L182,76 L184,92 L166,92 Z M168,96 L182,96 L180,108 L168,106 Z', labelPos: { x: 175, y: 86 } }
    ],
    targetPath: 'M34,38 L54,38 L86,36 L124,36 L138,64 L136,92 L132,110 L126,118 L114,122 L102,122 L94,120 L96,116 L108,118 L118,114 L112,102 L102,78 L92,58 L86,50 L72,46 L48,42 L34,48 Z',
    targetCenter: { x: 104, y: 68 },
    compass: true
  },

  'Hawaii': {
    viewBox: '0 0 200 140',
    title: 'Hawaii Archipelago',
    waterBodies: [
      { name: 'Pacific Ocean', x: 50, y: 26 },
      { name: 'Pacific Ocean', x: 150, y: 126 }
    ],
    surroundingLand: [],
    targetPath: 'M26,38 A6,5 0 1,0 38,38 A6,5 0 1,0 26,38 M18,44 A2.5,2 0 1,0 23,44 A2.5,2 0 1,0 18,44 M62,50 L76,46 L82,54 L72,60 L60,56 Z M94,60 L110,58 L108,64 L94,64 Z M96,68 L104,66 L102,74 L94,72 Z M112,66 L124,62 L132,70 L126,80 L116,76 Z M148,88 L168,82 L180,98 L174,122 L154,126 L142,108 Z',
    targetCenter: { x: 105, y: 70 },
    compass: true
  },

  'Michigan': {
    viewBox: '0 0 200 140',
    title: 'Michigan & Great Lakes Region',
    waterBodies: [
      { name: 'Lake Superior', x: 82, y: 16 },
      { name: 'Lake Michigan', x: 50, y: 84 },
      { name: 'Lake Huron', x: 164, y: 58 },
      { name: 'Lake Erie', x: 168, y: 116 }
    ],
    surroundingLand: [
      { name: 'Wisconsin', d: 'M0,24 L66,24 L66,44 L54,62 L54,114 L0,114 Z', labelPos: { x: 28, y: 78 } },
      { name: 'Indiana', d: 'M54,114 L96,114 L96,140 L54,140 Z', labelPos: { x: 75, y: 128 } },
      { name: 'Ohio', d: 'M96,114 L160,114 L160,140 L96,140 Z', labelPos: { x: 132, y: 128 } },
      { name: 'Canada', d: 'M80,0 L200,0 L200,96 L142,96 L134,48 L122,28 L80,8 Z', labelPos: { x: 172, y: 30 } }
    ],
    targetPath: 'M66,44 L74,24 L94,32 L122,28 L114,42 L80,48 Z M114,46 L136,68 L138,76 L132,108 L82,114 L82,92 L98,54 Z',
    targetCenter: { x: 104, y: 76 },
    compass: true
  },

  'New York': {
    viewBox: '0 0 200 140',
    title: 'New York & Northeast Region',
    waterBodies: [
      { name: 'Lake Ontario', x: 56, y: 44 },
      { name: 'Lake Erie', x: 20, y: 74 },
      { name: 'Atlantic Ocean', x: 168, y: 124 }
    ],
    surroundingLand: [
      { name: 'Canada', d: 'M0,0 L200,0 L200,18 L168,18 L134,18 L114,18 L78,32 L30,32 L0,32 Z', labelPos: { x: 92, y: 14 } },
      { name: 'VT', d: 'M134,18 L200,18 L200,56 L168,56 L136,56 Z', labelPos: { x: 168, y: 36 } },
      { name: 'MA', d: 'M136,56 L200,56 L200,82 L138,82 Z', labelPos: { x: 168, y: 70 } },
      { name: 'CT', d: 'M138,82 L200,82 L200,96 L136,96 Z', labelPos: { x: 170, y: 90 } },
      { name: 'Pennsylvania', d: 'M0,92 L118,92 L118,140 L0,140 Z', labelPos: { x: 58, y: 118 } },
      { name: 'NJ', d: 'M118,92 L130,108 L136,140 L118,140 Z', labelPos: { x: 128, y: 124 } }
    ],
    targetPath: 'M78,32 L114,18 L134,18 L136,56 L138,82 L136,96 L132,102 L148,104 L176,106 L152,112 L130,108 L118,92 L52,92 L42,82 L42,70 L72,54 Z',
    targetCenter: { x: 96, y: 60 },
    compass: true
  },

  'Texas': {
    viewBox: '0 0 200 140',
    title: 'Texas & South Central Region',
    waterBodies: [
      { name: 'Gulf of Mexico', x: 156, y: 118 }
    ],
    surroundingLand: [
      { name: 'New Mexico', d: 'M0,0 L58,0 L58,48 L24,48 L24,68 L0,68 Z', labelPos: { x: 28, y: 32 } },
      { name: 'Oklahoma', d: 'M58,0 L200,0 L200,38 L132,38 L88,38 L88,20 L58,20 Z', labelPos: { x: 130, y: 16 } },
      { name: 'Louisiana', d: 'M132,38 L200,38 L200,102 L138,92 L136,72 Z', labelPos: { x: 172, y: 65 } },
      { name: 'Mexico', d: 'M0,68 L24,68 L42,94 L54,102 L68,96 L84,122 L98,140 L0,140 Z', labelPos: { x: 36, y: 118 } }
    ],
    targetPath: 'M58,20 L88,20 L88,38 L132,38 L136,72 L138,92 L128,102 L118,114 L108,126 L98,136 L84,122 L68,96 L54,102 L42,94 L24,68 L24,48 L58,48 Z',
    targetCenter: { x: 92, y: 74 },
    compass: true
  },

  'Wyoming': {
    viewBox: '0 0 200 140',
    title: 'Wyoming & Mountain West',
    waterBodies: [],
    surroundingLand: [
      { name: 'Montana', d: 'M0,0 L200,0 L200,35 L145,35 L55,35 L0,35 Z', labelPos: { x: 100, y: 16 } },
      { name: 'South Dakota', d: 'M145,0 L200,0 L200,55 L145,55 Z', labelPos: { x: 172, y: 26 } },
      { name: 'Nebraska', d: 'M145,55 L200,55 L200,95 L145,95 Z', labelPos: { x: 172, y: 75 } },
      { name: 'Colorado', d: 'M0,95 L200,95 L200,140 L0,140 Z', labelPos: { x: 100, y: 120 } },
      { name: 'Utah', d: 'M0,35 L55,35 L55,95 L0,95 Z', labelPos: { x: 26, y: 65 } },
      { name: 'Idaho', d: 'M0,0 L55,0 L55,35 L0,35 Z', labelPos: { x: 26, y: 18 } }
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
      { name: 'Pacific Ocean', x: 36, y: 124 },
      { name: 'Gulf of California', x: 32, y: 64 },
      { name: 'Gulf of Mexico', x: 148, y: 48 },
      { name: 'Caribbean Sea', x: 184, y: 74 }
    ],
    surroundingLand: [
      {
        name: 'United States',
        // Pacific coast (CA/OR) angles NW on the left; Texas Gulf Coast bulges south on the right
        d: 'M0,18 L8,12 L18,6 L30,2 L200,0 L200,44 L190,48 L182,54 L174,54 L166,50 L158,46 L150,44 L140,42 L132,44 L112,34 L98,38 L80,26 L44,32 L24,32 L14,28 L6,22 Z',
        labelPos: { x: 80, y: 14 }
      },
      { name: 'Guatemala', d: 'M140,106 L148,102 L156,88 L168,88 L182,98 L185,120 L200,128 L200,140 L140,140 Z', labelPos: { x: 170, y: 120 } },
      { name: 'Belize', d: 'M170,84 L176,78 L178,88 L172,92 L168,88 L156,88 Z', labelPos: { x: 174, y: 86 } },
      { name: 'Cuba', d: 'M174,46 L200,46 L200,58 L176,52 Z', labelPos: { x: 190, y: 50 } }
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
      { name: 'Venezuela', d: 'M0,0 L90,0 L95,24 L78,22 L64,28 L56,22 L32,18 L0,18 Z', labelPos: { x: 40, y: 10 } },
      { name: 'Guyanas', d: 'M90,0 L200,0 L200,22 L128,10 L122,22 L108,22 L95,24 Z', labelPos: { x: 155, y: 10 } },
      { name: 'Colombia', d: 'M0,18 L32,18 L56,22 L64,28 L52,38 L45,52 L32,44 L0,44 Z', labelPos: { x: 20, y: 30 } },
      { name: 'Peru', d: 'M0,44 L32,44 L45,52 L36,62 L44,74 L30,78 L18,62 L0,62 Z', labelPos: { x: 16, y: 58 } },
      { name: 'Bolivia', d: 'M0,62 L18,62 L30,78 L44,74 L58,76 L68,92 L56,98 L38,94 L0,94 Z', labelPos: { x: 30, y: 82 } },
      { name: 'Paraguay', d: 'M56,98 L68,92 L78,98 L84,108 L70,112 L60,106 Z', labelPos: { x: 70, y: 103 } },
      { name: 'Argentina', d: 'M0,94 L38,94 L56,98 L70,112 L84,108 L92,114 L88,122 L82,140 L0,140 Z', labelPos: { x: 36, y: 124 } },
      { name: 'Uruguay', d: 'M88,122 L92,114 L96,128 L105,128 L100,140 L88,140 Z', labelPos: { x: 96, y: 133 } }
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
      { name: 'Peru', d: 'M0,0 L200,0 L200,6 L98,6 L90,14 L82,14 L62,12 L0,12 Z', labelPos: { x: 60, y: 6 } },
      { name: 'Bolivia', d: 'M98,6 L200,6 L200,42 L140,42 L95,42 L96,24 L90,14 Z', labelPos: { x: 155, y: 22 } },
      { name: 'Argentina', d: 'M95,42 L200,42 L200,140 L104,140 L98,118 L94,102 L92,80 L94,58 Z', labelPos: { x: 160, y: 90 } }
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
      { name: 'France', d: 'M60,120 L86,122 L102,126 L116,114 L138,112 L170,120 L200,124 L200,140 L0,140 Z', labelPos: { x: 155, y: 132 } },
      {
        name: 'Scandinavia',
        // Norwegian coast: rugged western face stepping in from the North Sea
        d: 'M155,0 L200,0 L200,96 L178,86 L172,72 L168,58 L164,44 L160,30 L156,16 L155,8 Z',
        labelPos: { x: 182, y: 36 }
      }
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
      { name: 'UK', d: 'M0,0 L200,0 L200,18 L115,18 L115,8 L80,18 L65,14 L0,14 Z', labelPos: { x: 80, y: 8 } },
      { name: 'Belgium', d: 'M105,22 L118,32 L138,22 L200,12 L200,22 L122,12 Z', labelPos: { x: 165, y: 16 } },
      { name: 'Germany', d: 'M118,32 L126,38 L132,48 L165,38 L160,16 L138,22 Z', labelPos: { x: 146, y: 32 } },
      { name: 'Switzerland', d: 'M132,48 L128,58 L134,66 L152,66 L156,52 L165,38 Z', labelPos: { x: 144, y: 58 } },
      { name: 'Italy', d: 'M134,66 L132,74 L138,84 L140,96 L200,96 L200,66 L152,66 Z', labelPos: { x: 175, y: 82 } },
      { name: 'Spain', d: 'M0,108 L76,108 L92,108 L108,110 L108,140 L0,140 Z', labelPos: { x: 50, y: 128 } }
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
      { name: 'France', d: 'M0,0 L64,0 L64,32 L68,46 L0,46 Z', labelPos: { x: 28, y: 22 } },
      { name: 'Switzerland', d: 'M64,0 L102,0 L102,22 L88,22 L74,24 L64,32 Z', labelPos: { x: 82, y: 10 } },
      { name: 'Austria', d: 'M102,0 L200,0 L200,10 L140,10 L132,28 L126,22 L114,20 L102,22 Z', labelPos: { x: 160, y: 6 } },
      { name: 'Balkans', d: 'M140,10 L200,10 L200,140 L175,140 L168,95 L148,62 L132,28 Z', labelPos: { x: 180, y: 70 } },
      { name: 'Corsica', d: 'M56,56 L64,56 L62,72 L54,72 Z', labelPos: { x: 59, y: 64 } },
      { name: 'Tunisia', d: 'M0,124 L78,124 L72,140 L0,140 Z', labelPos: { x: 38, y: 134 } }
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
      {
        name: 'Russia',
        // Siberian coastline: Kamchatka/Okhotsk coast angles in from east; Vladivostok narrows on west
        d: 'M0,0 L200,0 L200,26 L190,18 L176,10 L162,6 L148,6 L135,8 L130,24 L88,28 L74,42 L48,40 L15,30 L0,30 Z M144,4 L156,4 L152,12 L142,12 Z',
        labelPos: { x: 60, y: 16 }
      },
      {
        name: 'Korea',
        // Korean peninsula — narrows toward the south
        d: 'M0,52 L46,52 L52,74 L46,94 L32,96 L22,78 L0,78 Z',
        labelPos: { x: 24, y: 70 }
      },
      { name: 'China', d: 'M0,78 L26,98 L28,140 L0,140 Z', labelPos: { x: 12, y: 120 } }
    ],
    targetPath: 'M146,14 L172,18 L168,36 L146,38 L140,26 Z M140,40 L158,50 L154,68 L144,82 L132,90 L118,98 L98,104 L84,108 L96,96 L115,84 L132,64 L136,48 Z M96,102 L114,100 L110,112 L94,110 Z M72,104 L88,104 L84,124 L68,124 L66,112 Z M44,128 L50,130 L48,134 Z',
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
      { name: 'Pakistan', d: 'M0,0 L68,0 L68,16 L62,38 L52,48 L58,56 L48,62 L0,62 Z', labelPos: { x: 28, y: 30 } },
      { name: 'China', d: 'M68,0 L200,0 L200,10 L188,10 L165,26 L148,28 L132,28 L102,28 L92,22 L82,14 L68,16 Z', labelPos: { x: 140, y: 10 } },
      { name: 'Nepal', d: 'M102,28 L126,30 L132,28 L128,22 L104,22 Z', labelPos: { x: 116, y: 26 } },
      { name: 'Bhutan', d: 'M138,30 L148,28 L148,24 L138,24 Z', labelPos: { x: 143, y: 26 } },
      { name: 'Bangladesh', d: 'M138,36 L150,36 L152,54 L138,54 Z', labelPos: { x: 145, y: 45 } },
      { name: 'Myanmar', d: 'M158,48 L168,38 L200,38 L200,85 L165,75 Z', labelPos: { x: 183, y: 58 } },
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
      { name: 'Mediterranean Sea', x: 86, y: 16 },
      { name: 'Red Sea', x: 172, y: 92 },
      { name: 'Gulf of Suez', x: 114, y: 56 }
    ],
    surroundingLand: [
      {
        name: 'Libya',
        d: 'M0,0 L56,0 L56,36 L42,34 L24,36 L8,34 L0,34 Z M0,34 L8,34 L24,36 L42,34 L56,36 L56,118 L0,118 Z',
        labelPos: { x: 28, y: 76 }
      },
      {
        name: 'Sudan',
        d: 'M0,118 L200,118 L200,140 L0,140 Z',
        labelPos: { x: 100, y: 130 }
      },
      {
        name: 'Saudi Arabia',
        d: 'M144,40 C150,52 156,68 162,82 C168,96 174,112 180,130 L200,130 L200,0 L148,0 L132,0 L132,32 L144,40 Z',
        labelPos: { x: 180, y: 65 }
      },
      {
        name: 'Jordan',
        d: 'M132,0 L200,0 L200,18 L148,18 L132,18 Z M132,18 L148,18 L144,40 L132,32 Z',
        labelPos: { x: 160, y: 8 }
      }
    ],
    targetPath: 'M56,36 L70,38 L86,36 L94,30 L108,30 L118,34 L132,32 L140,42 L134,62 L124,48 L120,40 L124,48 L134,62 L144,76 L148,86 L154,98 L162,118 L56,118 Z',
    targetCenter: { x: 100, y: 76 },
    compass: true
  },

  'Madagascar': {
    viewBox: '0 0 200 140',
    title: 'Madagascar & East African Coast',
    waterBodies: [
      { name: 'Mozambique Channel', x: 62, y: 76 },
      { name: 'Indian Ocean', x: 162, y: 70 }
    ],
    surroundingLand: [
      {
        name: 'Mozambique',
        d: 'M0,0 L44,0 L44,10 L40,32 L46,56 L36,82 L42,110 L34,136 L0,140 Z',
        labelPos: { x: 22, y: 72 }
      },
      { name: 'Comoros', d: 'M72,28 L78,28 L76,32 Z M84,34 L88,34 L86,38 Z', labelPos: { x: 78, y: 40 } }
    ],
    targetPath: 'M118,16 L132,34 L130,54 L122,88 L102,126 L88,114 L90,84 L96,52 L108,28 Z',
    targetCenter: { x: 110, y: 70 },
    compass: true
  },

  'Australia': {
    viewBox: '0 0 200 140',
    title: 'Australia & Oceania',
    waterBodies: [
      { name: 'Indian Ocean', x: 26, y: 70 },
      { name: 'Coral Sea', x: 164, y: 36 },
      { name: 'Pacific Ocean', x: 178, y: 64 },
      { name: 'Tasman Sea', x: 160, y: 122 },
      { name: 'Southern Ocean', x: 86, y: 128 }
    ],
    surroundingLand: [
      {
        name: 'Indonesia',
        d: 'M0,0 L84,0 L84,12 L72,16 L56,14 L38,18 L20,14 L0,18 Z',
        labelPos: { x: 40, y: 8 }
      },
      {
        name: 'PNG',
        d: 'M84,0 L200,0 L200,20 L164,20 L148,14 L134,18 L112,14 L84,14 Z',
        labelPos: { x: 150, y: 8 }
      },
      { name: 'New Zealand', d: 'M176,94 L184,98 L180,108 L174,104 Z M168,112 L176,110 L172,126 L164,128 Z', labelPos: { x: 180, y: 100 } }
    ],
    targetPath: 'M136,24 L116,32 L102,26 L88,30 L74,38 L40,52 L32,70 L38,92 L46,104 L64,104 L80,98 L98,100 L108,104 L124,110 L144,104 L152,88 L148,50 Z M132,120 L144,120 L142,132 L132,130 Z',
    targetCenter: { x: 96, y: 70 },
    compass: true
  }
};

export const getRegionalMap = (name) => {
  if (!name) return null;
  return REGIONAL_MAPS[name] || null;
};

