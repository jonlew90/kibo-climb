const fs = require('fs');

let content = fs.readFileSync('src/components/WordsSessionView.jsx', 'utf8');

const processOld = `  const processAnswerEvaluation = (userAnsString) => {
    if (!userAnsString || !userAnsString.trim()) return;

    setInputVal(userAnsString);
    setConsecutiveSkips(0);

    if (problemStartTimeRef.current === 0) {
      problemStartTimeRef.current = performance.now();
    }

    const normUserAns = userAnsString.trim().toLowerCase();
    const normTargetAns = (currentProblem.answerString || currentProblem.answer || '').toString().toLowerCase();

    const isCorrect = normUserAns === normTargetAns;`;

const processNew = `  const getFullWordFromInput = (input) => {
    const targetStr = (currentProblem.answerString || currentProblem.answer || '').toString();
    const displayStr = currentProblem.displayString || '';

    let fullWord = '';
    let inputIdx = 0;

    for (let i = 0; i < displayStr.length; i++) {
        if (displayStr[i] === ' ') continue;
        if (displayStr[i] === '_') {
            if (inputIdx < input.length) {
                fullWord += input[inputIdx];
                inputIdx++;
            } else {
                fullWord += '_'; // missing input
            }
        } else {
            fullWord += displayStr[i];
        }
    }
    return fullWord.toLowerCase();
  };

  const processAnswerEvaluation = (userAnsString) => {
    if (!userAnsString || !userAnsString.trim()) return;

    setInputVal(userAnsString);
    setConsecutiveSkips(0);

    if (problemStartTimeRef.current === 0) {
      problemStartTimeRef.current = performance.now();
    }

    const normTargetAns = (currentProblem.answerString || currentProblem.answer || '').toString().toLowerCase();
    const fullWordGuess = getFullWordFromInput(userAnsString);

    const isCorrect = fullWordGuess === normTargetAns;`;

content = content.replace(processOld, processNew);


const handleCharOld = `  const handleCharInput = (val) => {
    if (problemStartTimeRef.current === 0) {
      problemStartTimeRef.current = performance.now();
    }
    soundFx.playKeyTap();

    let newInput = inputVal + val;
    newInput = newInput.trim();

    const normUserAns = newInput.toLowerCase();
    const normTargetAns = (currentProblem.answerString || currentProblem.answer || '').toString().toLowerCase();

    const isCorrect = normUserAns === normTargetAns;

    if (isCorrect) {
      processAnswerEvaluation(newInput);
      return;
    }

    if (newInput.length >= normTargetAns.length) {
       processAnswerEvaluation(newInput);
       return;
    }`;

const handleCharNew = `  const handleCharInput = (val) => {
    if (problemStartTimeRef.current === 0) {
      problemStartTimeRef.current = performance.now();
    }
    soundFx.playKeyTap();

    let newInput = inputVal + val;
    newInput = newInput.trim();

    const normTargetAns = (currentProblem.answerString || currentProblem.answer || '').toString().toLowerCase();
    const fullWordGuess = getFullWordFromInput(newInput);

    const blanksCount = (currentProblem.displayString || '').split('').filter(c => c === '_').length;

    const isCorrect = fullWordGuess === normTargetAns;

    if (isCorrect) {
      processAnswerEvaluation(newInput);
      return;
    }

    if (newInput.length >= blanksCount) {
       processAnswerEvaluation(newInput);
       return;
    }`;

content = content.replace(handleCharOld, handleCharNew);

fs.writeFileSync('src/components/WordsSessionView.jsx', content);
