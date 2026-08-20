import React, { memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation
} from 'react-simple-maps';

const WORLD_GEO = '/geo/world-110m.json';
const US_GEO   = '/geo/us-states.json';

/**
 * WorldMapViewer — accurate cartographic map renderer for Kibo World.
 *
 * mapData shape (new format):
 *   geoType      : 'world' | 'us'
 *   targetId     : ISO numeric string (world) | FIPS string (US states)
 *   center       : [longitude, latitude]   — projection center
 *   scale        : number                  — projection scale / zoom
 *   targetCenter : [longitude, latitude]   — beacon pin position
 *   waterBodies  : [{ name, lon, lat }]
 *   compass      : boolean
 */
export default memo(function WorldMapViewer({ mapData, shapeSvg, className = '' }) {

  /* ── Fallback: standalone shapeSvg (no regional context) ── */
  if (!mapData) {
    return (
      <div className={`w-full max-w-[320px] sm:max-w-[360px] mx-auto rounded-2xl overflow-hidden border-2 border-sky-300 shadow-md bg-gradient-to-b from-sky-100 via-sky-200 to-sky-100 relative ${className}`}>
        <svg viewBox="0 0 200 140" className="w-full h-full block select-none">
          <rect width="100%" height="100%" fill="#bae6fd" />
          <line x1="0" y1="70" x2="200" y2="70" stroke="rgba(255,255,255,0.4)" strokeDasharray="3,3" strokeWidth="0.75" />
          <line x1="100" y1="0" x2="100" y2="140" stroke="rgba(255,255,255,0.4)" strokeDasharray="3,3" strokeWidth="0.75" />
          {shapeSvg && (
            <path d={shapeSvg} fill="#10b981" stroke="#064e3b" strokeWidth="2.2" strokeLinejoin="round" />
          )}
        </svg>
      </div>
    );
  }

  const {
    geoType = 'world',
    targetId,
    center  = [0, 20],
    scale   = 150,
    targetCenter,
    waterBodies = [],
    compass = true
  } = mapData;

  const geoUrl = geoType === 'us' ? US_GEO : WORLD_GEO;

  return (
    <div
      className={`w-full max-w-[320px] sm:max-w-[360px] mx-auto rounded-2xl overflow-hidden border-2 border-sky-300 shadow-md relative select-none ${className}`}
      style={{ background: 'linear-gradient(to bottom, #bae6fd, #7dd3fc, #38bdf8)' }}
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center, scale }}
        width={360}
        height={260}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <filter id="targetGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#047857" floodOpacity="0.45" />
          </filter>
          <filter id="beaconGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* ── Geographies ── */}
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isTarget = String(geo.id) === String(targetId);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  tabIndex={-1}
                  style={{
                    default: {
                      fill:        isTarget ? '#10b981' : '#d1d5db',
                      stroke:      isTarget ? '#064e3b' : '#94a3b8',
                      strokeWidth: isTarget ? 1.4 : 0.4,
                      outline:     'none',
                      filter:      isTarget ? 'url(#targetGlow)' : 'none',
                    },
                    hover:   { outline: 'none' },
                    pressed: { outline: 'none' }
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* ── Water body italic labels ── */}
        {waterBodies.map((wb, i) => (
          <Annotation
            key={`wb-${i}`}
            subject={[wb.lon, wb.lat]}
            dx={0}
            dy={0}
            connectorProps={{ stroke: 'none' }}
          >
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#075985"
              fontSize="9"
              fontStyle="italic"
              fontWeight="700"
              style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: 'serif', opacity: 0.9 }}
            >
              {wb.name}
            </text>
          </Annotation>
        ))}

        {/* ── Beacon pin ── */}
        {targetCenter && (
          <Marker coordinates={targetCenter}>
            <circle
              r={10}
              fill="#fbbf24"
              stroke="#78350f"
              strokeWidth={1.8}
              filter="url(#beaconGlow)"
              style={{ animation: 'beaconPulse 2s ease-in-out infinite' }}
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fill="#78350f"
              fontSize="11"
              fontWeight="900"
              dy="0.5"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              ?
            </text>
          </Marker>
        )}

        {/* ── Compass rose (top-right, offset from center) ── */}
        {compass && (
          <Marker coordinates={center}>
            <g transform="translate(148, -108)">
              <circle r="10" fill="rgba(255,255,255,0.85)" stroke="#0369a1" strokeWidth="0.9" />
              <path d="M0,-7 L2.5,-1.5 L0,0 L-2.5,-1.5 Z" fill="#ef4444" />
              <path d="M0,7 L2.5,1.5 L0,0 L-2.5,1.5 Z" fill="#94a3b8" />
              <text x="0" y="-10" textAnchor="middle" fill="#0369a1" fontSize="6.5" fontWeight="900">N</text>
            </g>
          </Marker>
        )}
      </ComposableMap>

      <style>{`
        @keyframes beaconPulse {
          0%, 100% { transform: scale(1);    opacity: 1; }
          50%       { transform: scale(1.18); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
});


