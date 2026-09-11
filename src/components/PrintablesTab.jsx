import React, { useState, useEffect } from 'react';
import { Printer, Lock, Sparkles, Download, CheckCircle2, AlertCircle, FileText, Share2, Copy } from 'lucide-react';
import { getWorksheetsForSubject, openPrintableWorksheet } from '../utils/worksheetGenerator';
import { soundFx } from '../utils/audio';
import { analyticsService } from '../services/analyticsService';

export default function PrintablesTab({
  selectedSubject = 'math',
  isKiboClub = false,
  childName = 'Kibo Climber',
  recentMistakes = [],
  onOpenKiboClubUpgrade,
  onSelectWorksheet
}) {
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all', 'starter', 'vip'
  const [statusMsg, setStatusMsg] = useState('');

  const worksheets = getWorksheetsForSubject(selectedSubject);
  const filteredWorksheets = worksheets.filter(w => {
    if (activeSubTab === 'starter') return !w.isKiboClubOnly;
    if (activeSubTab === 'vip') return w.isKiboClubOnly;
    return true;
  });

  useEffect(() => {
    // Log worksheet tab view in analytics
    analyticsService.logScreenView('ParentDashboard_Worksheets');
  }, [selectedSubject]);

  const handlePrint = (worksheet) => {
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

  const handleCopyWorksheetLink = (worksheet) => {
    soundFx.playKeyTap();
    const url = `${window.location.origin}/worksheets/${worksheet.id}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setStatusMsg(`Copied share link for "${worksheet.title}"!`);
        setTimeout(() => setStatusMsg(''), 3000);
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Promo Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖨️</span>
            <h3 className="text-base sm:text-lg font-black tracking-tight">Printable Worksheets & Offline Packets</h3>
          </div>
          <p className="text-xs sm:text-sm text-teal-100 font-medium max-w-xl">
            Offline learning with Mascot Kibo! Print focused 16-problem drill sheets (Page 1) with clean parent answer keys (Page 2).
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

      {statusMsg && (
        <div className="bg-teal-50 border border-teal-300 text-teal-900 text-xs font-bold p-3 rounded-xl flex items-center gap-2 animate-pop">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{statusMsg}</span>
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
              className={`border-2 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all relative overflow-hidden ${
                isLocked
                  ? 'bg-slate-50/90 border-slate-200'
                  : 'bg-white border-purple-100 hover:border-purple-300 shadow-2xs'
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
                  {w.description}
                </p>
                {w.isDynamic && (
                  <div className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg p-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 shrink-0 text-indigo-600" />
                    <span>Auto-calibrated using {childName}'s recent mistakes & weak areas.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-500">
                    16 Questions + Key
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyWorksheetLink(w)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
                    title="Copy direct share link for SEO / bookmarks"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handlePrint(w)}
                  className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                    isLocked
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:from-amber-500 hover:to-amber-600 shadow-xs'
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
                      <span>Print Sheet 🖨️</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
