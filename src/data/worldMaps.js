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
    center: [-153, 64],
    scale: 430,
    targetCenter: [-153, 64],
    waterBodies: [
      { name: 'Arctic Ocean',    lon: -158, lat: 72 },
      { name: 'Bering Sea',      lon: -174, lat: 58 },
      { name: 'Gulf of Alaska',  lon: -145, lat: 57 },
      { name: 'Bering Strait',   lon: -168, lat: 65.5 }
    ],
    compass: true
  },

  'California': {
    geoType: 'us',
    targetId: '06',
    center: [-119.5, 37.3],
    scale: 2200,
    targetCenter: [-119.5, 37.3],
    waterBodies: [
      { name: 'Pacific Ocean', lon: -124, lat: 37 }
    ],
    compass: true
  },

  'Colorado': {
    geoType: 'us',
    targetId: '08',
    center: [-105.5, 39],
    scale: 3200,
    targetCenter: [-105.5, 39],
    waterBodies: [],
    compass: true
  },

  'Florida': {
    geoType: 'us',
    targetId: '12',
    center: [-81.5, 28],
    scale: 3200,
    targetCenter: [-81.5, 28],
    waterBodies: [
      { name: 'Gulf of Mexico',  lon: -87, lat: 27 },
      { name: 'Atlantic Ocean',  lon: -76, lat: 28 }
    ],
    compass: true
  },

  'Hawaii': {
    geoType: 'us',
    targetId: '15',
    center: [-156.5, 20.5],
    scale: 3800,
    targetCenter: [-156.5, 20.5],
    waterBodies: [
      { name: 'Pacific Ocean', lon: -165, lat: 24 }
    ],
    compass: true
  },

  'Michigan': {
    geoType: 'us',
    targetId: '26',
    center: [-84.5, 44.5],
    scale: 3200,
    targetCenter: [-84.5, 44.5],
    waterBodies: [
      { name: 'Lake Superior', lon: -87, lat: 47 },
      { name: 'Lake Michigan', lon: -87, lat: 43 },
      { name: 'Lake Huron',    lon: -82, lat: 44 },
      { name: 'Lake Erie',     lon: -82, lat: 42 }
    ],
    compass: true
  },

  'New York': {
    geoType: 'us',
    targetId: '36',
    center: [-75.5, 42.9],
    scale: 3800,
    targetCenter: [-75.5, 42.9],
    waterBodies: [
      { name: 'Atlantic Ocean',  lon: -70, lat: 40 },
      { name: 'Lake Ontario',    lon: -77.5, lat: 43.7 },
      { name: 'Lake Erie',       lon: -80, lat: 42.5 }
    ],
    compass: true
  },

  'Texas': {
    geoType: 'us',
    targetId: '48',
    center: [-99.5, 31.5],
    scale: 2100,
    targetCenter: [-99.5, 31.5],
    waterBodies: [
      { name: 'Gulf of Mexico', lon: -95, lat: 27 }
    ],
    compass: true
  },

  'Wyoming': {
    geoType: 'us',
    targetId: '56',
    center: [-107.5, 43],
    scale: 3800,
    targetCenter: [-107.5, 43],
    waterBodies: [],
    compass: true
  },

  // ── COUNTRIES ────────────────────────────────────────────────────────────

  'Mexico': {
    geoType: 'world',
    targetId: '484',
    center: [-102, 24],
    scale: 1000,
    targetCenter: [-102, 24],
    waterBodies: [
      { name: 'Pacific Ocean',       lon: -112, lat: 18 },
      { name: 'Gulf of California',  lon: -110, lat: 27 },
      { name: 'Gulf of Mexico',      lon: -92,  lat: 22 },
      { name: 'Caribbean Sea',       lon: -84,  lat: 18 }
    ],
    compass: true
  },

  'Brazil': {
    geoType: 'world',
    targetId: '076',
    center: [-53, -11],
    scale: 650,
    targetCenter: [-53, -11],
    waterBodies: [
      { name: 'Atlantic Ocean',  lon: -35, lat: -15 },
      { name: 'Amazon Basin',    lon: -58, lat: -3 }
    ],
    compass: true
  },

  'Chile': {
    geoType: 'world',
    targetId: '152',
    center: [-71, -35],
    scale: 750,
    targetCenter: [-71, -35],
    waterBodies: [
      { name: 'Pacific Ocean',   lon: -82,  lat: -30 },
      { name: 'Atlantic Ocean',  lon: -58,  lat: -48 }
    ],
    compass: true
  },

  'United Kingdom': {
    geoType: 'world',
    targetId: '826',
    center: [-2, 54],
    scale: 2800,
    targetCenter: [-2, 54],
    waterBodies: [
      { name: 'Atlantic Ocean',  lon: -12, lat: 55 },
      { name: 'North Sea',       lon: 4,   lat: 56 },
      { name: 'Irish Sea',       lon: -5,  lat: 53 },
      { name: 'English Channel', lon: 0,   lat: 50 }
    ],
    compass: true
  },

  'France': {
    geoType: 'world',
    targetId: '250',
    center: [2.5, 46.5],
    scale: 2800,
    targetCenter: [2.5, 46.5],
    waterBodies: [
      { name: 'Atlantic Ocean',    lon: -5, lat: 46 },
      { name: 'Mediterranean Sea', lon: 6,  lat: 43 },
      { name: 'English Channel',   lon: 0,  lat: 50 }
    ],
    compass: true
  },

  'Italy': {
    geoType: 'world',
    targetId: '380',
    center: [12.5, 42.5],
    scale: 2500,
    targetCenter: [12.5, 42.5],
    waterBodies: [
      { name: 'Mediterranean Sea', lon: 10,  lat: 38 },
      { name: 'Adriatic Sea',      lon: 15,  lat: 43 },
      { name: 'Tyrrhenian Sea',    lon: 10,  lat: 40 }
    ],
    compass: true
  },

  'Japan': {
    geoType: 'world',
    targetId: '392',
    center: [137, 37],
    scale: 2200,
    targetCenter: [137, 37],
    waterBodies: [
      { name: 'Sea of Japan',    lon: 130, lat: 40 },
      { name: 'Pacific Ocean',   lon: 146, lat: 36 },
      { name: 'Sea of Okhotsk',  lon: 148, lat: 48 }
    ],
    compass: true
  },

  'India': {
    geoType: 'world',
    targetId: '356',
    center: [79, 22],
    scale: 1200,
    targetCenter: [79, 22],
    waterBodies: [
      { name: 'Arabian Sea',   lon: 67, lat: 18 },
      { name: 'Bay of Bengal', lon: 90, lat: 15 },
      { name: 'Indian Ocean',  lon: 79, lat: 7 }
    ],
    compass: true
  },

  'Egypt': {
    geoType: 'world',
    targetId: '818',
    center: [30, 26],
    scale: 2200,
    targetCenter: [30, 26],
    waterBodies: [
      { name: 'Mediterranean Sea', lon: 28, lat: 33 },
      { name: 'Red Sea',           lon: 36, lat: 25 },
      { name: 'Nile River',        lon: 32, lat: 22 }
    ],
    compass: true
  },

  'Madagascar': {
    geoType: 'world',
    targetId: '450',
    center: [46.5, -19.5],
    scale: 1400,
    targetCenter: [46.5, -19.5],
    waterBodies: [
      { name: 'Indian Ocean',         lon: 54, lat: -20 },
      { name: 'Mozambique Channel',   lon: 42, lat: -20 }
    ],
    compass: true
  },

  'Australia': {
    geoType: 'world',
    targetId: '036',
    center: [134, -27],
    scale: 550,
    targetCenter: [134, -27],
    waterBodies: [
      { name: 'Indian Ocean',   lon: 116, lat: -35 },
      { name: 'Pacific Ocean',  lon: 157, lat: -35 },
      { name: 'Coral Sea',      lon: 153, lat: -18 },
      { name: 'Tasman Sea',     lon: 156, lat: -40 },
      { name: 'Timor Sea',      lon: 128, lat: -12 }
    ],
    compass: true
  }

};

// Helper used by WorldSessionView to look up a map by country/state name
export const getRegionalMap = (name) => REGIONAL_MAPS[name] || null;
