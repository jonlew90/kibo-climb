import React from 'react';

export default function LeaderboardIcon({ className = "w-5 h-5", isActive = false }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={isActive ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={isActive ? "2" : "2.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Mountain Peak Background */}
      <path d="M12 3L20 13.5H16.5" strokeOpacity={isActive ? "0.8" : "0.6"} />
      <path d="M12 3L4 13.5H7.5" strokeOpacity={isActive ? "0.8" : "0.6"} />
      {/* Snow cap detail */}
      <path d="M9.5 6.5L12 8L14.5 6.5" strokeOpacity={isActive ? "0.8" : "0.6"} fill="none" />

      {/* Center Podium (1st) */}
      <path d="M9 12H15V22H9Z" />
      {/* Left Podium (2nd) */}
      <path d="M3 16H9V22H3Z" />
      {/* Right Podium (3rd) */}
      <path d="M15 18H21V22H15Z" />
    </svg>
  );
}
