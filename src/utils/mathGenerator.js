// Generates 20 arithmetic problems: Addition/Subtraction under 20, single-digit Multiplication

export function generate20Problems() {
  const problems = [];
  const types = ['add', 'sub', 'mul'];

  for (let i = 0; i < 20; i++) {
    // Pick random operation type
    const type = types[Math.floor(Math.random() * types.length)];
    let num1, num2, answer, operatorSymbol;

    if (type === 'add') {
      // Sum under 20
      answer = Math.floor(Math.random() * 18) + 2; // 2 to 19
      num1 = Math.floor(Math.random() * (answer - 1)) + 1;
      num2 = answer - num1;
      operatorSymbol = '+';
    } else if (type === 'sub') {
      // Subtraction under 20
      num1 = Math.floor(Math.random() * 18) + 2; // 2 to 19
      num2 = Math.floor(Math.random() * num1) + 1; // 1 to num1
      answer = num1 - num2;
      operatorSymbol = '−';
    } else {
      // Single-digit multiplication
      num1 = Math.floor(Math.random() * 9) + 1; // 1 to 9
      num2 = Math.floor(Math.random() * 9) + 1; // 1 to 9
      answer = num1 * num2;
      operatorSymbol = '×';
    }

    problems.push({
      id: i + 1,
      num1,
      num2,
      operatorSymbol,
      type,
      answer,
      answerString: answer.toString()
    });
  }

  return problems;
}
