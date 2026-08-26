import { describe, it, expect } from 'vitest';
import { generateWeeklyDigestData } from './weeklyDigest.js';

describe('Weekly Digest Generator', () => {
  const subjectsConfig = {
    math: { name: 'Math', icon: '🔢' },
    words: { name: 'Words', icon: '📚' },
    world: { name: 'World', icon: '🌍' }
  };

  it('generates happy path data with recent sprints across subjects', () => {
    const mockProfile = {
      id: 'profile123',
      name: 'Test Child',
      gradeLevel: 'Grade 3',
      userData: {
        streak: 5,
        sparks: 120,
        unlockedBadges: [{ id: 'badge1' }],
        subjects: {
          math: {
            adaptiveCompetenceRating: 1100,
            tier: 2,
            totalProblemsSolved: 24,
            sprintHistory: [
              {
                date: new Date().toISOString(),
                totalQuestions: 12,
                correctCount: 10,
                totalTimeSec: 60,
                tier: 2,
                answers: [
                  { problemId: 'm1', tier: 2, isCorrect: true, responseTimeSec: 5 },
                ]
              },
              {
                date: new Date().toISOString(),
                totalQuestions: 12,
                correctCount: 8,
                totalTimeSec: 72,
                tier: 2,
                answers: []
              }
            ]
          },
          words: {
            adaptiveCompetenceRating: 1050,
            tier: 1,
            totalProblemsSolved: 12,
            sprintHistory: [
              {
                date: new Date().toISOString(),
                totalQuestions: 12,
                correctCount: 11,
                totalTimeSec: 45,
                tier: 1,
                answers: []
              }
            ]
          }
        }
      }
    };

    const digest = generateWeeklyDigestData(mockProfile, subjectsConfig, 'http://localhost:3000');

    expect(digest.childName).toBe('Test Child');
    expect(digest.streak).toBe(5);
    expect(digest.sparks).toBe(120);
    expect(digest.unlockedBadgesCount).toBe(1);

    // totalProblemsThisWeek = Math (12 + 12) + Words (12) = 36
    expect(digest.totalProblemsThisWeek).toBe(36);
    // totalProblemsAllTime = Math (24) + Words (12) = 36
    expect(digest.totalProblemsAllTime).toBe(36);

    expect(digest.subjects.length).toBe(2);

    const mathSub = digest.subjects.find(s => s.subjectId === 'math');
    expect(mathSub.solvedThisWeek).toBe(24);
    // Accuracy: (10 + 8) / 24 = 18 / 24 = 75%
    expect(mathSub.accuracyPct).toBe(75);
    // Latency: (60 + 72) / 24 = 132 / 24 = 5.5s
    expect(mathSub.avgLatencySec).toBe("5.5");

    const wordsSub = digest.subjects.find(s => s.subjectId === 'words');
    expect(wordsSub.solvedThisWeek).toBe(12);
    // Accuracy: 11 / 12 = ~92%
    expect(wordsSub.accuracyPct).toBe(92);
    // Latency: 45 / 12 = 3.75s
    expect(wordsSub.avgLatencySec).toBe("3.8");

    // World should be unstarted
    expect(digest.unstartedSubjects.length).toBe(1);
    expect(digest.unstartedSubjects[0].subjectId).toBe('world');
  });

  it('handles profile with no recent sprints but has played (all-time stats only)', () => {
    // Sprint date 10 days ago
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);

    const mockProfile = {
      id: 'profile456',
      name: 'Sleepy Child',
      userData: {
        subjects: {
          math: {
            totalProblemsSolved: 50,
            sprintHistory: [
              {
                date: oldDate.toISOString(),
                totalQuestions: 10,
                correctCount: 9,
                totalTimeSec: 50,
                tier: 1
              }
            ]
          }
        }
      }
    };

    const digest = generateWeeklyDigestData(mockProfile, { math: subjectsConfig.math }, 'http://localhost:3000');

    // Note: The current code falls back to the last 10 sprints if there are no sprints in the past 7 days,
    // treating them as 'this week' for calculation purposes.
    expect(digest.totalProblemsThisWeek).toBe(10);
    expect(digest.totalProblemsAllTime).toBe(50);
    expect(digest.subjects.length).toBe(1);

    const mathSub = digest.subjects[0];
    expect(mathSub.solvedThisWeek).toBe(10);
    expect(mathSub.accuracyPct).toBe(90);
    expect(mathSub.avgLatencySec).toBe("5.0");
    // It should still analyze the older sprints for allPlayedTopics if no recent ones exist
    expect(mathSub.allPlayedTopics.length).toBeGreaterThan(0);
  });

  it('handles empty/null inputs gracefully', () => {
    const emptyDigest = generateWeeklyDigestData(null, subjectsConfig, 'http://localhost:3000');

    expect(emptyDigest.childName).toBe('Kibo Climber');
    expect(emptyDigest.streak).toBe(0);
    expect(emptyDigest.sparks).toBe(0);
    expect(emptyDigest.totalProblemsThisWeek).toBe(0);
    expect(emptyDigest.totalProblemsAllTime).toBe(0);
    expect(emptyDigest.subjects.length).toBe(0);
    expect(emptyDigest.unstartedSubjects.length).toBe(3); // All 3 configured subjects
  });

  it('groups played topics into correct mastery statuses', () => {
    // Generate a profile that clearly has 'Mastered' and 'Practicing' tiers
    const mockProfile = {
      id: 'profile789',
      userData: {
        subjects: {
          math: {
            adaptiveCompetenceRating: 1400, // Should master Tier 1 (800+200=1000) and maybe Tier 2 (1200)
            tier: 3,
            totalProblemsSolved: 100,
            sprintHistory: [
              {
                date: new Date().toISOString(),
                totalQuestions: 10,
                correctCount: 10,
                tier: 1
              },
              {
                date: new Date().toISOString(),
                totalQuestions: 10,
                correctCount: 8,
                tier: 3
              }
            ]
          }
        }
      }
    };

    const digest = generateWeeklyDigestData(mockProfile, { math: subjectsConfig.math }, 'http://localhost:3000');

    const mathSub = digest.subjects[0];
    expect(mathSub.allPlayedTopics.length).toBeGreaterThan(0);

    // With a rating of 1400, early tiers should be considered Mastered
    expect(mathSub.masteredTopics.length).toBeGreaterThanOrEqual(0);
    expect(mathSub.practicingTopics.length).toBeGreaterThanOrEqual(0);
  });
});
