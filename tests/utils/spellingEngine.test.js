import { describe, it, expect } from 'vitest';
import {
  getSpellingVariants,
  getPreferredSpelling,
  checkSpellingAttempt
} from '../../src/utils/spellingEngine.js';

describe('spellingEngine', () => {
  it('returns valid variants for US and UK spellings', () => {
    expect(getSpellingVariants('color')).toEqual(expect.arrayContaining(['color', 'colour']));
    expect(getSpellingVariants('colour')).toEqual(expect.arrayContaining(['color', 'colour']));
    expect(getSpellingVariants('center')).toEqual(expect.arrayContaining(['center', 'centre']));
    expect(getSpellingVariants('organize')).toEqual(expect.arrayContaining(['organize', 'organise']));
  });

  it('selects preferred spelling based on dialect', () => {
    expect(getPreferredSpelling('color', 'en-GB')).toBe('colour');
    expect(getPreferredSpelling('colour', 'en-US')).toBe('color');
    expect(getPreferredSpelling('theatre', 'en-US')).toBe('theater');
    expect(getPreferredSpelling('theater', 'en-GB')).toBe('theatre');
  });

  it('validates user attempts correctly for identical and regional variants', () => {
    // Exact match
    const exact = checkSpellingAttempt('color', 'color', true);
    expect(exact.isCorrect).toBe(true);
    expect(exact.isVariant).toBe(false);

    // British variant of American target
    const variant = checkSpellingAttempt('colour', 'color', true);
    expect(variant.isCorrect).toBe(true);
    expect(variant.isVariant).toBe(true);
    expect(variant.matchedVariant).toBe('colour');

    // American variant of British target
    const variantUS = checkSpellingAttempt('center', 'centre', true);
    expect(variantUS.isCorrect).toBe(true);
    expect(variantUS.isVariant).toBe(true);

    // Incorrect spelling
    const wrong = checkSpellingAttempt('colur', 'color', true);
    expect(wrong.isCorrect).toBe(false);
  });
});
