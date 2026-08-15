const fs = require('fs');

let content = fs.readFileSync('src/components/WordsSessionView.jsx', 'utf8');

content = content.replace(
  /import { generateProblems } from '\.\.\/utils\/mathGenerator';\nimport { getTierFromRating, generateTierProblem, isNearTierThreshold } from '\.\.\/utils\/mathCurriculum';/,
  `import { generateProblems, generateTierProblem } from '../utils/wordsGenerator';\nimport { getTierFromRating, isNearTierThreshold } from '../utils/wordsCurriculum';\nimport QwertyKeyboard from './QwertyKeyboard';`
);

content = content.replace(/export default function AdaptiveSessionView\(\{/, 'export default function WordsSessionView({');

content = content.replace(/storageService\.getUserData\(\)\.adaptiveCompetenceRating \|\| storageService\.getUserData\(\)\.competenceRank/g, "storageService.getUserData('words').adaptiveCompetenceRating || storageService.getUserData('words').competenceRank");

content = content.replace(/storageService\.getActiveClimbState\(profileId\)/g, "storageService.getActiveClimbState(profileId, 'words')");

content = content.replace(/storageService\.saveActiveClimbState\(climbState, profileId\)/g, "storageService.saveActiveClimbState(climbState, profileId, 'words')");

content = content.replace(/storageService\.clearActiveClimbState\(profileId\)/g, "storageService.clearActiveClimbState(profileId, 'words')");

content = content.replace(/if \(isMoneyQuestion && targetStr\.startsWith\('0\.'\)\) \{\n\s+setInputVal\('0\.'\);\n\s+\} else \{\n\s+setInputVal\(''\);\n\s+\}/, "setInputVal('');");

content = content.replace(/const concept = getConceptForProblem\(currentProblem\);\n\n\s+storageService\.logSkipEvent\(\{\n\s+problemId: currentProblem\.id \|\| `prob_\$\{currentIndex\}`,\n\s+concept: concept,\n\s+timeElapsedSec: Number\(timeElapsedSec\.toFixed\(1\)\),\n\s+consecutiveSkipCount: nextConsecutiveSkips\n\s+\}\);/, "const concept = currentProblem.hint || 'Vocabulary';\n\n    storageService.logSkipEvent({\n      problemId: currentProblem.id || `prob_\${currentIndex}`,\n      concept: concept,\n      timeElapsedSec: Number(timeElapsedSec.toFixed(1)),\n      consecutiveSkipCount: nextConsecutiveSkips\n    }, 'words');");

content = content.replace(/storageService\.saveUserData\(\{\n\s+adaptiveCompetenceRating: evalResult\.nextCompetenceRank,\n\s+competenceRank: evalResult\.nextCompetenceRank\n\s+\}\);/g, "storageService.saveUserData({\n      adaptiveCompetenceRating: evalResult.nextCompetenceRank,\n      competenceRank: evalResult.nextCompetenceRank\n    }, 'words');");

content = content.replace(/const activeUserData = storageService\.getUserData\(\);/g, "const activeUserData = storageService.getUserData('words');");

content = content.replace(/storageService\.saveUserData\(\{ recentSkillMastery: updatedMastery \}\);/g, "storageService.saveUserData({ recentSkillMastery: updatedMastery }, 'words');");

content = content.replace(/storageService\.saveUserData\(\{\n\s+sprintHistory: updatedHistory,\n\s+personalRecords: updatedRecords\n\s+\}\);/g, "storageService.saveUserData({\n        sprintHistory: updatedHistory,\n        personalRecords: updatedRecords\n      }, 'words');");

content = content.replace(/const postBlockUserData = storageService\.getUserData\(\);/g, "const postBlockUserData = storageService.getUserData('words');");

const answerEvaluationOld = `const normUserAns = normalizeTimeAnswer(normalizeDecimal(userAnsString));
    const normTargetAns = normalizeTimeAnswer(normalizeDecimal(currentProblem.answerString || currentProblem.answer?.toString()));

    const userNum = Number(normalizeDecimal(userAnsString));
    const targetNum = Number(normalizeDecimal(currentProblem.answerString || currentProblem.answer));

    const isMoneyMatch =
      isMoneyQuestion &&
      !isNaN(userNum) &&
      !isNaN(targetNum) &&
      (Math.abs(userNum - targetNum) < 0.001 ||
       Math.abs(userNum * 100 - targetNum) < 0.001 ||
       Math.abs(userNum / 100 - targetNum) < 0.001);

    const isNumMatch = !isNaN(userNum) && !isNaN(targetNum) && (userNum === targetNum || Math.abs(userNum - targetNum) < 0.0001);

    const userFracVal = parseFractionValue(userAnsString);
    const targetFracVal = parseFractionValue(currentProblem.answerString || currentProblem.answer);
    const isReductionQuestion = currentProblem.displayString?.toLowerCase().includes('reduce') || currentProblem.operatorSymbol === '⚡';

    const isFractionMatch =
      ((userFracVal !== null && targetFracVal !== null && Math.abs(userFracVal - targetFracVal) < 0.0001) ||
       (userFracVal !== null && !isNaN(targetNum) && Math.abs(userFracVal - targetNum) < 0.0001) ||
       (targetFracVal !== null && !isNaN(userNum) && Math.abs(userNum - targetFracVal) < 0.0001)) &&
      (!isReductionQuestion || normUserAns === normTargetAns);


    // Decimal implicit match (e.g. user typed "62" for "6.2" or "35" for "0.35")
    let isDecimalImplicitMatch = false;
    const targetAnsStr = String(currentProblem.answerString || currentProblem.answer || '');
    if (targetAnsStr.includes('.') && !userAnsString.includes('.')) {
      const decIndex = targetAnsStr.indexOf('.');
      const decPlaces = targetAnsStr.length - decIndex - 1;
      if (decPlaces > 0 && !isNaN(userNum) && !isNaN(targetNum)) {
        const scaledUserVal = userNum / Math.pow(10, decPlaces);
        if (Math.abs(scaledUserVal - targetNum) < 0.0001) {
          isDecimalImplicitMatch = true;
        }
      }
    }

    const isCorrect = normUserAns === normTargetAns || isNumMatch || isMoneyMatch || isFractionMatch || isDecimalImplicitMatch;
    const latencyMs = performance.now() - problemStartTimeRef.current;`;

const answerEvaluationNew = `const normUserAns = userAnsString.trim().toLowerCase();
    const normTargetAns = (currentProblem.answerString || currentProblem.answer || '').toString().toLowerCase();

    const isCorrect = normUserAns === normTargetAns;
    const latencyMs = performance.now() - problemStartTimeRef.current;`;

content = content.replace(answerEvaluationOld, answerEvaluationNew);

const inputHandlerOld = /const handleDigitInput = \(val\) => \{[\s\S]*?setInputVal\(newInput\);\n\s+\};/;
const inputHandlerNew = `const handleCharInput = (val) => {
    if (problemStartTimeRef.current === 0) {
      problemStartTimeRef.current = performance.now();
    }
    soundFx.playKeyTap();

    let newInput = inputVal + val;
    newInput = newInput.trim();

    const normUserAns = newInput.toLowerCase();
    const normTargetAns = (currentProblem.answerString || currentProblem.answer || '').toString().toLowerCase();

    const isCorrect = normUserAns === normTargetAns;

    if (isCorrect) {
      processAnswerEvaluation(newInput);
      return;
    }

    if (newInput.length >= normTargetAns.length) {
       processAnswerEvaluation(newInput);
       return;
    }

    setInputVal(newInput);
  };`;
content = content.replace(inputHandlerOld, inputHandlerNew);

const keyEventsOld = `if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleDeleteDigit();
      } else if (/^[0-9]$/.test(e.key) || e.key === '.' || e.key === ':' || e.key === '/' || e.key === '-') {
        e.preventDefault();
        handleDigitInput(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (inputVal) {
          processAnswerEvaluation(inputVal);
        }
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        processAnswerEvaluation('Yes');
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        processAnswerEvaluation('No');
      }`;

const keyEventsNew = `if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleDeleteDigit();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleCharInput(e.key.toLowerCase());
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (inputVal) {
          processAnswerEvaluation(inputVal);
        }
      }`;
content = content.replace(keyEventsOld, keyEventsNew);

const displayBlockOld = /\(\(\) => \{\n\s+const rawDisplay = currentProblem\.displayString \|\| `\$\{currentProblem\.num1\} \$\{currentProblem\.operatorSymbol\} \$\{currentProblem\.num2\}`;[\s\S]*?\}\)\(\)/;

const displayBlockNew = `(() => {
              const displayStr = currentProblem.displayString || '';
              const targetStr = (currentProblem.answerString || currentProblem.answer || '').toString();

              // Helper to interleave the input with the blanks
              const renderWordDisplay = () => {
                 let inputIndex = 0;
                 return displayStr.split(' ').map((char, index) => {
                     if (char === '_') {
                         const typedChar = inputVal[inputIndex];
                         inputIndex++;
                         return (
                            <span key={index} className="inline-block mx-0.5 w-6 border-b-4 border-slate-400 text-center text-kibo-teal">
                               {typedChar || '\\u00A0'}
                            </span>
                         );
                     } else {
                         return (
                            <span key={index} className="inline-block mx-0.5 w-6 text-center text-slate-800">
                               {char}
                            </span>
                         );
                     }
                 });
              }

              return (
                <div className="space-y-1.5 w-full">
                  <div className="w-full text-center my-2 text-sm sm:text-base leading-tight font-bold text-slate-600">
                     {currentProblem.hint || "Spell the word!"}
                  </div>
                  <div className="w-full flex items-center justify-center flex-wrap my-2 text-2xl sm:text-3xl font-extrabold uppercase">
                     {renderWordDisplay()}
                  </div>

                  {/* INTEGRATED KIBO HINT */}
                  {showFrustrationCard && (
                    <div className="w-full pt-1.5 border-t border-indigo-100 text-[11px] font-bold text-indigo-900 bg-indigo-50/90 p-2 rounded-2xl animate-pop text-center space-y-0.5 mt-1">
                      <span className="block font-black text-indigo-950">💪 Kibo Wisdom Hint:</span>
                      <span className="italic block text-indigo-800">The word starts with "{targetStr.charAt(0).toUpperCase()}"!</span>
                    </div>
                  )}
                </div>
              );
            })()`;

content = content.replace(displayBlockOld, displayBlockNew);

const keypadOld = /\{\/\* NUMERIC KEYPAD \(AUTO-DETECTING & TYPE AWARE\) \*\/\}[\s\S]*?<\/Keypad>\n\s+<\/div>\n\s+\}\)/;
const keypadNew = `{/* QWERTY KEYBOARD */}
      {hasStartedClimb && (
        <div className="w-full max-w-sm shrink-0 animate-pop mt-0.5 sm:mt-2 max-h-[35vh]">
          <QwertyKeyboard
            onChar={handleCharInput}
            onDelete={handleDeleteDigit}
            onClear={handleClearInput}
            onSubmit={(val) => {
              const answerToSubmit = typeof val === 'string' && val.trim() ? val : inputVal;
              processAnswerEvaluation(answerToSubmit);
            }}
          />
        </div>
      )}`;
content = content.replace(keypadOld, keypadNew);

fs.writeFileSync('src/components/WordsSessionView.jsx', content);
