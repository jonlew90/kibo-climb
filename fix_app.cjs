const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// Add WordsSessionView import
content = content.replace(
  /import AdaptiveSessionView from '\.\/components\/AdaptiveSessionView';/,
  `import AdaptiveSessionView from './components/AdaptiveSessionView';\nimport WordsSessionView from './components/WordsSessionView';`
);

// Add activeSubject state
content = content.replace(
  /const \[appState, setAppState\] = useState\(\(\) => \{/,
  `const [activeSubject, setActiveSubject] = useState('math');\n\n  const [appState, setAppState] = useState(() => {`
);

// Modify syncAppStateWithStorage to pass activeSubject
content = content.replace(
  /const uData = storageService\.getUserData\(\);/g,
  `const uData = storageService.getUserData(activeSubject);`
);

content = content.replace(
  /const activeUserData = storageService\.getUserData\(\);/g,
  `const activeUserData = storageService.getUserData(activeSubject);`
);


// Replace subject selector UI
const subjectSelectorOld = /<span className="tracking-tight font-black">Kibo Math<\/span>[\s\S]*?<div className="h-px bg-slate-100 w-full" \/>\s*<div className="flex items-center gap-2 px-3 py-2\.5 bg-slate-50 opacity-75 cursor-not-allowed">\s*<div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 border border-indigo-300 flex items-center justify-center shrink-0 opacity-50 grayscale">\s*<span className="text-lg">📚<\/span>\s*<\/div>\s*<div className="flex flex-col">\s*<span className="text-sm font-black text-slate-400 leading-tight">Kibo Words<\/span>\s*<span className="text-\[10px\] font-bold text-indigo-400 uppercase tracking-wider">Coming Soon<\/span>\s*<\/div>\s*<\/div>/;

const subjectSelectorNew = `<span className="tracking-tight font-black">{activeSubject === 'math' ? 'Kibo Math' : 'Kibo Words'}</span>
              <ChevronDown className={\`w-3.5 h-3.5 transition-transform \${showSubjectSelector ? 'rotate-180' : ''}\`} />
            </button>

            {showSubjectSelector && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border-2 border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col">
                <button
                  onClick={() => {
                    soundFx.playKeyTap();
                    setActiveSubject('math');
                    setAppState('adaptive_session');
                    setShowSubjectSelector(false);
                    // trigger resync
                    setTimeout(syncAppStateWithStorage, 0);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 flex items-center justify-center shrink-0">
                    <span className="text-lg">🏔️</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 leading-tight">Kibo Math</span>
                    <span className={\`text-[10px] font-bold \${activeSubject === 'math' ? 'text-emerald-600' : 'text-slate-400'}\`}>{activeSubject === 'math' ? 'Active' : 'Switch'}</span>
                  </div>
                </button>

                <div className="h-px bg-slate-100 w-full" />

                <button
                  onClick={() => {
                    soundFx.playKeyTap();
                    setActiveSubject('words');
                    setAppState('adaptive_session');
                    setShowSubjectSelector(false);
                    setTimeout(syncAppStateWithStorage, 0);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 border border-indigo-300 flex items-center justify-center shrink-0">
                    <span className="text-lg">📚</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 leading-tight">Kibo Words</span>
                    <span className={\`text-[10px] font-bold \${activeSubject === 'words' ? 'text-emerald-600' : 'text-slate-400'}\`}>{activeSubject === 'words' ? 'Active' : 'Switch'}</span>
                  </div>
                </button>`;
content = content.replace(subjectSelectorOld, subjectSelectorNew);

// Replace views rendering based on activeSubject
const adaptiveSessionOld = /\{\/\* PURE ADAPTIVE MASTERY SESSION VIEW \(Default & Fallback Main View\) \*\/\}\s*\{appState === 'adaptive_session' && \([\s\S]*?onOpenWorkshop=\{\(\) => handleOpenWorkshop\('adaptive_session'\)\}\n\s+\/>\n\s+\)\}/;

const adaptiveSessionNew = `{/* PURE ADAPTIVE MASTERY SESSION VIEW (Default & Fallback Main View) */}
      {appState === 'adaptive_session' && activeSubject === 'math' && (
        <AdaptiveSessionView
          key={activeProfileId + '-math'}
          profileId={activeProfileId}
          isPaused={isAppPaused}
          equippedItems={equippedItems}
          sparks={sparks}
          streak={streak}
          userTier={tier}
          totalProblemsSolved={totalProblemsSolved}
          isFTUX={showFirstLaunchOnboardingModal}
          isDoubleSparksActive={isDoubleSparksActive}
          consumables={consumables}
          onToggleDoubleSparksPotion={handleToggleDoubleSparksPotion}
          onConsumeHintScroll={handleConsumeHintScroll}
          onConsumeShield={handleConsumeShield}
          onResetDoubleSparks={() => setIsDoubleSparksActive(false)}
          onIncrementLifetimeProblems={handleIncrementLifetimeProblems}
          onRecordDailyPractice={recordDailyPractice}
          onUpdatePersonalRecords={(newRecords) => setPersonalRecords(newRecords)}
          onUnlockedBadgesChange={(newList) => setUnlockedBadges(newList)}
          onUpdateCompetenceRating={(newRating) => {
            setLiveCompetenceRating(newRating);
            checkAndPromptLinkAccount(
              { rating: newRating },
              setLinkModalMilestone,
              setShowAccountLinkModal
            );
          }}
          onAwardSparks={(earned) => {
            const updated = sparks + earned;
            setSparks(updated);
            localStorage.setItem('kibo_math_sparks', updated.toString());
          }}
          onOpenWorkshop={() => handleOpenWorkshop('adaptive_session')}
        />
      )}

      {appState === 'adaptive_session' && activeSubject === 'words' && (
        <WordsSessionView
          key={activeProfileId + '-words'}
          profileId={activeProfileId}
          isPaused={isAppPaused}
          equippedItems={equippedItems}
          sparks={sparks}
          streak={streak}
          userTier={tier}
          totalProblemsSolved={totalProblemsSolved}
          isFTUX={showFirstLaunchOnboardingModal}
          isDoubleSparksActive={isDoubleSparksActive}
          consumables={consumables}
          onToggleDoubleSparksPotion={handleToggleDoubleSparksPotion}
          onConsumeHintScroll={handleConsumeHintScroll}
          onConsumeShield={handleConsumeShield}
          onResetDoubleSparks={() => setIsDoubleSparksActive(false)}
          onIncrementLifetimeProblems={handleIncrementLifetimeProblems}
          onRecordDailyPractice={recordDailyPractice}
          onUpdatePersonalRecords={(newRecords) => setPersonalRecords(newRecords)}
          onUnlockedBadgesChange={(newList) => setUnlockedBadges(newList)}
          onUpdateCompetenceRating={(newRating) => {
            setLiveCompetenceRating(newRating);
            checkAndPromptLinkAccount(
              { rating: newRating },
              setLinkModalMilestone,
              setShowAccountLinkModal
            );
          }}
          onAwardSparks={(earned) => {
            const updated = sparks + earned;
            setSparks(updated);
            localStorage.setItem('kibo_math_sparks', updated.toString());
          }}
          onOpenWorkshop={() => handleOpenWorkshop('adaptive_session')}
        />
      )}`;

content = content.replace(adaptiveSessionOld, adaptiveSessionNew);


// Handle active subject saves for general saveUserData calls
content = content.replace(/storageService\.saveUserData\(\{\s+streak: currentStreak,\s+lastSprintDate: todayStr\s+\}\);/g, "storageService.saveUserData({ streak: currentStreak, lastSprintDate: todayStr }, activeSubject);");
content = content.replace(/storageService\.saveUserData\(\{\s+streak: nextStreak,\s+lastSprintDate: todayStr\s+\}\);/g, "storageService.saveUserData({ streak: nextStreak, lastSprintDate: todayStr }, activeSubject);");

content = content.replace(/storageService\.saveUserData\(\{\s+totalProblemsSolved: nextTotal,\s+cumulativeCorrectStreak: nextStreak,\s+personalRecords: nextRecords,/g, "storageService.saveUserData({\n      totalProblemsSolved: nextTotal,\n      cumulativeCorrectStreak: nextStreak,\n      personalRecords: nextRecords,");
content = content.replace(/\.\.\.\(newlyCalibrated \? \{ baselineRating: newBaseline, isCalibrated: true \} : \{\}\)\n\s+\}\);/g, "...(newlyCalibrated ? { baselineRating: newBaseline, isCalibrated: true } : {})\n    }, activeSubject);");


content = content.replace(/storageService\.saveUserData\(\{ streak: savedStreak \}\);/g, "storageService.saveUserData({ streak: savedStreak }, activeSubject);");
content = content.replace(/storageService\.saveUserData\(\{ streak: 0 \}\);/g, "storageService.saveUserData({ streak: 0 }, activeSubject);");

fs.writeFileSync('src/App.jsx', content);
