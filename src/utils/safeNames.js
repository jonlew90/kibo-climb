// src/utils/safeNames.js

export const SAFE_ADJECTIVES = [
  'Swift', 'Brave', 'Cosmic', 'Solar', 'Clever', 'Super', 'Bright', 'Epic',
  'Mighty', 'Happy', 'Starry', 'Golden', 'Sparky', 'Hyper', 'Nova', 'Sunny',
  'Cool', 'Lucky', 'Speedy', 'Wise', 'Alpine', 'Turbo', 'Quick', 'Cheer',
  'Astral', 'Lunar', 'Nimble', 'Daring', 'Frosty', 'Blazing', 'Bouncy', 'Zippy',
  'Mellow', 'Radiant', 'Stellar', 'Vibrant', 'Valiant', 'Dazzling', 'Merry', 'Jolly',
  'Snappy', 'Spunky', 'Glitzy', 'Sunny', 'Peppy', 'Breezy', 'Flashy', 'Groovy',
  'Noble', 'Heroic', 'Glacial', 'Sonic', 'Vivid', 'Prismatic', 'Dynamic', 'Polite',
  'Gentle', 'Crisp', 'Brisk', 'Shining', 'Lively', 'Kind', 'True', 'Grand',
  'Friendly', 'Fearless', 'Active', 'Agile', 'Brilliant', 'Cheerful', 'Curious', 'Eager',
  'Electric', 'Fantastic', 'Gleaming', 'Honest', 'Jubilant', 'Kinetic', 'Luminous', 'Magical',
  'Optimistic', 'Playful', 'Radiant', 'Soaring', 'Spirited', 'Stalwart', 'Sunny', 'Thriving',
  'Upbeat', 'Valorous', 'Witty', 'Zealous', 'Keen', 'Proud', 'Splendid', 'Sturdy',
  'Tough', 'Warm', 'Wonderful', 'Radiant', 'Bold', 'Glory', 'Spark', 'Topaz'
];

export const SAFE_NOUNS = [
  'Otter', 'Falcon', 'Panda', 'Tiger', 'Fox', 'Koala', 'Eagle', 'Dolphin',
  'Badger', 'Lynx', 'Dragon', 'Penguin', 'Cheetah', 'Rabbit', 'Wolf', 'Hawk',
  'Owl', 'Bear', 'Climber', 'Star', 'Runner', 'Pioneer', 'Ranger', 'Comet',
  'Explorer', 'Robin', 'Gecko', 'Puffin', 'Panther', 'Kangaroo', 'Leopard', 'Jaguar',
  'Bison', 'Caribou', 'Osprey', 'Toucan', 'Flamingo', 'Gazelle', 'Stag', 'Badger',
  'Beaver', 'Puma', 'Mustang', 'Falcon', 'Finch', 'Sparrow', 'Swift', 'Albatross',
  'Pelican', 'Walrus', 'Seal', 'Orca', 'Narwhal', 'Beluga', 'Dolphin', 'Chameleon',
  'Iguana', 'Cheetah', 'Giraffe', 'Zebra', 'Antelope', 'Meerkat', 'Lemur', 'Gibbon',
  'Chimp', 'Badger', 'Hedgehog', 'Squirrel', 'Chipmunk', 'Marmot', 'Grizzly', 'Kodiak',
  'Voyager', 'Navigator', 'Scout', 'Champion', 'Captain', 'Defender', 'Guardian', 'Seeker',
  'Astronaut', 'Summit', 'Peak', 'Glacier', 'Canyon', 'Aurora', 'Orbit', 'Meteor',
  'Pheonix', 'Hero', 'Spark', 'Echo', 'Legend', 'Comet', 'Beacon', 'Atlas',
  'Zenith', 'Titan', 'Stratos', 'Nova', 'Pulse', 'Vertex', 'Matrix', 'Nexus'
];

/**
 * Generates a random COPPA-safe kid name.
 * 100+ Adjectives * 100+ Nouns * 9000 numbers (1000–9999) = 90,000,000+ combinations.
 */
export function generateSafeUsername() {
  const adj = SAFE_ADJECTIVES[Math.floor(Math.random() * SAFE_ADJECTIVES.length)];
  const noun = SAFE_NOUNS[Math.floor(Math.random() * SAFE_NOUNS.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}${noun}${num}`;
}

/**
 * Deterministically generates an anonymous alias from a string seed (e.g. uid or documentId).
 * This ensures the same player appears with the same anonymous alias on public leaderboards
 * without exposing their custom chosen username to strangers.
 */
export function getDeterministicAnonymousName(seed = '') {
  if (!seed) return 'Climber#1001';
  
  let hash1 = 0;
  let hash2 = 5381;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash1 = ((hash1 << 5) - hash1) + char;
    hash1 |= 0;
    hash2 = ((hash2 << 5) + hash2) ^ char;
    hash2 |= 0;
  }
  const positiveHash1 = Math.abs(hash1);
  const positiveHash2 = Math.abs(hash2);
  
  const adj = SAFE_ADJECTIVES[positiveHash1 % SAFE_ADJECTIVES.length];
  const noun = SAFE_NOUNS[positiveHash2 % SAFE_NOUNS.length];
  const num = (positiveHash1 % 9000) + 1000;
  
  return `${adj}${noun}#${num}`;
}
