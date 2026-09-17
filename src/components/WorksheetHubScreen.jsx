import React, { useState, useMemo, useEffect } from 'react';
import { Search, Printer, Lock, Sparkles, Download, CheckCircle2, ChevronRight, BookOpen, Filter, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
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
  { id: 'k', label: 'Kindergarten' },
  { id: '1', label: 'Grade 1' },
  { id: '2', label: 'Grade 2' },
  { id: '3', label: 'Grade 3' },
  { id: '4', label: 'Grade 4' },
  { id: '5', label: 'Grade 5' },
  { id: '6', label: 'Grade 6+' }
];

const TIERS = [
  { id: 'all', label: 'All Worksheets' },
  { id: 'free', label: 'Free Worksheets' },
  { id: 'premium', label: 'VIP Skill Boosters' }
];

export default function WorksheetHubScreen({ onNavigate, onOpenKiboClubUpgrade, fromParentDashboard = false, onBack }) {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null); // 'topic' | 'grade' | 'tier' | null

  const currentPlan = storageService.getSubscriptionPlan();
  const isClubMember = currentPlan?.tier === 'family' || currentPlan?.tier === 'single';

  useEffect(() => {
    updateWorksheetHubSeo(WORKSHEET_CATALOG);
    analyticsService?.logScreenView?.('WorksheetHub');
  }, []);

  // Close dropdowns on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.custom-dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpenDropdown(null);
    };
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
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
        if (selectedGrade === 'k') {
          if (!gradeText.includes('kindergarten') && !gradeText.includes('grades k') && !gradeText.includes('all')) return false;
        } else if (selectedGrade === '1') {
          if (!gradeText.includes('grade 1') && !gradeText.includes('grades k–1') && !gradeText.includes('grades k-1') && !gradeText.includes('grades 1–3') && !gradeText.includes('grades 1-3') && !gradeText.includes('all')) return false;
        } else if (selectedGrade === '2') {
          if (!gradeText.includes('grade 2') && !gradeText.includes('grades 2–3') && !gradeText.includes('grades 2-3') && !gradeText.includes('grades 1–3') && !gradeText.includes('grades 1-3') && !gradeText.includes('all')) return false;
        } else if (selectedGrade === '3') {
          if (!gradeText.includes('grade 3') && !gradeText.includes('grades 2–3') && !gradeText.includes('grades 2-3') && !gradeText.includes('grades 1–3') && !gradeText.includes('grades 1-3') && !gradeText.includes('all')) return false;
        } else if (selectedGrade === '4') {
          if (!gradeText.includes('grade 4') && !gradeText.includes('grades 4–6') && !gradeText.includes('grades 4-6') && !gradeText.includes('grades 4–8') && !gradeText.includes('grades 4-8') && !gradeText.includes('all')) return false;
        } else if (selectedGrade === '5') {
          if (!gradeText.includes('grade 5') && !gradeText.includes('grades 4–6') && !gradeText.includes('grades 4-6') && !gradeText.includes('grades 4–8') && !gradeText.includes('grades 4-8') && !gradeText.includes('all')) return false;
        } else if (selectedGrade === '6') {
          if (!gradeText.includes('grade 6') && !gradeText.includes('grades 4–6') && !gradeText.includes('grades 4-6') && !gradeText.includes('grades 4–8') && !gradeText.includes('grades 4-8') && !gradeText.includes('all')) return false;
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

  const currentTopicLabel = TOPICS.find(t => t.id === selectedTopic)?.label || 'All Topics';
  const currentGradeLabel = GRADES.find(g => g.id === selectedGrade)?.label || 'All Grades';
  const currentTierLabel = TIERS.find(t => t.id === selectedTier)?.label || 'All Worksheets';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FFFDF9] text-[#1E293B] flex flex-col selection:bg-orange-200">
      {/* Global Nav Bar (Consistent with /blog & App) */}
      <header className="border-b border-orange-100/70 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          <a
            href="/"
            onClick={(e) => handleNavigateTo('/', e)}
            className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer shrink-0"
          >
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden shrink-0 shadow-xs group-hover:scale-105 transition-transform"
              dangerouslySetInnerHTML={{ __html: KIBO_RED_PANDA_FAVICON_SVG }}
            />
            <span className="font-heading font-black text-lg sm:text-xl text-[#1E293B] tracking-tight whitespace-nowrap group-hover:text-orange-600 transition-colors">
              Kibo Climb
            </span>
          </a>

          <nav className="flex items-center gap-1.5 sm:gap-3 shrink-0">
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
            {fromParentDashboard ? (
              <button
                type="button"
                onClick={() => {
                  soundFx.playKeyTap();
                  if (onBack) onBack();
                  else if (onNavigate) onNavigate('/parent', 'parent_dashboard', { tab: 'printables' });
                }}
                className="ml-1 sm:ml-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-teal-200" />
                <span>Parent Zone</span>
              </button>
            ) : (
              <a
                href="/"
                onClick={(e) => handleNavigateTo('/', e)}
                className="ml-1 sm:ml-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Play Free
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Hero Banner - Warm Brand Theme Matching /blog & App */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 text-white p-5 sm:p-10 shadow-lg border border-orange-500/30">
          <div className="relative z-10 max-w-2xl space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/15 backdrop-blur-xs text-amber-100 text-[10px] sm:text-xs font-black uppercase tracking-wider border border-white/20">
              <Printer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-200" />
              <span>Printable Learning Hub &bull; ♾️ Infinite Variations</span>
            </div>
            <h1 className="text-xl sm:text-4xl font-heading font-black tracking-tight leading-tight">
              Curriculum Worksheets &amp; Parent Step Guides
            </h1>
            <p className="text-xs sm:text-base text-amber-100/90 font-medium leading-relaxed">
              Explore free foundational printables and VIP Skill Boosters with step-by-step parent strategy keys. Every worksheet procedurally generates infinite problem variations on click for unlimited offline practice!
            </p>
          </div>
          
          <div className="absolute right-0 bottom-0 opacity-10 sm:opacity-20 translate-x-12 translate-y-8 pointer-events-none w-48 h-48 sm:w-64 sm:h-64">
            <div dangerouslySetInnerHTML={{ __html: KIBO_RED_PANDA_FAVICON_SVG }} />
          </div>
        </div>

        {/* Infinite Practice Feature Highlight Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-teal-500/10 border border-orange-200/80 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
                <span>Infinite Practice on Every Sheet</span>
                <span className="text-[10px] bg-orange-100 text-orange-800 font-extrabold px-2 py-0.5 rounded-full border border-orange-200">
                  Procedural Generator
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
                These aren't static PDFs. Open any worksheet and click <strong className="text-slate-800 font-bold">&quot;New Set&quot;</strong> in the viewer to instantly generate unlimited fresh number permutations!
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <section className="space-y-3 sm:space-y-4 bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-5 shadow-xs">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search worksheets by skill, topic, or grade (e.g. Multiplication, Fractions, Grade 3)..."
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            />
          </div>

          {/* Multi-facet Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-1">
            {/* Topic Filter Dropdown */}
            <div className="space-y-1 custom-dropdown-container relative">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Topic / Subject
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFx?.playKeyTap?.();
                  setOpenDropdown(openDropdown === 'topic' ? null : 'topic');
                }}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              >
                <span className="truncate">{currentTopicLabel}</span>
                <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${openDropdown === 'topic' ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {openDropdown === 'topic' && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 overflow-hidden animate-pop">
                  {TOPICS.map(topic => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => {
                        soundFx?.playKeyTap?.();
                        setSelectedTopic(topic.id);
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer transition-colors ${
                        selectedTopic === topic.id
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{topic.label}</span>
                      {selectedTopic === topic.id && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grade Filter Dropdown */}
            <div className="space-y-1 custom-dropdown-container relative">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Grade Level
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFx?.playKeyTap?.();
                  setOpenDropdown(openDropdown === 'grade' ? null : 'grade');
                }}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              >
                <span className="truncate">{currentGradeLabel}</span>
                <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${openDropdown === 'grade' ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {openDropdown === 'grade' && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 overflow-hidden animate-pop">
                  {GRADES.map(grade => (
                    <button
                      key={grade.id}
                      type="button"
                      onClick={() => {
                        soundFx?.playKeyTap?.();
                        setSelectedGrade(grade.id);
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer transition-colors ${
                        selectedGrade === grade.id
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{grade.label}</span>
                      {selectedGrade === grade.id && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Access Tier Filter Dropdown */}
            <div className="space-y-1 custom-dropdown-container relative">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500">
                Access Level
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFx?.playKeyTap?.();
                  setOpenDropdown(openDropdown === 'tier' ? null : 'tier');
                }}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              >
                <span className="truncate">{currentTierLabel}</span>
                <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${openDropdown === 'tier' ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {openDropdown === 'tier' && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 overflow-hidden animate-pop">
                  {TIERS.map(tier => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => {
                        soundFx?.playKeyTap?.();
                        setSelectedTier(tier.id);
                        setOpenDropdown(null);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer transition-colors ${
                        selectedTier === tier.id
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{tier.label}</span>
                      {selectedTier === tier.id && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Catalog Content Grouped by Topic */}
        <div className="space-y-8">
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
            TOPICS.filter(t => t.id !== 'all').map(topic => {
              const topicWorksheets = filteredWorksheets.filter(w => w.subject === topic.id);
              if (topicWorksheets.length === 0) return null;

              const topicBadge = {
                math: { icon: '🔢', color: 'text-orange-700 bg-orange-100 border-orange-200' },
                words: { icon: '📖', color: 'text-sky-700 bg-sky-100 border-sky-200' },
                world: { icon: '🌍', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' },
                coding: { icon: '💻', color: 'text-purple-700 bg-purple-100 border-purple-200' }
              }[topic.id] || { icon: '📄', color: 'text-slate-700 bg-slate-100 border-slate-200' };

              return (
                <section key={topic.id} className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-200 pb-2">
                    <span className="text-lg">{topicBadge.icon}</span>
                    <h3 className="text-base sm:text-lg font-heading font-black text-slate-800">
                      {topic.label}
                    </h3>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${topicBadge.color}`}>
                      {topicWorksheets.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                    {topicWorksheets.map((worksheet) => {
                      const isPremiumLocked = worksheet.isKiboClubOnly && !isClubMember;

                      return (
                        <div
                          key={worksheet.id}
                          onClick={() => handleWorksheetClick(worksheet)}
                          className="group bg-white rounded-2xl border-2 border-slate-200/90 hover:border-orange-400 p-3.5 sm:p-5 flex flex-col justify-between gap-3 sm:gap-4 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                        >
                          {/* Top Preview & Header Section */}
                          <div className="space-y-2.5 sm:space-y-3">
                            {/* Document Cover Thumbnail: Hidden/Compact on mobile, full on tablet/desktop */}
                            <div className="hidden sm:flex relative w-full h-32 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-2.5 overflow-hidden shadow-inner flex-col justify-between group-hover:bg-orange-50/40 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className="w-4 h-4 rounded-md overflow-hidden shrink-0"
                                    dangerouslySetInnerHTML={{ __html: KIBO_RED_PANDA_FAVICON_SVG }}
                                  />
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    {worksheet.subject} Practice
                                  </span>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200">
                                  16 Qs + Key
                                </span>
                              </div>

                              <div className="space-y-0.5 text-center my-auto px-1">
                                <p className="text-xs font-black text-slate-800 line-clamp-1">
                                  {worksheet.title}
                                </p>
                                <div className="flex justify-center gap-2 text-[8px] font-mono text-slate-400">
                                  <span>1. ___</span>
                                  <span>2. ___</span>
                                  <span>3. ___</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 border-t border-slate-200/60 pt-0.5">
                                <span>Page 1: Drill</span>
                                <span>Page 2: Answer Key</span>
                              </div>
                            </div>

                            {/* Pill Badges Row */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                  worksheet.isKiboClubOnly
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                }`}>
                                  {worksheet.isKiboClubOnly ? '👑 VIP Booster' : 'Free Printable'}
                                </span>
                                {worksheet.isKiboClubOnly && (
                                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                                    + Parent Strategy Guide
                                  </span>
                                )}
                                <span className="sm:hidden text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                                  16 Qs + Key
                                </span>
                              </div>
                              <span className="text-[11px] sm:text-xs font-extrabold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                                {worksheet.gradeLabel}
                              </span>
                            </div>

                            {/* Title & Objective */}
                            <div className="space-y-1">
                              <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                                {worksheet.title}
                              </h4>
                              <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                                {worksheet.desc || worksheet.description}
                              </p>
                            </div>
                          </div>

                          {/* Bottom Action Button */}
                          <div className="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <span className="hidden sm:inline text-[11px] font-bold text-slate-400">
                              Instant PDF Format
                            </span>

                            {worksheet.isKiboClubOnly ? (
                              isClubMember ? (
                                <button
                                  type="button"
                                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-200" />
                                  <span>Download PDF (Member)</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => handleUnlockClick(e, worksheet)}
                                  className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Preview &amp; Unlock VIP</span>
                                </button>
                              )
                            ) : (
                              <button
                                type="button"
                                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Free Printable PDF</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>

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
