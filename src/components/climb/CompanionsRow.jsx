import React, { useState, useRef, useEffect } from 'react';
import Mascot from '../Mascot';
import { soundFx } from '../../utils/audio';
import { storageService } from '../../services/storageService';

export default function CompanionsRow({
  profileId,
  equippedItems = [],
  mascotMood = 'happy',
  mascotState = 'idle'
}) {
  const displayedFriends = storageService.getFriends(profileId).filter(f => f.isDisplayedOnMain).slice(0, 2);
  const [friend1State, setFriend1State] = useState('idle');
  const [friend2State, setFriend2State] = useState('idle');
  const [friend1Tooltip, setFriend1Tooltip] = useState(false);
  const [friend2Tooltip, setFriend2Tooltip] = useState(false);

  const friend1TimeoutRef = useRef(null);
  const friend1TooltipTimeoutRef = useRef(null);
  const friend2TimeoutRef = useRef(null);
  const friend2TooltipTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (friend1TimeoutRef.current) clearTimeout(friend1TimeoutRef.current);
      if (friend1TooltipTimeoutRef.current) clearTimeout(friend1TooltipTimeoutRef.current);
      if (friend2TimeoutRef.current) clearTimeout(friend2TimeoutRef.current);
      if (friend2TooltipTimeoutRef.current) clearTimeout(friend2TooltipTimeoutRef.current);
    };
  }, []);

  const handleFriendClick = (friendIndex) => {
    soundFx.playKeyTap();
    if (friendIndex === 0) {
      if (friend1TimeoutRef.current) clearTimeout(friend1TimeoutRef.current);
      if (friend1TooltipTimeoutRef.current) clearTimeout(friend1TooltipTimeoutRef.current);
      setFriend1State('streak');
      setFriend1Tooltip(true);
      friend1TimeoutRef.current = setTimeout(() => setFriend1State('idle'), 700);
      friend1TooltipTimeoutRef.current = setTimeout(() => setFriend1Tooltip(false), 2000);
    } else {
      if (friend2TimeoutRef.current) clearTimeout(friend2TimeoutRef.current);
      if (friend2TooltipTimeoutRef.current) clearTimeout(friend2TooltipTimeoutRef.current);
      setFriend2State('streak');
      setFriend2Tooltip(true);
      friend2TimeoutRef.current = setTimeout(() => setFriend2State('idle'), 700);
      friend2TooltipTimeoutRef.current = setTimeout(() => setFriend2Tooltip(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-row items-center justify-center w-full min-h-0 my-auto py-1 sm:py-2 z-10 overflow-visible px-2 sm:px-4">
      {/* Left Friend */}
      {displayedFriends[0] ? (
        <div
          className="relative z-0 flex items-center justify-end sm:justify-center overflow-visible flex-1 max-w-[28%] sm:max-w-[140px] md:max-w-[170px] h-3/4 max-h-[22vh] sm:max-h-[28vh] md:max-h-[32vh] cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
          onClick={() => handleFriendClick(0)}
          title={`Tap ${displayedFriends[0].username}!`}
        >
          {friend1Tooltip && (
            <div className="absolute -top-8 left-0 sm:left-1/2 sm:-translate-x-1/2 bg-white text-slate-800 text-[10px] sm:text-xs font-black px-2 py-1 rounded-xl shadow-lg border-2 border-slate-200 z-50 whitespace-nowrap animate-bounce pointer-events-none">
              Hi, I'm {displayedFriends[0].username}!
            </div>
          )}
          <div className="w-full h-full flex items-center justify-center scale-x-[-1]">
            <Mascot
              mood="happy"
              state={friend1State}
              equipped={displayedFriends[0].equipped || []}
              className="h-full w-auto max-h-[22vh] max-w-full sm:max-h-[28vh] md:max-h-[32vh] aspect-square filter drop-shadow-md object-contain shrink-0 opacity-90"
            />
          </div>
          <div className="absolute bottom-0 sm:bottom-1 left-1/2 -translate-x-1/2 bg-white/90 text-slate-600 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm border border-slate-200 z-10 truncate max-w-full pointer-events-none">
            {displayedFriends[0].username}
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-[28%] sm:max-w-[140px] md:max-w-[170px] shrink-0" />
      )}

      {/* Main Mascot */}
      <div
        className="relative z-10 flex items-center justify-center overflow-visible p-1 sm:p-2 w-1/2 max-w-[50%] sm:max-w-[240px] md:max-w-[300px] h-full max-h-[32vh] sm:max-h-[44vh] md:max-h-[48vh] shrink-0"
        title="Tap Kibo!"
      >
        <Mascot
          mood={mascotMood}
          state={mascotState}
          equipped={equippedItems}
          className="h-full w-auto max-h-[32vh] max-w-full sm:max-h-[44vh] md:max-h-[48vh] aspect-square filter drop-shadow-xl object-contain shrink-0"
        />
      </div>

      {/* Right Friend */}
      {displayedFriends[1] ? (
        <div
          className="relative z-0 flex items-center justify-start sm:justify-center overflow-visible flex-1 max-w-[28%] sm:max-w-[140px] md:max-w-[170px] h-3/4 max-h-[22vh] sm:max-h-[28vh] md:max-h-[32vh] cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
          onClick={() => handleFriendClick(1)}
          title={`Tap ${displayedFriends[1].username}!`}
        >
          {friend2Tooltip && (
            <div className="absolute -top-8 right-0 sm:left-1/2 sm:-translate-x-1/2 bg-white text-slate-800 text-[10px] sm:text-xs font-black px-2 py-1 rounded-xl shadow-lg border-2 border-slate-200 z-50 whitespace-nowrap animate-bounce pointer-events-none">
              Hi, I'm {displayedFriends[1].username}!
            </div>
          )}
          <Mascot
            mood="happy"
            state={friend2State}
            equipped={displayedFriends[1].equipped || []}
            className="h-full w-auto max-h-[22vh] max-w-full sm:max-h-[28vh] md:max-h-[32vh] aspect-square filter drop-shadow-md object-contain shrink-0 opacity-90"
          />
          <div className="absolute bottom-0 sm:bottom-1 left-1/2 -translate-x-1/2 bg-white/90 text-slate-600 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm border border-slate-200 z-10 truncate max-w-full pointer-events-none">
            {displayedFriends[1].username}
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-[28%] sm:max-w-[140px] md:max-w-[170px] shrink-0" />
      )}
    </div>
  );
}
