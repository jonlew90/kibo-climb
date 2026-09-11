import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Copy, Lock, Sparkles, CheckCircle2, Home, Dices, ChevronLeft, ChevronRight } from 'lucide-react';
import { getWorksheetById, getWorksheetsForSubject, generateProblemsForWorksheet, KIBO_RED_PANDA_FAVICON_SVG } from '../utils/worksheetGenerator';
import { soundFx } from '../utils/audio';
import { analyticsService } from '../services/analyticsService';
import { storageService } from '../services/storageService';

export default function WorksheetViewerScreen({
  worksheetId,
  onBack,
  onNavigate,
  onOpenKiboClubUpgrade,
  fromParentDashboard = false
}) {
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('seed');
      return s ? Number(s) || s : 0;
    }
    return 0;
  });

  const worksheet = getWorksheetById(worksheetId) || getWorksheetById('math_starter_k2');

  const currentPlan = storageService.getSubscriptionPlan();
  const isClubMember = currentPlan?.tier === 'family' || currentPlan?.tier === 'single';
  const isLocked = worksheet?.isKiboClubOnly && !isClubMember;

  const activeProf = storageService.getActiveProfile();
  // Privacy safeguard: Only display profile child name if accessed from within Parent Dashboard
  const childName = fromParentDashboard && activeProf?.name ? activeProf.name : '___________';
  const recentMistakes = storageService.getUserData(worksheet?.subject || 'math')?.mistakeHistory || [];

  const problems = generateProblemsForWorksheet(worksheet?.id || 'math_starter_k2', recentMistakes, seed);

  useEffect(() => {
    if (worksheet) {
      const isDefault = !seed || seed === 0;
      document.title = `${worksheet.title}${!isDefault ? ` (Set #${seed})` : ''} (${worksheet.gradeLabel}) • Printable Worksheet | Kibo Climb`;
      analyticsService.logWorksheetView(worksheet.id, worksheet.subject, seed);
    }
    return () => {
      document.title = 'Kibo Climb – Fun Daily Math, Words & Geography Practice for Kids';
    };
  }, [worksheet, seed]);

  const handleGenerateNewSet = () => {
    soundFx.playKeyTap();
    // Generate a fresh random integer seed (1 - 99999)
    const nextSeed = Math.floor(Math.random() * 99000) + 1000;
    setSeed(nextSeed);

    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      const url = new URL(window.location.href);
      url.searchParams.set('seed', nextSeed);
      window.history.pushState({ worksheetId: worksheet.id, seed: nextSeed }, '', url.toString());
    }
  };

  const handlePrint = () => {
    soundFx.playKeyTap();
    if (isLocked) {
      if (onOpenKiboClubUpgrade) onOpenKiboClubUpgrade();
      return;
    }
    analyticsService.logWorksheetPrint(worksheet.id, worksheet.subject, worksheet.isKiboClubOnly);
    window.print();
  };

  const handleShare = () => {
    soundFx.playKeyTap();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  const handleReturn = () => {
    soundFx.playKeyTap();
    if (fromParentDashboard) {
      if (onBack) onBack();
      else if (onNavigate) onNavigate('/parent', 'parent_dashboard');
    } else {
      // Direct external / public visitor returning to home
      if (onNavigate) onNavigate('/', 'adaptive_session');
      else if (onBack) onBack();
    }
  };

  if (!worksheet) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-4 px-2 sm:px-4 text-slate-800">
      {/* Interactive Top Bar (Hidden on print) */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-3 shadow-xs no-print gap-2">
        <button
          type="button"
          onClick={handleReturn}
          className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer hover:bg-slate-100 transition-all text-left"
        >
          {fromParentDashboard ? (
            <>
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Parent Dashboard</span>
            </>
          ) : (
            <>
              <Home className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="whitespace-nowrap">Kibo Climb Home</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleGenerateNewSet}
            className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 font-black text-xs text-indigo-800 inline-flex items-center gap-1.5 cursor-pointer transition-all shrink-0 active:scale-95"
            title="Generate a new set of 16 practice questions"
          >
            <Dices className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="hidden sm:inline">New Set</span>
            <span className="sm:hidden">New</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className={`px-3 py-1.5 rounded-xl border font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${
              copied
                ? 'bg-teal-50 border-teal-300 text-teal-700'
                : 'border-slate-300 hover:bg-slate-50 text-slate-700'
            }`}
            title="Copy direct share link with current problem set"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className={`px-4 py-1.5 rounded-xl font-black text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 shrink-0 ${
              isLocked
                ? 'bg-amber-500 hover:bg-amber-600 text-amber-950'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock VIP</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sheet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Printable 2-Page Container */}
      <div className="w-full max-w-4xl flex flex-col gap-8 print:gap-0">
        
        {/* PAGE 1: QUESTIONS */}
        <div className="bg-white border border-slate-300 rounded-2xl p-5 sm:p-8 shadow-sm flex flex-col justify-between min-h-[920px] page-1-print relative">
          <div>
            {/* Header with Mascot SVG */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-teal-600 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-xs"
                  dangerouslySetInnerHTML={{ __html: KIBO_RED_PANDA_FAVICON_SVG }}
                />
                <div>
                  <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {worksheet.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                    {worksheet.desc}
                  </p>
                </div>
              </div>

              {/* Responsive Badge Container (never word-wraps awkwardly) */}
              <div className="self-start sm:self-auto flex items-center gap-1.5">
                <span className={`text-[10px] sm:text-[11px] font-black uppercase whitespace-nowrap px-2.5 py-1 rounded-full border shrink-0 ${
                  worksheet.isKiboClubOnly
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-teal-100 text-teal-900 border-teal-300'
                }`}>
                  {worksheet.isKiboClubOnly ? '👑 Kibo Club VIP' : 'Free Starter'}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200 whitespace-nowrap shrink-0">
                  {worksheet.gradeLabel}
                </span>
                {seed !== 0 && (
                  <span className="text-[10px] sm:text-[11px] font-black text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-200 whitespace-nowrap shrink-0">
                    Set #{seed}
                  </span>
                )}
              </div>
            </div>

            {/* Climber Meta Info Box */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3 mb-5 text-[11px] sm:text-xs font-bold text-slate-600">
              <div>Climber: <span className="underline ml-1 font-extrabold text-slate-900">{childName}</span></div>
              <div>Date: <span className="underline ml-1 font-extrabold text-slate-900">___________</span></div>
              <div>Score: <span className="underline ml-1 font-extrabold text-slate-900">&nbsp;&nbsp;&nbsp;&nbsp;/ 16</span></div>
            </div>

            {/* 16 Questions in a 8x2 Responsive Grid (or Locked Preview) */}
            <div className="relative mb-6">
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 ${isLocked ? 'select-none' : ''}`}>
                {problems.map((p, idx) => {
                  const isPreviewVisible = !isLocked || idx < 2;
                  return (
                    <div
                      key={idx}
                      className={`border border-slate-300 rounded-xl p-2.5 sm:p-3 bg-white flex items-center justify-between min-h-[44px] transition-all ${
                        !isPreviewVisible ? 'blur-xs opacity-25 select-none pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="text-xs font-black text-teal-600 shrink-0">#{idx + 1}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {isPreviewVisible ? p.q : 'Sample problem preview...'}
                        </span>
                      </div>
                      <div className="w-12 sm:w-14 border-b-2 border-slate-700 h-4 shrink-0"></div>
                    </div>
                  );
                })}
              </div>

              {/* VIP Upsell Overlay when locked */}
              {isLocked && (
                <div className="absolute inset-x-0 bottom-0 top-[90px] flex flex-col items-center justify-center p-4 text-center bg-gradient-to-t from-white via-white/95 to-transparent rounded-2xl">
                  <div className="max-w-md bg-amber-50/95 border-2 border-amber-300 rounded-2xl p-5 shadow-lg flex flex-col items-center">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-md mb-3">
                      <Lock className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black uppercase text-amber-800 tracking-wider bg-amber-200/80 px-2.5 py-0.5 rounded-full mb-1.5">
                      Kibo Club VIP Worksheet
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mb-1">
                      Unlock All 16 Problems & Full Answer Key
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mb-4 leading-relaxed">
                      Upgrade to Kibo Club to print unlimited curriculum-aligned practice worksheets, diagnostic mastery packs, and detailed parent step guides.
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenKiboClubUpgrade && onOpenKiboClubUpgrade()}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-amber-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-950" />
                      <span>Unlock with Kibo Club</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Page 1 Footer */}
          <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[10px] sm:text-[11px] text-slate-500 font-bold">
            <div className="flex items-center gap-1.5">
              <span>🐾 Kibo the Red Panda Mascot</span>
              <span>•</span>
              <span>www.kiboclimb.com</span>
            </div>
            <div>Page 1 of 2 • Practice Worksheet</div>
          </div>
        </div>

        {/* PAGE 2: PARENT ANSWER KEY */}
        <div className="bg-white border border-slate-300 rounded-2xl p-5 sm:p-8 shadow-sm flex flex-col justify-between min-h-[920px] page-2-print relative">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-purple-600 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl overflow-hidden shrink-0"
                  dangerouslySetInnerHTML={{ __html: KIBO_RED_PANDA_FAVICON_SVG }}
                />
                <div>
                  <h2 className="text-base sm:text-xl font-black text-purple-950 leading-none">
                    🔑 Parent Answer Key & Guide
                  </h2>
                  <span className="text-xs text-purple-700 font-bold mt-0.5 block">
                    {worksheet.title} • Verified Solutions
                  </span>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-black uppercase bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full border border-purple-300 whitespace-nowrap">
                Page 2 of 2
              </span>
            </div>

            <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3 text-xs text-purple-900 font-medium mb-5">
              <strong>🐾 Mascot Kibo's Learning Note:</strong> Encourage your learner to explain their thinking out loud. Mistakes are valuable milestones!
            </div>

            {isLocked ? (
              <div className="border-2 border-dashed border-purple-200 rounded-2xl p-8 bg-purple-50/50 flex flex-col items-center justify-center text-center my-8">
                <div className="w-12 h-12 bg-purple-200 text-purple-800 rounded-2xl flex items-center justify-center mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-purple-950 mb-1">
                  Answer Key Locked for Non-Members
                </h3>
                <p className="text-xs text-purple-800/80 max-w-sm font-medium mb-4">
                  Full step-by-step solutions and scoring guides are reserved for Kibo Club members.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenKiboClubUpgrade && onOpenKiboClubUpgrade()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  Join Kibo Club to View Solutions
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mb-6">
                {problems.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-2 sm:p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold"
                  >
                    <span className="text-slate-700 truncate pr-2">
                      <strong>#{idx + 1}:</strong> {p.q.replace(/___/g, '').replace(/=.*$/, '=')}
                    </span>
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md font-black shrink-0">
                      {p.ans}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[10px] sm:text-[11px] text-slate-500 font-bold">
            <div>Kibo Climb Offline Practice Solutions • Not for redistribution</div>
            <div>Page 2 of 2 • Solutions Guide</div>
          </div>
        </div>

        {/* Curriculum Progression Links (Hidden on print) */}
        {(() => {
          const subjectSheets = getWorksheetsForSubject(worksheet.subject).filter(w => !w.isDynamic);
          const currentIndex = subjectSheets.findIndex(w => w.id === worksheet.id);
          const prevSheet = currentIndex > 0 ? subjectSheets[currentIndex - 1] : null;
          const nextSheet = currentIndex >= 0 && currentIndex < subjectSheets.length - 1 ? subjectSheets[currentIndex + 1] : null;

          if (!prevSheet && !nextSheet) return null;

          return (
            <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs no-print space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Curriculum Progression • {worksheet.subject.toUpperCase()} Tiers
                </h4>
                <span className="text-[11px] font-bold text-slate-400">
                  Step {currentIndex + 1} of {subjectSheets.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prevSheet ? (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      if (onNavigate) onNavigate(`/worksheets/${prevSheet.id}`, 'worksheet_viewer');
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 shrink-0">
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">← Lower / Review Tier</div>
                      <div className="text-xs font-black text-slate-800 truncate">{prevSheet.title}</div>
                      <div className="text-[10px] font-semibold text-slate-500">{prevSheet.gradeLabel}</div>
                    </div>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-slate-200 text-left flex items-center gap-2.5 opacity-60">
                    <div className="text-xs font-bold text-slate-400">🌱 Foundational Base Tier</div>
                  </div>
                )}

                {nextSheet ? (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playKeyTap();
                      if (onNavigate) onNavigate(`/worksheets/${nextSheet.id}`, 'worksheet_viewer');
                    }}
                    className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-300 transition-all text-left flex items-center justify-between gap-2.5 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-indigo-600 uppercase">Next Higher Tier →</div>
                      <div className="text-xs font-black text-slate-800 truncate">{nextSheet.title}</div>
                      <div className="text-[10px] font-semibold text-slate-500">{nextSheet.gradeLabel}</div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-200 shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-slate-200 text-left flex items-center gap-2.5 opacity-60">
                    <div className="text-xs font-bold text-slate-400">🏔️ Summit Tier Reached!</div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .page-1-print {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            min-height: 100vh !important;
          }
          .page-2-print {
            border: none !important;
            box-shadow: none !important;
            padding-top: 24px !important;
            page-break-before: always !important;
            break-before: page !important;
            min-height: 100vh !important;
          }
        }
      `}} />
    </div>
  );
}
