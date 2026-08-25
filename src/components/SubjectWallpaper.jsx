import React from 'react';

const SubjectWallpaper = ({ activeSubject }) => {
  let icons = ['🔢', '➕', '➗', '📐'];
  if (activeSubject === 'words') {
    icons = ['📚', '✏️', '🅰️', '📖'];
  } else if (activeSubject === 'world') {
    icons = ['🌍', '🗺️', '🧭', '🏔️'];
  } else if (activeSubject === 'coding') {
    icons = ['💻', '⚙️', '🔀', '⚡'];
  }

  // Repeating pattern using a data URL with an SVG containing subject-specific motifs with enhanced visibility
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <text x="30" y="35" font-size="28" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle" opacity="0.18">
        ${icons[0]}
      </text>
      <text x="90" y="35" font-size="24" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle" opacity="0.15">
        ${icons[1]}
      </text>
      <text x="30" y="95" font-size="24" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle" opacity="0.15">
        ${icons[2]}
      </text>
      <text x="90" y="95" font-size="28" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle" opacity="0.18">
        ${icons[3]}
      </text>
    </svg>
  `;

  const encodedSvg = encodeURIComponent(svgString.trim());
  const backgroundUrl = `url("data:image/svg+xml;utf8,${encodedSvg}")`;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 transition-all duration-300"
      style={{
        backgroundImage: backgroundUrl,
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
      }}
    />
  );
};

export default SubjectWallpaper;

