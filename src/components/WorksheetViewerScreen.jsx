import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, Share2, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { getWorksheetById, generateProblemsForWorksheet, KIBO_RED_PANDA_FAVICON_SVG } from '../utils/worksheetGenerator';
import { soundFx } from '../utils/audio';
import { analyticsService } from '../services/analyticsService';
import { storageService } from '../services/storageService';

export default function WorksheetViewerScreen({
  worksheetId,
  onBack,
  onNavigate,
  onOpenKiboClubUpgrade
}) {
  const [copied, setCopied] = useState(false);
  const worksheet = getWorksheetById(worksheetId) || getWorksheetById('math_starter_k2');

  const currentPlan = storageService.getSubscriptionPlan();
  const isClubMember = currentPlan?.tier === 'family' || currentPlan?.tier === 'single';
  const isLocked = worksheet?.isKiboClubOnly && !isClubMember;

  const activeProf = storageService.getActiveProfile();
  const childName = activeProf?.name || 'Kibo Climber';
  const recentMistakes = storageService.getUserData(worksheet?.subject || 'math')?.mistakeHistory || [];

  const problems = generateProblemsForWorksheet(worksheet?.id || 'math_starter_k2', recentMistakes);

  useEffect(() => {
    // Dynamic document title & meta for SEO
    if (worksheet) {
      document.title = `${worksheet.title} (${worksheet.gradeLabel}) • Printable Worksheet | Kibo Climb`;
      analyticsService.logWorksheetView(worksheet.id, worksheet.subject);
    }
    return () => {
      document.title = 'Kibo Climb – Fun Daily Math, Words & Geography Practice for Kids';
    };
  }, [worksheet]);

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

  if (!worksheet) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-4 px-2 sm:px-4 text-slate-800">
      {/* Interactive Controls Bar (Hidden during print) */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-3 shadow-xs no-print">
        <button
          type="button"
          onClick={onBack || (() => onNavigate && onNavigate('/parent', 'parent_dashboard'))}
          className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Parent Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share URL'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className={`px-4 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 ${
              isLocked
                ? 'bg-amber-500 hover:bg-amber-600 text-amber-950'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
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
                <span>Print Worksheet 🖨️</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* WORKSHEET CONTAINER (Print Styled) */}
      <div className="w-full max-w-4xl space-y-6">
        
        {/* PAGE 1: QUESTIONS */}
        <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[920px] page-1-print">
          <div>
            {/* Header with Mascot SVG */}
            <div className="flex justify-between items-center border-b-2 border-teal-600 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-2xs"
                  dangerouslySetInnerHTML={{ __html: KIBO_RED_PANDA_FAVICON_SVG }}
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                    Kibo Climb • {worksheet.title}
                  </h1>
                  <span className="text-xs text-slate-600 font-bold mt-1 block">
                    {worksheet.description}
                  </span>
                </div>
              </div>

              <div>
                <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  worksheet.isKiboClubOnly
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-teal-100 text-teal-900 border-teal-300'
                }`}>
                  {worksheet.isKiboClubOnly ? '👑 Kibo Club VIP' : 'Free Starter'} • {worksheet.gradeLabel}
                </span>
              </div>
            </div>

            {/* Climber Meta Info Box */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-5 text-xs font-bold text-slate-600">
              <div>Climber: <span className="underline ml-1 font-extrabold text-slate-900">{childName !== 'Kibo Climber' ? childName : '_______________'}</span></div>
              <div>Date: <span className="underline ml-1 font-extrabold text-slate-900">_______________</span></div>
              <div>Score: <span className="underline ml-1 font-extrabold text-slate-900">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/ 16</span></div>
            </div>

            {/* 16 Questions in a 8x2 Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {problems.map((p, idx) => (
                <div
                  key={idx}
                  className="border border-slate-300 rounded-xl p-3 bg-white flex items-center justify-between min-h-[46px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-teal-600">#{idx + 1}</span>
                    <span className="text-sm font-bold text-slate-900">{p.q}</span>
                  </div>
                  <div className="w-14 border-b-2 border-slate-700 h-5"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Page 1 Footer */}
          <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[11px] text-slate-500 font-bold">
            <div className="flex items-center gap-1.5">
              <span>🐾 Kibo the Red Panda Mascot</span>
              <span>•</span>
              <span>www.kiboclimb.com</span>
            </div>
            <div>Page 1 of 2 • Practice Worksheet</div>
          </div>
        </div>

        {/* PAGE 2: PARENT ANSWER KEY */}
        <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[920px] page-2-print">
          <div>
            <div className="flex justify-between items-center border-b-2 border-purple-600 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl overflow-hidden shrink-0"
                  dangerouslySetInnerHTML={{ __html: KIBO_RED_PANDA_FAVICON_SVG }}
                />
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-purple-950 leading-none">
                    🔑 Parent Answer Key & Verification Guide
                  </h2>
                  <span className="text-xs text-purple-700 font-bold mt-0.5 block">
                    {worksheet.title} • Verified Solutions
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full border border-purple-300">
                Page 2 of 2
              </span>
            </div>

            <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3 text-xs text-purple-900 font-medium mb-5">
              <strong>🐾 Mascot Kibo's Learning Note:</strong> Encourage your learner to explain their thinking out loud. Mistakes are the trail markers of learning!
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {problems.map((p, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold"
                >
                  <span className="text-slate-700">
                    <strong>#{idx + 1}:</strong> {p.q.replace(/___/g, '').replace(/=.*$/, '=')}
                  </span>
                  <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md font-black">
                    {p.ans}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[11px] text-slate-500 font-bold">
            <div>Kibo Climb Offline Practice Solutions • Not for redistribution</div>
            <div>Page 2 of 2 • Solutions Guide</div>
          </div>
        </div>

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
