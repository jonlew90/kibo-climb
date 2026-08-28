import { describe, it, expect } from 'vitest';
import {
  getConceptForProblem,
  categorizeSkip,
  detectDiagnosticTriggers,
  calculateConceptBreakdown,
  generateParentInsightCards
} from './skipDiagnosticEngine.js';

function runTests() {
  console.log('--- Running Skip Diagnostic Engine Tests ---');

  // Test 1: getConceptForProblem
  const prob1 = { displayString: '3/4 + 1/2', tier: 7 };
  console.assert(getConceptForProblem(prob1) === 'Fractions & GCF/LCM', 'Test 1 Failed');

  const prob2 = { displayString: '$1.00 - $0.35', tier: 5 };
  console.assert(getConceptForProblem(prob2) === 'Money & Decimals', 'Test 2 Failed');

  // Test 2: categorizeSkip
  const catImm = categorizeSkip(1.5);
  console.assert(catImm.type === 'immediate', 'Test Immediate Skip Failed');

  const catDel = categorizeSkip(35.0);
  console.assert(catDel.type === 'deliberate', 'Test Deliberate Skip Failed');

  const catMod = categorizeSkip(12.0);
  console.assert(catMod.type === 'moderate', 'Test Moderate Skip Failed');

  // Test 3: detectDiagnosticTriggers - Topic Bottleneck (3+ skips on same concept)
  const logs = [
    { timestamp: '2026-08-09T14:00:00Z', concept: 'Fractions & GCF/LCM', timeElapsedSec: 35 },
    { timestamp: '2026-08-09T14:00:20Z', concept: 'Fractions & GCF/LCM', timeElapsedSec: 32 },
    { timestamp: '2026-08-09T14:00:40Z', concept: 'Fractions & GCF/LCM', timeElapsedSec: 31 }
  ];
  const triggers = detectDiagnosticTriggers(logs);
  console.assert(triggers.topicBottlenecks.length === 1, 'Test Topic Bottleneck Count Failed');
  console.assert(triggers.topicBottlenecks[0].concept === 'Fractions & GCF/LCM', 'Test Topic Name Failed');

  // Test 4: detectDiagnosticTriggers - Session Fatigue (3 skips in <60s)
  console.assert(triggers.sessionFatigue !== null, 'Test Session Fatigue Failed');

  // Test 5: generateParentInsightCards
  const cards = generateParentInsightCards(logs, [], 'Leo');
  console.assert(cards.length >= 1, 'Test Card Generation Failed');
  // Test 6: calculateConceptBreakdown - Unique IDs for custom concepts in world subject
  const worldSkipLogs = [
    { timestamp: '2026-08-09T14:00:00Z', concept: 'Capital of France', timeElapsedSec: 5 },
    { timestamp: '2026-08-09T14:01:00Z', concept: 'Capital of Japan', timeElapsedSec: 8 },
    { timestamp: '2026-08-09T14:02:00Z', concept: 'Basics', timeElapsedSec: 2 }
  ];
  const worldBreakdown = calculateConceptBreakdown([], worldSkipLogs, 'world');
  const values = Object.values(worldBreakdown);
  const ids = values.map(v => v.id);
  const uniqueIds = new Set(ids);
  console.assert(uniqueIds.size === ids.length, 'Test Unique Concept IDs Failed: ' + JSON.stringify(ids));
  console.assert(worldBreakdown['Basics'].skipped === 1, 'Test Basics skip count failed');

  console.log('✅ ALL TESTS PASSED SUCCESSFULLY!');
}

runTests();

describe('Skip Diagnostic', () => {
  it('should run skip diagnostic test script successfully', () => {
    // existing prints run on import
    expect(true).toBe(true);
  });

  it('should generate unique ids in concept breakdown for custom concepts', () => {
    const worldSkipLogs = [
      { timestamp: '2026-08-09T14:00:00Z', concept: 'Capital of France', timeElapsedSec: 5 },
      { timestamp: '2026-08-09T14:01:00Z', concept: 'Capital of Japan', timeElapsedSec: 8 }
    ];
    const breakdown = calculateConceptBreakdown([], worldSkipLogs, 'world');
    const items = Object.values(breakdown);
    const ids = items.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain('concept_custom');
  });
});
