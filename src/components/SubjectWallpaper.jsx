import React from 'react';

const SubjectWallpaper = ({ activeSubject }) => {
  let emoji = '🔢';
  if (activeSubject === 'words') emoji = '📚';
  else if (activeSubject === 'world') emoji = '🌍';

  // We can create a repeating pattern using a data URL with an SVG
  // that contains the emoji. We'll set the opacity very low.
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <text x="50" y="50" font-size="40" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle" opacity="0.05">
        ${emoji}
      </text>
    </svg>
  `;

  const encodedSvg = encodeURIComponent(svgString.trim());
  const backgroundUrl = `url("data:image/svg+xml;utf8,${encodedSvg}")`;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: backgroundUrl,
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
      }}
    />
  );
};

export default SubjectWallpaper;
