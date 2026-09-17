import React, { useState, useEffect } from 'react';
import { Printer, Lock, Sparkles, Download, CheckCircle2, Star, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { getWorksheetsForSubject, getBestWorksheetForTier, getCanonicalPath, openPrintableWorksheet } from '../utils/worksheetGenerator';
import { soundFx } from '../utils/audio';
import { analyticsService } from '../services/analyticsService';

export default function PrintablesTab({
  selectedSubject = 'math',
  userTier = 1,
  isKiboClub = false,
  childName = 'Kibo Climber',
  recentMistakes = [],
  onOpenKiboClubUpgrade,
  onSelectWorksheet,
  onNavigateToHub
}) {
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all', 'starter', 'vip'

  const worksheets = getWorksheetsForSubject(selectedSubject);
  const recommendedWorksheet = getBestWorksheetForTier(selectedSubject, userTier);

  const filteredWorksheets = worksheets.filter(w => {
    if (activeSubTab === 'starter') return !w.isKiboClubOnly;
    if (activeSubTab === 'vip') return w.isKiboClubOnly;
    return true;
  });

  useEffect(() => {
    // Log worksheet tab view in analytics
    analyticsService.logScreenView('ParentDashboard_Worksheets');
  }, [selectedSubject]);

  const handleLaunchWorksheet = (worksheet) => {
    soundFx.playKeyTap();
    analyticsService.logWorksheetPrint(worksheet.id, selectedSubject, worksheet.isKiboClubOnly);

    if (worksheet.isKiboClubOnly && !isKiboClub) {
      if (onOpenKiboClubUpgrade) {
        onOpenKiboClubUpgrade();
      }
      return;
    }

    if (onSelectWorksheet) {
      onSelectWorksheet(worksheet.id);
    } else {
      openPrintableWorksheet(worksheet, childName, recentMistakes);
    }
  };

  const handleOpenHub = () => {
    soundFx.playKeyTap();
    if (onNavigateToHub) {
      onNavigateToHub();
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/worksheets');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Promo Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖨️</span>
            <h3 className="text-base sm:text-lg font-black tracking-tight">Printable Learning Hub &amp; Offline Packets</h3>
          </div>
          <p className="text-xs sm:text-sm text-teal-100 font-medium max-w-xl">
            Offline practice with Mascot Kibo! High-contrast 16-problem drill sheets (Page 1) with clean parent answer keys (Page 2).
          </p>
        </div>
        {!isKiboClub && (
          <button
            type="button"
            onClick={() => onOpenKiboClubUpgrade && onOpenKiboClubUpgrade()}
            className="shrink-0 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 fill-amber-950" />
            <span>Unlock VIP Packets</span>
          </button>
        )}
      </div>

      {/* FULL HUB GATEWAY BANNER */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-300 flex items-center gap-1">
              <Layers className="w-3 h-3 text-orange-600" />
              <span>Full Resource Catalog</span>
            </span>
          </div>
          <h4 className="text-sm sm:text-base font-black text-slate-900">
            Explore Full Printable Learning Hub
          </h4>
          <p className="text-xs text-slate-600 font-medium">
            Browse our complete library of printable math activities, vocabulary drills, geography maps, and progression packs.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenHub}
          className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <span>Browse All Worksheets (/worksheets)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* RECOMMENDED FOR CURRENT LEVEL QUICK-ACCESS CARD */}
      {recommendedWorksheet && (
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-teal-50 border-2 border-indigo-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-300 flex items-center gap-1">
                <Star className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                <span>Recommended for {childName} (Tier {userTier})</span>
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-900">
              {recommendedWorksheet.title}
            </h4>
            <p className="text-xs text-slate-600 font-medium max-w-xl">
              {recommendedWorksheet.desc || recommendedWorksheet.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleLaunchWorksheet(recommendedWorksheet)}
            className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Open &amp; Print Sheet 🖨️</span>
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('all')}
          className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'all'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Sheets ({worksheets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('starter')}
          className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'starter'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Free Starter
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('vip')}
          className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
            activeSubTab === 'vip'
              ? 'bg-amber-500 text-amber-950 shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>👑 Kibo Club VIP</span>
        </button>
      </div>

      {/* Worksheets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredWorksheets.map((w) => {
          const isLocked = w.isKiboClubOnly && !isKiboClub;

          return (
            <div
              key={w.id}
              onClick={() => handleLaunchWorksheet(w)}
              className={`border-2 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all relative overflow-hidden cursor-pointer ${
                isLocked
                  ? 'bg-slate-50/90 border-slate-200 hover:border-amber-300'
                  : 'bg-white border-purple-100 hover:border-purple-300 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    w.isKiboClubOnly
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {w.isKiboClubOnly ? '👑 Kibo Club Exclusive' : 'Free Starter'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">
                    {w.gradeLabel}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                  {w.title}
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {w.desc || w.description}
                </p>
                {w.isDynamic && (
                  <div className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg p-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 shrink-0 text-indigo-600" />
                    <span>Auto-calibrated using {childName}'s recent mistakes &amp; weak areas.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-extrabold text-slate-500">
                  16 Questions + Key
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLaunchWorksheet(w);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                    isLocked
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-500 hover:to-amber-600 shadow-xs'
                      : isKiboClub && w.isKiboClubOnly
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                  }`}
                >
                  {isLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock with Kibo Club</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-3.5 h-3.5" />
                      <span>{isKiboClub && w.isKiboClubOnly ? 'Open VIP Sheet' : 'Open Sheet'} 🖨️</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Blog Cross-Link Bridge Banner for Parents */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border-2 border-purple-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">Parent Strategy &amp; Teaching Guides</h4>
            <p className="text-xs text-slate-600 font-medium">Read our step-by-step math breakdowns, mental arithmetic tips, and coaching guides on the blog.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            soundFx.playKeyTap();
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/blog');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }}
          className="shrink-0 bg-white hover:bg-purple-50 text-purple-950 font-black text-xs px-4 py-2.5 rounded-xl border border-purple-300 shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <span>Explore Blog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

