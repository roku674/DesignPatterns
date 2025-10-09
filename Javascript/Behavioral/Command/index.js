/**
 * Command Pattern - Document Editor Demo
 * Demonstrates real undo/redo functionality with text manipulation
 */

const { DocumentEditor } = require('./smart-home');

console.log('=== Command Pattern - Document Editor Demo ===\n');

const editor = new DocumentEditor();

// Example 1: Basic typing with undo/redo
console.log('=== Example 1: Basic Text Editing ===\n');

editor.type('Hello');
console.log('After typing "Hello":', editor.getText());

editor.type(' World');
console.log('After typing " World":', editor.getText());

editor.type('!');
console.log('After typing "!":', editor.getText());

console.log('\nUndo last action:');
editor.undo();
console.log('Text:', editor.getText());

console.log('\nUndo again:');
editor.undo();
console.log('Text:', editor.getText());

console.log('\nRedo:');
editor.redo();
console.log('Text:', editor.getText());

// Example 2: Delete operations
console.log('\n=== Example 2: Delete Operations ===\n');

editor.redo();
console.log('Current text:', editor.getText());

editor.delete(7);
console.log('After deleting 7 characters:', editor.getText());

console.log('\nUndo delete:');
editor.undo();
console.log('Text:', editor.getText());

// Example 3: Insert at specific position
console.log('\n=== Example 3: Insert at Position ===\n');

editor.insertAt(' Beautiful', 5);
console.log('After inserting " Beautiful" at position 5:', editor.getText());

console.log('\nUndo insert:');
editor.undo();
console.log('Text:', editor.getText());

console.log('\nRedo insert:');
editor.redo();
console.log('Text:', editor.getText());

// Example 4: Replace text
console.log('\n=== Example 4: Replace Text ===\n');

console.log('Current text:', editor.getText());
editor.replace(6, 9, 'Amazing');
console.log('After replacing "Beautiful" with "Amazing":', editor.getText());

console.log('\nUndo replace:');
editor.undo();
console.log('Text:', editor.getText());

// Example 5: Command merging (consecutive typing)
console.log('\n=== Example 5: Command Merging ===\n');

const editor2 = new DocumentEditor();
console.log('History before typing:', editor2.getHistory());

editor2.type('a');
editor2.type('b');
editor2.type('c');
console.log('Text after typing "abc":', editor2.getText());
console.log('History after typing (commands merged):', editor2.getHistory());

console.log('\nUndo once (removes all merged typing):');
editor2.undo();
console.log('Text:', editor2.getText());

// Example 6: Complex scenario
console.log('\n=== Example 6: Complex Editing Scenario ===\n');

const editor3 = new DocumentEditor();

editor3.type('The quick brown fox');
console.log('Step 1:', editor3.getText());

editor3.insertAt(' lazy', 19);
console.log('Step 2:', editor3.getText());

editor3.insertAt(' jumps over the', 15);
console.log('Step 3:', editor3.getText());

editor3.deleteAt(4, 6);
console.log('Step 4 (delete "quick "):', editor3.getText());

console.log('\nHistory:', editor3.getHistory());

console.log('\nUndo all changes:');
while (editor3.canUndo()) {
  editor3.undo();
  console.log('  ->', editor3.getText());
}

console.log('\nRedo all changes:');
while (editor3.canRedo()) {
  editor3.redo();
  console.log('  ->', editor3.getText());
}

console.log('\n=== Pattern Benefits ===\n');
console.log('Real-world advantages:');
console.log('  - Complete undo/redo functionality');
console.log('  - Commands encapsulate all info needed to reverse actions');
console.log('  - Command merging optimizes history (consecutive typing)');
console.log('  - Macro commands group multiple operations');
console.log('  - History size limits prevent memory issues');
console.log('  - Decouples invoker from receiver');
console.log();

console.log('=== Demo Complete ===');
