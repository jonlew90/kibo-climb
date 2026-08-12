import { describe, it, expect } from 'vitest';
import {
  getConceptForProblem,
  categorizeSkip,
  detectDiagnosticTriggers,
  generateParentInsightCards
} from './skipDiagnosticEngine.js';

describe('Skip Diagnostic Engine', () => {
  it('getConceptForProblem correctly categorizes problems', () => {
    const prob1 = { displayString: '3/4 + 1/2', tier: 7 };
    expect(getConceptForProblem(prob1)).toBe('Fractions & GCF/LCM');

    const prob2 = { displayString: '$1.00 - $0.35', tier: 5 };
    expect(getConceptForProblem(prob2)).toBe('Money & Decimals');
  });

  it('categorizeSkip classifies latencies correctly', () => {
    const catImm = categorizeSkip(1.5);
    expect(catImm.type).toBe('immediate');

    const catDel = categorizeSkip(35.0);
    expect(catDel.type).toBe('deliberate');

    const catMod = categorizeSkip(12.0);
    expect(catMod.type).toBe('moderate');
  });

  it('detectDiagnosticTriggers detects Topic Bottlenecks and Session Fatigue', () => {
    const logs = [
      { timestamp: '2026-08-09T14:00:00Z', concept: 'Fractions & GCF/LCM', timeElapsedSec: 35 },
      { timestamp: '2026-08-09T14:00:20Z', concept: 'Fractions & GCF/LCM', timeElapsedSec: 32 },
      { timestamp: '2026-08-09T14:00:40Z', concept: 'Fractions & GCF/LCM', timeElapsedSec: 31 }
    ];
    const triggers = detectDiagnosticTriggers(logs);

    expect(triggers.topicBottlenecks.length).toBe(1);
    expect(triggers.topicBottlenecks[0].concept).toBe('Fractions & GCF/LCM');
    expect(triggers.sessionFatigue).not.toBeNull();
  });

  it('generateParentInsightCards generates actionable insights', () => {
    const logs = [
      { timestamp: '2026-08-09T14:00:00Z', concept: 'Fractions & GCF/LCM', timeElapsedSec: 35 },
      { timestamp: '2026-08-09T14:00:20Z', concept: 'Fractions & GCF/LCM', timeElapsedSec: 32 },
      { timestamp: '2026-08-09T14:00:40Z', concept: 'Fractions & GCF/LCM', timeElapsedSec: 31 }
    ];
    const cards = generateParentInsightCards(logs, [], 'Leo');

    expect(cards.length).toBeGreaterThanOrEqual(1);
    expect(cards[0].description).toContain('Leo skipped 3 fractions & gcf/lcm problems today');
  });
});
