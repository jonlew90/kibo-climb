import { describe, it, expect } from 'vitest';
// Verification & Simulation Test for AdaptiveEngine.js & SkillTreeConfig.js
import { evaluateAdaptiveAttempt, shouldTriggerProbeQuestion } from './AdaptiveEngine.js';
import { getKFactor, getStrandForRating, getProbeTargetTier } from './SkillTreeConfig.js';

function runSimulationProficientStudent() {
  console.log('=== SIMULATION 1: PROFICIENT STUDENT (15 CONSECUTIVE CORRECT ANSWERS) ===');
  let currentRating = 1000;
  let totalProblemsSolved = 0;
  let inSessionStreak = 0;
  const history = [];

  for (let i = 1; i <= 15; i++) {
    const isProbe = shouldTriggerProbeQuestion({ totalProblemsSolved, inSessionStreak });
    
    const evalResult = evaluateAdaptiveAttempt({
      isCorrect: true,
      latencyMs: 1500,
      currentCompetenceRank: currentRating,
      inSessionStreak,
      inSessionIncorrectStreak: 0,
      totalProblemsSolved,
      isProbeQuestion: isProbe
    });

    currentRating = evalResult.nextCompetenceRank;
    inSessionStreak = evalResult.nextInSessionStreak;
    totalProblemsSolved++;

    const currentStrand = getStrandForRating(currentRating);
    history.push({
      qNum: i,
      isProbe,
      rankDelta: evalResult.rankDelta,
      nextRank: currentRating,
      kFactor: evalResult.kFactor,
      phase: evalResult.phase,
      strandName: currentStrand.name
    });

    console.log(`Q#${i.toString().padStart(2, '0')}: [Phase: ${evalResult.phase.padEnd(11, ' ')} K:${evalResult.kFactor}] ${isProbe ? '🚀 PROBE ' : '   REGULAR'} -> Delta: +${evalResult.rankDelta.toString().padStart(3, ' ')} => New Rating: ${currentRating} (${currentStrand.name})`);
  }

  const finalStrand = getStrandForRating(currentRating);
  console.log(`\nProficient Student Final Rating after 15 problems: ${currentRating} ⭐ (${finalStrand.name})`);
  console.assert(currentRating >= 1400, `FAIL: Expected rating >= 1400, got ${currentRating}`);
  console.log(currentRating >= 1400 ? '✅ PASSED: Proficient student reached 1400+ rating in under 15 questions!\n' : '❌ FAILED');
  return currentRating;
}

function runSimulationBeginnerProbeMiss() {
  console.log('=== SIMULATION 2: BEGINNER MISSES PROBE QUESTION ===');
  let currentRating = 1000;
  let totalProblemsSolved = 0;
  let inSessionStreak = 0;

  // 3 correct answers to trigger probe
  for (let i = 1; i <= 3; i++) {
    const evalResult = evaluateAdaptiveAttempt({
      isCorrect: true,
      latencyMs: 2500,
      currentCompetenceRank: currentRating,
      inSessionStreak,
      inSessionIncorrectStreak: 0,
      totalProblemsSolved,
      isProbeQuestion: false
    });
    currentRating = evalResult.nextCompetenceRank;
    inSessionStreak = evalResult.nextInSessionStreak;
    totalProblemsSolved++;
  }

  console.log(`Rating after 3 correct baseline answers: ${currentRating} (Streak: ${inSessionStreak})`);
  const isProbe = shouldTriggerProbeQuestion({ totalProblemsSolved, inSessionStreak });
  console.log(`Is Probe Question Triggered for Q#4? ${isProbe}`);

  // Miss the probe question
  const probeEval = evaluateAdaptiveAttempt({
    isCorrect: false,
    latencyMs: 4000,
    currentCompetenceRank: currentRating,
    inSessionStreak,
    inSessionIncorrectStreak: 0,
    totalProblemsSolved,
    isProbeQuestion: true
  });

  currentRating = probeEval.nextCompetenceRank;
  console.log(`Probe Missed -> Rank Delta: ${probeEval.rankDelta} => Rating: ${currentRating}`);
  console.assert(probeEval.rankDelta >= -15 && probeEval.rankDelta <= -5, `FAIL: Expected small penalty on probe miss, got ${probeEval.rankDelta}`);
  console.assert(currentRating >= 1000, `FAIL: Expected rating >= 1000 after gentle probe miss, got ${currentRating}`);
  console.log('✅ PASSED: Beginner smoothly regressed with minimal penalty on probe miss!\n');
}

runSimulationProficientStudent();
runSimulationBeginnerProbeMiss();


describe('Adaptive Engine', () => {
  it('should run simulation proficient student', () => {
    runSimulationProficientStudent();
  });
  it('should run simulation beginner probe miss', () => {
    runSimulationBeginnerProbeMiss();
  });
});
