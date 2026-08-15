const fs = require('fs');

let content = fs.readFileSync('src/components/ParentDashboardModal.jsx', 'utf8');

const getGradeOld = /import \{ CURRICULUM_TIERS, getTierFromRating, getGradeLevelFromRating, GRADE_STARTING_RATINGS \} from '\.\.\/utils\/mathCurriculum';/;
const getGradeNew = `import { CURRICULUM_TIERS, getTierFromRating, getGradeLevelFromRating, GRADE_STARTING_RATINGS } from '../utils/mathCurriculum';
import { WORDS_CURRICULUM_TIERS } from '../utils/wordsCurriculum';`;

content = content.replace(getGradeOld, getGradeNew);

fs.writeFileSync('src/components/ParentDashboardModal.jsx', content);
