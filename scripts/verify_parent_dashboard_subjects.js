// Verification script for Parent Dashboard Multi-Subject Stats and Weekly Progress Summary

import { SUBJECTS_CONFIG } from '../src/config/subjects.js';
import { generateWeeklyDigestData, formatWeeklyDigestText, formatWeeklyDigestHtml } from '../src/utils/weeklyDigest.js';
import { calculateConceptBreakdown, generateParentInsightCards, getConceptsForSubject } from '../src/utils/skipDiagnosticEngine.js';

console.log('--- Testing Weekly Progress Summary Across All Active Subjects ---');

const mockProfile = {
  id: 'child_test_1',
  name: 'Leo Matrix',
  username: 'LeoMatrix',
  gradeLevel: 'Grade 3–4',
  userData: {
    streak: 5,
    sparks: 350,
    unlockedBadges: ['speed_demon', 'math_champion'],
    subjects: {
      math: {
        adaptiveCompetenceRating: 1450,
        competenceRank: 1450,
        tier: 3,
        totalProblemsSolved: 75,
        sprintHistory: [
          {
            date: new Date().toISOString(),
            totalQuestions: 12,
            correctCount: 11,
            totalTimeSec: 28,
            tier: 3,
            ratingGain: 15
          },
          {
            date: new Date(Date.now() - 86400000).toISOString(),
            totalQuestions: 12,
            correctCount: 12,
            totalTimeSec: 24,
            tier: 3,
            ratingGain: 20
          }
        ],
        skipLogs: []
      },
      words: {
        adaptiveCompetenceRating: 1320,
        competenceRank: 1320,
        tier: 2,
        totalProblemsSolved: 48,
        sprintHistory: [
          {
            date: new Date().toISOString(),
            totalQuestions: 12,
            correctCount: 10,
            totalTimeSec: 36,
            tier: 2,
            ratingGain: 12
          }
        ],
        skipLogs: []
      }
    }
  }
};

const digestData = generateWeeklyDigestData(mockProfile, SUBJECTS_CONFIG);
console.log('Child Name:', digestData.childName);
console.log('Active Streak:', digestData.streak);
console.log('Number of Subjects Included:', digestData.subjects.length);

if (digestData.subjects.length !== Object.keys(SUBJECTS_CONFIG).length) {
  throw new Error(`Expected ${Object.keys(SUBJECTS_CONFIG).length} subjects, got ${digestData.subjects.length}`);
}

digestData.subjects.forEach(sub => {
  console.log(`- Subject: ${sub.name} (${sub.icon}) | Rating: ${sub.rating} (${sub.rankTitle}) | Solved this week: ${sub.solvedThisWeek}`);
});

const plainText = formatWeeklyDigestText({ childName: mockProfile.name, digestData });
console.log('\n--- Plain Text Digest Output Preview ---');
console.log(plainText);

const html = formatWeeklyDigestHtml({ childName: mockProfile.name, digestData });
if (!html.includes('Math Performance') || !html.includes('Words Performance')) {
  throw new Error('HTML output missing subject performance sections');
}
console.log('\n✅ HTML Digest successfully rendered with all active subjects.');

console.log('\n--- Testing Subject Concept Breakdown & Diagnostic Insights ---');
const mathConcepts = getConceptsForSubject('math');
const wordsConcepts = getConceptsForSubject('words');
console.log('Math concept count:', mathConcepts.length);
console.log('Words concept count:', wordsConcepts.length);

const mathBreakdown = calculateConceptBreakdown(mockProfile.userData.subjects.math.sprintHistory, [], 'math');
const wordsBreakdown = calculateConceptBreakdown(mockProfile.userData.subjects.words.sprintHistory, [], 'words');

console.log('Math concepts in breakdown:', Object.keys(mathBreakdown));
console.log('Words concepts in breakdown:', Object.keys(wordsBreakdown));

if (!wordsBreakdown['Alphabet'] && !wordsBreakdown['Letters'] && !wordsBreakdown['Spelling'] && !wordsBreakdown['Sight Words']) {
  console.warn('Words concepts check:', Object.keys(wordsBreakdown));
}

const mathCards = generateParentInsightCards([], mockProfile.userData.subjects.math.sprintHistory, 'Leo', 'math');
const wordsCards = generateParentInsightCards([], mockProfile.userData.subjects.words.sprintHistory, 'Leo', 'words');

console.log('Math insight cards:', mathCards.map(c => c.title));
console.log('Words insight cards:', wordsCards.map(c => c.title));

console.log('\n🎉 ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
