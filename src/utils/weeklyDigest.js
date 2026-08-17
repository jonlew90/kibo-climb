/**
 * Weekly Progress Digest Generator
 * Generates and formats multi-subject weekly progress summaries
 * across all active subjects (Math, Words, etc.) for a child profile.
 */

import { SUBJECTS_CONFIG } from '../config/subjects.js';
import { getCompetenceRankTier } from './GameEconomyModel.js';
import { getGradeLevelFromRating, getTierFromRating } from './mathCurriculum.js';
import { calculateAdaptiveCompetenceProfile } from './domainStats.js';

/**
 * Extracts and compiles multi-subject weekly performance metrics for a profile.
 *
 * @param {Object} profile - Full profile object from storageService.getProfileById or storageService.getActiveProfile
 * @param {Object} [subjectsConfig=SUBJECTS_CONFIG] - Config map of active subjects
 * @returns {Object} Compiled digest data with overall and per-subject breakdown
 */
export function generateWeeklyDigestData(profile, subjectsConfig = SUBJECTS_CONFIG) {
  const userData = profile?.userData || {};
  const childName = profile?.username || profile?.name || 'Kibo Climber';
  const childGrade = profile?.gradeLevel || 'Grade 1–2';
  const streak = userData.streak ?? 0;
  const sparks = userData.sparks ?? 0;
  const unlockedBadges = userData.unlockedBadges || [];

  const subjectKeys = Object.keys(subjectsConfig || { math: {}, words: {} });

  let totalProblemsThisWeek = 0;
  let totalProblemsAllTime = 0;
  let totalTimeSecThisWeek = 0;

  const now = new Date();

  const subjectsStats = subjectKeys.map((subjectId) => {
    const config = subjectsConfig[subjectId] || {};
    const subData = userData.subjects?.[subjectId] || (subjectId === 'math' ? userData : {}) || {};

    const rating = subData.adaptiveCompetenceRating || (subjectId === 'math' ? userData.adaptiveCompetenceRating : 1000) || 1000;
    const rankTitle = getCompetenceRankTier(rating, subjectId);
    const tier = subData.tier ?? (subjectId === 'math' ? (userData.tier ?? 1) : 1);
    const gradeLevel = getGradeLevelFromRating(rating);
    const totalSolved = subData.totalProblemsSolved ?? (subjectId === 'math' ? (userData.totalProblemsSolved ?? 0) : 0);
    totalProblemsAllTime += totalSolved;

    const sprintHistory = subData.sprintHistory || (subjectId === 'math' ? (userData.sprintHistory || []) : []);

    // Filter sprints in the past 7 days (or fallback to the last 10 sprints if timestamps not present)
    const recentSprints = sprintHistory.filter((s) => {
      if (!s.date) return false;
      const sprintDate = new Date(s.date);
      return (now - sprintDate) / (1000 * 60 * 60 * 24) <= 7;
    });

    const sprintsToAnalyze = recentSprints.length > 0 ? recentSprints : sprintHistory.slice(0, 10);

    let solvedThisWeek = 0;
    let correctCountThisWeek = 0;
    let totalTimeThisWeek = 0;

    sprintsToAnalyze.forEach((sprint) => {
      const qCount = Number(sprint.totalQuestions || (sprint.answers ? sprint.answers.length : 12));
      const cCount = Number(sprint.correctCount || sprint.score || 0);
      const dur = Number(sprint.totalTimeSec || sprint.durationInSeconds || 0);

      solvedThisWeek += qCount;
      correctCountThisWeek += cCount;
      totalTimeThisWeek += dur;
    });

    totalProblemsThisWeek += solvedThisWeek;
    totalTimeSecThisWeek += totalTimeThisWeek;

    const accuracyPct = solvedThisWeek > 0 ? Math.round((correctCountThisWeek / solvedThisWeek) * 100) : null;
    const avgLatencySec = solvedThisWeek > 0 ? (totalTimeThisWeek / solvedThisWeek).toFixed(1) : null;

    // Calculate mastered topics & in-progress topics
    const adaptiveProfile = calculateAdaptiveCompetenceProfile(
      sprintHistory,
      tier,
      rating,
      userData.ratingHistory || [],
      subjectId
    );

    const masteredTopics = Object.values(adaptiveProfile.skillStrandBreakdown || {})
      .filter((s) => s.status === 'Mastered')
      .map((s) => s.strandName || s.name);

    const practicingTopics = Object.values(adaptiveProfile.skillStrandBreakdown || {})
      .filter((s) => s.status === 'Practicing' || s.status === 'Challenged')
      .map((s) => s.strandName || s.name);

    return {
      subjectId,
      name: config.name || subjectId,
      icon: config.icon || (subjectId === 'words' ? '📖' : (subjectId === 'science' ? '🧪' : (subjectId === 'coding' ? '💻' : '🔢'))),
      rating,
      rankTitle,
      tier,
      gradeLevel,
      totalSolved,
      solvedThisWeek,
      accuracyPct,
      avgLatencySec,
      totalTimeThisWeekSec: totalTimeThisWeek,
      masteredTopics,
      practicingTopics
    };
  });

  return {
    childName,
    childGrade,
    streak,
    sparks,
    unlockedBadgesCount: unlockedBadges.length,
    unlockedBadges,
    totalProblemsThisWeek,
    totalProblemsAllTime,
    totalTimeSecThisWeek,
    subjects: subjectsStats,
    generatedAt: now.toISOString()
  };
}

/**
 * Formats multi-subject weekly digest data as plain text.
 */
export function formatWeeklyDigestText({ childName, digestData }) {
  const data = digestData;
  const name = childName || data.childName || 'Kibo Climber';

  let text = `Hi there!\n\nHere is the Weekly Progress Summary for ${name}:\n\n`;
  text += `🔥 DAILY STREAK: ${data.streak} ${data.streak === 1 ? 'Day' : 'Days'}\n`;
  text += `⚡ Sparks: ${data.sparks}\n`;
  text += `🏆 Badges Unlocked: ${data.unlockedBadgesCount} total\n`;
  text += `📈 Total Questions Completed This Week: ${data.totalProblemsThisWeek}\n\n`;

  data.subjects.forEach((sub) => {
    const unitLabel = sub.subjectId === 'words' ? 'words' : 'problems';
    text += `========================================\n`;
    text += `${sub.icon} ${sub.name.toUpperCase()} PERFORMANCE\n`;
    text += `• Skill Rating: ${sub.rating} (${sub.rankTitle} · Tier ${sub.tier})\n`;
    text += `• ${sub.name} Solved: ${sub.solvedThisWeek} this week (${sub.totalSolved} total)\n`;
    if (sub.accuracyPct !== null) {
      text += `• Recent Accuracy: ${sub.accuracyPct}%\n`;
    }
    if (sub.avgLatencySec !== null) {
      text += `• Avg Recall Latency: ${sub.avgLatencySec}s per ${unitLabel.slice(0, -1)}\n`;
    }
    text += `• Mastered Topics: ${sub.masteredTopics.length > 0 ? sub.masteredTopics.join(', ') : 'Building fundamentals'}\n`;
    if (sub.practicingTopics.length > 0) {
      text += `• Active Practice: ${sub.practicingTopics.join(', ')}\n`;
    }
    text += `\n`;
  });

  text += `========================================\n`;
  text += `Keep up the fantastic progress across all subjects! 🚀`;

  return text;
}

/**
 * Formats multi-subject weekly digest data into clean, responsive HTML email.
 */
export function formatWeeklyDigestHtml({ childName, digestData }) {
  const data = digestData;
  const name = childName || data.childName || 'Kibo Climber';

  const subjectsHtml = data.subjects
    .map((sub) => {
      const unitLabel = sub.subjectId === 'words' ? 'Words' : 'Problems';
      const masteredList = sub.masteredTopics.length > 0
        ? sub.masteredTopics.map((t) => `<li style="margin: 4px 0; color: #166534; font-size: 13px;">✅ ${t}</li>`).join('')
        : `<li style="margin: 4px 0; color: #64748b; font-size: 13px; font-style: italic;">Building initial subject foundations</li>`;

      const practicingList = sub.practicingTopics.length > 0
        ? sub.practicingTopics.map((t) => `<li style="margin: 4px 0; color: #1e293b; font-size: 13px;">🎯 ${t}</li>`).join('')
        : `<li style="margin: 4px 0; color: #64748b; font-size: 13px; font-style: italic;">Ready for next topic climb</li>`;

      return `
      <div style="background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 20px; text-align: left;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 14px;">
          <h3 style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 800;">
            <span style="font-size: 18px; margin-right: 6px;">${sub.icon}</span> ${sub.name} Performance
          </h3>
          <span style="background-color: #f3e8ff; color: #6b21a8; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 20px; border: 1px solid #e9d5ff;">
            Rating: ${sub.rating}
          </span>
        </div>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
          <tr>
            <td width="50%" style="padding: 6px 0; vertical-align: top;">
              <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">Rank & Tier</span>
              <strong style="font-size: 14px; color: #1e293b;">${sub.rankTitle} (Tier ${sub.tier})</strong>
            </td>
            <td width="50%" style="padding: 6px 0; vertical-align: top;">
              <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">${unitLabel} Solved</span>
              <strong style="font-size: 14px; color: #1e293b;">${sub.solvedThisWeek} this week <span style="font-size: 12px; color: #64748b; font-weight: 500;">(${sub.totalSolved} total)</span></strong>
            </td>
          </tr>
          <tr>
            <td width="50%" style="padding: 6px 0; vertical-align: top;">
              <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">Recent Accuracy</span>
              <strong style="font-size: 14px; color: ${sub.accuracyPct >= 80 ? '#16a34a' : (sub.accuracyPct >= 60 ? '#d97706' : '#dc2626')};">${sub.accuracyPct !== null ? `${sub.accuracyPct}%` : 'Calibrating'}</strong>
            </td>
            <td width="50%" style="padding: 6px 0; vertical-align: top;">
              <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">Avg Recall Latency</span>
              <strong style="font-size: 14px; color: #0284c7;">${sub.avgLatencySec !== null ? `${sub.avgLatencySec}s / item` : 'N/A'}</strong>
            </td>
          </tr>
        </table>

        <div style="background-color: #f8fafc; border-radius: 10px; padding: 12px; margin-top: 8px;">
          <strong style="font-size: 12px; color: #334155; text-transform: uppercase; display: block; margin-bottom: 6px;">Mastered Topics</strong>
          <ul style="margin: 0; padding-left: 18px;">
            ${masteredList}
          </ul>
          
          <strong style="font-size: 12px; color: #334155; text-transform: uppercase; display: block; margin-top: 10px; margin-bottom: 6px;">Active Practice Focus</strong>
          <ul style="margin: 0; padding-left: 18px;">
            ${practicingList}
          </ul>
        </div>
      </div>
    `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Progress Summary for ${name}</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 28px 32px; text-align: left;">
              <span style="font-size: 28px;">🏔️</span>
              <h1 style="margin: 8px 0 0 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Kibo Climb Weekly Progress</h1>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px; font-weight: 500;">Multi-Subject Mastery Digest for <strong>${name}</strong></p>
            </td>
          </tr>

          <!-- OVERALL STATS RIBBON -->
          <tr>
            <td style="background-color: #faf5ff; border-bottom: 2px solid #f3e8ff; padding: 16px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 0 8px;">
                    <span style="font-size: 18px;">🔥</span>
                    <div style="font-size: 16px; font-weight: 900; color: #d97706;">${data.streak} Days</div>
                    <div style="font-size: 10px; font-weight: 700; color: #78350f; text-transform: uppercase;">Active Streak</div>
                  </td>
                  <td align="center" style="padding: 0 8px; border-left: 1px solid #e9d5ff; border-right: 1px solid #e9d5ff;">
                    <span style="font-size: 18px;">⚡</span>
                    <div style="font-size: 16px; font-weight: 900; color: #7c3aed;">${data.totalProblemsThisWeek}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #581c87; text-transform: uppercase;">Weekly Items</div>
                  </td>
                  <td align="center" style="padding: 0 8px;">
                    <span style="font-size: 18px;">🏆</span>
                    <div style="font-size: 16px; font-weight: 900; color: #0284c7;">${data.unlockedBadgesCount}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #0c4a6e; text-transform: uppercase;">Badges Won</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- SUBJECTS CONTENT -->
          <tr>
            <td style="padding: 24px 32px 16px 32px; background-color: #f8fafc;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 800; text-align: left;">All Active Subjects' Stats</h2>
              ${subjectsHtml}
              <p style="margin: 16px 0 0 0; color: #64748b; font-size: 12px; line-height: 1.5; text-align: center;">
                You are receiving this summary because Weekly Digest is enabled in your Kibo Climb Parent Zone.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #ffffff; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © ${new Date().getFullYear()} Kibo Climb. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
