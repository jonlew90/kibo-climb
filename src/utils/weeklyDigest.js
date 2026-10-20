/**
 * Weekly Progress Digest Generator
 * Generates and formats multi-subject weekly progress summaries
 * across all active subjects (Math, Words, etc.) for a child profile.
 */

import { SUBJECTS_CONFIG } from '../config/subjects.js';
import { getCompetenceRankTier } from './GameEconomyModel.js';
import { getTierFromRating, CURRICULUM_TIERS } from './mathCurriculum.js';
import { getGradeLevelForSubject } from './SkillTreeConfig.js';
import { WORDS_CURRICULUM_TIERS } from './wordsCurriculum.js';
import { calculateAdaptiveCompetenceProfile, calculateDomainMastery } from './domainStats.js';
import { calculateConceptBreakdown, generateParentInsightCards } from './skipDiagnosticEngine.js';
import { questService } from '../services/questService.js';

/**
 * Resolves the web app base URL for direct deep-linking in emails and static assets.
 */
export function getAppBaseUrl() {
  if (typeof window !== 'undefined' && window.location && window.location.origin && !window.location.origin.includes('localhost')) {
    return window.location.origin;
  }
  return 'https://kiboclimb.com';
}

/**
 * Extracts and compiles multi-subject weekly performance metrics and played topics for a profile.
 *
 * @param {Object} profile - Full profile object from storageService.getProfileById or storageService.getActiveProfile
 * @param {Object} [subjectsConfig=SUBJECTS_CONFIG] - Config map of active subjects
 * @param {string} [baseUrl] - Base URL for game deep links
 * @returns {Object} Compiled digest data with overall, per-subject breakdown, played topics, and unstarted subjects
 */
export function generateWeeklyDigestData(profile, subjectsConfig = SUBJECTS_CONFIG, baseUrl = getAppBaseUrl(), options = {}) {
  const userData = profile?.userData || {};
  const profileId = profile?.id || 'default';
  const childName = profile?.username || profile?.name || 'Kibo Climber';
  const childGrade = profile?.gradeLevel || 'Grade 1–2';
  const streak = userData.streak ?? 0;
  const sparks = userData.sparks ?? 0;
  const unlockedBadges = userData.unlockedBadges || [];

  // Allow explicit override via options or fallback to profile data / unlockedItems
  const isKiboClub = typeof options.isKiboClub === 'boolean'
    ? options.isKiboClub
    : Boolean(
        userData.isKiboClub ||
        profile?.isKiboClub ||
        profile?.shopState?.unlockedItems?.includes('kibo_club_sub') ||
        profile?.shopState?.unlockedItems?.includes('kibo_club_sub_annual')
      );

  const questState = questService.getQuests(profileId);
  const questLevelInfo = questState?.levelInfo || { level: 1, title: 'Basecamp Explorer', icon: '🏕️', ascentTier: 1, ascentMode: { name: 'Sunny Trailhead' } };
  const questLevel = questLevelInfo.level || 1;
  const questAscentTier = questLevelInfo.ascentTier || 1;
  const questAscentName = questLevelInfo.ascentMode?.name || 'Sunny Trailhead';
  const questTitle = questLevelInfo.title || 'Basecamp Explorer';
  const questIcon = questLevelInfo.icon || '🏕️';
  const questTotalXp = questState?.totalXp || 0;
  const questProgressPct = questLevelInfo.progressPct || 0;
  const questNextRankTitle = questLevelInfo.nextRankTitle || '';

  const subjectKeys = Object.keys(subjectsConfig || { math: {}, words: {} });

  let totalProblemsThisWeek = 0;
  let totalProblemsAllTime = 0;
  let totalTimeSecThisWeek = 0;

  const now = new Date();

  const playedSubjects = [];
  const unstartedSubjects = [];

  subjectKeys.forEach((subjectId) => {
    const config = subjectsConfig[subjectId] || {};
    const subData = userData.subjects?.[subjectId] || (subjectId === 'math' ? userData : {}) || {};

    const rating = subData.adaptiveCompetenceRating || (subjectId === 'math' ? userData.adaptiveCompetenceRating : 1000) || 1000;
    const rankTitle = getCompetenceRankTier(rating, subjectId);
    const tier = subData.tier ?? (subjectId === 'math' ? (userData.tier ?? 1) : 1);
    const gradeLevel = getGradeLevelForSubject(rating, subjectId);
    const totalSolved = subData.totalProblemsSolved ?? (subjectId === 'math' ? (userData.totalProblemsSolved ?? 0) : 0);
    const sprintHistory = subData.sprintHistory || (subjectId === 'math' ? (userData.sprintHistory || []) : []);
    const skipLogs = subData.skipLogs || (subjectId === 'math' ? (userData.skipLogs || []) : []);

    const hasPlayed = totalSolved > 0 || sprintHistory.length > 0;

    if (!hasPlayed) {
      unstartedSubjects.push({
        subjectId,
        name: config.name || subjectId,
        icon: config.icon || (subjectId === 'words' ? '📚' : subjectId === 'world' ? '🌍' : '🔢'),
        description: subjectId === 'words'
          ? 'Build spelling fluency, vocabulary, and phonics climbing through Alphabet Meadow to Syntax Summit.'
          : (subjectId === 'math' ? 'Climb through foundational mental math, multiplication, and algebra.' : 'Explore new learning climbs!'),
        playUrl: `${baseUrl}/${subjectId}?profile=${encodeURIComponent(profileId)}&utm_source=transactional_email&utm_medium=email&utm_campaign=weekly_digest&utm_content=${encodeURIComponent(subjectId)}_unstarted`
      });
      return;
    }

    totalProblemsAllTime += totalSolved;

    // Filter sprints in the past 7 days (or fallback to recent sprints if timestamps not present)
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

    // Calculate domain mastery and adaptive competence profile
    const domainMasteryList = calculateDomainMastery(
      sprintHistory,
      tier,
      rating,
      userData.ratingHistory || [],
      subjectId
    );

    const conceptBreakdown = calculateConceptBreakdown(sprintHistory, skipLogs, subjectId);

    const curriculumCatalog = subjectId === 'words' ? WORDS_CURRICULUM_TIERS : CURRICULUM_TIERS;

    // Find all tiers played in sprints (including individual question tiers from answers)
    const playedTiersSet = new Set();
    (sprintHistory || []).forEach((s) => {
      if (Array.isArray(s.answers) && s.answers.length > 0) {
        s.answers.forEach((ans) => {
          playedTiersSet.add(Number(ans.tier || ans.problemTier || s.tier || 1));
        });
      } else {
        playedTiersSet.add(Number(s.tier) || 1);
      }
    });
    playedTiersSet.add(tier);

    // Build comprehensive list of all played topics
    const allPlayedTopics = [];
    const masteredTopics = [];
    const practicingTopics = [];
    const needsReviewTopics = [];

    domainMasteryList.forEach((dm) => {
      const isAttempted = dm.totalAttempted > 0 || dm.status === 'Mastered' || dm.status === 'Practicing' || dm.status === 'Challenged' || dm.status === 'Needs Review';
      if (isAttempted) {
        // Find matching curriculum tier details
        const matchingTier = curriculumCatalog.find((ct) => dm.tiers ? dm.tiers.includes(ct.tier) : ct.name.toLowerCase().includes(dm.name.toLowerCase()));
        const specificSubTopics = matchingTier?.topics || [dm.subtitle || dm.name];

        const topicSummary = {
          id: dm.id,
          name: dm.name,
          icon: dm.icon || '🌱',
          subtitle: dm.subtitle || '',
          status: dm.status,
          accuracyPct: dm.accuracy,
          totalAttempted: dm.totalAttempted,
          speedSec: dm.speed,
          specificTopics: specificSubTopics,
          recommendation: dm.recommendation
        };

        allPlayedTopics.push(topicSummary);

        if (dm.status === 'Mastered') {
          masteredTopics.push(topicSummary);
        } else if (dm.status === 'Needs Review') {
          needsReviewTopics.push(topicSummary);
        } else if (dm.status === 'Practicing' || dm.status === 'Challenged') {
          practicingTopics.push(topicSummary);
        }
      }
    });

    // Also verify any topics from played tiers that might not be in domain mastery
    playedTiersSet.forEach((t) => {
      const curTier = curriculumCatalog.find((c) => c.tier === t);
      if (curTier && !allPlayedTopics.some((p) => p.name === curTier.title || p.name === curTier.name)) {
        const fallbackTopic = {
          id: `tier_${t}`,
          name: curTier.title || curTier.name,
          icon: curTier.icon || '⛰️',
          subtitle: curTier.subtitle || curTier.description,
          status: rating >= (curTier.tier * 200 + 800) ? 'Mastered' : 'Practicing',
          accuracyPct: null,
          totalAttempted: 0,
          speedSec: null,
          specificTopics: curTier.topics || [],
          recommendation: curTier.description
        };
        allPlayedTopics.push(fallbackTopic);
        if (fallbackTopic.status === 'Mastered') {
          masteredTopics.push(fallbackTopic);
        } else {
          practicingTopics.push(fallbackTopic);
        }
      }
    });

    // Advanced Diagnostic Insights for Kibo Club VIPs
    let clubInsights = null;
    if (isKiboClub) {
      const insightCards = generateParentInsightCards(skipLogs, sprintHistory, childName, subjectId);
      clubInsights = {
        insightCards,
        hasBottlenecks: insightCards.some((c) => c.type === 'bottleneck'),
        hasFatigueAlert: insightCards.some((c) => c.type === 'fatigue'),
        totalSkipsLogged: skipLogs.length
      };
    }

    playedSubjects.push({
      subjectId,
      name: config.name || subjectId,
      icon: config.icon || (subjectId === 'words' ? '📚' : subjectId === 'world' ? '🌍' : '🔢'),
      rating,
      rankTitle,
      tier,
      gradeLevel,
      totalSolved,
      solvedThisWeek,
      accuracyPct,
      avgLatencySec,
      totalTimeThisWeekSec: totalTimeThisWeek,
      allPlayedTopics,
      masteredTopics,
      practicingTopics,
      needsReviewTopics,
      conceptBreakdown,
      clubInsights,
      playSubjectUrl: `${baseUrl}/${subjectId}?profile=${encodeURIComponent(profileId)}&utm_source=transactional_email&utm_medium=email&utm_campaign=weekly_digest&utm_content=${encodeURIComponent(subjectId)}_subject_card`
    });
  });

  const totalTimeMinThisWeek = Math.round(totalTimeSecThisWeek / 60);

  return {
    profileId,
    childName,
    childGrade,
    streak,
    sparks,
    questLevel,
    questAscentTier,
    questAscentName,
    questTitle,
    questIcon,
    questTotalXp,
    questProgressPct,
    questNextRankTitle,
    multiSubjectBonusClaimsCount: questState?.multiSubjectBonusClaimsCount || 0,
    unlockedBadgesCount: unlockedBadges.length,
    unlockedBadges,
    totalProblemsThisWeek,
    totalProblemsAllTime,
    totalTimeSecThisWeek,
    totalTimeMinThisWeek,
    isKiboClub,
    hasAdvancedInsightsLocked: !isKiboClub,
    subjects: playedSubjects,
    unstartedSubjects,
    links: {
      playUrl: `${baseUrl}/?action=play&profile=${encodeURIComponent(profileId)}&utm_source=transactional_email&utm_medium=email&utm_campaign=weekly_digest&utm_content=cta_continue_ascent`,
      parentSettingsUrl: `${baseUrl}/?action=parent-settings&profile=${encodeURIComponent(profileId)}&utm_source=transactional_email&utm_medium=email&utm_campaign=weekly_digest&utm_content=footer_parent_zone`,
      feedbackUrl: `${baseUrl}/?action=feedback&profile=${encodeURIComponent(profileId)}&utm_source=transactional_email&utm_medium=email&utm_campaign=weekly_digest&utm_content=footer_feedback`,
      notificationsUrl: `${baseUrl}/?action=notifications&profile=${encodeURIComponent(profileId)}&utm_source=transactional_email&utm_medium=email&utm_campaign=weekly_digest&utm_content=footer_notifications`
    },
    generatedAt: now.toISOString()
  };
}

/**
 * Formats multi-subject weekly digest data as plain text.
 */
export function formatWeeklyDigestText({ childName, digestData }) {
  const data = digestData;
  const name = childName || data.childName || 'Kibo Climber';
  const clubTag = data.isKiboClub ? ' 👑 [KIBO CLUB]' : '';

  let text = `🐾 Kibo Climb Weekly Progress for ${name}${clubTag} 🏔️\n\n`;
  text += `Hi there!\n\nHere is ${name}'s personalized learning progress summary for the week:\n\n`;
  if (data.isKiboClub) {
    text += `👑 KIBO CLUB STATUS: Active (1.25x Spark Multiplier & Multi-Profile Access)\n`;
  }
  text += `🔥 DAILY STREAK: ${data.streak} ${data.streak === 1 ? 'Day' : 'Days'}\n`;
  text += `⚡ Sparks Balance: ${data.sparks} ⚡\n`;
  text += `🧭 Quest Expedition: Ascent ${data.questAscentTier || 1} (${data.questAscentName || 'Sunny Trailhead'}) · Level ${data.questLevel} (${data.questTitle}) · ${data.questTotalXp} XP\n`;
  text += `🏆 Badges Won: ${data.unlockedBadgesCount} total\n`;
  text += `📈 Total Questions Completed This Week: ${data.totalProblemsThisWeek} (${data.totalProblemsAllTime} all-time)\n\n`;

  if (data.subjects.length > 0) {
    data.subjects.forEach((sub) => {
      const unitLabel = sub.subjectId === 'words' ? 'words' : sub.subjectId === 'world' ? 'locations' : 'problems';
      text += `========================================\n`;
      text += `${sub.icon} ${sub.name.toUpperCase()} PROGRESS & PLAYED TOPICS\n`;
      text += `• Skill Rating: ${sub.rating} (${sub.rankTitle} · Tier ${sub.tier})\n`;
      text += `• ${sub.name} Solved: ${sub.solvedThisWeek} this week (${sub.totalSolved} total)\n`;
      if (sub.accuracyPct !== null) {
        text += `• Recent Accuracy: ${sub.accuracyPct}%\n`;
      }
      if (sub.avgLatencySec !== null) {
        text += `• Avg Recall Latency: ${sub.avgLatencySec}s per ${unitLabel.slice(0, -1)}\n`;
      }

      text += `\n📋 ALL PLAYED TOPICS IN ${sub.name.toUpperCase()}:\n`;
      if (sub.allPlayedTopics && sub.allPlayedTopics.length > 0) {
        sub.allPlayedTopics.forEach((t) => {
          const statusIcon = t.status === 'Mastered' ? '✅ Mastered' : (t.status === 'Needs Review' ? '🔄 Needs Review' : '🎯 Active Practice');
          const accStr = t.accuracyPct !== null ? ` (${t.accuracyPct}% acc)` : '';
          text += `  • [${statusIcon}] ${t.name}${accStr}\n`;
          if (t.specificTopics && t.specificTopics.length > 0) {
            text += `    Skills: ${t.specificTopics.join(', ')}\n`;
          }
        });
      } else {
        text += `  • Building initial fundamentals\n`;
      }

      if (data.isKiboClub && sub.clubInsights?.insightCards && sub.clubInsights.insightCards.length > 0) {
        text += `\n👑 KIBO CLUB DEEP DIAGNOSTIC INSIGHTS (${sub.name.toUpperCase()}):\n`;
        sub.clubInsights.insightCards.forEach((card) => {
          text += `  • [${card.badge}] ${card.title}: ${card.description}\n`;
        });
      }

      text += `\n`;
    });
  }

  if (!data.isKiboClub) {
    text += `========================================\n`;
    text += `👑 KIBO CLUB PREVIEW: Deep diagnostic bottleneck alerts, fatigue tracking, and actionable parent coaching insights are available with Kibo Club!\n\n`;
  }

  if (data.unstartedSubjects && data.unstartedSubjects.length > 0) {
    text += `========================================\n`;
    text += `🌟 SUBJECTS READY TO EXPLORE:\n`;
    data.unstartedSubjects.forEach((unsub) => {
      text += `• ${unsub.icon} ${unsub.name}: ${unsub.description}\n  Start climb: ${unsub.playUrl}\n\n`;
    });
  }

  text += `========================================\n`;
  text += `QUICK LINKS:\n`;
  text += `🏔️ Continue Today's Climb: ${data.links.playUrl}\n`;
  text += `⚙️ Parent Zone Settings: ${data.links.parentSettingsUrl}\n`;
  text += `💬 Share Feedback: ${data.links.feedbackUrl}\n\n`;
  text += `Keep up the fantastic ascent! 🚀\n– Team Kibo Climb`;

  return text;
}

/**
 * Formats multi-subject weekly digest data into clean, responsive HTML email.
 */
export function formatWeeklyDigestHtml({ childName, digestData, baseUrl = digestData?.baseUrl || getAppBaseUrl() }) {
  const data = digestData;
  const name = childName || data.childName || 'Kibo Climber';

  const subjectsHtml = data.subjects
    .map((sub) => {
      const unitLabel = sub.subjectId === 'words' ? 'Words' : sub.subjectId === 'world' ? 'Locations' : 'Problems';

      // Build all played topics cards/list
      const playedTopicsHtml = sub.allPlayedTopics && sub.allPlayedTopics.length > 0
        ? sub.allPlayedTopics.map((t) => {
            const isMastered = t.status === 'Mastered';
            const isNeedsReview = t.status === 'Needs Review';
            const badgeBg = isMastered ? '#dcfce7' : (isNeedsReview ? '#fef3c7' : '#f3e8ff');
            const badgeColor = isMastered ? '#166534' : (isNeedsReview ? '#92400e' : '#6b21a8');
            const badgeBorder = isMastered ? '#bbf7d0' : (isNeedsReview ? '#fde68a' : '#e9d5ff');
            const badgeText = isMastered ? '✅ Mastered' : (isNeedsReview ? '🔄 Needs Review' : '🎯 Practicing');

            const skillsStr = t.specificTopics && t.specificTopics.length > 0
              ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.4;">${t.specificTopics.slice(0, 3).join(' · ')}</div>`
              : '';

            return `
              <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                  <div style="font-size: 13px; font-weight: 700; color: #1e293b;">
                    <span style="margin-right: 6px;">${t.icon || '🌱'}</span>${t.name}
                  </div>
                  <span style="background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 12px;">
                    ${badgeText} ${t.accuracyPct !== null ? `(${t.accuracyPct}%)` : ''}
                  </span>
                </div>
                ${skillsStr}
              </div>
            `;
          }).join('')
        : `<div style="font-size: 12px; color: #64748b; font-style: italic; padding: 8px 0;">Building initial topic foundations</div>`;

      return `
      <div style="background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: left; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 16px;">
          <h3 style="margin: 0; color: #0f172a; font-size: 17px; font-weight: 800; display: flex; align-items: center;">
            <span style="font-size: 20px; margin-right: 8px;">${sub.icon}</span> ${sub.name} Progress
          </h3>
          <span style="background-color: #f3e8ff; color: #6b21a8; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 20px; border: 1px solid #e9d5ff;">
            Rating: ${sub.rating} (${sub.rankTitle})
          </span>
        </div>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
          <tr>
            <td width="50%" style="padding: 6px 0; vertical-align: top;">
              <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; letter-spacing: 0.5px;">Rank & Level</span>
              <strong style="font-size: 14px; color: #1e293b;">${sub.rankTitle} · Tier ${sub.tier}</strong>
            </td>
            <td width="50%" style="padding: 6px 0; vertical-align: top;">
              <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; letter-spacing: 0.5px;">${unitLabel} Solved</span>
              <strong style="font-size: 14px; color: #1e293b;">${sub.solvedThisWeek} this week <span style="font-size: 12px; color: #64748b; font-weight: 500;">(${sub.totalSolved} total)</span></strong>
            </td>
          </tr>
          <tr>
            <td width="50%" style="padding: 6px 0; vertical-align: top;">
              <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; letter-spacing: 0.5px;">Recent Accuracy</span>
              <strong style="font-size: 14px; color: ${sub.accuracyPct >= 80 ? '#16a34a' : (sub.accuracyPct >= 60 ? '#d97706' : '#dc2626')};">${sub.accuracyPct !== null ? `${sub.accuracyPct}%` : 'Calibrating'}</strong>
            </td>
            <td width="50%" style="padding: 6px 0; vertical-align: top;">
              <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; letter-spacing: 0.5px;">Avg Recall Latency</span>
              <strong style="font-size: 14px; color: #0284c7;">${sub.avgLatencySec !== null ? `${sub.avgLatencySec}s / item` : 'N/A'}</strong>
            </td>
          </tr>
        </table>

        <!-- ALL PLAYED TOPICS ACCORDION/SECTION -->
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 14px; margin-top: 8px; border: 1px solid #edf2f7;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <strong style="font-size: 12px; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;">
              📚 All Topics Played in ${sub.name} (${sub.allPlayedTopics.length})
            </strong>
          </div>
          ${playedTopicsHtml}
        </div>

        ${data.isKiboClub && sub.clubInsights?.insightCards && sub.clubInsights.insightCards.length > 0 ? `
          <!-- KIBO CLUB ADVANCED DIAGNOSTICS -->
          <div style="background: linear-gradient(135deg, #fefce8 0%, #fffbeb 100%); border-radius: 12px; padding: 14px; margin-top: 12px; border: 1.5px solid #fef08a;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 14px; margin-right: 6px;">👑</span>
              <strong style="font-size: 12px; color: #854d0e; text-transform: uppercase; letter-spacing: 0.5px;">
                Kibo Club Diagnostic Insights
              </strong>
            </div>
            ${sub.clubInsights.insightCards.map((card) => `
              <div style="background-color: #ffffff; border-radius: 8px; padding: 10px 12px; margin-bottom: 6px; border: 1px solid #fef08a;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-size: 12px; font-weight: 800; color: #1e293b;">
                    ${card.icon || '🧩'} ${card.title}
                  </span>
                  <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 6px; background-color: #fef3c7; color: #92400e;">
                    ${card.badge}
                  </span>
                </div>
                <p style="margin: 0; font-size: 11px; color: #475569; line-height: 1.4;">
                  ${card.description}
                </p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="text-align: right; margin-top: 12px;">
          <a href="${sub.playSubjectUrl}" style="display: inline-block; font-size: 12px; font-weight: 800; color: #7c3aed; text-decoration: none; padding: 6px 12px; background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px;">
            Play ${sub.name} Climb →
          </a>
        </div>
      </div>
    `;
    })
    .join('');

  // Non-club locked feature teaser banner (static blurred mockup, zero leakage of actual child analytics)
  let clubTeaserHtml = '';
  if (!data.isKiboClub) {
    clubTeaserHtml = `
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border-radius: 16px; padding: 20px 24px; margin-top: 20px; color: #ffffff; text-align: left; box-shadow: 0 4px 14px rgba(30, 27, 75, 0.2); border: 1px solid #4338ca;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">👑</span>
            <strong style="font-size: 15px; font-weight: 900; color: #fef08a; letter-spacing: -0.2px;">
              Unlock Deep Learning Insights with Kibo Club
            </strong>
          </div>
          <span style="background-color: rgba(254, 240, 138, 0.2); color: #fef08a; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 10px; border: 1px solid rgba(254, 240, 138, 0.4); text-transform: uppercase;">
            Kibo Club
          </span>
        </div>
        <p style="margin: 0 0 12px 0; font-size: 12px; color: #c7d2fe; line-height: 1.5;">
          Get automated topic bottleneck detection, fatigue alerts, and actionable parent coaching recommendations tailored to ${name}'s daily climbs.
        </p>
        <div style="background: rgba(255,255,255,0.08); border: 1px dashed rgba(255,255,255,0.25); border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; filter: blur(0.2px);">
          <div style="font-size: 11px; font-weight: 700; color: #e0e7ff; opacity: 0.85;">
            🔒 Sample Bottleneck Alert: Immediate skip patterns (<3s) & prerequisite skill coaching suggestions...
          </div>
        </div>
        <div style="text-align: center; margin-top: 14px;">
          <a href="${data.links.parentSettingsUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #78350f; font-size: 13px; font-weight: 900; text-decoration: none; padding: 10px 22px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            👑 Upgrade to Kibo Club →
          </a>
        </div>
      </div>
    `;
  }

  // Unstarted Subjects Section
  let unstartedSectionHtml = '';
  if (data.unstartedSubjects && data.unstartedSubjects.length > 0) {
    const unstartedCards = data.unstartedSubjects.map((unsub) => `
      <div style="background-color: #ffffff; border: 2px dashed #cbd5e1; border-radius: 14px; padding: 16px; margin-bottom: 12px; text-align: left;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-size: 15px; font-weight: 800; color: #334155;">
            <span style="font-size: 18px; margin-right: 6px;">${unsub.icon}</span> ${unsub.name} Climb
          </div>
          <a href="${unsub.playUrl}" style="display: inline-block; background-color: #0284c7; color: #ffffff; font-size: 11px; font-weight: 800; text-decoration: none; padding: 6px 12px; border-radius: 8px;">
            Start Climb →
          </a>
        </div>
        <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
          ${unsub.description}
        </p>
      </div>
    `).join('');

    unstartedSectionHtml = `
      <div style="margin-top: 24px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: left;">
        <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px; font-weight: 800;">
          🌟 Ready to Explore: New Subjects for ${name}
        </h3>
        <p style="margin: 0 0 14px 0; color: #64748b; font-size: 12px; line-height: 1.5;">
          Expand ${name}'s learning journey by starting these additional climbs!
        </p>
        ${unstartedCards}
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🐾 Kibo Climb Weekly Progress for ${name}</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- BRAND & MASCOT HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 24px 32px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 14px;" width="52">
                          <!-- Official Kibo Mascot Icon -->
                          <img src="https://kiboclimb.com/favicon.png" alt="Kibo Mascot" width="48" height="48" style="display: block; width: 48px; height: 48px; border-radius: 12px; border: 0;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 21px; font-weight: 900; letter-spacing: -0.5px;">Kibo Climb</h1>
                          <p style="margin: 2px 0 0 0; color: #a5b4fc; font-size: 13px; font-weight: 600;">Weekly Progress Summary for <strong>${name}</strong></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <div style="text-align: right;">
                      <span style="background-color: rgba(255,255,255,0.12); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2); display: inline-block; margin-bottom: ${data.isKiboClub ? '4px' : '0'};">
                        ${data.childGrade}
                      </span>
                      ${data.isKiboClub ? `
                        <div>
                          <span style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #78350f; font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 12px; border: 1px solid #fde68a; display: inline-block; box-shadow: 0 2px 6px rgba(217,119,6,0.3); text-transform: uppercase; letter-spacing: 0.5px;">
                            👑 Kibo Club
                          </span>
                        </div>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- OVERALL STATS RIBBON -->
          <tr>
            <td style="background-color: #faf5ff; border-bottom: 2px solid #f3e8ff; padding: 18px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 0 6px;">
                    <span style="font-size: 20px;">🔥</span>
                    <div style="font-size: 16px; font-weight: 900; color: #d97706;">${data.streak} Days</div>
                    <div style="font-size: 10px; font-weight: 700; color: #78350f; text-transform: uppercase;">Active Streak</div>
                  </td>
                  <td align="center" style="padding: 0 6px; border-left: 1px solid #e9d5ff; border-right: 1px solid #e9d5ff;">
                    <span style="font-size: 20px;">⚡</span>
                    <div style="font-size: 16px; font-weight: 900; color: #7c3aed;">${data.totalProblemsThisWeek}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #581c87; text-transform: uppercase;">Weekly Items</div>
                  </td>
                  <td align="center" style="padding: 0 6px; border-right: 1px solid #e9d5ff;">
                    <span style="font-size: 20px;">⏱️</span>
                    <div style="font-size: 16px; font-weight: 900; color: #059669;">${data.totalTimeMinThisWeek || Math.ceil(data.totalTimeSecThisWeek / 60) || 0}m</div>
                    <div style="font-size: 10px; font-weight: 700; color: #065f46; text-transform: uppercase;">Study Time</div>
                  </td>
                  <td align="center" style="padding: 0 6px; border-right: 1px solid #e9d5ff;">
                    <span style="font-size: 20px;">${data.questIcon || '🧭'}</span>
                    <div style="font-size: 14px; font-weight: 900; color: #4338ca;">Ascent ${data.questAscentTier || 1} · Lv ${data.questLevel}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #3730a3; text-transform: uppercase;">${data.questTitle} · ${data.questTotalXp} XP</div>
                  </td>
                  <td align="center" style="padding: 0 6px;">
                    <span style="font-size: 20px;">🏆</span>
                    <div style="font-size: 16px; font-weight: 900; color: #0284c7;">${data.unlockedBadgesCount}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #0c4a6e; text-transform: uppercase;">Badges Won</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- MAIN SUBJECTS CONTENT -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; background-color: #f8fafc;">
              <h2 style="margin: 0 0 18px 0; color: #0f172a; font-size: 16px; font-weight: 800; text-align: left;">
                Multi-Subject Performance & Topics Played
              </h2>
              ${subjectsHtml}

              <!-- Kibo Club Locked Teaser (for standard accounts) -->
              ${clubTeaserHtml}

              <!-- Unstarted Subjects / Cross-Subject Discovery -->
              ${unstartedSectionHtml}

              <!-- CALL TO ACTION BUTTONS -->
              <div style="margin-top: 28px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center;">
                <a href="${data.links.playUrl}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3); margin-bottom: 12px;">
                  🏔️ Continue ${name}'s Ascent
                </a>
                <div style="margin-top: 6px;">
                  <a href="${data.links.parentSettingsUrl}" style="font-size: 12px; font-weight: 700; color: #64748b; text-decoration: underline; margin: 0 10px;">
                    ⚙️ Parent Zone & Goals
                  </a>
                  <a href="${data.links.feedbackUrl}" style="font-size: 12px; font-weight: 700; color: #64748b; text-decoration: underline; margin: 0 10px;">
                    💬 Share Feedback
                  </a>
                </div>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #ffffff; border-top: 1px solid #e2e8f0; padding: 22px 32px; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #64748b; font-size: 12px;">
                You are receiving this summary because Weekly Digest is enabled for <strong>${name}</strong> in your Kibo Climb Parent Zone.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                © ${new Date().getFullYear()} Kibo Climb. The Daily Climb to Mastery.
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

/**
 * Compiles a weekly summary and HTML template for scheduled email digests.
 */
export function computeProfileWeeklyStats({ childName, profile, profileId = null }) {
  const name = childName || profile?.name || profile?.username || 'Kibo Climber';
  const grade = profile?.gradeLevel || 'Grade 1–2';
  const userData = profile?.userData || {};
  const streak = userData.streak || 0;
  const unlockedBadges = userData.unlockedBadges || [];

  const now = new Date();
  const mathData = userData.subjects?.math || userData || {};
  const wordsData = userData.subjects?.words || {};

  const profileQuery = profileId ? `&profile=${encodeURIComponent(profileId)}` : '';
  const subjects = [];

  // Math Subject Summary
  const mathSolved = mathData.totalProblemsSolved || 0;
  const mathSprints = mathData.sprintHistory || [];
  const mathRecent = mathSprints.filter(s => s.date && (now - new Date(s.date)) / (1000 * 60 * 60 * 24) <= 7);
  let mathWeekSolved = 0, mathWeekCorrect = 0, mathWeekTime = 0;
  mathRecent.forEach(s => {
    mathWeekSolved += Number(s.totalQuestions || 12);
    mathWeekCorrect += Number(s.correctCount || s.score || 0);
    mathWeekTime += Number(s.totalTimeSec || 0);
  });
  const mathRating = mathData.adaptiveCompetenceRating || 1000;
  const mathAcc = mathWeekSolved > 0 ? Math.round((mathWeekCorrect / mathWeekSolved) * 100) : null;
  const mathSpeed = mathWeekSolved > 0 ? (mathWeekTime / mathWeekSolved).toFixed(1) : null;

  subjects.push({
    name: 'Math',
    icon: '🔢',
    rating: mathRating,
    tier: mathData.tier || 1,
    solvedThisWeek: mathWeekSolved,
    totalSolved: mathSolved,
    accuracyPct: mathAcc,
    avgLatencySec: mathSpeed,
    playUrl: `https://kiboclimb.com/math?utm_source=transactional_email&utm_medium=email&utm_campaign=weekly_digest&utm_content=subject_math${profileQuery}`
  });

  // Words Subject Summary
  const wordsSolved = wordsData.totalProblemsSolved || 0;
  const wordsSprints = wordsData.sprintHistory || [];
  if (wordsSolved > 0 || wordsSprints.length > 0) {
    const wordsRecent = wordsSprints.filter(s => s.date && (now - new Date(s.date)) / (1000 * 60 * 60 * 24) <= 7);
    let wordsWeekSolved = 0, wordsWeekCorrect = 0, wordsWeekTime = 0;
    wordsRecent.forEach(s => {
      wordsWeekSolved += Number(s.totalQuestions || 12);
      wordsWeekCorrect += Number(s.correctCount || s.score || 0);
      wordsWeekTime += Number(s.totalTimeSec || 0);
    });
    subjects.push({
      name: 'Words',
      icon: '📚',
      rating: wordsData.adaptiveCompetenceRating || 1000,
      tier: wordsData.tier || 1,
      solvedThisWeek: wordsWeekSolved,
      totalSolved: wordsSolved,
      accuracyPct: wordsWeekSolved > 0 ? Math.round((wordsWeekCorrect / wordsWeekSolved) * 100) : null,
      avgLatencySec: wordsWeekSolved > 0 ? (wordsWeekTime / wordsWeekSolved).toFixed(1) : null,
      playUrl: `https://kiboclimb.com/words?utm_source=transactional_email&utm_medium=email&utm_campaign=weekly_digest&utm_content=subject_words${profileQuery}`
    });
  }

  const totalProblemsThisWeek = subjects.reduce((sum, s) => sum + s.solvedThisWeek, 0);

  const subjectsHtml = subjects.map(sub => `
    <div style="background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 18px; margin-bottom: 16px; text-align: left;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 12px;">
        <h3 style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 800;">
          <span style="font-size: 18px; margin-right: 6px;">${sub.icon}</span> ${sub.name} Climb
        </h3>
        <span style="background-color: #f3e8ff; color: #6b21a8; font-weight: 800; font-size: 11px; padding: 3px 8px; border-radius: 12px;">
          Rating: ${sub.rating} · Tier ${sub.tier}
        </span>
      </div>
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td width="50%" style="padding: 4px 0;">
            <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700;">Completed</span>
            <div style="font-size: 13px; font-weight: 800; color: #1e293b;">${sub.solvedThisWeek} this week (${sub.totalSolved} total)</div>
          </td>
          <td width="50%" style="padding: 4px 0;">
            <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700;">Accuracy</span>
            <div style="font-size: 13px; font-weight: 800; color: ${sub.accuracyPct >= 80 ? '#16a34a' : '#d97706'};">${sub.accuracyPct !== null ? `${sub.accuracyPct}%` : 'Calibrating'}</div>
          </td>
        </tr>
      </table>
      <div style="text-align: right; margin-top: 10px;">
        <a href="${sub.playUrl}" style="font-size: 12px; font-weight: 800; color: #7c3aed; text-decoration: none;">
          Play ${sub.name} Climb →
        </a>
      </div>
    </div>
  `).join('');

  return {
    name,
    grade,
    streak,
    unlockedBadgesCount: unlockedBadges.length,
    totalProblemsThisWeek,
    subjects,
    subjectsHtml,
    profileQuery,
    profileId
  };
}

export function buildScheduledDigestHtml({ childName, profile, isKiboClub = false, profileId = null }) {
  const stats = computeProfileWeeklyStats({ childName, profile, profileId });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>🐾 Kibo Climb Weekly Progress for ${stats.name}</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 24px 32px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 21px; font-weight: 900;">🐾 Kibo Climb</h1>
                    <p style="margin: 2px 0 0 0; color: #a5b4fc; font-size: 13px; font-weight: 600;">Weekly Progress Summary for <strong>${stats.name}</strong></p>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(255,255,255,0.15); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px;">
                      ${stats.grade}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- RIBBON -->
          <tr>
            <td style="background-color: #faf5ff; border-bottom: 2px solid #f3e8ff; padding: 16px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="font-size: 18px;">🔥</span>
                    <div style="font-size: 15px; font-weight: 900; color: #d97706;">${stats.streak} Days</div>
                    <div style="font-size: 10px; font-weight: 700; color: #78350f; text-transform: uppercase;">Streak</div>
                  </td>
                  <td align="center" style="border-left: 1px solid #e9d5ff; border-right: 1px solid #e9d5ff;">
                    <span style="font-size: 18px;">⚡</span>
                    <div style="font-size: 15px; font-weight: 900; color: #7c3aed;">${stats.totalProblemsThisWeek}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #581c87; text-transform: uppercase;">Weekly Items</div>
                  </td>
                  <td align="center">
                    <span style="font-size: 18px;">🏆</span>
                    <div style="font-size: 15px; font-weight: 900; color: #0284c7;">${stats.unlockedBadgesCount}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #0c4a6e; text-transform: uppercase;">Badges</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SUBJECTS -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc;">
              ${stats.subjectsHtml}

              <div style="margin-top: 24px; padding-top: 18px; border-top: 2px solid #e2e8f0; text-align: center;">
                <a href="https://kiboclimb.com/?action=play&utm_source=transactional_email&utm_medium=email&utm_campaign=weekly_digest&utm_content=cta_continue_ascent${stats.profileQuery}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 12px;">
                  🏔️ Continue ${stats.name}'s Ascent
                </a>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #ffffff; border-top: 1px solid #e2e8f0; padding: 18px 32px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                You are receiving this because Weekly Digest is enabled in your Kibo Climb Parent Zone.<br/>
                © ${new Date().getFullYear()} Kibo Climb. The Daily Climb to Mastery.
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

/**
 * Builds a single consolidated family weekly digest email covering all children in a family account.
 */
export function buildScheduledFamilyDigestHtml({ children = [], isKiboClub = false }) {
  const childrenStats = children.map(c => computeProfileWeeklyStats({
    childName: c.childName,
    profile: c.profile,
    profileId: c.pid
  }));

  const totalFamilyProblems = childrenStats.reduce((sum, c) => sum + c.totalProblemsThisWeek, 0);
  const totalFamilyBadges = childrenStats.reduce((sum, c) => sum + c.unlockedBadgesCount, 0);
  const topStreak = Math.max(0, ...childrenStats.map(c => c.streak));
  const namesSummary = childrenStats.map(c => c.name).join(' & ');

  const childrenSectionsHtml = childrenStats.map(c => `
    <div style="background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 18px; padding: 22px; margin-bottom: 24px; text-align: left;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">
        <tr>
          <td>
            <h2 style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 900;">👤 ${c.name}</h2>
            <span style="color: #64748b; font-size: 12px; font-weight: 700;">${c.grade}</span>
          </td>
          <td align="right">
            <span style="background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 12px; margin-right: 6px;">
              🔥 ${c.streak}d streak
            </span>
            <span style="background-color: #f3e8ff; color: #6b21a8; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 12px;">
              ⚡ ${c.totalProblemsThisWeek} this week
            </span>
          </td>
        </tr>
      </table>

      ${c.subjectsHtml}

      <div style="text-align: center; margin-top: 14px;">
        <a href="https://kiboclimb.com/?action=play&profile=${encodeURIComponent(c.profileId || '')}&utm_source=transactional_email&utm_medium=email&utm_campaign=weekly_family_digest" style="display: inline-block; background-color: #7c3aed; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; padding: 10px 20px; border-radius: 10px;">
          🏔️ Continue ${c.name}'s Ascent →
        </a>
      </div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>🐾 Kibo Climb Weekly Family Progress: ${namesSummary}</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 24px 32px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 21px; font-weight: 900;">🐾 Kibo Climb</h1>
                    <p style="margin: 2px 0 0 0; color: #a5b4fc; font-size: 13px; font-weight: 600;">Family Progress Summary · <strong>${children.length} Climbers</strong></p>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(255,255,255,0.15); color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px;">
                      👨‍👩‍👧‍👦 Family Plan
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- COMBINED FAMILY RIBBON -->
          <tr>
            <td style="background-color: #faf5ff; border-bottom: 2px solid #f3e8ff; padding: 16px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <span style="font-size: 18px;">🔥</span>
                    <div style="font-size: 15px; font-weight: 900; color: #d97706;">${topStreak} Days</div>
                    <div style="font-size: 10px; font-weight: 700; color: #78350f; text-transform: uppercase;">Top Streak</div>
                  </td>
                  <td align="center" style="border-left: 1px solid #e9d5ff; border-right: 1px solid #e9d5ff;">
                    <span style="font-size: 18px;">⚡</span>
                    <div style="font-size: 15px; font-weight: 900; color: #7c3aed;">${totalFamilyProblems}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #581c87; text-transform: uppercase;">Family Solved</div>
                  </td>
                  <td align="center">
                    <span style="font-size: 18px;">🏆</span>
                    <div style="font-size: 15px; font-weight: 900; color: #0284c7;">${totalFamilyBadges}</div>
                    <div style="font-size: 10px; font-weight: 700; color: #0c4a6e; text-transform: uppercase;">Total Badges</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PER-CHILD SECTIONS -->
          <tr>
            <td style="padding: 24px 28px; background-color: #f8fafc;">
              ${childrenSectionsHtml}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #ffffff; border-top: 1px solid #e2e8f0; padding: 18px 32px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                You are receiving this single consolidated digest because Weekly Digest is enabled in your Kibo Climb Parent Zone.<br/>
                © ${new Date().getFullYear()} Kibo Climb. The Daily Climb to Mastery.
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
