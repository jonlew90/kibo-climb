import { describe, it, expect } from 'vitest';
import {
  WORKSHEET_CATALOG,
  getWorksheetsForSubject,
  getWorksheetById,
  generateProblemsForWorksheet,
  generateWorksheetHtml
} from '../../src/utils/worksheetGenerator';

describe('worksheetGenerator', () => {
  it('should have catalog entries for all primary subjects with exactly 16 questions', () => {
    const subjects = ['math', 'words', 'world', 'coding'];
    subjects.forEach((sub) => {
      const sheets = getWorksheetsForSubject(sub);
      expect(sheets.length).toBeGreaterThan(0);
      expect(sheets.some(s => !s.isKiboClubOnly)).toBe(true);
      expect(sheets.some(s => s.isKiboClubOnly)).toBe(true);

      sheets.forEach(sheet => {
        const problems = generateProblemsForWorksheet(sheet.id);
        expect(problems.length).toBe(16);
        expect(problems[0].q).toBeDefined();
        expect(problems[0].ans).toBeDefined();
      });
    });
  });

  it('should generate personalized problems using recent mistakes', () => {
    const mockMistakes = [
      { question: '7 × 8 = ?', correctAnswer: '56' },
      { question: '9 × 6 = ?', correctAnswer: '54' }
    ];
    const problems = generateProblemsForWorksheet('math_club_weak_spot', mockMistakes);
    expect(problems.length).toBe(16);
    expect(problems[0].q).toContain('7 × 8');
    expect(problems[0].ans).toBe('56');
  });

  it('should format clean 2-page HTML with mascot branding and answer keys', () => {
    const sheet = WORKSHEET_CATALOG[0];
    const html = generateWorksheetHtml(sheet, 'Alex', []);
    expect(html).toContain('Kibo the Red Panda Mascot 🐾');
    expect(html).toContain('page-1');
    expect(html).toContain('page-2');
    expect(html).toContain('Parent Answer Key');
    expect(html).toContain('@media print');
    expect(html).toContain('Alex');
  });
});
