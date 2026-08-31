import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security Hardening Validations', () => {
  it('firestore.rules should lock down weekly_leagues writes to server only', () => {
    const rulesPath = path.resolve(__dirname, '../../firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');

    expect(rulesContent).toContain('match /weekly_leagues/{docId}');
    expect(rulesContent).toContain('allow write: if false;');
  });

  it('firestore.rules should constrain leaderboard score and name sizes', () => {
    const rulesPath = path.resolve(__dirname, '../../firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');

    expect(rulesContent).toContain('match /leaderboard/{userId}');
    expect(rulesContent).toContain("request.resource.data.score <= 20000");
    expect(rulesContent).toContain("request.resource.data.name.size() <= 40");
  });

  it('firestore.rules should constrain weekly_stats sparks and maxStreak bounds', () => {
    const rulesPath = path.resolve(__dirname, '../../firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');

    expect(rulesContent).toContain('match /weekly_stats/{docId}');
    expect(rulesContent).toContain("request.resource.data.sparks <= 500000");
    expect(rulesContent).toContain("request.resource.data.maxStreak <= 1000");
  });

  it('functions/index.js should enforce authentication on claimUsername and sendParentEmail', () => {
    const functionsPath = path.resolve(__dirname, '../../functions/index.js');
    const functionsContent = fs.readFileSync(functionsPath, 'utf8');

    expect(functionsContent).toContain('exports.claimUsername = onCall(');
    expect(functionsContent).toContain('if (!request.auth || !request.auth.uid)');
    expect(functionsContent).toContain('exports.sendParentEmail = onCall(');
    expect(functionsContent).toContain('email_rate_limits');
  });
});
