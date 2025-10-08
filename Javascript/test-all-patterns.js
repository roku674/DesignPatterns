/**
 * Test All Design Patterns
 * Runs all 23 Gang of Four design patterns to verify they work
 */

const { execSync } = require('child_process');
const path = require('path');

const patterns = [
  // Creational Patterns
  { category: 'Creational', name: 'Factory Method', path: 'Creational/FactoryMethod' },
  { category: 'Creational', name: 'Abstract Factory', path: 'Creational/AbstractFactory' },
  { category: 'Creational', name: 'Builder', path: 'Creational/Builder' },
  { category: 'Creational', name: 'Prototype', path: 'Creational/Prototype' },
  { category: 'Creational', name: 'Singleton', path: 'Creational/Singleton' },

  // Structural Patterns
  { category: 'Structural', name: 'Adapter', path: 'Structural/Adapter' },
  { category: 'Structural', name: 'Bridge', path: 'Structural/Bridge' },
  { category: 'Structural', name: 'Composite', path: 'Structural/Composite' },
  { category: 'Structural', name: 'Decorator', path: 'Structural/Decorator' },
  { category: 'Structural', name: 'Facade', path: 'Structural/Facade' },
  { category: 'Structural', name: 'Flyweight', path: 'Structural/Flyweight' },
  { category: 'Structural', name: 'Proxy', path: 'Structural/Proxy' },

  // Behavioral Patterns
  { category: 'Behavioral', name: 'Chain of Responsibility', path: 'Behavioral/ChainOfResponsibility' },
  { category: 'Behavioral', name: 'Command', path: 'Behavioral/Command' },
  { category: 'Behavioral', name: 'Interpreter', path: 'Behavioral/Interpreter' },
  { category: 'Behavioral', name: 'Iterator', path: 'Behavioral/Iterator' },
  { category: 'Behavioral', name: 'Mediator', path: 'Behavioral/Mediator' },
  { category: 'Behavioral', name: 'Memento', path: 'Behavioral/Memento' },
  { category: 'Behavioral', name: 'Observer', path: 'Behavioral/Observer' },
  { category: 'Behavioral', name: 'State', path: 'Behavioral/State' },
  { category: 'Behavioral', name: 'Strategy', path: 'Behavioral/Strategy' },
  { category: 'Behavioral', name: 'Template Method', path: 'Behavioral/TemplateMethod' },
  { category: 'Behavioral', name: 'Visitor', path: 'Behavioral/Visitor' }
];

console.log('═══════════════════════════════════════════════════════');
console.log('   Testing All 23 Gang of Four Design Patterns');
console.log('═══════════════════════════════════════════════════════\n');

const results = {
  passed: [],
  failed: []
};

patterns.forEach((pattern, index) => {
  const fullPath = path.join(__dirname, pattern.path);

  try {
    console.log(`[${index + 1}/23] Testing ${pattern.name}...`);

    const output = execSync(`node index.js`, {
      cwd: fullPath,
      encoding: 'utf8',
      timeout: 5000
    });

    results.passed.push(pattern.name);
    console.log(`  ✓ PASS\n`);
  } catch (error) {
    results.failed.push({
      name: pattern.name,
      error: error.message
    });
    console.log(`  ✗ FAIL: ${error.message}\n`);
  }
});

// Summary
console.log('═══════════════════════════════════════════════════════');
console.log('                    TEST SUMMARY');
console.log('═══════════════════════════════════════════════════════\n');

console.log(`Total Patterns: ${patterns.length}`);
console.log(`Passed: ${results.passed.length} ✓`);
console.log(`Failed: ${results.failed.length} ✗\n`);

if (results.failed.length > 0) {
  console.log('Failed patterns:');
  results.failed.forEach(failure => {
    console.log(`  - ${failure.name}: ${failure.error}`);
  });
} else {
  console.log('🎉 All 23 design patterns are working correctly!');
}

console.log('\n═══════════════════════════════════════════════════════');
