import { CONTINENTS, OCEANS, US_STATES, COUNTRIES } from '../data/worldGeography.js';
import { getTierForRating } from './worldCurriculum.js';

/**
 * Utility to shuffle an array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Utility to get random distractors
 */
const getDistractors = (correctAnswer, sourceArray, count = 3, key = 'name') => {
  const distractors = sourceArray
    .filter(item => item[key] !== correctAnswer)
    .map(item => item[key]);
  return shuffleArray(distractors).slice(0, count);
};

export const generateWorldProblem = (rating = 1000, history = []) => {
  const targetTier = getTierForRating(rating);

  let questionType = 1;

  if (targetTier === 1) {
    questionType = Math.random() > 0.5 ? 'continent_name' : 'ocean_name';
  } else if (targetTier === 2) {
    const types = ['state_capital', 'capital_state', 'state_shape'];
    questionType = types[Math.floor(Math.random() * types.length)];
  } else if (targetTier === 3) {
    const types = ['country_capital', 'capital_country'];
    questionType = types[Math.floor(Math.random() * types.length)];
  } else if (targetTier >= 4) {
    const types = ['country_capital', 'capital_country', 'country_shape'];
    questionType = types[Math.floor(Math.random() * types.length)];
  }

  let problem = {
    id: `world_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: questionType,
    prompt: '',
    correctAnswer: '',
    options: [],
    hint: '',
    shapeSvg: null
  };

  switch (questionType) {
    case 'continent_name': {
      const item = CONTINENTS[Math.floor(Math.random() * CONTINENTS.length)];
      problem.prompt = `Which of the following is a Continent?`;
      problem.correctAnswer = item.name;
      const distractors = getDistractors(item.name, OCEANS, 3, 'name');
      problem.options = shuffleArray([item.name, ...distractors]);
      problem.hint = "Continents are the large landmasses on Earth.";
      break;
    }
    case 'ocean_name': {
      const item = OCEANS[Math.floor(Math.random() * OCEANS.length)];
      problem.prompt = `Which of the following is an Ocean?`;
      problem.correctAnswer = item.name;
      const distractors = getDistractors(item.name, CONTINENTS, 3, 'name');
      problem.options = shuffleArray([item.name, ...distractors]);
      problem.hint = "Oceans are the large bodies of water.";
      break;
    }
    case 'state_capital': {
      const item = US_STATES[Math.floor(Math.random() * US_STATES.length)];
      problem.prompt = `What is the capital of ${item.name}?`;
      problem.correctAnswer = item.capital;
      const distractors = getDistractors(item.capital, US_STATES, 3, 'capital');
      problem.options = shuffleArray([item.capital, ...distractors]);
      problem.hint = `It is the seat of government for ${item.name}.`;
      break;
    }
    case 'capital_state': {
      const item = US_STATES[Math.floor(Math.random() * US_STATES.length)];
      problem.prompt = `${item.capital} is the capital of which US state?`;
      problem.correctAnswer = item.name;
      const distractors = getDistractors(item.name, US_STATES, 3, 'name');
      problem.options = shuffleArray([item.name, ...distractors]);
      problem.hint = `This state is in the United States.`;
      break;
    }
    case 'state_shape': {
      const statesWithShapes = US_STATES.filter(s => s.shapeSvg);
      const item = statesWithShapes[Math.floor(Math.random() * statesWithShapes.length)];
      problem.prompt = `Which US state has this shape?`;
      problem.correctAnswer = item.name;
      problem.shapeSvg = item.shapeSvg;
      const distractors = getDistractors(item.name, US_STATES, 3, 'name');
      problem.options = shuffleArray([item.name, ...distractors]);
      problem.hint = `Look at the outline borders carefully.`;
      break;
    }
    case 'country_capital': {
      const item = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      problem.prompt = `What is the capital of ${item.name}?`;
      problem.correctAnswer = item.capital;
      const distractors = getDistractors(item.capital, COUNTRIES, 3, 'capital');
      problem.options = shuffleArray([item.capital, ...distractors]);
      problem.hint = `It is the center of government for ${item.name}.`;
      break;
    }
    case 'capital_country': {
      const item = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      problem.prompt = `${item.capital} is the capital of which country?`;
      problem.correctAnswer = item.name;
      const distractors = getDistractors(item.name, COUNTRIES, 3, 'name');
      problem.options = shuffleArray([item.name, ...distractors]);
      problem.hint = `It is a country globally recognized.`;
      break;
    }
    case 'country_shape': {
      const countriesWithShapes = COUNTRIES.filter(c => c.shapeSvg);
      const item = countriesWithShapes[Math.floor(Math.random() * countriesWithShapes.length)];
      problem.prompt = `Which country has this shape?`;
      problem.correctAnswer = item.name;
      problem.shapeSvg = item.shapeSvg;
      const distractors = getDistractors(item.name, COUNTRIES, 3, 'name');
      problem.options = shuffleArray([item.name, ...distractors]);
      problem.hint = `Look at the outline borders carefully.`;
      break;
    }
    default:
      // Fallback
      problem.prompt = `Which is a Continent?`;
      problem.correctAnswer = 'Asia';
      problem.options = ['Asia', 'Pacific', 'Atlantic', 'Indian'];
      problem.hint = 'Largest landmass.';
      break;
  }

  return problem;
};

export const generateWorldSession = (count = 12, currentRating = 1000, history = []) => {
  const problems = [];
  for (let i = 0; i < count; i++) {
    // Basic dynamic rating curve for the session
    const offsetRating = currentRating + (i * 10);
    problems.push(generateWorldProblem(offsetRating, history));
  }
  return problems;
};
