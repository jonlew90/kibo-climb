import { describe, it, expect } from 'vitest';
import {
  getClueHintMessage,
  getClueHintedPositions,
  selectSpyglassSlot,
  adjustInputForSpyglassReveal
} from '../src/utils/wordsCurriculum';

describe('Clue and Spyglass Non-Overlapping Behavior', () => {
  it('should not reveal start clue when slot 0 is already revealed by spyglass or given', () => {
    const targetStr = 'BOAT';
    const effectiveWordSlots = ['B', '_', '_', '_']; // 'B' revealed
    const clueMessage = getClueHintMessage({
      targetStr,
      effectiveWordSlots
    });

    // Clue should NOT say "Starts with 'B'" since 'B' is already revealed at slot 0
    expect(clueMessage).not.toContain("Starts with 'B'");
    expect(clueMessage).toContain("ends with 'T'");
    expect(clueMessage).toContain("Vowels: O, A");
  });

  it('should not reveal ending clue when last slot is already revealed by spyglass or given', () => {
    const targetStr = 'CRANE';
    const effectiveWordSlots = ['_', '_', '_', '_', 'E']; // 'E' at end revealed
    const clueMessage = getClueHintMessage({
      targetStr,
      effectiveWordSlots
    });

    expect(clueMessage).toContain("Starts with 'CR' blend");
    expect(clueMessage).not.toContain("ends with 'E'");
    expect(clueMessage).toContain("Vowel: A"); // Only unrevealed vowel 'A'
  });

  it('should only list unrevealed vowels in vowel clue when some vowels are already uncovered', () => {
    const targetStr = 'ELEPHANT';
    // Let's say vowels at index 0 ('E') and 2 ('E') are already revealed
    const effectiveWordSlots = ['E', '_', 'E', '_', '_', '_', '_', '_'];
    const clueMessage = getClueHintMessage({
      targetStr,
      effectiveWordSlots
    });

    // Unrevealed vowel is only 'A' (at index 5)
    expect(clueMessage).toContain("Vowel: A");
    expect(clueMessage).not.toContain("E, A");
  });

  it('should select an unhinted blank slot for Spyglass when Wisdom Clue is active', () => {
    const targetStr = 'PLANT'; // 5 letters: P (0), L (1), A (2), N (3), T (4)
    const effectiveWordSlots = ['_', '_', '_', '_', '_'];
    const blankSlotIndices = [0, 1, 2, 3, 4];

    // Clue hints: Starts with 'PL' (0, 1), Vowel: A (2), ends with 'T' (4)
    // Unhinted slot is index 3 ('N')
    const chosenSlot = selectSpyglassSlot({
      targetStr,
      effectiveWordSlots,
      isClueActive: true,
      blankSlotIndices
    });

    expect(chosenSlot).toBe(3); // Spyglass picks unhinted 'N' at index 3!
  });

  it('should pick slot 0 for Spyglass when Clue is NOT active', () => {
    const targetStr = 'PLANT';
    const effectiveWordSlots = ['_', '_', '_', '_', '_'];
    const blankSlotIndices = [0, 1, 2, 3, 4];

    const chosenSlot = selectSpyglassSlot({
      targetStr,
      effectiveWordSlots,
      isClueActive: false,
      blankSlotIndices
    });

    expect(chosenSlot).toBe(0);
  });

  it('should handle full multi-step sequence of Clue then multiple Spyglasses', () => {
    const targetStr = 'FROST'; // F(0), R(1), O(2), S(3), T(4)
    let effectiveWordSlots = ['_', '_', '_', '_', '_'];
    let blankSlotIndices = [0, 1, 2, 3, 4];

    // Step 1: User activates Clue
    const clue1 = getClueHintMessage({ targetStr, effectiveWordSlots });
    expect(clue1).toContain("Starts with 'FR' blend");
    expect(clue1).toContain("Vowel: O");
    expect(clue1).toContain("ends with 'T'");

    // Step 2: User uses Spyglass #1 -> Should pick slot 3 ('S')
    const spyglassSlot1 = selectSpyglassSlot({
      targetStr,
      effectiveWordSlots,
      isClueActive: true,
      blankSlotIndices
    });
    expect(spyglassSlot1).toBe(3);

    // Apply Spyglass #1 reveal
    effectiveWordSlots[3] = 'S';
    blankSlotIndices = [0, 1, 2, 4];

    // Step 3: User uses Spyglass #2 -> Remaining blanks are 0(F), 1(R), 2(O), 4(T).
    // It should prioritize non-boundary/vowel slot (1 or 2) over exact start/end boundary (0 or 4)
    const spyglassSlot2 = selectSpyglassSlot({
      targetStr,
      effectiveWordSlots,
      isClueActive: true,
      blankSlotIndices
    });
    expect([1, 2]).toContain(spyglassSlot2);

    // Apply Spyglass #2 reveal (say slot 2 'O' was revealed)
    effectiveWordSlots[2] = 'O';
    blankSlotIndices = [0, 1, 4];

    // Step 4: Check that Clue message dynamically updated and no longer lists vowel 'O'
    const clue2 = getClueHintMessage({ targetStr, effectiveWordSlots });
    expect(clue2).not.toContain("Vowel: O");
    expect(clue2).toContain("Starts with 'FR' blend");
    expect(clue2).toContain("ends with 'T'");
  });

  describe('adjustInputForSpyglassReveal', () => {
    it('should preserve typed letters in remaining blanks when an un-typed slot is revealed', () => {
      // blanks at [1, 2, 3], user typed 'L' into slot 1 and 'A' into slot 2
      // spyglass reveals slot 3
      const adjusted = adjustInputForSpyglassReveal({
        inputVal: 'LA',
        blankSlotIndices: [1, 2, 3],
        targetPos: 3
      });
      expect(adjusted).toBe('LA');
    });

    it('should discard the character for a slot that was already typed when that exact slot is revealed', () => {
      // blanks at [1, 2, 3], user typed 'L' into slot 1 and 'A' into slot 2
      // spyglass reveals slot 2 (which had 'A')
      const adjusted = adjustInputForSpyglassReveal({
        inputVal: 'LA',
        blankSlotIndices: [1, 2, 3],
        targetPos: 2
      });
      // Remaining blanks are [1, 3]. Slot 1 had 'L', slot 3 was empty -> 'L'
      expect(adjusted).toBe('L');
    });

    it('should discard the first character if slot 1 is revealed and preserve slot 2 character in its position', () => {
      // blanks at [1, 2, 3], user typed 'L' into slot 1 and 'A' into slot 2
      // spyglass reveals slot 1 (which had 'L')
      const adjusted = adjustInputForSpyglassReveal({
        inputVal: 'LA',
        blankSlotIndices: [1, 2, 3],
        targetPos: 1
      });
      // Remaining blanks are [2, 3]. Slot 2 had 'A', slot 3 was empty -> 'A'
      expect(adjusted).toBe('A');
    });

    it('should handle empty or full input smoothly', () => {
      expect(adjustInputForSpyglassReveal({ inputVal: '', blankSlotIndices: [0, 1], targetPos: 0 })).toBe('');
      expect(adjustInputForSpyglassReveal({ inputVal: 'CAT', blankSlotIndices: [0, 1, 2], targetPos: 1 })).toBe('CT');
    });
  });
});
