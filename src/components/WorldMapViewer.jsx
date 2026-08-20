import React from 'react';

/**
 * WorldMapViewer - Rich geographic map visualizer for Kibo World
 * Displays the target piece of land prominently highlighted against
 * surrounding bodies of land and water with cartographic labels.
 */
export default function WorldMapViewer({
  mapData,
  shapeSvg,
  className = ''
}) {
  // If we have full regional map context
  if (mapData) {
    const {
      viewBox = '0 0 200 140',
      waterBodies = [],
      surroundingLand = [],
      targetPath,
      targetCenter = { x: 100, y: 70 },
      compass = true
    } = mapData;

    return (
      <div className={`w-full max-w-[320px] sm:max-w-[360px] mx-auto rounded-2xl overflow-hidden border-2 border-sky-300 shadow-md bg-gradient-to-b from-sky-100 via-sky-200 to-sky-100 relative ${className}`}>
        <svg
          viewBox={viewBox}
          className="w-full h-full block select-none"
          style={{ maxHeight: '100%' }}
        >
          <defs>
            {/* Subtle ocean wave pattern */}
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="50%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Target Land Glow Filter */}
            <filter id="targetHighlightGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#047857" floodOpacity="0.4" />
            </filter>

            {/* Pulsating Target Beacon Filter */}
            <filter id="beaconGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#10b981" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* 1. Base Ocean / Water Canvas */}
          <rect width="100%" height="100%" fill="url(#oceanGrad)" />

          {/* Subtle Nautical Coordinate Grid Lines */}
          <line x1="0" y1="35" x2="200" y2="35" stroke="rgba(255,255,255,0.3)" strokeDasharray="3,3" strokeWidth="0.75" />
          <line x1="0" y1="70" x2="200" y2="70" stroke="rgba(255,255,255,0.3)" strokeDasharray="3,3" strokeWidth="0.75" />
          <line x1="0" y1="105" x2="200" y2="105" stroke="rgba(255,255,255,0.3)" strokeDasharray="3,3" strokeWidth="0.75" />
          <line x1="50" y1="0" x2="50" y2="140" stroke="rgba(255,255,255,0.3)" strokeDasharray="3,3" strokeWidth="0.75" />
          <line x1="100" y1="0" x2="100" y2="140" stroke="rgba(255,255,255,0.3)" strokeDasharray="3,3" strokeWidth="0.75" />
          <line x1="150" y1="0" x2="150" y2="140" stroke="rgba(255,255,255,0.3)" strokeDasharray="3,3" strokeWidth="0.75" />

          {/* 2. Surrounding Bodies of Land */}
          {surroundingLand.map((land, idx) => (
            <g key={`land-${idx}`}>
              <path
                d={land.d}
                fill="#e2e8f0"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeLinejoin="round"
                className="transition-colors"
              />
              {land.labelPos && land.name && (
                <text
                  x={land.labelPos.x}
                  y={land.labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#475569"
                  fontSize="7.5"
                  fontWeight="800"
                  letterSpacing="0.4"
                  className="pointer-events-none uppercase tracking-wider select-none font-sans"
                >
                  {land.name}
                </text>
              )}
            </g>
          ))}

          {/* 3. Water Body Names & Labels */}
          {waterBodies.map((water, idx) => (
            <text
              key={`water-${idx}`}
              x={water.x}
              y={water.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#0369a1"
              fontSize="7.5"
              fontStyle="italic"
              fontWeight="700"
              className="pointer-events-none select-none font-serif opacity-90 drop-shadow-xs"
            >
              {water.name}
            </text>
          ))}

          {/* 4. Target Piece of Land (Prominently Highlighted) */}
          {targetPath && (
            <g filter="url(#targetHighlightGlow)">
              {/* Highlight Halo Outline */}
              <path
                d={targetPath}
                fill="none"
                stroke="#34d399"
                strokeWidth="4"
                strokeOpacity="0.6"
                strokeLinejoin="round"
                className="animate-pulse"
              />
              {/* Main Target Fill & Border */}
              <path
                d={targetPath}
                fill="#10b981"
                stroke="#064e3b"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* 5. Target Beacon Pin Indicator */}
          {targetCenter && (
            <g
              transform={`translate(${targetCenter.x}, ${targetCenter.y})`}
              filter="url(#beaconGlow)"
              className="pointer-events-none select-none"
            >
              <circle r="7" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" className="animate-pulse" />
              <text
                x="0"
                y="0.5"
                textAnchor="middle"
                dominantBaseline="central"
                fill="#78350f"
                fontSize="8"
                fontWeight="900"
                className="font-sans"
              >
                ?
              </text>
            </g>
          )}

          {/* 6. Compass Indicator (Top Right) */}
          {compass && (
            <g transform="translate(186, 14)" className="pointer-events-none opacity-85 select-none">
              <circle r="8" fill="rgba(255,255,255,0.7)" stroke="#0369a1" strokeWidth="0.8" />
              <path d="M0,-6 L2,-1 L0,0 L-2,-1 Z" fill="#ef4444" />
              <path d="M0,6 L2,1 L0,0 L-2,1 Z" fill="#94a3b8" />
              <text x="0" y="-8.5" textAnchor="middle" fill="#0369a1" fontSize="5.5" fontWeight="900">
                N
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  }

  // Fallback for raw shapeSvg if full map context not provided
  return (
    <div className={`w-full max-w-[320px] sm:max-w-[360px] mx-auto rounded-2xl overflow-hidden border-2 border-sky-300 shadow-md bg-gradient-to-b from-sky-100 via-sky-200 to-sky-100 relative ${className}`}>
      <svg viewBox="0 0 200 140" className="w-full h-full block select-none">
        <rect width="100%" height="100%" fill="#bae6fd" />
        <line x1="0" y1="70" x2="200" y2="70" stroke="rgba(255,255,255,0.4)" strokeDasharray="3,3" strokeWidth="0.75" />
        <line x1="100" y1="0" x2="100" y2="140" stroke="rgba(255,255,255,0.4)" strokeDasharray="3,3" strokeWidth="0.75" />
        {shapeSvg && (
          <path
            d={shapeSvg}
            fill="#10b981"
            stroke="#064e3b"
            strokeWidth="2.2"
            strokeLinejoin="round"
            className="drop-shadow-md"
          />
        )}
      </svg>
    </div>
  );
}
