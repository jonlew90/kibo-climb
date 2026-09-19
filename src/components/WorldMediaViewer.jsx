import React from 'react';
import WorldMapViewer from './WorldMapViewer';
import DOMPurify from 'dompurify';

/**
 * WorldMediaViewer - Unified zero-load visual component for Kibo World
 * Seamlessly handles:
 * 3. Landmark & Wonder Visuals (vector illustration cards)
 */
const sanitizeSvgSnippet = (svgSnippet) => {
  if (!svgSnippet) return '';
  const clean = DOMPurify.sanitize(`<svg xmlns="http://www.w3.org/2000/svg">${svgSnippet}</svg>`, {
    USE_PROFILES: { svg: true, svgFilters: true }
  });
  return clean.replace(/^<svg[^>]*>|<\/svg>$/gi, '');
};

export default function WorldMediaViewer({
  mapData,
  shapeSvg,
  flagData,
  landmarkData,
  className = ''
}) {
  // 1. National Flag Visualizer
  if (flagData) {
    const { viewBox = '0 0 60 40', svg } = flagData;

    return (
      <div className={`w-full max-w-[260px] sm:max-w-[300px] mx-auto rounded-2xl overflow-hidden border-2 border-slate-300 shadow-md bg-white p-2 flex flex-col items-center justify-center ${className}`}>
        <div className="w-full aspect-[3/2] max-h-28 sm:max-h-32 rounded-xl overflow-hidden shadow-inner border border-slate-200 bg-slate-50 flex items-center justify-center">
          <svg
            viewBox={viewBox}
            className="w-full h-full block select-none object-contain"
            dangerouslySetInnerHTML={{ __html: sanitizeSvgSnippet(svg) }}
          />
        </div>
      </div>
    );
  }

  // 2. Landmark & Physical Wonder Visualizer
  if (landmarkData) {
    const { viewBox = '0 0 100 80', svg, badge, name } = landmarkData;

    return (
      <div className={`w-full max-w-[280px] sm:max-w-[320px] mx-auto rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md bg-white relative p-1.5 ${className}`}>
        <div className="w-full aspect-[5/4] max-h-28 sm:max-h-32 rounded-xl overflow-hidden bg-sky-50/50 border border-amber-100 relative">
          <svg
            viewBox={viewBox}
            className="w-full h-full block select-none"
            dangerouslySetInnerHTML={{ __html: sanitizeSvgSnippet(svg) }}
          />
          {badge && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-100/90 backdrop-blur-xs text-[9px] sm:text-[10px] font-bold text-amber-900 border border-amber-300/80 shadow-xs select-none pointer-events-none">
              {badge}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Regional Map Visualizer (Default)
  if (mapData || shapeSvg) {
    return (
      <WorldMapViewer
        mapData={mapData}
        shapeSvg={shapeSvg}
        className={className}
      />
    );
  }

  return null;
}
