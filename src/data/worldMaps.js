// Regional Map Datasets for Kibo World — react-simple-maps / TopoJSON edition
// Uses Natural Earth 110m data bundled locally at /public/geo/ for offline PWA support.
//
// Each entry drives WorldMapViewer:
//   geoType      : 'world' | 'us'
//   targetId     : ISO numeric string (world) | state FIPS string (US)
//   center       : [longitude, latitude]  — geoMercator projection center
//   scale        : number                 — projection zoom (larger = more zoomed in)
//   targetCenter : [longitude, latitude]  — beacon pin position (country/state centroid)
//   waterBodies  : [{ name, lon, lat }]   — italic ocean/sea labels
//   compass      : boolean

export const REGIONAL_MAPS = {

  // ── US STATES ────────────────────────────────────────────────────────────

  'Alaska': {
    geoType: 'us',
    targetId: '02',
    center: [-152.5, 64],
    scale: 200,
    targetCenter: [-152.5, 64],
    waterBodies: [
      { name: 'Arctic Ocean',    lon: -152, lat: 71.5 },
      { name: 'Bering Sea',      lon: -170, lat: 59 },
      { name: 'Gulf of Alaska',  lon: -145, lat: 57 }
    ],
    compass: true
  },

  'California': {
    geoType: 'us',
    targetId: '06',
    center: [-119.5, 37.2],
    scale: 720,
    targetCenter: [-119.5, 37],
    waterBodies: [
      { name: 'Pacific Ocean', lon: -125, lat: 36.5 }
    ],
    compass: true
  },

  'Colorado': {
    geoType: 'us',
    targetId: '08',
    center: [-105.55, 39],
    scale: 1650,
    targetCenter: [-105.55, 39],
    waterBodies: [],
    compass: true
  },

  'Florida': {
    geoType: 'us',
    targetId: '12',
    center: [-82.5, 28.5],
    scale: 1150,
    targetCenter: [-82, 28],
    waterBodies: [
      { name: 'Gulf of Mexico',  lon: -86.5, lat: 26.5 },
      { name: 'Atlantic Ocean',  lon: -77.5, lat: 28.5 }
    ],
    compass: true
  },

  'Hawaii': {
    geoType: 'us',
    targetId: '15',
    center: [-156.5, 20.3],
    scale: 2300,
    targetCenter: [-156.5, 20.5],
    waterBodies: [
      { name: 'Pacific Ocean', lon: -159, lat: 22 }
    ],
    compass: true
  },

  'Michigan': {
    geoType: 'us',
    targetId: '26',
    center: [-85.4, 44.3],
    scale: 900,
    targetCenter: [-85, 44.5],
    waterBodies: [
      { name: 'Lake Superior', lon: -87,   lat: 47.5 },
      { name: 'Lake Michigan', lon: -87.5, lat: 43.5 },
      { name: 'Lake Huron',    lon: -82.5, lat: 44.8 },
      { name: 'Lake Erie',     lon: -82.5, lat: 41.8 }
    ],
    compass: true
  },

  'New York': {
    geoType: 'us',
    targetId: '36',
    center: [-75.5, 43],
    scale: 1350,
    targetCenter: [-75.5, 43],
    waterBodies: [
      { name: 'Atlantic Ocean',  lon: -72,   lat: 40.5 },
      { name: 'Lake Ontario',    lon: -77.8, lat: 43.8 },
      { name: 'Lake Erie',       lon: -79.5, lat: 42.4 }
    ],
    compass: true
  },

  'Texas': {
    geoType: 'us',
    targetId: '48',
    center: [-99.3, 31.5],
    scale: 680,
    targetCenter: [-99.5, 31.5],
    waterBodies: [
      { name: 'Gulf of Mexico', lon: -94.5, lat: 27 }
    ],
    compass: true
  },

  'Wyoming': {
    geoType: 'us',
    targetId: '56',
    center: [-107.55, 43],
    scale: 1550,
    targetCenter: [-107.55, 43],
    waterBodies: [],
    compass: true
  },

  // ── COUNTRIES ────────────────────────────────────────────────────────────

  'Mexico': {
    geoType: 'world',
    targetId: '484',
    center: [-102.2, 23.9],
    scale: 430,
    targetCenter: [-102, 23.5],
    waterBodies: [
      { name: 'Pacific Ocean',       lon: -108, lat: 18 },
      { name: 'Gulf of California',  lon: -111, lat: 26 },
      { name: 'Gulf of Mexico',      lon: -92,  lat: 23 },
      { name: 'Caribbean Sea',       lon: -85,  lat: 19 }
    ],
    compass: true
  },

  'Brazil': {
    geoType: 'world',
    targetId: '076',
    center: [-53.2, -10.7],
    scale: 210,
    targetCenter: [-53, -11],
    waterBodies: [
      { name: 'Atlantic Ocean',  lon: -35, lat: -12 }
    ],
    compass: true
  },

  'Chile': {
    geoType: 'world',
    targetId: '152',
    center: [-71.2, -37.3],
    scale: 170,
    targetCenter: [-71, -36],
    waterBodies: [
      { name: 'Pacific Ocean',   lon: -78,  lat: -35 },
      { name: 'Atlantic Ocean',  lon: -62,  lat: -48 }
    ],
    compass: true
  },

  'United Kingdom': {
    geoType: 'world',
    targetId: '826',
    center: [-2.8, 53.8],
    scale: 570,
    targetCenter: [-2.5, 54],
    waterBodies: [
      { name: 'Atlantic Ocean',  lon: -9, lat: 56 },
      { name: 'North Sea',       lon: 3,  lat: 55 },
      { name: 'English Channel', lon: 0,  lat: 50 }
    ],
    compass: true
  },

  'France': {
    geoType: 'world',
    targetId: '250',
    center: [2.5, 46.5],
    scale: 600,
    targetCenter: [2.5, 46.8],
    waterBodies: [
      { name: 'Atlantic Ocean',    lon: -4.5, lat: 46.5 },
      { name: 'Mediterranean Sea', lon: 5.5,  lat: 42.5 },
      { name: 'English Channel',   lon: 0,    lat: 50.2 }
    ],
    compass: true
  },

  'Italy': {
    geoType: 'world',
    targetId: '380',
    center: [12.3, 42.7],
    scale: 600,
    targetCenter: [12.5, 42.5],
    waterBodies: [
      { name: 'Mediterranean Sea', lon: 11, lat: 38.5 },
      { name: 'Adriatic Sea',      lon: 15, lat: 42.8 },
      { name: 'Tyrrhenian Sea',    lon: 11, lat: 40.5 }
    ],
    compass: true
  },

  'Japan': {
    geoType: 'world',
    targetId: '392',
    center: [137.7, 37.5],
    scale: 460,
    targetCenter: [137.5, 37],
    waterBodies: [
      { name: 'Sea of Japan',    lon: 133, lat: 39 },
      { name: 'Pacific Ocean',   lon: 144, lat: 34 }
    ],
    compass: true
  },

  'India': {
    geoType: 'world',
    targetId: '356',
    center: [79.5, 22.8],
    scale: 280,
    targetCenter: [79.5, 22.5],
    waterBodies: [
      { name: 'Arabian Sea',   lon: 70,   lat: 17 },
      { name: 'Bay of Bengal', lon: 88,   lat: 16 },
      { name: 'Indian Ocean',  lon: 79.5, lat: 8 }
    ],
    compass: true
  },

  'Egypt': {
    geoType: 'world',
    targetId: '818',
    center: [29.9, 26.5],
    scale: 790,
    targetCenter: [30, 26.5],
    waterBodies: [
      { name: 'Mediterranean Sea', lon: 30, lat: 32.5 },
      { name: 'Red Sea',           lon: 35, lat: 25.5 }
    ],
    compass: true
  },

  'Madagascar': {
    geoType: 'world',
    targetId: '450',
    center: [46.7, -19.3],
    scale: 590,
    targetCenter: [47, -19],
    waterBodies: [
      { name: 'Indian Ocean',         lon: 52.5, lat: -19 },
      { name: 'Mozambique Channel',   lon: 41.5, lat: -19 }
    ],
    compass: true
  },

  'Australia': {
    geoType: 'world',
    targetId: '036',
    center: [134.3, -25.8],
    scale: 225,
    targetCenter: [134, -26],
    waterBodies: [
      { name: 'Indian Ocean',   lon: 116, lat: -32 },
      { name: 'Pacific Ocean',  lon: 153, lat: -32 },
      { name: 'Coral Sea',      lon: 150, lat: -17 },
      { name: 'Tasman Sea',     lon: 153, lat: -42 },
      { name: 'Timor Sea',      lon: 127, lat: -12 }
    ],
    compass: true
  }

};

// Helper used by WorldSessionView to look up a map by country/state name
export const getRegionalMap = (name) => REGIONAL_MAPS[name] || null;
