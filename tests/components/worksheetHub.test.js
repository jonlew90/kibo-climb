import { describe, it, expect, vi } from 'vitest';
import { updateWorksheetHubSeo } from '../../src/utils/seoMetadata';
import { WORKSHEET_CATALOG, getCanonicalPath } from '../../src/utils/worksheetGenerator';
import { VIEWS, getPathForId, normalizeEntry } from '../../src/utils/navigationHistory';

describe('Worksheet Hub & Parent Experience Refactor', () => {
  it('should generate CollectionPage and LearningResource Schema.org metadata for /worksheets', () => {
    updateWorksheetHubSeo(WORKSHEET_CATALOG);

    expect(document.title).toContain('Free Printable Worksheets for Kids');
    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toBe('https://kiboclimb.com/worksheets');

    const jsonLdScript = document.getElementById('worksheet-hub-jsonld');
    expect(jsonLdScript).not.toBeNull();
    const parsed = JSON.parse(jsonLdScript.textContent);
    expect(parsed['@type']).toBe('CollectionPage');
    expect(parsed.mainEntity['@type']).toBe('ItemList');
    expect(parsed.mainEntity.itemListElement.length).toBeGreaterThan(0);
    expect(parsed.mainEntity.itemListElement[0]['@type']).toBe('LearningResource');
    expect(parsed.mainEntity.itemListElement[0].educationalLevel).toBeDefined();
  });

  it('should verify all worksheet entries in catalog have valid metadata for the hub', () => {
    const nonDynamic = WORKSHEET_CATALOG.filter(w => !w.isDynamic);
    expect(nonDynamic.length).toBeGreaterThan(0);

    nonDynamic.forEach(sheet => {
      expect(sheet.id).toBeDefined();
      expect(sheet.title).toBeDefined();
      expect(sheet.gradeLabel).toBeDefined();
      expect(sheet.subject).toBeDefined();
      expect(sheet.slug).toBeDefined();
      expect(sheet.desc || sheet.description).toBeDefined();
      expect(typeof sheet.isKiboClubOnly).toBe('boolean');
      expect(getCanonicalPath(sheet)).toBe(`/worksheets/${sheet.subject}/${sheet.slug}`);
    });
  });

  it('should support navigation history mapping for VIEWS.WORKSHEET_HUB', () => {
    expect(getPathForId(VIEWS.WORKSHEET_HUB)).toBe('/worksheets');
    const normalized = normalizeEntry({ path: '/worksheets' });
    expect(normalized.id).toBe(VIEWS.WORKSHEET_HUB);
    expect(normalized.path).toBe('/worksheets');
  });
});
