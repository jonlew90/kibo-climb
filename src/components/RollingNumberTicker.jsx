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
  showDeltaBadge = false,
  profileId = null,
  subjectId = null
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const prevProfileIdRef = useRef(profileId);
  const prevSubjectIdRef = useRef(subjectId);

  useEffect(() => {
    // If context changed (profile or subject switched), update immediately without slot machine rolling
    if (prevProfileIdRef.current !== profileId || prevSubjectIdRef.current !== subjectId) {
      prevValueRef.current = value;
      prevProfileIdRef.current = profileId;
      prevSubjectIdRef.current = subjectId;
      setDisplayValue(value);
      return;
    }

    const prev = prevValueRef.current;
    const diff = value - prev;

    if (diff !== 0) {
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

      prevValueRef.current = value;

      return () => {
        clearInterval(interval);
      };
    } else {
      setDisplayValue(value);
    }
  }, [value, profileId, subjectId]);

  return (
    <div className={`relative inline-flex items-center gap-1 select-none ${className}`}>
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
