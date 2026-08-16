// Script to generate the comprehensive 2,200+ word child-friendly curriculum for Kibo Words
import fs from 'fs';
import path from 'path';

// Let's create the master tiers
import { tier1Words } from './data/tier1.js';
import { tier2Words } from './data/tier2.js';
import { tier3Words } from './data/tier3.js';
import { tier4Words } from './data/tier4.js';
import { tier5Words } from './data/tier5.js';
import { tier6Words } from './data/tier6.js';
import { tier7Words } from './data/tier7.js';
import { tier8Words } from './data/tier8.js';

const allTiers = {
  1: tier1Words,
  2: tier2Words,
  3: tier3Words,
  4: tier4Words,
  5: tier5Words,
  6: tier6Words,
  7: tier7Words,
  8: tier8Words
};

let total = 0;
for (let t = 1; t <= 8; t++) {
  const words = allTiers[t];
  const unique = new Set(words.map(x => x.word.toLowerCase()));
  console.log(`Tier ${t}: ${words.length} items (${unique.size} unique)`);
  total += words.length;
}
console.log(`Total Master Dictionary Count: ${total}`);
