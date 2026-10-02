import { describe, it, expect } from 'vitest';
import { VIEWS, getPathForId, normalizeEntry } from '../src/utils/navigationHistory';
import { getAllTipsAndStrategies, CORE_STRATEGY_CHEATS } from '../src/utils/tipsCatalog';

describe('Tips & Tricks Strategy Hub (/tips)', () => {
  describe('Routing & Navigation', () => {
    it('maps VIEWS.TIPS_HUB to /tips path', () => {
      expect(VIEWS.TIPS_HUB).toBe('tips_hub');
      expect(getPathForId(VIEWS.TIPS_HUB)).toBe('/tips');
    });

    it('normalizes /tips and /tips/ paths to TIPS_HUB view', () => {
      const entry1 = normalizeEntry({ path: '/tips' });
      expect(entry1.id).toBe(VIEWS.TIPS_HUB);
      expect(entry1.path).toBe('/tips');

      const entry2 = normalizeEntry({ path: '/tips/' });
      expect(entry2.id).toBe(VIEWS.TIPS_HUB);
      expect(entry2.path).toBe('/tips');
    });
  });

  describe('Tips & Strategy Catalog Synthesis', () => {
    it('provides core curated interactive cheat-sheets across subjects', () => {
      expect(CORE_STRATEGY_CHEATS.length).toBeGreaterThanOrEqual(5);

      const mathCheats = CORE_STRATEGY_CHEATS.filter(c => c.subject === 'math');
      const wordsCheats = CORE_STRATEGY_CHEATS.filter(c => c.subject === 'words');
      const codingCheats = CORE_STRATEGY_CHEATS.filter(c => c.subject === 'coding');
      const worldCheats = CORE_STRATEGY_CHEATS.filter(c => c.subject === 'world');

      expect(mathCheats.length).toBeGreaterThan(0);
      expect(wordsCheats.length).toBeGreaterThan(0);
      expect(codingCheats.length).toBeGreaterThan(0);
      expect(worldCheats.length).toBeGreaterThan(0);

      // Verify every curated cheat has a formula and blog link
      CORE_STRATEGY_CHEATS.forEach(cheat => {
        expect(cheat.title).toBeDefined();
        expect(cheat.formula).toBeDefined();
        expect(cheat.blogSlug).toBeDefined();
      });
    });

    it('dynamically ingests all live blog posts without duplication', () => {
      const allCheats = getAllTipsAndStrategies();
      expect(allCheats.length).toBeGreaterThanOrEqual(CORE_STRATEGY_CHEATS.length);

      // Verify unique slugs
      const slugs = allCheats.map(c => c.blogSlug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });
  });
});
