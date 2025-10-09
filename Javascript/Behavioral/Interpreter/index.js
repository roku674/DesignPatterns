/**
 * Interpreter Pattern - Mathematical Expression Evaluator Demo
 * Demonstrates real expression parsing and evaluation
 */

const { ExpressionEvaluator } = require('./expression-interpreter');

console.log('=== Interpreter Pattern - Expression Evaluator Demo ===\n');

// Example 1: Basic arithmetic
console.log('=== Example 1: Basic Arithmetic ===\n');

const evaluator = new ExpressionEvaluator();

const expressions1 = [
  '2 + 3',
  '10 - 4',
  '5 * 6',
  '20 / 4',
  '17 % 5',
  '2 + 3 * 4',
  '(2 + 3) * 4',
  '10 / 2 + 3'
];

expressions1.forEach(expr => {
  const result = evaluator.evaluate(expr);
  console.log(`${expr} = ${result}`);
});

// Example 2: Power and complex expressions
console.log('\n=== Example 2: Power and Complex Expressions ===\n');

const expressions2 = [
  '2^3',
  '2^3^2',
  '(2 + 3) * (4 - 1)',
  '100 / (2 + 3) - 10',
  '2 * 3 + 4 * 5'
];

expressions2.forEach(expr => {
  const result = evaluator.evaluate(expr);
  console.log(`${expr} = ${result}`);
});

// Example 3: Variables
console.log('\n=== Example 3: Variables ===\n');

const eval2 = new ExpressionEvaluator();
eval2.setVariable('x', 10);
eval2.setVariable('y', 5);
eval2.setVariable('z', 2);

const expressions3 = [
  'x + y',
  'x * y',
  'x / y',
  'x^z',
  'x + y * z',
  '(x + y) * z'
];

console.log('Variables: x=10, y=5, z=2\n');
expressions3.forEach(expr => {
  const result = eval2.evaluate(expr);
  console.log(`${expr} = ${result}`);
});

// Example 4: Built-in functions
console.log('\n=== Example 4: Built-in Functions ===\n');

const eval3 = new ExpressionEvaluator();
eval3.setVariable('pi', Math.PI);

const expressions4 = [
  'sqrt(16)',
  'abs(-10)',
  'floor(3.7)',
  'ceil(3.2)',
  'round(3.6)',
  'min(5, 3, 8, 1)',
  'max(5, 3, 8, 1)',
  'sqrt(9) + abs(-5)'
];

expressions4.forEach(expr => {
  const result = evaluator.evaluate(expr);
  console.log(`${expr} = ${result}`);
});

// Example 5: Trigonometric functions
console.log('\n=== Example 5: Trigonometric Functions ===\n');

const eval4 = new ExpressionEvaluator();
eval4.setVariable('pi', Math.PI);

const expressions5 = [
  'sin(0)',
  'cos(0)',
  'sin(pi / 2)',
  'cos(pi)',
  'tan(pi / 4)'
];

expressions5.forEach(expr => {
  const result = eval4.evaluate(expr);
  console.log(`${expr} = ${result.toFixed(4)}`);
});

// Example 6: Custom functions
console.log('\n=== Example 6: Custom Functions ===\n');

const eval5 = new ExpressionEvaluator();
eval5.setFunction('double', x => x * 2);
eval5.setFunction('triple', x => x * 3);
eval5.setFunction('average', (...args) => args.reduce((a, b) => a + b, 0) / args.length);

const expressions6 = [
  'double(5)',
  'triple(4)',
  'average(10, 20, 30)',
  'double(5) + triple(4)',
  'average(double(5), triple(4))'
];

expressions6.forEach(expr => {
  const result = eval5.evaluate(expr);
  console.log(`${expr} = ${result}`);
});

// Example 7: Real-world scenario - Physics calculation
console.log('\n=== Example 7: Physics Calculation ===\n');

const physics = new ExpressionEvaluator();
physics.setVariable('g', 9.8);
physics.setVariable('t', 2);
physics.setVariable('v0', 20);
physics.setVariable('h0', 10);

const distanceFallen = 'h0 + v0 * t - (g * t^2) / 2';
console.log('Projectile height formula: h = h0 + v0*t - (g*t^2)/2');
console.log(`Variables: h0=${physics.context.variables.h0}m, v0=${physics.context.variables.v0}m/s, t=${physics.context.variables.t}s, g=${physics.context.variables.g}m/s^2`);
console.log(`Height after ${physics.context.variables.t}s: ${physics.evaluate(distanceFallen).toFixed(2)}m`);

// Example 8: Nested functions
console.log('\n=== Example 8: Nested Functions ===\n');

const expressions8 = [
  'sqrt(abs(-16))',
  'floor(sqrt(10))',
  'max(abs(-5), sqrt(16), floor(7.8))',
  'sqrt(max(4, 9, 16))'
];

expressions8.forEach(expr => {
  const result = evaluator.evaluate(expr);
  console.log(`${expr} = ${result}`);
});

// Example 9: Negative numbers
console.log('\n=== Example 9: Negative Numbers ===\n');

const expressions9 = [
  '-5',
  '-5 + 3',
  '10 + -5',
  '-2 * -3',
  '-(5 + 3)'
];

expressions9.forEach(expr => {
  const result = evaluator.evaluate(expr);
  console.log(`${expr} = ${result}`);
});

console.log('\n=== Pattern Benefits ===\n');
console.log('Real-world advantages:');
console.log('  - Parse and evaluate complex expressions from strings');
console.log('  - Support for variables and functions');
console.log('  - Operator precedence handled correctly');
console.log('  - Extensible: add new operators or functions easily');
console.log('  - AST can be inspected, optimized, or transformed');
console.log('  - Used in calculators, query languages, config parsers');
console.log();

console.log('=== Demo Complete ===');
