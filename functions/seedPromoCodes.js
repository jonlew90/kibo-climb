const { getFirestore } = require('firebase-admin/firestore');
const { getApps, initializeApp } = require('firebase-admin/app');

// Initialize Firebase Admin SDK
// Assumes you have set the GOOGLE_APPLICATION_CREDENTIALS environment variable
// or are running this in an environment where it's implicitly authenticated.
// For local testing, you might need to use a service account key.
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

const PROMO_CODES_REGISTRY = {
  GOLDENKIBO: {
    code: 'GOLDENKIBO',
    title: 'Golden Ticket VIP',
    description: 'Unlocks the legendary Golden Ticket gear and 150 bonus Sparks!',
    badge: '🎟️ VIP EXCLUSIVE',
    rewards: {
      sparks: 150,
      items: ['golden_ticket']
    },
    availableFrom: '2026-01-01T00:00:00Z',
    expiresAt: '2027-01-01T00:00:00Z'
  },
  KIBOSPARKS: {
    code: 'KIBOSPARKS',
    title: 'Spark Shower Boost',
    description: 'Grants +300 Sparks directly to your balance to gear up Kibo!',
    badge: '⚡ +300 SPARKS',
    rewards: {
      sparks: 300
    },
    availableFrom: '2026-01-01T00:00:00Z',
    expiresAt: '2027-01-01T00:00:00Z'
  },
  SUMMERCLIMB: {
    code: 'SUMMERCLIMB',
    title: 'Summer Climber Supply Pack',
    description: 'Grants 2x Streak Savers, 2x Hint Scrolls, and 100 bonus Sparks!',
    badge: '☀️ SUMMER SPECIAL',
    rewards: {
      sparks: 100,
      consumables: {
        streakSaverCount: 2,
        hintScrollCount: 2
      }
    },
    availableFrom: '2026-06-01T00:00:00Z',
    expiresAt: '2026-09-30T23:59:59Z'
  },
  CYBERCLIMB: {
    code: 'CYBERCLIMB',
    title: 'Cyberpunk Headwear Drop',
    description: 'Unlocks Cyber Neon Shades and 150 bonus Sparks!',
    badge: '🕶️ PROMO GEAR',
    rewards: {
      sparks: 150,
      items: ['cyber_shades']
    },
    availableFrom: '2026-01-01T00:00:00Z',
    expiresAt: '2027-01-01T00:00:00Z'
  },
  KIBOFRIEND: {
    code: 'KIBOFRIEND',
    title: 'Robot Buddy Rescue',
    description: 'Unlocks the Mini Robot pet companion and 100 Sparks!',
    badge: '🤖 PET COMPANION',
    rewards: {
      sparks: 100,
      items: ['mini_robot']
    },
    availableFrom: '2026-01-01T00:00:00Z',
    expiresAt: '2027-01-01T00:00:00Z'
  },
  OCTOBERFEST: {
    code: 'OCTOBERFEST',
    title: 'Autumn Harvest Celebration',
    description: 'Unlocks the Jack-o\'-Lantern Headwear and 100 Sparks!',
    badge: '🎃 AUTUMN SPECIAL',
    rewards: {
      sparks: 100,
      items: ['pumpkin_hat']
    },
    availableFrom: '2026-08-01T00:00:00Z',
    expiresAt: '2026-11-30T23:59:59Z'
  }
};

async function seedData() {
  console.log('Starting seed process for promo codes...');
  const batch = db.batch();
  const collectionRef = db.collection('promoCodes');

  for (const [key, value] of Object.entries(PROMO_CODES_REGISTRY)) {
    const docRef = collectionRef.doc(key);
    batch.set(docRef, value);
    console.log(`Added code ${key} to batch.`);
  }

  try {
    await batch.commit();
    console.log('Successfully seeded promo codes into Firestore.');
  } catch (error) {
    console.error('Error seeding promo codes:', error);
  } finally {
    process.exit(0);
  }
}

seedData();
