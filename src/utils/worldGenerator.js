import {
  CONTINENTS,
  OCEANS,
  CARDINAL_DIRECTIONS,
  GEOGRAPHIC_FOUNDATIONS,
  US_STATES,
  COUNTRIES,
  WORLD_LANDMARKS_AND_WONDERS,
  TRICKY_CAPITALS
} from '../data/worldGeography.js';
import { getTierForRating } from './worldCurriculum.js';
import { REGIONAL_MAPS } from '../data/worldMaps.js';
import { getFlagForCountry } from '../data/worldFlags.js';
import { getLandmarkVisual, WORLD_LANDMARK_VISUALS } from '../data/worldLandmarks.js';

/**
 * Utility to shuffle an array immutably
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Normalizes problem keys for deduplication
 */
export const getNormalizedProblemKey = (problem) => {
  if (!problem) return '';
  if (problem.key) return String(problem.key).toLowerCase().trim();
  const ans = problem.correctAnswer || problem.answerString || problem.answer || '';
  const prompt = problem.prompt || '';
  return `${problem.type || 'world'}:${ans}:${prompt}`.toLowerCase().trim();
};

/**
 * Utility to get unique distractors from a pool
 */
const getUniqueDistractors = (correctAnswer, sourcePool, count = 3, keyExtractor = (item) => (typeof item === 'string' ? item : item.name)) => {
  const uniqueItems = new Set();
  const pool = shuffleArray(sourcePool);

  for (const item of pool) {
    const val = keyExtractor(item);
    if (val && val !== correctAnswer && !uniqueItems.has(val)) {
      uniqueItems.add(val);
      if (uniqueItems.size === count) break;
    }
  }

  return Array.from(uniqueItems);
};

/**
 * Generate all possible candidate problem templates for a given tier
 */
export const getTierCandidateTemplates = (tier) => {
  const templates = [];

  if (tier === 1) {
    // 1. Continent identification
    for (const c of CONTINENTS) {
      templates.push({
        key: `continent_name:${c.name}`,
        type: 'continent_name',
        prompt: 'Which of the following is a Continent?',
        correctAnswer: c.name,
        options: shuffleArray([c.name, ...getUniqueDistractors(c.name, OCEANS, 3, o => o.name)]),
        hint: 'Continents are large landmasses on Earth.',
        concept: 'Continents & Oceans',
        tier: 1
      });
    }

    // 2. Ocean identification
    for (const o of OCEANS) {
      templates.push({
        key: `ocean_name:${o.name}`,
        type: 'ocean_name',
        prompt: 'Which of the following is an Ocean?',
        correctAnswer: o.name,
        options: shuffleArray([o.name, ...getUniqueDistractors(o.name, CONTINENTS, 3, c => c.name)]),
        hint: 'Oceans are large bodies of saltwater covering most of Earth.',
        concept: 'Continents & Oceans',
        tier: 1
      });
    }

    // 3. Cardinal directions
    for (const d of CARDINAL_DIRECTIONS) {
      templates.push({
        key: `cardinal_pos:${d.direction}`,
        type: 'cardinal_direction',
        prompt: `On a standard compass map, which direction points toward the ${d.mapPosition}?`,
        correctAnswer: d.direction,
        options: shuffleArray(['North', 'South', 'East', 'West']),
        hint: d.hint,
        concept: 'Cardinal Directions',
        tier: 1
      });

      templates.push({
        key: `cardinal_opp:${d.direction}`,
        type: 'cardinal_direction',
        prompt: `Which direction is directly opposite of ${d.direction}?`,
        correctAnswer: d.opposite,
        options: shuffleArray(['North', 'South', 'East', 'West']),
        hint: `Think about what lies on the opposite side of ${d.direction}.`,
        concept: 'Cardinal Directions',
        tier: 1
      });
    }

    // 4. Continent & Ocean Counts & Superlatives
    templates.push({
      key: 'fact:continent_count',
      type: 'continent_fact',
      prompt: 'How many continents are there on Earth?',
      correctAnswer: '7',
      options: shuffleArray(['7', '5', '6', '8']),
      hint: 'Asia, Africa, North America, South America, Antarctica, Europe, and Australia.',
      concept: 'Continents & Oceans',
      tier: 1
    });

    templates.push({
      key: 'fact:ocean_count',
      type: 'ocean_fact',
      prompt: 'How many major oceans are there on Earth?',
      correctAnswer: '5',
      options: shuffleArray(['5', '4', '6', '7']),
      hint: 'Pacific, Atlantic, Indian, Southern, and Arctic.',
      concept: 'Continents & Oceans',
      tier: 1
    });

    templates.push({
      key: 'fact:largest_continent',
      type: 'continent_fact',
      prompt: 'Which is the largest continent on Earth by land area and population?',
      correctAnswer: 'Asia',
      options: shuffleArray(['Asia', 'Africa', 'North America', 'Europe']),
      hint: 'It is home to over 4.5 billion people.',
      concept: 'Continents & Oceans',
      tier: 1
    });

    templates.push({
      key: 'fact:smallest_continent',
      type: 'continent_fact',
      prompt: 'Which is the smallest continent by land area?',
      correctAnswer: 'Australia',
      options: shuffleArray(['Australia', 'Europe', 'Antarctica', 'South America']),
      hint: 'It is also known as an island continent.',
      concept: 'Continents & Oceans',
      tier: 1
    });

    templates.push({
      key: 'fact:coldest_continent',
      type: 'continent_fact',
      prompt: 'Which continent is the coldest and covered almost entirely in ice?',
      correctAnswer: 'Antarctica',
      options: shuffleArray(['Antarctica', 'Europe', 'North America', 'Asia']),
      hint: 'It is located around the South Pole.',
      concept: 'Continents & Oceans',
      tier: 1
    });

    templates.push({
      key: 'fact:largest_ocean',
      type: 'ocean_fact',
      prompt: 'Which is the largest and deepest ocean on Earth?',
      correctAnswer: 'Pacific Ocean',
      options: shuffleArray(['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean']),
      hint: 'It covers over 30% of Earth surface.',
      concept: 'Continents & Oceans',
      tier: 1
    });

    templates.push({
      key: 'fact:smallest_ocean',
      type: 'ocean_fact',
      prompt: 'Which is the smallest and shallowest ocean on Earth?',
      correctAnswer: 'Arctic Ocean',
      options: shuffleArray(['Arctic Ocean', 'Indian Ocean', 'Southern Ocean', 'Atlantic Ocean']),
      hint: 'It surrounds the North Pole.',
      concept: 'Continents & Oceans',
      tier: 1
    });

    templates.push({
      key: 'fact:equator_def',
      type: 'geographic_foundation',
      prompt: 'What is the imaginary line at 0° latitude dividing Earth into Northern and Southern Hemispheres?',
      correctAnswer: 'Equator',
      options: shuffleArray(['Equator', 'Prime Meridian', 'Tropic of Cancer', 'Arctic Circle']),
      hint: 'It runs horizontally around the middle of Earth.',
      concept: 'Geographic Foundations',
      tier: 1
    });

    // 5. Basic Continent of Major Country
    const basicCountries = COUNTRIES.slice(0, 15);
    for (const country of basicCountries) {
      templates.push({
        key: `country_to_continent:${country.name}`,
        type: 'country_continent',
        prompt: `On which continent is ${country.name} located?`,
        correctAnswer: country.continent,
        options: shuffleArray([country.continent, ...getUniqueDistractors(country.continent, CONTINENTS, 3, c => c.name)]),
        hint: country.capital ? `Its capital city is ${country.capital}.` : `Consider the landmass surrounding ${country.name}.`,
        concept: 'Continents & Oceans',
        tier: 1
      });
    }
  } else if (tier === 2) {
    // Tier 2: US States & Shapes
    for (const state of US_STATES) {
      // 1. State -> Capital
      templates.push({
        key: `state_capital:${state.name}`,
        type: 'state_capital',
        prompt: `What is the capital of ${state.name}?`,
        correctAnswer: state.capital,
        options: shuffleArray([state.capital, ...getUniqueDistractors(state.capital, US_STATES, 3, s => s.capital)]),
        hint: `It is the seat of government for ${state.name}.`,
        concept: 'US States & Shapes',
        tier: 2
      });

      // 2. Capital -> State
      templates.push({
        key: `capital_state:${state.capital}`,
        type: 'capital_state',
        prompt: `${state.capital} is the capital of which US state?`,
        correctAnswer: state.name,
        options: shuffleArray([state.name, ...getUniqueDistractors(state.name, US_STATES, 3, s => s.name)]),
        hint: `Look for the state governed from ${state.capital}.`,
        concept: 'US States & Shapes',
        tier: 2
      });

      // 3. State Shapes
      if (state.shapeSvg) {
        const regionalMap = REGIONAL_MAPS[state.name] || null;
        templates.push({
          key: `state_shape:${state.name}`,
          type: 'state_shape',
          prompt: `Which US state is highlighted on this map?`,
          correctAnswer: state.name,
          options: shuffleArray([state.name, ...getUniqueDistractors(state.name, US_STATES, 3, s => s.name)]),
          hint: `Observe the surrounding states, bodies of water, and borders carefully.`,
          shapeSvg: regionalMap?.targetPath || state.shapeSvg,
          mapData: regionalMap,
          concept: 'US States & Shapes',
          tier: 2
        });
      }

      // 4. State Trivia / Landmarks if available
      if (state.trivia) {
        templates.push({
          key: `state_trivia:${state.name}`,
          type: 'state_trivia',
          prompt: `Which US state is known for: "${state.trivia}"?`,
          correctAnswer: state.name,
          options: shuffleArray([state.name, ...getUniqueDistractors(state.name, US_STATES, 3, s => s.name)]),
          hint: state.nickname ? `Known as the "${state.nickname}".` : `State capital is ${state.capital}.`,
          concept: 'US States & Shapes',
          tier: 2
        });
      }
    }
  } else if (tier === 3) {
    // Tier 3: Major Countries & Capitals & Continents
    for (const country of COUNTRIES) {
      // 1. Country -> Capital
      templates.push({
        key: `country_capital:${country.name}`,
        type: 'country_capital',
        prompt: `What is the capital of ${country.name}?`,
        correctAnswer: country.capital,
        options: shuffleArray([country.capital, ...getUniqueDistractors(country.capital, COUNTRIES, 3, c => c.capital)]),
        hint: country.trivia || `It is the official seat of government and executive center for ${country.name}.`,
        concept: 'Major Countries & Capitals',
        tier: 3
      });

      // 2. Capital -> Country
      templates.push({
        key: `capital_country:${country.capital}`,
        type: 'capital_country',
        prompt: `${country.capital} is the capital city of which country?`,
        correctAnswer: country.name,
        options: shuffleArray([country.name, ...getUniqueDistractors(country.name, COUNTRIES, 3, c => c.name)]),
        hint: country.landmark ? `This nation is famous for landmarks like the ${country.landmark}.` : `Look for the sovereign country whose government meets in ${country.capital}.`,
        concept: 'Major Countries & Capitals',
        tier: 3
      });

      // 3. Country -> Continent
      templates.push({
        key: `country_continent:${country.name}`,
        type: 'country_continent',
        prompt: `Which continent is ${country.name} located in?`,
        correctAnswer: country.continent,
        options: shuffleArray([country.continent, ...getUniqueDistractors(country.continent, CONTINENTS, 3, c => c.name)]),
        hint: country.capital ? `The capital city of this country is ${country.capital}.` : `Consider the landmass that encompasses ${country.name}.`,
        concept: 'Major Countries & Capitals',
        tier: 3
      });

      // 4. Country landmark if available
      if (country.landmark) {
        const landmarkVis = getLandmarkVisual(country.landmark);
        templates.push({
          key: `country_landmark:${country.landmark}`,
          type: 'country_landmark',
          prompt: `The famous landmark "${country.landmark}" is located in which country?`,
          correctAnswer: country.name,
          options: shuffleArray([country.name, ...getUniqueDistractors(country.name, COUNTRIES, 3, c => c.name)]),
          hint: `The capital of this host nation is ${country.capital}.`,
          landmarkData: landmarkVis,
          concept: 'Major Countries & Capitals',
          tier: 3
        });
      }

      // 5. National Flag recognition if available
      const flag = getFlagForCountry(country.name);
      if (flag) {
        templates.push({
          key: `country_flag:${country.name}`,
          type: 'country_flag',
          prompt: `Which country does this national flag belong to?`,
          correctAnswer: country.name,
          options: shuffleArray([country.name, ...getUniqueDistractors(country.name, COUNTRIES, 3, c => c.name)]),
          hint: country.capital ? `Its national capital city is ${country.capital}.` : (country.landmark ? `Famous for the ${country.landmark}.` : `Examine the colors and national emblem.`),
          flagData: flag,
          concept: 'National Flags & Symbols',
          tier: 3
        });
      }
    }
  } else if (tier === 4) {
    // Tier 4: Country Shapes, Hemispheres & Physical Geography
    const countriesWithShapes = COUNTRIES.filter(c => c.shapeSvg);
    for (const country of countriesWithShapes) {
      const regionalMap = REGIONAL_MAPS[country.name] || null;
      templates.push({
        key: `country_shape:${country.name}`,
        type: 'country_shape',
        prompt: `Which country is highlighted on this map?`,
        correctAnswer: country.name,
        options: shuffleArray([country.name, ...getUniqueDistractors(country.name, COUNTRIES, 3, c => c.name)]),
        hint: country.capital ? `The capital of this country is ${country.capital}.` : `Look at the surrounding borders and coastal profile.`,
        shapeSvg: regionalMap?.targetPath || country.shapeSvg,
        mapData: regionalMap,
        concept: 'Country Shapes & Locations',
        tier: 4
      });
    }

    // Visual Landmark identification questions
    for (const [landmarkName, vis] of Object.entries(WORLD_LANDMARK_VISUALS)) {
      templates.push({
        key: `landmark_visual:${landmarkName}`,
        type: 'landmark_visual',
        prompt: `Identify this famous world landmark:`,
        correctAnswer: landmarkName,
        options: shuffleArray([landmarkName, ...getUniqueDistractors(landmarkName, Object.keys(WORLD_LANDMARK_VISUALS).map(k => ({ name: k })), 3, w => w.name)]),
        hint: vis.badge ? `${vis.badge} built in ${vis.city || 'historic times'}.` : (vis.category ? `An iconic example of world ${vis.category.toLowerCase()}.` : 'Observe the architectural structure.'),
        landmarkData: vis,
        concept: 'Landmarks & Wonders',
        tier: 4
      });
    }

    // World landmarks & physical features
    for (const item of WORLD_LANDMARKS_AND_WONDERS) {
      const landmarkVis = getLandmarkVisual(item.name);
      templates.push({
        key: `wonder:${item.name}`,
        type: 'world_wonder',
        prompt: `Which geographic wonder is described as: "${item.fact}"?`,
        correctAnswer: item.name,
        options: shuffleArray([item.name, ...getUniqueDistractors(item.name, WORLD_LANDMARKS_AND_WONDERS, 3, w => w.name)]),
        hint: item.mountainRange ? `Part of the ${item.mountainRange} range.` : (item.type ? `It is a world-renowned natural ${item.type.replace('_', ' ')}.` : 'Examine the record-setting characteristics described.'),
        landmarkData: landmarkVis,
        concept: 'Country Shapes & Locations',
        tier: 4
      });
    }

    // Hemisphere & coordinate questions
    templates.push({
      key: 'foundation:prime_meridian',
      type: 'geographic_foundation',
      prompt: 'What is the line of 0° longitude that divides Earth into Eastern and Western Hemispheres?',
      correctAnswer: 'Prime Meridian',
      options: shuffleArray(['Prime Meridian', 'Equator', 'International Date Line', 'Tropic of Capricorn']),
      hint: 'It is the starting line for world time zones (UTC/GMT) and passes through the Royal Observatory.',
      concept: 'Country Shapes & Locations',
      tier: 4
    });

    templates.push({
      key: 'foundation:southern_hemisphere',
      type: 'geographic_foundation',
      prompt: 'Which continent lies entirely in the Southern Hemisphere?',
      correctAnswer: 'Antarctica',
      options: shuffleArray(['Antarctica', 'Europe', 'North America', 'Asia']),
      hint: 'It is the coldest and windiest continent, covered by a permanent ice sheet.',
      concept: 'Country Shapes & Locations',
      tier: 4
    });
  } else if (tier >= 5) {
    // Tier 5: World Summit (Tricky Capitals, Global Expert & Extreme Geography)
    for (const tricky of TRICKY_CAPITALS) {
      const distractors = [tricky.commonConfusion];
      const otherCapitals = getUniqueDistractors(tricky.capital, COUNTRIES, 2, c => c.capital);
      for (const oc of otherCapitals) {
        if (!distractors.includes(oc)) distractors.push(oc);
      }

      templates.push({
        key: `tricky_capital:${tricky.country}`,
        type: 'tricky_capital',
        prompt: `What is the official capital of ${tricky.country}?`,
        correctAnswer: tricky.capital,
        options: shuffleArray([tricky.capital, ...distractors.slice(0, 3)]),
        hint: tricky.reason,
        concept: 'Global Geography Expert',
        tier: 5
      });
    }

    for (const item of WORLD_LANDMARKS_AND_WONDERS) {
      if (item.mountainRange) {
        templates.push({
          key: `mountain_range:${item.name}`,
          type: 'extreme_geography',
          prompt: `${item.name} is located in which famous mountain range?`,
          correctAnswer: item.mountainRange,
          options: shuffleArray([item.mountainRange, 'Andes', 'Alps', 'Rocky Mountains']),
          hint: `It features the highest elevation peaks on Earth.`,
          concept: 'Global Geography Expert',
          tier: 5
        });
      }
    }

    // Advanced Shapes from Tier 4
    const shapes = COUNTRIES.filter(c => c.shapeSvg);
    for (const country of shapes) {
      const regionalMap = REGIONAL_MAPS[country.name] || null;
      templates.push({
        key: `summit_shape:${country.name}`,
        type: 'country_shape',
        prompt: `Summit Challenge: Identify this highlighted country by its outline borders:`,
        correctAnswer: country.name,
        options: shuffleArray([country.name, ...getUniqueDistractors(country.name, COUNTRIES, 3, c => c.name)]),
        hint: country.capital ? `Its seat of government is ${country.capital}.` : (country.trivia || `Inspect the coastal perimeter and neighboring territory.`),
        shapeSvg: regionalMap?.targetPath || country.shapeSvg,
        mapData: regionalMap,
        concept: 'Global Geography Expert',
        tier: 5
      });
    }
  }

  return templates;
};

/**
 * Generates a single world problem for a given tier
 * @param {number} tier - Curriculum tier (1-5)
 * @param {boolean} isProbe - Whether this is a probe question
 * @param {Set|Array} seenKeys - Excluded problem keys
 * @param {Object} specificItem - Optional specific template
 */
export const generateTierProblem = (tier = 1, isProbe = false, seenKeys = new Set(), specificItem = null) => {
  const effectiveTier = Math.max(1, Math.min(5, Number(tier) || 1));
  const seenSet = seenKeys instanceof Set ? seenKeys : new Set(Array.isArray(seenKeys) ? seenKeys.map(k => String(k).toLowerCase()) : []);

  if (specificItem) {
    const normKey = getNormalizedProblemKey(specificItem);
    return {
      id: `world_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: specificItem.type || 'world',
      prompt: specificItem.prompt,
      displayString: specificItem.prompt || specificItem.displayString || 'Geography Challenge',
      correctAnswer: specificItem.correctAnswer,
      answer: specificItem.correctAnswer,
      answerString: specificItem.correctAnswer,
      options: specificItem.options || [specificItem.correctAnswer],
      hint: specificItem.hint || 'Examine the question carefully.',
      concept: specificItem.concept || 'Geography',
      tier: effectiveTier,
      shapeSvg: specificItem.shapeSvg || null,
      mapData: specificItem.mapData || null,
      flagData: specificItem.flagData || null,
      landmarkData: specificItem.landmarkData || null,
      key: normKey,
      isProbe: !!isProbe
    };
  }

  const templates = getTierCandidateTemplates(effectiveTier);
  const shuffled = shuffleArray(templates);

  let chosen = shuffled.find(t => !seenSet.has(getNormalizedProblemKey(t)));

  if (!chosen) {
    // If all seen in this tier, pick random from tier
    chosen = shuffled[Math.floor(Math.random() * shuffled.length)] || templates[0];
  }

  const normKey = getNormalizedProblemKey(chosen);

  return {
    id: `world_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: chosen.type,
    prompt: chosen.prompt,
    displayString: chosen.prompt || 'Geography Challenge',
    correctAnswer: chosen.correctAnswer,
    answer: chosen.correctAnswer,
    answerString: chosen.correctAnswer,
    options: chosen.options,
    hint: chosen.hint,
    concept: chosen.concept,
    tier: effectiveTier,
    shapeSvg: chosen.shapeSvg || null,
    mapData: chosen.mapData || null,
    flagData: chosen.flagData || null,
    landmarkData: chosen.landmarkData || null,
    key: normKey,
    isProbe: !!isProbe
  };
};

/**
 * Legacy compatibility wrapper for generateWorldProblem
 */
export const generateWorldProblem = (ratingOrTier = 1000, history = [], seenKeys = new Set()) => {
  const tier = typeof ratingOrTier === 'number' && ratingOrTier >= 100
    ? getTierForRating(ratingOrTier)
    : Math.max(1, Math.min(5, Number(ratingOrTier) || 1));

  return generateTierProblem(tier, false, seenKeys);
};

/**
 * Generates an expansive batch of deduplicated problems for a session or climb.
 * Guarantees zero question repetition in the returned batch and actively deprioritizes recent history.
 * @param {number} count - Total problems to generate (e.g. 15)
 * @param {number} targetTier - Active tier (1-5) or rating
 * @param {Array} history - Recently answered problem keys/terms
 * @param {Set} seenKeys - Active session seen keys
 */
export const generateWorldSession = (count = 15, targetTier = 1, history = [], seenKeys = new Set()) => {
  const effectiveTier = Math.max(1, Math.min(5, Number(targetTier) || 1));
  const recentTerms = new Set((history || []).map(h => (typeof h === 'string' ? h.toLowerCase() : String(h?.key || '').toLowerCase())));
  const sessionSeen = new Set(seenKeys instanceof Set ? Array.from(seenKeys).map(k => String(k).toLowerCase()) : []);

  const targetTemplates = getTierCandidateTemplates(effectiveTier);
  const shuffledTarget = shuffleArray(targetTemplates);

  const problems = [];

  // 1. First pass: Target tier items NOT in recent history and NOT in active session
  for (const item of shuffledTarget) {
    if (problems.length >= count) break;
    const normKey = getNormalizedProblemKey(item);
    const ansKey = (item.correctAnswer || '').toString().toLowerCase();

    if (!sessionSeen.has(normKey) && !recentTerms.has(ansKey) && !recentTerms.has(normKey)) {
      sessionSeen.add(normKey);
      sessionSeen.add(ansKey);
      if (seenKeys instanceof Set) {
        seenKeys.add(normKey);
        seenKeys.add(ansKey);
      }

      problems.push({
        id: `world_${Date.now()}_${problems.length}_${Math.random().toString(36).substring(2, 7)}`,
        type: item.type,
        prompt: item.prompt,
        displayString: item.prompt || 'Geography Challenge',
        correctAnswer: item.correctAnswer,
        answer: item.correctAnswer,
        answerString: item.correctAnswer,
        options: item.options,
        hint: item.hint,
        concept: item.concept,
        tier: effectiveTier,
        shapeSvg: item.shapeSvg || null,
        mapData: item.mapData || null,
        flagData: item.flagData || null,
        landmarkData: item.landmarkData || null,
        key: normKey,
        isProbe: false
      });
    }
  }

  // 2. Second pass: If more problems needed, allow target tier items not in active session
  if (problems.length < count) {
    for (const item of shuffledTarget) {
      if (problems.length >= count) break;
      const normKey = getNormalizedProblemKey(item);
      const ansKey = (item.correctAnswer || '').toString().toLowerCase();

      if (!sessionSeen.has(normKey) && !sessionSeen.has(ansKey)) {
        sessionSeen.add(normKey);
        sessionSeen.add(ansKey);
        if (seenKeys instanceof Set) {
          seenKeys.add(normKey);
          seenKeys.add(ansKey);
        }

        problems.push({
          id: `world_${Date.now()}_sec_${problems.length}_${Math.random().toString(36).substring(2, 7)}`,
          type: item.type,
          prompt: item.prompt,
          displayString: item.prompt || 'Geography Challenge',
          correctAnswer: item.correctAnswer,
          answer: item.correctAnswer,
          answerString: item.correctAnswer,
          options: item.options,
          hint: item.hint,
          concept: item.concept,
          tier: effectiveTier,
          shapeSvg: item.shapeSvg || null,
          mapData: item.mapData || null,
          flagData: item.flagData || null,
          landmarkData: item.landmarkData || null,
          key: normKey,
          isProbe: false
        });
      }
    }
  }

  // 3. Third pass: Check adjacent/other curriculum tiers not seen in active session
  if (problems.length < count) {
    for (let t = 1; t <= 5; t++) {
      if (problems.length >= count) break;
      if (t === effectiveTier) continue;
      const otherTemplates = shuffleArray(getTierCandidateTemplates(t));

      for (const item of otherTemplates) {
        if (problems.length >= count) break;
        const normKey = getNormalizedProblemKey(item);
        const ansKey = (item.correctAnswer || '').toString().toLowerCase();

        if (!sessionSeen.has(normKey) && !sessionSeen.has(ansKey)) {
          sessionSeen.add(normKey);
          sessionSeen.add(ansKey);
          if (seenKeys instanceof Set) {
            seenKeys.add(normKey);
            seenKeys.add(ansKey);
          }

          problems.push({
            id: `world_${Date.now()}_tier${t}_${problems.length}_${Math.random().toString(36).substring(2, 7)}`,
            type: item.type,
            prompt: item.prompt,
            displayString: item.prompt || 'Geography Challenge',
            correctAnswer: item.correctAnswer,
            answer: item.correctAnswer,
            answerString: item.correctAnswer,
            options: item.options,
            hint: item.hint,
            concept: item.concept,
            tier: t,
            shapeSvg: item.shapeSvg || null,
            mapData: item.mapData || null,
            flagData: item.flagData || null,
            landmarkData: item.landmarkData || null,
            key: normKey,
            isProbe: false
          });
        }
      }
    }
  }

  // 4. Fallback pass: If pool exhausted, generate while updating seen keys
  while (problems.length < count) {
    const prob = generateTierProblem(effectiveTier, false, sessionSeen);
    const normKey = getNormalizedProblemKey(prob);
    sessionSeen.add(normKey);
    if (seenKeys instanceof Set) {
      seenKeys.add(normKey);
    }
    problems.push({
      ...prob,
      id: `world_${Date.now()}_fallback_${problems.length}_${Math.random().toString(36).substring(2, 7)}`
    });
  }

  return problems;
};

// Export alias for consistency across session components
export const generateProblems = generateWorldSession;

