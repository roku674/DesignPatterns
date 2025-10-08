const { NumberExpression, AddExpression, SubtractExpression } = require('./expression-interpreter');

console.log('=== Interpreter Pattern Demo ===\n');

// Build expression: (5 + 3) - 2
const expression = new SubtractExpression(
  new AddExpression(
    new NumberExpression(5),
    new NumberExpression(3)
  ),
  new NumberExpression(2)
);

const result = expression.interpret({});
console.log('Expression: (5 + 3) - 2');
console.log(`Result: ${result}`);

console.log('\n=== Demo Complete ===');
