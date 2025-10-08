/**
 * Flyweight Pattern - Demo
 */

const { TextEditor } = require('./character-rendering');

console.log('=== Flyweight Pattern Demo ===\n');

// Example 1: Creating a document with shared styles
console.log('=== Example 1: Document with Shared Styles ===\n');

const editor = new TextEditor();

// Title (all characters share same style)
console.log('Creating title...');
editor.insertText('Design Patterns', 0, 'Arial', 24, 'blue', true, false);

// Paragraph 1 (all characters share same style)
console.log('\nCreating paragraph 1...');
editor.insertText('The Flyweight pattern is a structural design pattern.', 16, 'Times', 12, 'black', false, false);

// Emphasized word (different style)
console.log('\nCreating emphasized text...');
editor.insertText('Important', 69, 'Times', 12, 'red', true, true);

// Paragraph 2
console.log('\nCreating paragraph 2...');
editor.insertText(' note about memory efficiency.', 78, 'Times', 12, 'black', false, false);

// Example 2: Render the document
console.log('\n\n=== Example 2: Rendering Document (first 20 chars) ===\n');

editor.characters.slice(0, 20).forEach(char => char.display());

// Example 3: Memory statistics
console.log('\n=== Example 3: Memory Usage Statistics ===\n');

const stats = editor.getMemoryStats();

console.log(`Total Characters: ${stats.totalCharacters}`);
console.log(`Unique Styles: ${stats.uniqueStyles}`);
console.log(`\nMemory Usage:`);
console.log(`  With Flyweight: ${stats.actualMemory} bytes`);
console.log(`  Without Flyweight: ${stats.memoryWithoutFlyweight} bytes`);
console.log(`  Memory Saved: ${stats.savedMemory} bytes`);
console.log(`  Savings: ${stats.savingsPercentage}%`);

// Example 4: Large document demonstration
console.log('\n\n=== Example 4: Large Document ===\n');

const largeEditor = new TextEditor();

console.log('Creating large document with 1000 characters...\n');

// Simulate a document with repeated styles
for (let i = 0; i < 10; i++) {
  largeEditor.insertText(
    'This is a paragraph with normal text. ',
    i * 100,
    'Arial',
    12,
    'black',
    false,
    false
  );

  largeEditor.insertText(
    'Bold text here. ',
    i * 100 + 38,
    'Arial',
    12,
    'black',
    true,
    false
  );

  largeEditor.insertText(
    'Italic text here. ',
    i * 100 + 54,
    'Arial',
    12,
    'black',
    false,
    true
  );

  largeEditor.insertText(
    'More text. ',
    i * 100 + 72,
    'Arial',
    12,
    'black',
    false,
    false
  );
}

const largeStats = largeEditor.getMemoryStats();

console.log(`Total Characters: ${largeStats.totalCharacters}`);
console.log(`Unique Styles: ${largeStats.uniqueStyles}`);
console.log(`\nMemory Usage:`);
console.log(`  With Flyweight: ${largeStats.actualMemory} bytes`);
console.log(`  Without Flyweight: ${largeStats.memoryWithoutFlyweight} bytes`);
console.log(`  Memory Saved: ${largeStats.savedMemory} bytes`);
console.log(`  Savings: ${largeStats.savingsPercentage}%`);

// Example 5: Demonstrating object reuse
console.log('\n\n=== Example 5: Object Sharing Demonstration ===\n');

const demo = new TextEditor();

console.log('Inserting 5 characters with same style:\n');

for (let i = 0; i < 5; i++) {
  demo.insertCharacter('A', i, 'Arial', 12, 'black', false, false);
}

console.log('\nInserting 3 characters with different style:\n');

for (let i = 0; i < 3; i++) {
  demo.insertCharacter('B', i + 5, 'Arial', 12, 'red', true, false);
}

const demoStats = demo.getMemoryStats();
console.log(`\n8 characters created, but only ${demoStats.uniqueStyles} style objects!`);

// Example 6: Flyweight pattern benefits
console.log('\n=== Example 6: Pattern Benefits ===\n');

console.log('WITHOUT Flyweight Pattern:');
console.log('  - Each character object stores complete style info');
console.log('  - 1000 characters = 1000 style objects');
console.log('  - High memory usage');
console.log('  - More objects to garbage collect\n');

console.log('WITH Flyweight Pattern:');
console.log('  ✓ Style information is shared');
console.log('  ✓ 1000 characters might share only 10 style objects');
console.log('  ✓ Significant memory savings (often 70-90%)');
console.log('  ✓ Fewer objects for garbage collector');
console.log('  ✓ Better performance with large datasets\n');

console.log('Trade-offs:');
console.log('  - Slightly more complex code');
console.log('  - Requires factory to manage shared objects');
console.log('  - Must separate intrinsic and extrinsic state');

console.log('\n=== Demo Complete ===');
