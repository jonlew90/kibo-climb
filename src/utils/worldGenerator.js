import {
  CONTINENTS,
  OCEANS,
  CARDINAL_DIRECTIONS,
  GEOGRAPHIC_FOUNDATIONS,
  MAJOR_SEAS_AND_WATERBODIES,
  US_STATES,
  COUNTRIES,
  WORLD_LANDMARKS_AND_WONDERS,
  TRICKY_CAPITALS,
  EXTREME_GEOGRAPHY,
  GEOPOLITICAL_ANOMALIES,
  GLOBAL_STRAITS
} from '../data/worldGeography.js';
import { getTierForRating } from './worldCurriculum.js';
import { REGIONAL_MAPS } from '../data/worldMaps.js';
import { getFlagForCountry, COUNTRY_FLAGS } from '../data/worldFlags.js';
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
    if (val && String(val).trim().toLowerCase() !== String(correctAnswer).trim().toLowerCase() && !uniqueItems.has(val)) {
      uniqueItems.add(val);
      if (uniqueItems.size === count) break;
    }
  }

  // If pool didn't have enough, fill from default fallbacks
  const fallbacks = [
    'Asia', 'Europe', 'Africa', 'North America', 'South America', 'Australia', 'Antarctica',
    'Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Southern Ocean',
    'Canada', 'Brazil', 'France', 'Japan', 'Egypt', 'Australia', 'Germany', 'India',
    'London', 'Paris', 'Tokyo', 'Rome', 'Berlin', 'Ottawa', 'Canberra', 'Cairo'
  ];
  for (const fb of fallbacks) {
    if (uniqueItems.size >= count) break;
    if (fb.toLowerCase() !== String(correctAnswer).toLowerCase() && !uniqueItems.has(fb)) {
      uniqueItems.add(fb);
    }
  }

  return Array.from(uniqueItems);
};

// Precomputed pool of all country capitals for optimization
const ALL_COUNTRY_CAPITALS = COUNTRIES.map(c => c.capital).filter(Boolean);

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
        hint: 'Continents are the seven large landmasses on Earth.',
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
        hint: 'Oceans are massive bodies of saltwater covering most of Earth.',
        concept: 'Continents & Oceans',
        tier: 1
      });
    }

    // 3. Cardinal & Intermediate directions
    for (const d of CARDINAL_DIRECTIONS) {
      templates.push({
        key: `cardinal_pos:${d.direction}`,
        type: 'cardinal_direction',
        prompt: `On a standard compass map, which direction points toward the ${d.mapPosition}?`,
        correctAnswer: d.direction,
        options: shuffleArray([d.direction, ...getUniqueDistractors(d.direction, CARDINAL_DIRECTIONS, 3, dir => dir.direction)]),
        hint: d.hint,
        concept: 'Cardinal Directions',
        tier: 1
      });

      templates.push({
        key: `cardinal_opp:${d.direction}`,
        type: 'cardinal_direction',
        prompt: `Which direction is directly opposite of ${d.direction}?`,
        correctAnswer: d.opposite,
        options: shuffleArray([d.opposite, ...getUniqueDistractors(d.opposite, CARDINAL_DIRECTIONS, 3, dir => dir.direction)]),
        hint: `Think about what lies directly across from ${d.direction} on a compass rose.`,
        concept: 'Cardinal Directions',
        tier: 1
      });
    }

    // 4. Continent & Ocean Superlatives and Foundational Facts
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
      key: 'fact:second_largest_continent',
      type: 'continent_fact',
      prompt: 'Which is the second largest continent by land area, home to the Sahara Desert?',
      correctAnswer: 'Africa',
      options: shuffleArray(['Africa', 'Asia', 'North America', 'South America']),
      hint: 'It is bordered by the Mediterranean Sea to the north and Atlantic to the west.',
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
      key: 'fact:warmest_ocean',
      type: 'ocean_fact',
      prompt: 'Which is the third largest ocean and warmest ocean on Earth?',
      correctAnswer: 'Indian Ocean',
      options: shuffleArray(['Indian Ocean', 'Atlantic Ocean', 'Pacific Ocean', 'Southern Ocean']),
      hint: 'It is bounded by Asia to the north, Africa to the west, and Australia to the east.',
      concept: 'Continents & Oceans',
      tier: 1
    });

    templates.push({
      key: 'fact:encircling_antarctica',
      type: 'ocean_fact',
      prompt: 'Which ocean completely encircles the continent of Antarctica?',
      correctAnswer: 'Southern Ocean',
      options: shuffleArray(['Southern Ocean', 'Arctic Ocean', 'Indian Ocean', 'Atlantic Ocean']),
      hint: 'It is the fourth largest ocean, surrounding the South Pole region.',
      concept: 'Continents & Oceans',
      tier: 1
    });

    templates.push({
      key: 'fact:atlantic_separation',
      type: 'ocean_fact',
      prompt: 'Which ocean separates the Americas from Europe and Africa?',
      correctAnswer: 'Atlantic Ocean',
      options: shuffleArray(['Atlantic Ocean', 'Pacific Ocean', 'Indian Ocean', 'Arctic Ocean']),
      hint: 'It is the second largest ocean in the world.',
      concept: 'Continents & Oceans',
      tier: 1
    });

    // Continent Peak Superlatives
    for (const c of CONTINENTS) {
      if (c.highestPoint) {
        templates.push({
          key: `continent_highest:${c.name}`,
          type: 'continent_superlative',
          prompt: `Which continent is home to the highest peak "${c.highestPoint}"?`,
          correctAnswer: c.name,
          options: shuffleArray([c.name, ...getUniqueDistractors(c.name, CONTINENTS, 3, con => con.name)]),
          hint: `It is the highest summit on the continent of ${c.name}.`,
          concept: 'Continents & Oceans',
          tier: 1
        });
      }
    }

    // 5. Geographic Foundations (Hemispheres, Equator, Prime Meridian, Tropics)
    for (const f of GEOGRAPHIC_FOUNDATIONS) {
      templates.push({
        key: `geo_foundation:${f.concept}`,
        type: 'geographic_foundation',
        prompt: `What is defined as: "${f.description}"?`,
        correctAnswer: f.concept,
        options: shuffleArray([f.concept, ...getUniqueDistractors(f.concept, GEOGRAPHIC_FOUNDATIONS, 3, gf => gf.concept)]),
        hint: `Think about global coordinate lines, hemispheres, and planetary divisions.`,
        concept: 'Geographic Foundations',
        tier: 1
      });
    }

    // 6. Major Seas & Water Bodies
    for (const sea of MAJOR_SEAS_AND_WATERBODIES) {
      templates.push({
        key: `sea_location:${sea.name}`,
        type: 'sea_waterbody',
        prompt: `Which major sea or body of water is located: "${sea.location}"?`,
        correctAnswer: sea.name,
        options: shuffleArray([sea.name, ...getUniqueDistractors(sea.name, MAJOR_SEAS_AND_WATERBODIES, 3, s => s.name)]),
        hint: sea.fact,
        concept: 'Continents & Oceans',
        tier: 1
      });
    }

    // 7. Comprehensive Country to Continent Matching (all sovereign countries)
    for (const country of COUNTRIES) {
      templates.push({
        key: `country_to_continent_t1:${country.name}`,
        type: 'country_continent',
        prompt: `On which continent is ${country.name} located?`,
        correctAnswer: country.continent,
        options: shuffleArray([country.continent, ...getUniqueDistractors(country.continent, CONTINENTS, 3, c => c.name)]),
        hint: `Consider the global region where ${country.name} is located.${country.trivia ? ' Hint: ' + country.trivia : ''}`,
        concept: 'Continents & Oceans',
        tier: 1
      });
    }
  } else if (tier === 2) {
    // Tier 2: US States, Capitals, Nicknames, Regions & Shapes
    const regions = ['South', 'West', 'Midwest', 'Northeast'];

    for (const state of US_STATES) {
      // 1. State -> Capital
      templates.push({
        key: `state_capital:${state.name}`,
        type: 'state_capital',
        prompt: `What is the capital of ${state.name}?`,
        correctAnswer: state.capital,
        options: shuffleArray([state.capital, ...getUniqueDistractors(state.capital, US_STATES, 3, s => s.capital)]),
        hint: state.nickname ? `Think about the capital of the ${state.nickname}.` : `Consider the primary center of government for this state.`,
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
        hint: `Consider which state has its seat of government here.`,
        concept: 'US States & Shapes',
        tier: 2
      });

      // 3. State -> Nickname
      if (state.nickname) {
        templates.push({
          key: `state_nickname:${state.name}`,
          type: 'state_nickname',
          prompt: `Which US state is known as the "${state.nickname}"?`,
          correctAnswer: state.name,
          options: shuffleArray([state.name, ...getUniqueDistractors(state.name, US_STATES, 3, s => s.name)]),
          hint: `Its capital city is ${state.capital}.`,
          concept: 'US States & Shapes',
          tier: 2
        });
      }

      // 4. State Trivia / Facts
      if (state.trivia) {
        templates.push({
          key: `state_trivia:${state.name}`,
          type: 'state_trivia',
          prompt: `Which US state is known for: "${state.trivia}"?`,
          correctAnswer: state.name,
          options: shuffleArray([state.name, ...getUniqueDistractors(state.name, US_STATES, 3, s => s.name)]),
          hint: state.nickname ? `Nicknamed the "${state.nickname}".` : `State capital is ${state.capital}.`,
          concept: 'US States & Shapes',
          tier: 2
        });
      }

      // 5. State Geographic Region
      if (state.region) {
        templates.push({
          key: `state_region:${state.name}`,
          type: 'state_region',
          prompt: `In which US geographic region is ${state.name} located?`,
          correctAnswer: state.region,
          options: shuffleArray(regions),
          hint: `Consider its location on the United States map.`,
          concept: 'US States & Shapes',
          tier: 2
        });
      }

      // 6. State Shapes
      if (state.shapeSvg) {
        const regionalMap = REGIONAL_MAPS[state.name] || null;
        templates.push({
          key: `state_shape:${state.name}`,
          type: 'state_shape',
          prompt: `Which US state is highlighted on this map?`,
          correctAnswer: state.name,
          options: shuffleArray([state.name, ...getUniqueDistractors(state.name, US_STATES, 3, s => s.name)]),
          hint: `Observe the surrounding states, bodies of water, and borders carefully.${state.nickname ? ' Hint: It is known as the ' + state.nickname + '.' : ''}`,
          shapeSvg: state.shapeSvg,
          mapData: regionalMap,
          concept: 'US States & Shapes',
          tier: 2
        });
      }
    }
  } else if (tier === 3) {
    // Tier 3: Major Sovereign Countries, Capitals, Continents, Landmarks & Flags
    for (const country of COUNTRIES) {
      // 1. Country -> Capital
      templates.push({
        key: `country_capital:${country.name}`,
        type: 'country_capital',
        prompt: `What is the capital of ${country.name}?`,
        correctAnswer: country.capital,
        options: shuffleArray([country.capital, ...getUniqueDistractors(country.capital, COUNTRIES, 3, c => c.capital)]),
        hint: country.trivia ? `Consider the primary political center. Hint: ${country.trivia}` : `Consider the primary political center of ${country.name}.`,
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
        hint: country.landmark ? `Think about the nation governed from here. Hint: It is famous for the ${country.landmark}.` : `Think about the nation governed from here.`,
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
        hint: `Think about the global region containing ${country.name}.${country.trivia ? ' Hint: ' + country.trivia : ''}`,
        concept: 'Major Countries & Capitals',
        tier: 3
      });

      // 4. Country landmark
      if (country.landmark) {
        const landmarkVis = getLandmarkVisual(country.landmark);
        templates.push({
          key: `country_landmark:${country.landmark}`,
          type: 'country_landmark',
          prompt: `The famous landmark "${country.landmark}" is located in which country?`,
          correctAnswer: country.name,
          options: shuffleArray([country.name, ...getUniqueDistractors(country.name, COUNTRIES, 3, c => c.name)]),
          hint: `Consider where this famous landmark was built.`,
          landmarkData: landmarkVis,
          concept: 'Major Countries & Capitals',
          tier: 3
        });
      }

      // 5. National Flag recognition
      const flag = getFlagForCountry(country.name);
      if (flag) {
        templates.push({
          key: `country_flag:${country.name}`,
          type: 'country_flag',
          prompt: `Which country does this national flag belong to?`,
          correctAnswer: country.name,
          options: shuffleArray([country.name, ...getUniqueDistractors(country.name, COUNTRIES, 3, c => c.name)]),
          hint: country.landmark ? `Examine the colors and national emblem. Hint: Famous for the ${country.landmark}.` : `Examine the colors and national emblem carefully.`,
          flagData: flag,
          concept: 'National Flags & Symbols',
          tier: 3
        });
      }

      // 6. Country Trivia
      if (country.trivia) {
        templates.push({
          key: `country_trivia:${country.name}`,
          type: 'country_trivia',
          prompt: `Which country is described by: "${country.trivia}"?`,
          correctAnswer: country.name,
          options: shuffleArray([country.name, ...getUniqueDistractors(country.name, COUNTRIES, 3, c => c.name)]),
          hint: `Its capital city is ${country.capital}.`,
          concept: 'Major Countries & Capitals',
          tier: 3
        });
      }
    }
  } else if (tier === 4) {
    // Tier 4: Country Shapes, Hemispheres, Physical Geography & Waterways
    const countriesWithShapes = COUNTRIES.filter(c => c.shapeSvg);
    for (const country of countriesWithShapes) {
      const regionalMap = REGIONAL_MAPS[country.name] || null;
      templates.push({
        key: `country_shape:${country.name}`,
        type: 'country_shape',
        prompt: `Which country is highlighted on this map?`,
        correctAnswer: country.name,
        options: shuffleArray([country.name, ...getUniqueDistractors(country.name, COUNTRIES, 3, c => c.name)]),
        hint: country.capital ? `The capital of this country is ${country.capital}.` : (country.trivia ? `Look at the surrounding borders and coastal profile. Hint: ${country.trivia}` : `Look at the surrounding borders and coastal profile.`),
        shapeSvg: country.shapeSvg,
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
        hint: vis.badge ? `${vis.badge} built in ${vis.city || vis.country || 'historic times'}.` : (vis.category ? `An iconic example of world ${vis.category.toLowerCase()}.` : 'Observe the architectural structure.'),
        landmarkData: vis,
        concept: 'Landmarks & Wonders',
        tier: 4
      });
    }

    // World physical landmarks & natural wonders
    for (const item of WORLD_LANDMARKS_AND_WONDERS) {
      const landmarkVis = getLandmarkVisual(item.name);
      templates.push({
        key: `wonder_fact:${item.name}`,
        type: 'world_wonder',
        prompt: `Which geographic wonder is described as: "${item.fact}"?`,
        correctAnswer: item.name,
        options: shuffleArray([item.name, ...getUniqueDistractors(item.name, WORLD_LANDMARKS_AND_WONDERS, 3, w => w.name)]),
        hint: item.mountainRange ? `Part of the ${item.mountainRange} range.` : (item.type ? `It is a world-renowned natural ${item.type.replace('_', ' ')}.` : 'Examine the record-setting characteristics described.'),
        landmarkData: landmarkVis,
        concept: 'Country Shapes & Locations',
        tier: 4
      });

      if (item.country) {
        templates.push({
          key: `wonder_country:${item.name}`,
          type: 'world_wonder',
          prompt: `The world wonder "${item.name}" is located in which country or territory?`,
          correctAnswer: item.country,
          options: shuffleArray([item.country, ...getUniqueDistractors(item.country, COUNTRIES, 3, c => c.name)]),
          hint: item.fact,
          concept: 'Country Shapes & Locations',
          tier: 4
        });
      }

      if (item.mountainRange) {
        templates.push({
          key: `mountain_range_t4:${item.name}`,
          type: 'mountain_range',
          prompt: `The mountain peak "${item.name}" is part of which mountain range?`,
          correctAnswer: item.mountainRange,
          options: shuffleArray([item.mountainRange, ...getUniqueDistractors(item.mountainRange, ['Himalayas', 'Andes', 'Alps', 'Rocky Mountains', 'Karakoram', 'Alaska Range'], 3)]),
          hint: item.fact,
          concept: 'Country Shapes & Locations',
          tier: 4
        });
      }

      if (item.continent && (item.type === 'river' || item.type === 'desert' || item.type === 'lake' || item.type === 'waterfall')) {
        templates.push({
          key: `wonder_continent_t4:${item.name}`,
          type: 'physical_geography',
          prompt: `On which continent is the famous ${item.type} "${item.name}" located?`,
          correctAnswer: item.continent,
          options: shuffleArray([item.continent, ...getUniqueDistractors(item.continent, CONTINENTS, 3, c => c.name)]),
          hint: item.fact,
          concept: 'Country Shapes & Locations',
          tier: 4
        });
      }
    }

    // Major Seas & Marginal Water Bodies in Tier 4
    for (const sea of MAJOR_SEAS_AND_WATERBODIES) {
      templates.push({
        key: `sea_ocean_t4:${sea.name}`,
        type: 'sea_ocean',
        prompt: `The ${sea.name} is connected to or considered part of which major ocean?`,
        correctAnswer: sea.ocean,
        options: shuffleArray([sea.ocean, ...getUniqueDistractors(sea.ocean, OCEANS, 3, o => o.fullName)]),
        hint: sea.fact,
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
      hint: 'It is the starting line for world time zones (UTC/GMT) and passes through Greenwich, England.',
      concept: 'Country Shapes & Locations',
      tier: 4
    });

    templates.push({
      key: 'foundation:tropic_cancer',
      type: 'geographic_foundation',
      prompt: 'What is the parallel of latitude at roughly 23.5° North marking the northern boundary of the tropics?',
      correctAnswer: 'Tropic of Cancer',
      options: shuffleArray(['Tropic of Cancer', 'Tropic of Capricorn', 'Equator', 'Arctic Circle']),
      hint: 'The sun is directly overhead here during the Northern Hemisphere summer solstice.',
      concept: 'Country Shapes & Locations',
      tier: 4
    });

    templates.push({
      key: 'foundation:tropic_capricorn',
      type: 'geographic_foundation',
      prompt: 'What is the parallel of latitude at roughly 23.5° South marking the southern boundary of the tropics?',
      correctAnswer: 'Tropic of Capricorn',
      options: shuffleArray(['Tropic of Capricorn', 'Tropic of Cancer', 'Equator', 'Antarctic Circle']),
      hint: 'The sun is directly overhead here during the Southern Hemisphere summer solstice.',
      concept: 'Country Shapes & Locations',
      tier: 4
    });

    templates.push({
      key: 'foundation:intl_date_line',
      type: 'geographic_foundation',
      prompt: 'What line roughly along 180° longitude marks where the calendar day transitions forward or backward?',
      correctAnswer: 'International Date Line',
      options: shuffleArray(['International Date Line', 'Prime Meridian', 'Equator', 'Arctic Circle']),
      hint: 'Crossing it westward adds a day; crossing it eastward subtracts a day.',
      concept: 'Country Shapes & Locations',
      tier: 4
    });

    templates.push({
      key: 'foundation:arctic_circle',
      type: 'geographic_foundation',
      prompt: 'What parallel of latitude at approximately 66.5° North marks the boundary of the northern polar region?',
      correctAnswer: 'Arctic Circle',
      options: shuffleArray(['Arctic Circle', 'Antarctic Circle', 'Tropic of Cancer', 'Prime Meridian']),
      hint: 'North of this line, the sun remains above the horizon for 24 hours during the summer solstice.',
      concept: 'Country Shapes & Locations',
      tier: 4
    });

    templates.push({
      key: 'foundation:antarctic_circle',
      type: 'geographic_foundation',
      prompt: 'What parallel of latitude at approximately 66.5° South marks the boundary of the southern polar region?',
      correctAnswer: 'Antarctic Circle',
      options: shuffleArray(['Antarctic Circle', 'Arctic Circle', 'Tropic of Capricorn', 'Equator']),
      hint: 'South of this line is the icy Antarctic polar zone.',
      concept: 'Country Shapes & Locations',
      tier: 4
    });
  } else if (tier >= 5) {
    // Tier 5: World Summit (Tricky Capitals, Global Expert, Extreme Geography, Straits & Enclaves)

    // 1. Tricky Capitals (direct and reverse)
    for (const tricky of TRICKY_CAPITALS) {
      const distractors = [tricky.commonConfusion];
      const otherCapitals = getUniqueDistractors(tricky.capital, ALL_COUNTRY_CAPITALS, 2);
      for (let j = 0; j < otherCapitals.length; j++) {
        const oc = otherCapitals[j];
        if (oc !== tricky.commonConfusion && oc !== tricky.capital) distractors.push(oc);
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

      templates.push({
        key: `reverse_tricky_capital:${tricky.capital}`,
        type: 'reverse_tricky_capital',
        prompt: `${tricky.capital} is the official capital city of which country?`,
        correctAnswer: tricky.country,
        options: shuffleArray([tricky.country, ...getUniqueDistractors(tricky.country, COUNTRIES, 3, c => c.name)]),
        hint: tricky.reason,
        concept: 'Global Geography Expert',
        tier: 5
      });
    }

    // 2. Extreme Earth Geography & Superlatives
    for (const ext of EXTREME_GEOGRAPHY) {
      templates.push({
        key: `extreme_geo:${ext.record}`,
        type: 'extreme_geography',
        prompt: `Which geographic location holds the record for: "${ext.record}"?`,
        correctAnswer: ext.answer,
        options: shuffleArray([ext.answer, ...getUniqueDistractors(ext.answer, EXTREME_GEOGRAPHY, 3, eg => eg.answer)]),
        hint: ext.details,
        concept: 'Global Geography Expert',
        tier: 5
      });
    }

    // 3. Geopolitical Anomalies & Enclaves
    for (const anomaly of GEOPOLITICAL_ANOMALIES) {
      templates.push({
        key: `anomaly:${anomaly.name}`,
        type: 'geopolitical_anomaly',
        prompt: `Which country or territory is described by: "${anomaly.fact}"?`,
        correctAnswer: anomaly.name,
        options: shuffleArray([anomaly.name, ...getUniqueDistractors(anomaly.name, COUNTRIES, 3, c => c.name)]),
        hint: `Think about geopolitical borders, enclaves, and transcontinental boundaries.`,
        concept: 'Global Geography Expert',
        tier: 5
      });
    }

    // 4. Strategic Global Straits & Passages
    for (const strait of GLOBAL_STRAITS) {
      templates.push({
        key: `strait_connects:${strait.name}`,
        type: 'global_strait',
        prompt: `Which strategic strait connects the ${strait.connects}?`,
        correctAnswer: strait.name,
        options: shuffleArray([strait.name, ...getUniqueDistractors(strait.name, GLOBAL_STRAITS, 3, s => s.name)]),
        hint: `It separates ${strait.separates}. ${strait.fact}`,
        concept: 'Global Geography Expert',
        tier: 5
      });

      templates.push({
        key: `strait_separates:${strait.name}`,
        type: 'global_strait',
        prompt: `Which strategic waterway separates ${strait.separates}?`,
        correctAnswer: strait.name,
        options: shuffleArray([strait.name, ...getUniqueDistractors(strait.name, GLOBAL_STRAITS, 3, s => s.name)]),
        hint: `It connects ${strait.connects}.`,
        concept: 'Global Geography Expert',
        tier: 5
      });
    }

    // 5. Summit Challenge Country Shapes
    const shapes = COUNTRIES.filter(c => c.shapeSvg);
    for (const country of shapes) {
      const regionalMap = REGIONAL_MAPS[country.name] || null;
      templates.push({
        key: `summit_shape:${country.name}`,
        type: 'country_shape',
        prompt: `Summit Challenge: Identify this highlighted country by its outline borders:`,
        correctAnswer: country.name,
        options: shuffleArray([country.name, ...getUniqueDistractors(country.name, COUNTRIES, 3, c => c.name)]),
        hint: country.capital ? `Its seat of government is ${country.capital}.` : (country.trivia ? `Inspect the coastal perimeter and neighboring territory. Hint: ${country.trivia}` : `Inspect the coastal perimeter and neighboring territory.`),
        shapeSvg: country.shapeSvg,
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

  let chosen = shuffled.find(t => {
    const normKey = getNormalizedProblemKey(t);
    const ansKey = (t.correctAnswer || '').toString().toLowerCase();
    return !seenSet.has(normKey) && !seenSet.has(ansKey);
  });

  if (!chosen) {
    // If all questions in this tier have been seen, check all other curriculum tiers
    for (let t = 1; t <= 5; t++) {
      if (t === effectiveTier) continue;
      const otherTemplates = shuffleArray(getTierCandidateTemplates(t));
      chosen = otherTemplates.find(item => {
        const normKey = getNormalizedProblemKey(item);
        const ansKey = (item.correctAnswer || '').toString().toLowerCase();
        return !seenSet.has(normKey) && !seenSet.has(ansKey);
      });
      if (chosen) break;
    }
  }

  if (!chosen) {
    // If entire catalog of 1,000+ questions was seen, pick random from active tier
    chosen = shuffled[Math.floor(Math.random() * shuffled.length)] || templates[0];
  }

  const normKey = getNormalizedProblemKey(chosen);
  const ansKey = (chosen.correctAnswer || '').toString().toLowerCase();

  if (seenKeys instanceof Set) {
    seenKeys.add(normKey);
    if (ansKey) seenKeys.add(ansKey);
  }

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
    tier: chosen.tier || effectiveTier,
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

