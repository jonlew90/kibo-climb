import { describe, it, expect } from 'vitest';
import { generateWeeklyDigestData, formatWeeklyDigestText, formatWeeklyDigestHtml } from '../src/utils/weeklyDigest.js';
import { SUBJECTS_CONFIG } from '../src/config/subjects.js';

describe('Weekly Progress Digest Reports (Kibo Club vs Basic)', () => {
  const mockChildProfile = {
    id: 'child_test_vip',
    name: 'Maya Explorer',
    username: 'MayaExplorer',
    gradeLevel: 'Grade 3–4',
    userData: {
      streak: 6,
      sparks: 420,
      unlockedBadges: ['speed_star', 'math_pro'],
      subjects: {
        math: {
          adaptiveCompetenceRating: 1420,
          competenceRank: 1420,
          tier: 3,
          totalProblemsSolved: 60,
          sprintHistory: [
            {
              date: new Date().toISOString(),
              totalQuestions: 12,
              correctCount: 10,
              totalTimeSec: 45,
              tier: 3,
              answers: [
                { tier: 3, isCorrect: true, responseTimeSec: 3.5 },
                { tier: 3, isCorrect: false, isSkip: true, responseTimeSec: 2.1 }, // Immediate skip (<3s) -> Avoidance / bottleneck
                { tier: 3, isCorrect: true, responseTimeSec: 4.0 }
              ]
            }
          ],
          skipLogs: [
            { concept: 'Fractions & GCF/LCM', timeElapsedSec: 2.1, timestamp: new Date().toISOString() },
            { concept: 'Fractions & GCF/LCM', timeElapsedSec: 1.8, timestamp: new Date().toISOString() },
            { concept: 'Fractions & GCF/LCM', timeElapsedSec: 2.5, timestamp: new Date().toISOString() } // 3 immediate skips -> bottleneck trigger
          ]
        }
      }
    }
  };

  it('generates rich diagnostic bottleneck insights for Kibo Club members', () => {
    const clubDigest = generateWeeklyDigestData(mockChildProfile, SUBJECTS_CONFIG, 'https://kiboclimb.com', {
      isKiboClub: true
    });

    expect(clubDigest.isKiboClub).toBe(true);
    expect(clubDigest.hasAdvancedInsightsLocked).toBe(false);
    expect(clubDigest.totalTimeMinThisWeek).toBeGreaterThanOrEqual(0);

    const mathSub = clubDigest.subjects.find((s) => s.subjectId === 'math');
    expect(mathSub).toBeDefined();
    expect(mathSub.clubInsights).not.toBeNull();
    expect(mathSub.clubInsights.insightCards.length).toBeGreaterThan(0);
    expect(mathSub.clubInsights.hasBottlenecks).toBe(true);

    const bottleneck = mathSub.clubInsights.insightCards.find((c) => c.type === 'bottleneck');
    expect(bottleneck).toBeDefined();
    expect(bottleneck.title).toContain('Topic Bottleneck');

    // Formats into text digest with club tag and insights
    const textDigest = formatWeeklyDigestText({ childName: 'Maya Explorer', digestData: clubDigest });
    expect(textDigest).toContain('👑 [KIBO CLUB]');
    expect(textDigest).toContain('👑 KIBO CLUB DEEP DIAGNOSTIC INSIGHTS');
    expect(textDigest).toContain('Topic Bottleneck: Fractions & GCF/LCM');

    // Formats into HTML email with club badges and insights
    const htmlDigest = formatWeeklyDigestHtml({ childName: 'Maya Explorer', digestData: clubDigest });
    expect(htmlDigest).toContain('👑 Kibo Club');
    expect(htmlDigest).toContain('Kibo Club Diagnostic Insights');
    expect(htmlDigest).not.toContain('Unlock Deep Diagnostic Insights with Kibo Club');
  });

  it('securely omits sensitive child diagnostic payload and locks teaser for non-club parents', () => {
    const nonClubDigest = generateWeeklyDigestData(mockChildProfile, SUBJECTS_CONFIG, 'https://kiboclimb.com', {
      isKiboClub: false
    });

    expect(nonClubDigest.isKiboClub).toBe(false);
    expect(nonClubDigest.hasAdvancedInsightsLocked).toBe(true);

    const mathSub = nonClubDigest.subjects.find((s) => s.subjectId === 'math');
    expect(mathSub).toBeDefined();
    // Payload security: diagnostic cards must NOT exist in the data tree for non-club users
    expect(mathSub.clubInsights).toBeNull();

    // Formats into text digest with teaser notice
    const textDigest = formatWeeklyDigestText({ childName: 'Maya Explorer', digestData: nonClubDigest });
    expect(textDigest).not.toContain('👑 [KIBO CLUB]');
    expect(textDigest).not.toContain('👑 KIBO CLUB DEEP DIAGNOSTIC INSIGHTS');
    expect(textDigest).toContain('👑 KIBO CLUB PREVIEW:');

    // Formats into HTML email with secure blurred teaser banner
    const htmlDigest = formatWeeklyDigestHtml({ childName: 'Maya Explorer', digestData: nonClubDigest });
    expect(htmlDigest).toContain('Unlock Deep Learning Insights with Kibo Club');
    expect(htmlDigest).toContain('Sample Bottleneck Alert');
    expect(htmlDigest).not.toContain('Topic Bottleneck: Fractions & GCF/LCM');
  });
});
