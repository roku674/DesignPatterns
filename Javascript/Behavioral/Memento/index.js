const { TextEditor, History } = require('./text-editor');

console.log('=== Memento Pattern Demo ===\n');

const editor = new TextEditor();
const history = new History();

console.log('Typing: "Hello "');
editor.type('Hello ');
history.push(editor.save());
console.log(`Content: "${editor.getContent()}"`);

console.log('\nTyping: "World"');
editor.type('World');
history.push(editor.save());
console.log(`Content: "${editor.getContent()}"`);

console.log('\nTyping: "!!!"');
editor.type('!!!');
console.log(`Content: "${editor.getContent()}"`);

console.log('\nUndo last change:');
editor.restore(history.pop());
console.log(`Content: "${editor.getContent()}"`);

console.log('\nUndo again:');
editor.restore(history.pop());
console.log(`Content: "${editor.getContent()}"`);

console.log('\n=== Demo Complete ===');
