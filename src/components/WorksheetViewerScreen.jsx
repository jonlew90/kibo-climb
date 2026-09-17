import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Printer, Copy, Share2, Lock, Sparkles, CheckCircle2, Home, Dices, ChevronLeft, ChevronRight, Dumbbell, ShieldCheck } from 'lucide-react';
import { getWorksheetBySlug, getWorksheetsForSubject, generateProblemsForWorksheet, getCanonicalPath, KIBO_RED_PANDA_FAVICON_SVG } from '../utils/worksheetGenerator';
import { updateWorksheetSeo } from '../utils/seoMetadata';
import { soundFx } from '../utils/audio';
import { analyticsService } from '../services/analyticsService';
import { storageService } from '../services/storageService';

export default function WorksheetViewerScreen({
  worksheetId,
  onBack,
  onNavigate,
  onOpenKiboClubUpgrade,
  onOpenTrainingCamp,
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

  // Resolve worksheet: first try new /worksheets/{subject}/{slug} URL format,
  // then fall back to the ID passed via prop (used by internal Parent Dashboard nav).
  const worksheet = (() => {
    if (typeof window !== 'undefined') {
      const pathMatch = window.location.pathname.match(/^\/worksheets\/([^/]+)\/([^/?]+)/);
      if (pathMatch) {
        const [, subject, slug] = pathMatch;
        const bySlug = getWorksheetBySlug(subject, slug);
        if (bySlug) return bySlug;
      }
    }
    // Fall back to ID lookup (from PrintablesTab / Parent Dashboard)
    const WORKSHEET_CATALOG = getWorksheetsForSubject('math')
      .concat(getWorksheetsForSubject('words'))
      .concat(getWorksheetsForSubject('world'))
      .concat(getWorksheetsForSubject('coding'));
    return WORKSHEET_CATALOG.find(w => w.id === worksheetId) || getWorksheetsForSubject('math')[0];
  })();

  // Reset seed when switching between worksheets
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('seed');
      setSeed(s ? Number(s) || s : 0);

      // Ensure the URL reflects the canonical path (handles internal nav from Parent Dashboard)
      if (worksheet && !window.location.pathname.includes(`/${worksheet.subject}/${worksheet.slug}`)) {
        const canonical = getCanonicalPath(worksheet);
        const url = new URL(window.location.href);
        url.pathname = canonical;
        window.history.replaceState({ worksheetId: worksheet.id }, '', url.toString());
      }
    } else {
      setSeed(0);
    }
  }, [worksheetId]);

  const currentPlan = storageService.getSubscriptionPlan();
  const isClubMember = currentPlan?.tier === 'family' || currentPlan?.tier === 'single';
  const isLocked = worksheet?.isKiboClubOnly && !isClubMember;

  const activeProf = storageService.getActiveProfile();
  // Privacy safeguard: Only display profile child name if accessed from within Parent Dashboard
  const childName = fromParentDashboard && activeProf?.name ? activeProf.name : '___________';
  const recentMistakes = storageService.getUserData(worksheet?.subject || 'math')?.mistakeHistory || [];

  const problems = useMemo(() => {
    return generateProblemsForWorksheet(worksheet?.id || 'math_starter_k2', recentMistakes, seed);
  }, [worksheet?.id, seed, recentMistakes]);

  useEffect(() => {
    if (worksheet) {
      updateWorksheetSeo(worksheet, seed);
      analyticsService.logWorksheetView(worksheet.id, worksheet.subject, seed);
    }
    return () => {
      document.title = 'Kibo Climb – Fun Daily Math, Words & Geography Practice for Kids';
    };
  }, [worksheet, seed]);

  const handleGenerateNewSet = () => {
    soundFx.playKeyTap();
    const nextSeed = Math.floor(Math.random() * 99000) + 1000;
    setSeed(nextSeed);

    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      const canonical = worksheet ? getCanonicalPath(worksheet) : window.location.pathname;
      const url = new URL(window.location.href);
      url.pathname = canonical;
      url.searchParams.set('seed', nextSeed);
      window.history.pushState({ worksheetId: worksheet?.id, seed: nextSeed }, '', url.toString());
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

  const handleShare = async () => {
    soundFx.playKeyTap();
    const shareData = {
      title: `Kibo Climb • ${worksheet?.title || 'Worksheet'}`,
      text: `Practice ${worksheet?.title || 'learning skills'} with Kibo Climb!`,
      url: window.location.href
    };

    if (navigator?.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError' || err.name === 'InvalidStateError') return;
      }
    }

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
      else if (onNavigate) onNavigate('/parent', 'parent_dashboard', { tab: 'printables' });
    } else {
      // Direct visitor returning to worksheets catalog hub
      if (onNavigate) onNavigate('/worksheets', 'worksheet_hub');
      else if (onBack) onBack();
    }
  };

  if (!worksheet) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-100 flex flex-col items-center py-4 px-2 sm:px-4 text-slate-800">
      {/* Interactive Top Bar (Hidden on print) */}
      <div className="w-full max-w-4xl mb-3 flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-2 sm:p-3 shadow-xs no-print gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={handleReturn}
          className="px-2 sm:px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs inline-flex items-center gap-1 sm:gap-1.5 shrink-0 cursor-pointer hover:bg-slate-100 transition-all text-left"
        >
          {fromParentDashboard ? (
            <>
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap hidden xs:inline">Parent Dashboard</span>
              <span className="whitespace-nowrap xs:hidden">Dashboard</span>
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="whitespace-nowrap hidden xs:inline">All Worksheets</span>
              <span className="whitespace-nowrap xs:hidden">Worksheets</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleGenerateNewSet}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 font-black text-xs text-indigo-800 inline-flex items-center gap-1.5 cursor-pointer transition-all shrink-0 active:scale-95 shadow-xs"
            title="Generate a fresh random version (infinite variations available)"
          >
            <Dices className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="hidden sm:inline">♾️ New Problems</span>
            <span className="sm:hidden">New Set</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl border font-black text-xs inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-all shrink-0 active:scale-95 ${
              copied
                ? 'bg-teal-50 border-teal-300 text-teal-700'
                : 'border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs'
            }`}
            title="Share or copy direct link with current problem set"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="hidden sm:inline">Share</span>
                <span className="sm:hidden">Share</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className={`px-2.5 sm:px-4 py-1.5 rounded-xl font-black text-xs inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 shrink-0 ${
              isLocked
                ? 'bg-amber-500 hover:bg-amber-600 text-amber-950'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Unlock VIP</span>
                <span className="sm:hidden">VIP</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print Sheet</span>
                <span className="sm:hidden">Print</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Curriculum Progression Links (Near top, hidden on print) */}
      {(() => {
        const subjectSheets = getWorksheetsForSubject(worksheet.subject).filter(w => !w.isDynamic);
        const currentIndex = subjectSheets.findIndex(w => w.id === worksheet.id);
        const prevSheet = currentIndex > 0 ? subjectSheets[currentIndex - 1] : null;
        const nextSheet = currentIndex >= 0 && currentIndex < subjectSheets.length - 1 ? subjectSheets[currentIndex + 1] : null;

        if (!prevSheet && !nextSheet) return null;

        return (
          <div className="w-full max-w-4xl mb-4 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs no-print flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 tracking-wider">
                {worksheet.subject.toUpperCase()} Difficulty
              </span>
              <span className="text-[10px] sm:text-xs font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                Tier {currentIndex + 1} of {subjectSheets.length}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              {prevSheet ? (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playKeyTap();
                    if (onNavigate) onNavigate(getCanonicalPath(prevSheet), 'worksheet_viewer', { worksheetId: prevSheet.id });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 hover:border-indigo-300 transition-all text-left flex items-center gap-1.5 cursor-pointer group shrink-0 active:scale-95 shadow-2xs"
                  title={`Go to previous difficulty: ${prevSheet.title}`}
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-indigo-600 group-hover:text-indigo-900 shrink-0" />
                  <div className="text-left">
                    <span className="text-[10px] font-black text-indigo-600 block sm:hidden">Prev</span>
                    <span className="text-xs font-black text-indigo-900 hidden sm:inline truncate max-w-[140px]">{prevSheet.title}</span>
                  </div>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 px-2 py-1 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  🌱 Base Tier
                </span>
              )}

              {nextSheet ? (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playKeyTap();
                    if (onNavigate) onNavigate(getCanonicalPath(nextSheet), 'worksheet_viewer', { worksheetId: nextSheet.id });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 hover:border-indigo-300 transition-all text-right flex items-center gap-1.5 cursor-pointer group shrink-0 active:scale-95 shadow-2xs"
                  title={`Go to next difficulty: ${nextSheet.title}`}
                >
                  <div className="text-right">
                    <span className="text-[10px] font-black text-indigo-600 block sm:hidden">Next</span>
                    <span className="text-xs font-black text-indigo-900 hidden sm:inline truncate max-w-[140px]">{nextSheet.title}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-600 group-hover:text-indigo-900 shrink-0" />
                </button>
              ) : (
                <span className="text-[11px] font-bold text-slate-400 px-2 py-1 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  🏔️ Summit Tier
                </span>
              )}
            </div>
          </div>
        );
      })()}

      {/* Try Live in Training Camp CTA (hidden on print, hidden when accessed from within the app) */}
      {!fromParentDashboard && (
        <div className="w-full max-w-4xl mb-4 no-print bg-indigo-50 border border-indigo-200 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-indigo-900">🏋️ Want to practice this live?</p>
            <p className="text-[11px] text-indigo-700 font-medium mt-0.5">Try Training Camp — same topic, interactive, streak-safe. Free with a Kibo account.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFx.playKeyTap();
              if (onOpenTrainingCamp) {
                onOpenTrainingCamp({ subject: worksheet.subject });
              } else if (onNavigate) {
                onNavigate('/', 'adaptive_session', { openTrainingCamp: true, subject: worksheet.subject });
              }
            }}
            className="shrink-0 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Try Live →
          </button>
        </div>
      )}

      {/* Printable 2-Page Container */}
      <div className="printable-document w-full max-w-4xl flex flex-col gap-8 print:gap-0 print:block">
        
        {/* PAGE 1: QUESTIONS */}
        <div className="bg-white border border-slate-300 rounded-2xl p-5 sm:p-8 shadow-sm flex flex-col justify-between min-h-[920px] print:min-h-0 page-1-print relative">
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

            {/* 16 Questions in Column-First Vertical Layout (#1-8 on Left, #9-16 on Right) */}
            <div className="relative mb-4 sm:mb-6">
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 items-start ${isLocked ? 'select-none' : ''}`}>
                {/* Column 1: Problems 1 to 8 */}
                <div className="space-y-2 sm:space-y-2.5">
                  {problems.slice(0, 8).map((p, i) => {
                    const idx = i; // 0..7 => #1..#8
                    const isPreviewVisible = !isLocked || idx < 2;
                    return (
                      <div
                        key={idx}
                        className={`border border-slate-300 rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 bg-white flex items-center justify-between gap-2 min-h-[42px] transition-all ${
                          !isPreviewVisible ? 'blur-xs opacity-25 select-none pointer-events-none' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-xs font-black text-teal-600 shrink-0">#{idx + 1}</span>
                          <span className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug break-words">
                            {isPreviewVisible ? p.q : 'Sample problem preview...'}
                          </span>
                        </div>
                        {p.scaffold ? (
                          <div className="font-mono font-black text-xs sm:text-sm text-slate-800 tracking-wider bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md shrink-0 ml-2">
                            {isPreviewVisible ? p.scaffold : '_ _ _'}
                          </div>
                        ) : (
                          <div className="w-10 sm:w-12 border-b-2 border-slate-700 h-3 shrink-0 ml-2"></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Column 2: Problems 9 to 16 */}
                <div className="space-y-2 sm:space-y-2.5">
                  {problems.slice(8, 16).map((p, i) => {
                    const idx = i + 8; // 8..15 => #9..#16
                    const isPreviewVisible = !isLocked;
                    return (
                      <div
                        key={idx}
                        className={`border border-slate-300 rounded-xl px-2.5 py-2 sm:px-3 sm:py-2.5 bg-white flex items-center justify-between gap-2 min-h-[42px] transition-all ${
                          !isPreviewVisible ? 'blur-xs opacity-25 select-none pointer-events-none' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-xs font-black text-teal-600 shrink-0">#{idx + 1}</span>
                          <span className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug break-words">
                            {isPreviewVisible ? p.q : 'Sample problem preview...'}
                          </span>
                        </div>
                        {p.scaffold ? (
                          <div className="font-mono font-black text-xs sm:text-sm text-slate-800 tracking-wider bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md shrink-0 ml-2">
                            {isPreviewVisible ? p.scaffold : '_ _ _'}
                          </div>
                        ) : (
                          <div className="w-10 sm:w-12 border-b-2 border-slate-700 h-3 shrink-0 ml-2"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
          <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-bold gap-1">
            <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
              <span>🐾 Kibo Climb</span>
              <span>•</span>
              <span className="text-slate-700">www.kiboclimb.com</span>
              <span>•</span>
              <span>© 2026 Kibo Climb. Single classroom &amp; personal home use only.</span>
            </div>
            <div className="shrink-0 text-slate-600 font-extrabold">Page 1 of 2 • Practice Drill</div>
          </div>
        </div>

        {/* PAGE 2: PARENT ANSWER KEY */}
        <div className="bg-white border border-slate-300 rounded-2xl p-5 sm:p-8 shadow-sm flex flex-col justify-between min-h-[920px] print:min-h-0 page-2-print relative">
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
              <div className="space-y-4 my-2">
                {/* Teaser: Unlocked Sample Solutions #1 & #2 with VIP Reasoning */}
                <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-3 sm:p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      Sample VIP Parent Key (Questions 1 &amp; 2)
                    </span>
                    <span className="text-[10px] bg-purple-200/80 text-purple-900 font-extrabold px-2 py-0.5 rounded-full">
                      Free Preview
                    </span>
                  </div>

                  <div className="space-y-2">
                    {problems.slice(0, 2).map((p, i) => (
                      <div key={i} className="bg-white border border-purple-200/80 rounded-xl p-2.5 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-800">
                            <strong>#{i + 1}:</strong> {p.q}
                          </span>
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md font-black shrink-0">
                            {p.ans}
                          </span>
                        </div>
                        {p.reasoning && (
                          <div className="text-[11px] text-purple-900 font-medium bg-purple-50/70 rounded-lg px-2 py-1 border border-purple-100 flex items-start gap-1.5">
                            <span className="font-extrabold text-purple-700 shrink-0">💡 Strategy Note:</span>
                            <span>{p.reasoning}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Locked Remaining 14 Problems Banner */}
                <div className="border-2 border-dashed border-purple-300 rounded-2xl p-5 sm:p-7 bg-purple-50/40 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="w-11 h-11 bg-purple-200 text-purple-800 rounded-2xl flex items-center justify-center mb-2.5 shadow-xs">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-purple-950 mb-1">
                    Unlock Solutions 3–16 &amp; Full Parent Strategy Guide
                  </h3>
                  <p className="text-xs text-purple-800/80 max-w-md font-medium mb-3 leading-relaxed">
                    VIP keys provide complete step-by-step parent reasoning notes, mental shortcut tips, and common learner traps for every problem.
                  </p>

                  {/* Standard vs VIP Comparison Pill */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 w-full max-w-md mb-4 text-left text-[11px]">
                    <div className="bg-white/80 border border-slate-200 rounded-xl p-2 text-slate-600">
                      <span className="font-extrabold text-slate-700 block mb-0.5">Standard Key:</span>
                      <span>Answers only (e.g. &quot;83&quot;)</span>
                    </div>
                    <div className="bg-purple-100/90 border border-purple-300 rounded-xl p-2 text-purple-950">
                      <span className="font-extrabold text-purple-900 block mb-0.5">👑 VIP Key:</span>
                      <span>Answers + Parent Strategy &amp; Shortcuts</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenKiboClubUpgrade && onOpenKiboClubUpgrade()}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>Join Kibo Club to Unlock All Solutions</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 items-start mb-6">
                {/* Column 1: Answers 1 to 8 */}
                <div className="space-y-2 sm:space-y-2.5">
                  {problems.slice(0, 8).map((p, i) => (
                    <div
                      key={i}
                      className="p-2 sm:p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between text-xs font-bold gap-1 min-h-[38px]"
                    >
                      <div className="flex items-center justify-between text-xs font-bold gap-2">
                        <span className="text-slate-700 leading-snug break-words min-w-0 flex-1">
                          <strong>#{i + 1}:</strong> {p.q}
                        </span>
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md font-black shrink-0">
                          {p.ans}
                        </span>
                      </div>
                      {p.reasoning && (
                        <div className="text-[10px] text-purple-900 font-medium bg-purple-50 rounded px-1.5 py-0.5 border border-purple-100">
                          💡 <strong>Guide:</strong> {p.reasoning}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Column 2: Answers 9 to 16 */}
                <div className="space-y-2 sm:space-y-2.5">
                  {problems.slice(8, 16).map((p, i) => (
                    <div
                      key={i + 8}
                      className="p-2 sm:p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between text-xs font-bold gap-1 min-h-[38px]"
                    >
                      <div className="flex items-center justify-between text-xs font-bold gap-2">
                        <span className="text-slate-700 leading-snug break-words min-w-0 flex-1">
                          <strong>#{i + 9}:</strong> {p.q}
                        </span>
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md font-black shrink-0">
                          {p.ans}
                        </span>
                      </div>
                      {p.reasoning && (
                        <div className="text-[10px] text-purple-900 font-medium bg-purple-50 rounded px-1.5 py-0.5 border border-purple-100">
                          💡 <strong>Guide:</strong> {p.reasoning}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-bold gap-1">
            <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
              <span>🔑 Kibo Climb Answer Key</span>
              <span>•</span>
              <span className="text-slate-700">www.kiboclimb.com</span>
              <span>•</span>
              <span>© 2026 Kibo Climb. Not for redistribution or resale.</span>
            </div>
            <div className="shrink-0 text-purple-900 font-extrabold">Page 2 of 2 • Solutions Guide</div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: letter portrait;
            margin: 0.35in 0.4in;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body, #root, .app-viewport-root {
            background: #ffffff !important;
            background-color: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            position: static !important;
            display: block !important;
          }
          .fixed.inset-0 {
            background: #ffffff !important;
            background-color: #ffffff !important;
            position: static !important;
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-document {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: 0 !important;
          }
          .page-1-print, .page-2-print {
            background: #ffffff !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
            max-height: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .page-1-print {
            page-break-after: always !important;
            break-after: page !important;
            padding-bottom: 0 !important;
            margin-bottom: 0 !important;
          }
          .page-2-print {
            page-break-before: always !important;
            break-before: page !important;
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
        }
      `}} />
    </div>
  );
}
