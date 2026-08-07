import React, { useEffect, useState, useRef } from 'react';

/**
 * Slot-machine style rolling number ticker component for Kibo Math.
 * Animates numbers rolling up or down and pops floating delta badges (+12 / -8).
 */
export default function RollingNumberTicker({
  value = 1000,
  prefix = '',
  suffix = '',
  label = '',
  className = '',
  icon = null,
  showDeltaBadge = true,
  profileId = null
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [deltaEffect, setDeltaEffect] = useState(null);
  const prevValueRef = useRef(value);
  const prevProfileIdRef = useRef(profileId);

  useEffect(() => {
    const prev = prevValueRef.current;
    const diff = value - prev;
    const isProfileChange = prevProfileIdRef.current !== profileId;

    if (diff !== 0) {
      if (!isProfileChange) {
        setDeltaEffect({
          diff,
          isPositive: diff > 0,
          id: Date.now()
        });
      }

      // Rapid Slot Machine Rolling Effect (Steps over 500ms)
      const steps = 8;
      const stepDuration = 500 / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const currentInterp = Math.round(prev + diff * progress);
        setDisplayValue(currentInterp);

        if (currentStep >= steps) {
          clearInterval(interval);
          setDisplayValue(value);
        }
      }, stepDuration);

      const timer = setTimeout(() => {
        setDeltaEffect(null);
      }, 1400);

      prevValueRef.current = value;
      prevProfileIdRef.current = profileId;

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    } else {
      setDisplayValue(value);
      prevProfileIdRef.current = profileId;
    }
  }, [value, profileId]);

  return (
    <div className={`relative inline-flex items-center gap-1 select-none ${className}`}>
      {/* Floating Slot Machine Delta Badge (+12 / -8) */}
      {showDeltaBadge && deltaEffect && (
        <span
          key={deltaEffect.id}
          className={`absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black px-2 py-0.5 rounded-full border shadow-md animate-slot-pop z-50 pointer-events-none whitespace-nowrap ${
            deltaEffect.isPositive
              ? 'bg-emerald-500 text-white border-emerald-300 shadow-emerald-900/30'
              : 'bg-rose-600 text-white border-rose-400 shadow-rose-900/30'
          }`}
        >
          {deltaEffect.isPositive ? `+${deltaEffect.diff}` : `${deltaEffect.diff}`}
        </span>
      )}

      {icon}
      {prefix && <span>{prefix}</span>}

      {/* Rolling Slot Reel Number Container */}
      <span className="inline-block transition-transform duration-100 font-extrabold tracking-tight">
        {label ? `${label} ` : ''}
        {displayValue.toLocaleString()}
      </span>

      {suffix && <span>{suffix}</span>}
    </div>
  );
}
