import React, { useState } from 'react';
import { Zap, Star, Shield } from 'lucide-react';
import Mascot from './Mascot';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';

export default function ReferralRewardModal({ rewardData, onClose, activeSubject }) {
  const [claiming, setClaiming] = useState(false);
  if (!rewardData) return null;

  const handleClaim = async (rewardType) => {
    setClaiming(true);
    const currentUser = authService.getAuthState();
    if (!currentUser) return;
    try {
      if (rewardType === 'sparks') {
        const currentSparks = parseInt(localStorage.getItem('kibo_math_sparks') || '0', 10);
        localStorage.setItem('kibo_math_sparks', (currentSparks + 1000).toString());
      } else if (rewardType === 'shields') {
         const currentShields = storageService.getConsumables().shieldCount || 0;
         storageService.saveConsumables({ shieldCount: currentShields + 5 });
      } else if (rewardType === 'hat') {
         storageService.unlockItem('wizard_hat');
      }

      const rewardRef = doc(db, 'users', currentUser.uid, 'pendingRewards', rewardData.id);
      await updateDoc(rewardRef, {
        status: 'claimed',
        claimedRewardType: rewardType,
        claimedAt: new Date()
      });

      window.location.reload();
    } catch (error) {
      console.error("Failed to claim reward:", error);
      alert("Failed to claim reward. Please try again later.");
      setClaiming(false);
    }
  };

  return (
    <div
      onClick={!claiming && onClose ? onClose : undefined}
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in ${!claiming && onClose ? 'cursor-pointer' : ''}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-scale-in border-4 border-indigo-300 flex flex-col items-center text-center cursor-default"
      >
        <div className="w-24 h-24 mb-4">
           <Mascot emotion="excited" activeItems={['holiday_santa_hat']} size={120} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Referral Successful!</h2>
        <p className="text-slate-600 text-lg mb-6 font-medium">A friend joined using your link! Choose your reward as a thank you!</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <button onClick={() => handleClaim('sparks')} disabled={claiming} className="flex flex-col items-center p-4 border-2 border-amber-300 bg-amber-50 rounded-2xl hover:scale-105 transition-all">
            <Zap className="w-10 h-10 text-amber-500 fill-amber-400 mb-2" />
            <span className="font-black text-amber-900">1000 Sparks</span>
          </button>
          <button onClick={() => handleClaim('shields')} disabled={claiming} className="flex flex-col items-center p-4 border-2 border-blue-300 bg-blue-50 rounded-2xl hover:scale-105 transition-all">
            <Shield className="w-10 h-10 text-blue-500 fill-blue-400 mb-2" />
            <span className="font-black text-blue-900">5 Shields</span>
          </button>
          <button onClick={() => handleClaim('hat')} disabled={claiming} className="flex flex-col items-center p-4 border-2 border-purple-300 bg-purple-50 rounded-2xl hover:scale-105 transition-all">
            <Star className="w-10 h-10 text-purple-500 fill-purple-400 mb-2" />
            <span className="font-black text-purple-900">Wizard Hat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
