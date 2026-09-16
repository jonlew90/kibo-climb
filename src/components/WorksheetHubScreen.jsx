import React, { useState, useMemo, useEffect } from 'react';
import { Search, Printer, Lock, Sparkles, Download, CheckCircle2, ChevronRight, BookOpen, Filter, ArrowRight } from 'lucide-react';
import { WORKSHEET_CATALOG, getCanonicalPath, KIBO_RED_PANDA_FAVICON_SVG } from '../utils/worksheetGenerator';
import { updateWorksheetHubSeo } from '../utils/seoMetadata';
import { soundFx } from '../utils/audio';
import { analyticsService } from '../services/analyticsService';
import { storageService } from '../services/storageService';

const TOPICS = [
  { id: 'all', label: 'All Topics' },
  { id: 'math', label: 'Mental Math' },
  { id: 'words', label: 'Phonics & Words' },
  { id: 'world', label: 'Geography' },
  { id: 'coding', label: 'Coding Logic' }
];

const GRADES = [
  { id: 'all', label: 'All Grades' },
  { id: 'k2', label: 'Grades K–2' },
  { id: '34', label: 'Grades 3–4' },
  { id: '46', label: 'Grades 3–8' }
];

const TIERS = [
  { id: 'all', label: 'All Worksheets' },
  { id: 'free', label: 'Free Only' },
  { id: 'premium', label: 'Premium VIP' }
];

export default function WorksheetHubScreen({ onNavigate, onOpenKiboClubUpgrade }) {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentPlan = storageService.getSubscriptionPlan();
  const isClubMember = currentPlan?.tier === 'family' || currentPlan?.tier === 'single';

  useEffect(() => {
    updateWorksheetHubSeo(WORKSHEET_CATALOG);
    analyticsService?.logScreenView?.('WorksheetHub');
  }, []);

  const filteredWorksheets = useMemo(() => {
    return WORKSHEET_CATALOG.filter(w => {
      // Dynamic profile-specific worksheets are for parent dashboard only
      if (w.isDynamic) return false;

      // Filter by Topic/Subject
      if (selectedTopic !== 'all' && w.subject !== selectedTopic) {
        return false;
      }

      // Filter by Grade
      if (selectedGrade !== 'all') {
        const gradeText = (w.gradeLabel || '').toLowerCase();
        if (selectedGrade === 'k2' && !gradeText.includes('k–2') && !gradeText.includes('k-2') && !gradeText.includes('all')) {
          return false;
        }
        if (selectedGrade === '34' && !gradeText.includes('3–4') && !gradeText.includes('3-4') && !gradeText.includes('all')) {
          return false;
        }
        if (selectedGrade === '46' && !gradeText.includes('4–6') && !gradeText.includes('3–6') && !gradeText.includes('3–8') && !gradeText.includes('all')) {
          return false;
        }
      }

      // Filter by Tier
      if (selectedTier === 'free' && w.isKiboClubOnly) {
        return false;
      }
      if (selectedTier === 'premium' && !w.isKiboClubOnly) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (w.title || '').toLowerCase().includes(q);
        const descMatch = (w.desc || '').toLowerCase().includes(q);
        const gradeMatch = (w.gradeLabel || '').toLowerCase().includes(q);
        const subjectMatch = (w.subject || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !gradeMatch && !subjectMatch) {
          return false;
        }
      }

      return true;
    });
  }, [selectedTopic, selectedGrade, selectedTier, searchQuery]);

  const handleNavigateTo = (path, e) => {
    if (e && e.preventDefault) e.preventDefault();
    soundFx?.playKeyTap?.();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleWorksheetClick = (worksheet) => {
    soundFx?.playKeyTap?.();
    analyticsService?.logWorksheetView?.(worksheet.id, worksheet.subject, 0);

    const url = getCanonicalPath(worksheet);
    if (onNavigate) {
      onNavigate(url, 'worksheet_viewer', { worksheetId: `${worksheet.subject}/${worksheet.slug}` });
    } else {
      window.history.pushState({ worksheetId: worksheet.id }, '', url);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleUnlockClick = (e, worksheet) => {
    if (e && e.stopPropagation) e.stopPropagation();
    soundFx?.playKeyTap?.();
    if (onOpenKiboClubUpgrade) {
      onOpenKiboClubUpgrade();
    } else {
      handleWorksheetClick(worksheet);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FFFDF9] text-[#1E293B] flex flex-col selection:bg-orange-200">
      {/* Global Nav Bar (Consistent with /blog & App) */}
      <header className="border-b border-orange-100/70 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => handleNavigateTo('/', e)}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div
              className="w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-xs group-hover:scale-105 transition-transform"
              dangerouslySetInnerHTML={{ __html: KIBO_RED_PANDA_FAVICON_SVG }}
            />
            <span className="font-heading font-black text-xl text-[#1E293B] tracking-tight group-hover:text-orange-600 transition-colors">
              Kibo Climb
            </span>
          </a>

          <nav className="flex items-center gap-2 sm:gap-4">
            <a
              href="/worksheets"
              onClick={(e) => handleNavigateTo('/worksheets', e)}
              className="text-sm font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl transition-colors"
            >
              Worksheets
            </a>
            <a
              href="/blog"
              onClick={(e) => handleNavigateTo('/blog', e)}
              className="text-sm font-bold text-slate-600 hover:text-orange-600 px-2 py-1.5 rounded-xl transition-colors"
            >
              Blog
            </a>
            <a
              href="/"
              onClick={(e) => handleNavigateTo('/', e)}
              className="ml-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Play Free
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500">
          <a
            href="/"
            onClick={(e) => handleNavigateTo('/', e)}
            className="hover:text-orange-600 transition-colors"
          >
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-orange-600 font-black">
            Worksheets {selectedTopic !== 'all' && `> ${TOPICS.find(t => t.id === selectedTopic)?.label}`}
          </span>
        </nav>

        {/* Hero Banner - Compact on mobile */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 text-white p-4 sm:p-10 shadow-lg border border-teal-600/30">
          <div className="relative z-10 max-w-2xl space-y-1.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/15 backdrop-blur-xs text-teal-100 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-white/20">
              <Printer className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Printable Learning Hub</span>
            </div>
            <h1 className="text-xl sm:text-4xl font-heading font-black tracking-tight leading-tight">
              Free Printable Skill Worksheets &amp; Answer Keys
            </h1>
            <p className="hidden sm:block text-sm sm:text-base text-teal-100/90 font-medium leading-relaxed">
              Targeted 16-problem drill sheets paired with complete parent grading keys. Practice mental math, spelling, geography, and coding offline with Mascot Kibo!
            </p>
          </div>
          
          <div className="absolute right-0 bottom-0 opacity-10 sm:opacity-20 translate-x-12 translate-y-8 pointer-events-none w-48 h-48 sm:w-64 sm:h-64">
            <div dangerouslySetInnerHTML={{ __html: KIBO_RED_PANDA_FAVICON_SVG }} />
          </div>
        </div>

        {/* Filter Controls & Search */}
        <section className="space-y-3 sm:space-y-4 bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-5 shadow-xs">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search worksheets by skill, topic, or grade (e.g. Multiplication, Fractions, K-2)..."
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
          </div>

          {/* Multi-facet Filter Rows - Swipeable / Flex on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-1">
            {/* Topic Filter */}
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Topic / Subject
              </label>
              <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap gap-1.5 pb-1 sm:pb-0">
                {TOPICS.map(topic => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => {
                      soundFx?.playKeyTap?.();
                      setSelectedTopic(topic.id);
                    }}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                      selectedTopic === topic.id
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade Filter */}
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Grade Level
              </label>
              <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap gap-1.5 pb-1 sm:pb-0">
                {GRADES.map(grade => (
                  <button
                    key={grade.id}
                    type="button"
                    onClick={() => {
                      soundFx?.playKeyTap?.();
                      setSelectedGrade(grade.id);
                    }}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                      selectedGrade === grade.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {grade.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Access Tier Filter */}
            <div className="space-y-1">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Access Level
              </label>
              <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap gap-1.5 pb-1 sm:pb-0">
                {TIERS.map(tier => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      soundFx?.playKeyTap?.();
                      setSelectedTier(tier.id);
                    }}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                      selectedTier === tier.id
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-black text-slate-900">
              Worksheet Catalog ({filteredWorksheets.length})
            </h2>
            {(selectedTopic !== 'all' || selectedGrade !== 'all' || selectedTier !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedTopic('all');
                  setSelectedGrade('all');
                  setSelectedTier('all');
                  setSearchQuery('');
                }}
                className="text-xs font-black text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {filteredWorksheets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <p className="text-slate-500 font-bold text-sm">No worksheets found matching your filter criteria.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedTopic('all');
                  setSelectedGrade('all');
                  setSelectedTier('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Show All Worksheets
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWorksheets.map((worksheet) => {
                const isPremiumLocked = worksheet.isKiboClubOnly && !isClubMember;

                return (
                  <div
                    key={worksheet.id}
                    onClick={() => handleWorksheetClick(worksheet)}
                    className="group bg-white rounded-2xl border-2 border-slate-200/90 hover:border-orange-400 p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                  >
                    {/* Top Preview Section */}
                    <div className="space-y-3">
                      {/* Stylized Document Cover Preview Thumbnail */}
                      <div className="relative w-full h-36 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-3 overflow-hidden shadow-inner flex flex-col justify-between group-hover:bg-orange-50/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded-md overflow-hidden shrink-0"
                              dangerouslySetInnerHTML={{ __html: KIBO_RED_PANDA_FAVICON_SVG }}
                            />
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                              {worksheet.subject} Practice
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                            16 Qs + Key
                          </span>
                        </div>

                        <div className="space-y-1 text-center my-auto">
                          <p className="text-xs font-black text-slate-800 line-clamp-2 px-1">
                            {worksheet.title}
                          </p>
                          <div className="flex justify-center gap-2 text-[9px] font-mono text-slate-400">
                            <span>1. ______</span>
                            <span>2. ______</span>
                            <span>3. ______</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 border-t border-slate-200/60 pt-1">
                          <span>Page 1: Drill</span>
                          <span>Page 2: Answer Key</span>
                        </div>
                      </div>

                      {/* Header Tags */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          worksheet.isKiboClubOnly
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}>
                          {worksheet.isKiboClubOnly ? '👑 Premium Pack' : 'Free Printable'}
                        </span>
                        <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {worksheet.gradeLabel}
                        </span>
                      </div>

                      {/* Title & Objective */}
                      <div className="space-y-1">
                        <h3 className="font-heading font-black text-base text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                          {worksheet.title}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                          {worksheet.desc || worksheet.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Button (Entitlement Aware) */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        Instant PDF Format
                      </span>

                      {worksheet.isKiboClubOnly ? (
                        isClubMember ? (
                          <button
                            type="button"
                            className="bg-teal-600 hover:bg-teal-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-200" />
                            <span>Instant Download (Included with Membership)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleUnlockClick(e, worksheet)}
                            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Preview &amp; Unlock</span>
                          </button>
                        )
                      ) : (
                        <button
                          type="button"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Free PDF</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Blog Cross-Link Bridge Banner */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">Looking for Strategy &amp; Teaching Guides?</h4>
              <p className="text-xs text-slate-600 font-medium">Read our step-by-step math breakdowns, mental arithmetic tips, and parent guides on the blog.</p>
            </div>
          </div>
          <a
            href="/blog"
            onClick={(e) => handleNavigateTo('/blog', e)}
            className="shrink-0 bg-white hover:bg-amber-100 text-amber-950 font-black text-xs px-4 py-2.5 rounded-xl border border-amber-300 shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explore Strategy Blog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-orange-100 bg-white py-8 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p>© 2026 Kibo Climb. Offline printable drill worksheets with parent answer keys for K-8 learners.</p>
          <div className="flex justify-center gap-4 text-slate-600 font-bold">
            <a href="/" onClick={(e) => handleNavigateTo('/', e)} className="hover:text-orange-600">Game</a>
            <a href="/worksheets" onClick={(e) => handleNavigateTo('/worksheets', e)} className="hover:text-orange-600">Worksheets</a>
            <a href="/blog" onClick={(e) => handleNavigateTo('/blog', e)} className="hover:text-orange-600">Blog</a>
            <a href="/privacy" onClick={(e) => handleNavigateTo('/privacy', e)} className="hover:text-orange-600">Privacy</a>
            <a href="/terms" onClick={(e) => handleNavigateTo('/terms', e)} className="hover:text-orange-600">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
