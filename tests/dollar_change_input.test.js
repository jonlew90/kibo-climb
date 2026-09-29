import { describe, it, expect } from 'vitest';
import { isDollarChangeProblem, computeNextInput, computeDeletedInput, normalizeDecimal } from '../src/utils/formatters';
import { generateTierProblem } from '../src/utils/mathCurriculum';

describe('Dollar Change Questions ($1.00 Change Format)', () => {
  describe('isDollarChangeProblem detection', () => {
    it('identifies "Pay $1.00 for an item costing 85¢. Change?" correctly', () => {
      const problem = { displayString: 'Pay $1.00 for an item costing 85¢. Change?' };
      expect(isDollarChangeProblem(problem)).toBe(true);
    });

    it('identifies variations with $1 or different spacing', () => {
      expect(isDollarChangeProblem({ displayString: 'Pay $1 for an item costing 60¢. Change?' })).toBe(true);
      expect(isDollarChangeProblem({ displayString: 'Buy Trail Bar ($0.85). Change from $1.00?' })).toBe(true);
      expect(isDollarChangeProblem({ displayString: 'Spent $0.45. Change from $1?' })).toBe(true);
    });

    it('does not falsely identify non-dollar-change problems', () => {
      expect(isDollarChangeProblem({ displayString: '3 + 5' })).toBe(false);
      expect(isDollarChangeProblem({ displayString: '2 Quarters + 1 Dime' })).toBe(false);
      expect(isDollarChangeProblem({ displayString: 'Pay $5.00 for an item costing $2.50. Change?' })).toBe(false);
      expect(isDollarChangeProblem(null)).toBe(false);
    });
  });

  describe('Keystroke behavior for dollar change questions', () => {
    it('auto-fills "0." when user types 1 then 5', () => {
      // 1. Initial state is empty
      let input = '';

      // 2. User types 1
      input = computeNextInput({ currentInput: input, key: '1', isDollarChange: true });
      expect(input).toBe('0.1');

      // 3. User types 5
      input = computeNextInput({ currentInput: input, key: '5', isDollarChange: true });
      expect(input).toBe('0.15');
    });

    it('auto-fills "0." for other non-zero digits typed first (e.g. 7 then 5 for 75¢)', () => {
      let input = '';
      input = computeNextInput({ currentInput: input, key: '7', isDollarChange: true });
      expect(input).toBe('0.7');

      input = computeNextInput({ currentInput: input, key: '5', isDollarChange: true });
      expect(input).toBe('0.75');
    });

    it('allows typing 0 first, then typing a period next without issue', () => {
      let input = '';

      // User types 0 first
      input = computeNextInput({ currentInput: input, key: '0', isDollarChange: true });
      expect(input).toBe('0');

      // User types period next
      input = computeNextInput({ currentInput: input, key: '.', isDollarChange: true });
      expect(input).toBe('0.');

      // User types 1 next
      input = computeNextInput({ currentInput: input, key: '1', isDollarChange: true });
      expect(input).toBe('0.1');

      // User types 5 next
      input = computeNextInput({ currentInput: input, key: '5', isDollarChange: true });
      expect(input).toBe('0.15');
    });

    it('allows typing 0 first, then typing 1 next directly without issue', () => {
      let input = '';

      // User types 0 first
      input = computeNextInput({ currentInput: input, key: '0', isDollarChange: true });
      expect(input).toBe('0');

      // User types 1 directly next (without pressing period)
      input = computeNextInput({ currentInput: input, key: '1', isDollarChange: true });
      expect(input).toBe('0.1');

      // User types 5 next
      input = computeNextInput({ currentInput: input, key: '5', isDollarChange: true });
      expect(input).toBe('0.15');
    });

    it('auto-fills 0 before . when typing period first', () => {
      let input = '';

      // User types . first
      input = computeNextInput({ currentInput: input, key: '.', isDollarChange: true });
      expect(input).toBe('0.');

      // User types 1 next
      input = computeNextInput({ currentInput: input, key: '1', isDollarChange: true });
      expect(input).toBe('0.1');

      // User types 5 next
      input = computeNextInput({ currentInput: input, key: '5', isDollarChange: true });
      expect(input).toBe('0.15');
    });

    it('handles deletion/backspace cleanly in dollar change mode', () => {
      expect(computeDeletedInput({ currentInput: '0.15', isDollarChange: true })).toBe('0.1');
      expect(computeDeletedInput({ currentInput: '0.1', isDollarChange: true })).toBe('0.');
      expect(computeDeletedInput({ currentInput: '0.', isDollarChange: true })).toBe('');
      expect(computeDeletedInput({ currentInput: '0', isDollarChange: true })).toBe('');
    });
  });

  describe('Non-dollar change problem isolation', () => {
    it('does not auto-fill "0." for standard integer problems', () => {
      let input = '';
      input = computeNextInput({ currentInput: input, key: '1', isDollarChange: false });
      expect(input).toBe('1');

      input = computeNextInput({ currentInput: input, key: '5', isDollarChange: false });
      expect(input).toBe('15');
    });

    it('handles standard decimal problems (period first becomes 0.)', () => {
      let input = '';
      input = computeNextInput({ currentInput: input, key: '.', isDollarChange: false });
      expect(input).toBe('0.');

      input = computeNextInput({ currentInput: input, key: '5', isDollarChange: false });
      expect(input).toBe('0.5');
    });
  });

  describe('Curriculum problem format compatibility', () => {
    it('generates tier 5 dollar change problem with decimal answer format', () => {
      let dollarProb = null;
      for (let i = 0; i < 100; i++) {
        const prob = generateTierProblem(5);
        if (prob.displayString && prob.displayString.includes('Pay $1.00')) {
          dollarProb = prob;
          break;
        }
      }

      if (dollarProb) {
        expect(dollarProb.displayString).toMatch(/Pay \$1\.00 for an item costing \d+¢\. Change\?/);
        expect(isDollarChangeProblem(dollarProb)).toBe(true);
        expect(dollarProb.answerString).toMatch(/^0\.\d{2}$/);
      }
    });

    it('accepts both "0.15" and "15" through normalizeDecimal and numeric scaling', () => {
      const userNum = Number(normalizeDecimal('0.15'));
      const targetNum1 = Number(normalizeDecimal('0.15'));
      const targetNum2 = Number(normalizeDecimal('15'));

      // 0.15 matches 0.15
      expect(userNum === targetNum1).toBe(true);
      // 0.15 * 100 matches 15
      expect(Math.abs(userNum * 100 - targetNum2) < 0.001).toBe(true);
    });
  });
});
