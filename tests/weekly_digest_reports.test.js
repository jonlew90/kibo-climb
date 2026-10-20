import { describe, it, expect, vi } from 'vitest';

vi.mock('firebase-functions/v2/https', () => ({
  onCall: (opts, handler) => (handler || opts),
  onRequest: (opts, handler) => (handler || opts),
  HttpsError: class extends Error {}
}));
vi.mock('firebase-functions/v2/scheduler', () => ({
  onSchedule: (opts, handler) => (handler || opts)
}));
vi.mock('firebase-functions/params', () => ({
  defineSecret: (name) => name
}));
vi.mock('resend', () => ({
  Resend: class {
    constructor() {
      this.emails = { send: vi.fn() };
    }
  }
}));

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
  });

  it('builds a consolidated multi-child family digest email for parents with multiple profiles', async () => {
    const { buildScheduledFamilyDigestHtml, buildScheduledDigestHtml } = await import('../functions/index.js');

    const mockChild1 = {
      childName: 'ThrivingKangaroo389',
      pid: 'prof_kangaroo',
      profile: {
        username: 'ThrivingKangaroo389',
        gradeLevel: 'Grade 3–4',
        userData: {
          streak: 5,
          sparks: 310,
          unlockedBadges: ['speed_star', 'math_pro'],
          subjects: {
            math: {
              adaptiveCompetenceRating: 1350,
              tier: 3,
              totalProblemsSolved: 45,
              sprintHistory: [
                {
                  date: new Date().toISOString(),
                  totalQuestions: 15,
                  correctCount: 14,
                  tier: 3
                }
              ]
            }
          }
        }
      }
    };

    const mockChild2 = {
      childName: 'EpicPioneer92',
      pid: 'prof_pioneer',
      profile: {
        username: 'EpicPioneer92',
        gradeLevel: 'Grade 1–2',
        userData: {
          streak: 8,
          sparks: 520,
          unlockedBadges: ['streak_master'],
          subjects: {
            math: {
              adaptiveCompetenceRating: 1200,
              tier: 2,
              totalProblemsSolved: 30,
              sprintHistory: [
                {
                  date: new Date().toISOString(),
                  totalQuestions: 10,
                  correctCount: 9,
                  tier: 2
                }
              ]
            }
          }
        }
      }
    };

    // Test single child digest
    const singleHtml = buildScheduledDigestHtml({
      childName: mockChild1.childName,
      profile: mockChild1.profile,
      profileId: mockChild1.pid,
      isKiboClub: false
    });
    expect(singleHtml).toContain('ThrivingKangaroo389');
    expect(singleHtml).not.toContain('EpicPioneer92');
    expect(singleHtml).toContain('Weekly Progress Summary for <strong>ThrivingKangaroo389</strong>');

    // Test consolidated family digest
    const familyHtml = buildScheduledFamilyDigestHtml({
      children: [mockChild1, mockChild2],
      isKiboClub: false
    });

    // Contains both climbers
    expect(familyHtml).toContain('ThrivingKangaroo389');
    expect(familyHtml).toContain('EpicPioneer92');
    expect(familyHtml).toContain('Family Progress Summary · <strong>2 Climbers</strong>');
    expect(familyHtml).toContain('ThrivingKangaroo389 & EpicPioneer92');

    // Combines family totals: top streak = 8, family solved = 15 + 10 = 25, badges = 2 + 1 = 3
    expect(familyHtml).toContain('8 Days');
    expect(familyHtml).toContain('Top Streak');
    expect(familyHtml).toContain('25');
    expect(familyHtml).toContain('Family Solved');
    expect(familyHtml).toContain('3');
    expect(familyHtml).toContain('Total Badges');

    // Per-child profile links
    expect(familyHtml).toContain('profile=prof_kangaroo');
    expect(familyHtml).toContain('profile=prof_pioneer');
  });
});

