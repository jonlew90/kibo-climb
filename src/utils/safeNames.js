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

// Curated compact list (<= 5 chars) for guaranteed mobile single-line fit on leaderboards
export const SHORT_SAFE_ADJECTIVES = [
  'Epic', 'Brave', 'Swift', 'Nova', 'Cool', 'Sunny', 'Star', 'Bold', 'Gold',
  'Wise', 'Fast', 'Keen', 'Hero', 'Ruby', 'Apex', 'Wild', 'Calm', 'Pure',
  'Neon', 'Zippy', 'Hyper', 'Super', 'Turbo', 'Quick', 'Frost', 'Spark',
  'Grand', 'Noble', 'Sonic', 'Vivid', 'Crisp', 'Brisk', 'Kind', 'True',
  'Stout', 'Lively', 'Agile', 'Merry', 'Jolly', 'Lucky', 'Warm', 'Cosmo'
];

export const SHORT_SAFE_NOUNS = [
  'Fox', 'Lynx', 'Bear', 'Wolf', 'Hawk', 'Owl', 'Puma', 'Lion', 'Stag',
  'Star', 'Comet', 'Seal', 'Orca', 'Gecko', 'Robin', 'Finch', 'Panda',
  'Tiger', 'Koala', 'Eagle', 'Otter', 'Puffin', 'Bison', 'Must', 'Apex',
  'Hero', 'Nova', 'Spark', 'Echo', 'Atlas', 'Titan', 'Pulse', 'Nexus',
  'Dort', 'Rider', 'Scout', 'Ranger', 'Dart', 'Bolt', 'Ray', 'Gull', 'Wren'
];

/**
 * Generates a random COPPA-safe kid name.
 * 100+ Adjectives * 100+ Nouns * 900 numbers (100–999) = 9,000,000+ combinations.
 */
export function generateSafeUsername() {
  const adj = SAFE_ADJECTIVES[Math.floor(Math.random() * SAFE_ADJECTIVES.length)];
  const noun = SAFE_NOUNS[Math.floor(Math.random() * SAFE_NOUNS.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  const name = `${adj}${noun}${num}`;
  return name.length > 20 ? `${adj.slice(0, 8)}${noun.slice(0, 8)}${num}`.slice(0, 20) : name;
}

/**
 * Deterministically generates a compact, COPPA-safe anonymous alias from a string seed (e.g. uid or documentId).
 * Guaranteed to be <= 12 characters (e.g. "BraveFox#42") to fit comfortably on 1 line across all mobile screens.
 */
export function getDeterministicAnonymousName(seed = '') {
  if (!seed) return 'Fox#42';
  
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
  
  const adj = SHORT_SAFE_ADJECTIVES[positiveHash1 % SHORT_SAFE_ADJECTIVES.length];
  const noun = SHORT_SAFE_NOUNS[positiveHash2 % SHORT_SAFE_NOUNS.length];
  const num = (positiveHash1 % 90) + 10; // 2-digit number (10–99)
  
  return `${adj}${noun}#${num}`;
}

const COMMON_FIRST_NAMES = new Set([
  'james', 'john', 'robert', 'michael', 'william', 'david', 'richard', 'joseph', 'thomas', 'charles',
  'christopher', 'daniel', 'matthew', 'anthony', 'donald', 'mark', 'paul', 'steven', 'andrew', 'kenneth',
  'joshua', 'george', 'kevin', 'brian', 'edward', 'ronald', 'timothy', 'jason', 'jeffrey', 'ryan',
  'jacob', 'gary', 'nicholas', 'eric', 'jonathan', 'stephen', 'larry', 'justin', 'scott', 'brandon',
  'benjamin', 'samuel', 'gregory', 'alexander', 'patrick', 'frank', 'raymond', 'jack', 'dennis', 'jerry',
  'mary', 'patricia', 'jennifer', 'linda', 'elizabeth', 'barbara', 'susan', 'jessica', 'sarah', 'karen',
  'nancy', 'lisa', 'betty', 'margaret', 'sandra', 'ashley', 'kimberly', 'emily', 'donna', 'michelle',
  'dorothy', 'carol', 'amanda', 'melissa', 'deborah', 'stephanie', 'rebecca', 'sharon', 'laura', 'cynthia',
  'kathleen', 'amy', 'shirley', 'angela', 'helen', 'anna', 'brenda', 'pamela', 'nicole', 'samantha',
  'katherine', 'emma', 'christine', 'debra', 'rachel', 'catherine', 'carolyn', 'janet', 'ruth', 'maria',
  'heather', 'diane', 'virginia', 'julie', 'joyce', 'victoria', 'olivia', 'kelly', 'christina', 'lauren',
  'joan', 'evelyn', 'judith', 'megan', 'cheryl', 'andrea', 'hannah', 'martha', 'jacqueline', 'frances',
  'gloria', 'ann', 'teresa', 'kathryn', 'sara', 'janice', 'jean', 'alice', 'madison', 'doris', 'abigail',
  'julia', 'judy', 'grace', 'denise', 'amber', 'marilyn', 'beverly', 'danielle', 'theresa', 'sophia',
  'marie', 'diana', 'brittany', 'natalie', 'isabella', 'charlotte', 'amelia', 'harper', 'ava', 'lucas',
  'liam', 'noah', 'oliver', 'elijah', 'mateo', 'leo', 'mason', 'ethan', 'aiden', 'logan'
]);

const COMMON_SURNAMES = new Set([
  'smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis', 'rodriguez', 'martinez',
  'hernandez', 'lopez', 'gonzalez', 'wilson', 'anderson', 'thomas', 'taylor', 'moore', 'jackson', 'martin',
  'lee', 'perez', 'thompson', 'white', 'harris', 'sanchez', 'clark', 'ramirez', 'lewis', 'robinson',
  'walker', 'young', 'allen', 'king', 'wright', 'scott', 'torres', 'nguyen', 'hill', 'flores',
  'green', 'adams', 'nelson', 'baker', 'hall', 'rivera', 'campbell', 'mitchell', 'carter', 'roberts',
  'gomez', 'phillips', 'evans', 'turner', 'diaz', 'parker', 'cruz', 'edwards', 'collins', 'reyes',
  'stewart', 'morris', 'morales', 'murphy', 'cook', 'rogers', 'gutierrez', 'ortiz', 'morgan', 'cooper',
  'peterson', 'bailey', 'reed', 'kelly', 'howard', 'ramos', 'kim', 'cox', 'ward', 'richardson',
  'watson', 'brooks', 'chavez', 'wood', 'james', 'bennett', 'gray', 'mendoza', 'ruiz', 'hughes',
  'price', 'alvarez', 'castillo', 'sanders', 'patel', 'myers', 'long', 'ross', 'foster', 'jimenez'
]);

/**
 * Checks if a string resembles a real first + last name combination.
 */
function resemblesRealFullName(str) {
  const clean = str.toLowerCase().replace(/[^a-z_]/g, '');
  if (clean.includes('_')) {
    const parts = clean.split('_').filter(Boolean);
    if (parts.length >= 2) {
      if ((COMMON_FIRST_NAMES.has(parts[0]) && COMMON_SURNAMES.has(parts[1])) ||
          (COMMON_SURNAMES.has(parts[0]) && COMMON_FIRST_NAMES.has(parts[1]))) {
        return true;
      }
    }
  }
  const noUnderscore = clean.replace(/_/g, '');
  if (noUnderscore.length >= 6) {
    for (let i = 3; i <= noUnderscore.length - 3; i++) {
      const p1 = noUnderscore.slice(0, i);
      const p2 = noUnderscore.slice(i);
      if (COMMON_FIRST_NAMES.has(p1) && COMMON_SURNAMES.has(p2)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * COPPA Child Data Minimization: Validates that a username contains no PII
 * (e.g. no emails, phone numbers, real names, or invalid characters).
 */
export function validateSafeChildUsername(val) {
  if (!val || val.trim().length === 0) return 'Please enter a username.';
  const trimmed = val.trim();
  if (trimmed.length < 3) return 'Must be at least 3 characters.';
  if (trimmed.length > 20) return 'Must be 20 characters or fewer.';
  // Data minimization: block email patterns
  if (/@/.test(trimmed) || /\.(com|org|net|edu|io|co)/i.test(trimmed)) {
    return 'COPPA notice: Usernames cannot contain emails or web domains.';
  }
  // Data minimization: block phone numbers (7+ consecutive digits)
  if (/\d{7,}/.test(trimmed)) {
    return 'COPPA notice: Usernames cannot contain phone numbers.';
  }
  // Data minimization: block real first and last names
  if (resemblesRealFullName(trimmed)) {
    return 'COPPA notice: Please avoid using your real first and last name. Pick a climber nickname or click "Generate Kid-Safe Tag"!';
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) return 'Letters, numbers, and underscores only.';
  return null;
}


