/**
 * Iterator Pattern - Lazy Collection Demo
 * Demonstrates real lazy evaluation and data processing
 */

const {
  LazyCollection,
  TreeNode,
  DepthFirstIterator,
  BreadthFirstIterator,
  ReverseIterator
} = require('./collection');

console.log('=== Iterator Pattern - Lazy Collection Demo ===\n');

// Example 1: Basic lazy operations
console.log('=== Example 1: Lazy Filtering and Mapping ===\n');

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
console.log('Original array:', numbers);

const result = LazyCollection.from(numbers)
  .filter(n => n % 2 === 0)
  .map(n => n * n)
  .toArray();

console.log('Even numbers squared:', result);
console.log();

// Example 2: Range with lazy operations
console.log('=== Example 2: Range Iterator ===\n');

const sum = LazyCollection.range(1, 101)
  .filter(n => n % 3 === 0 || n % 5 === 0)
  .sum();

console.log('Sum of numbers 1-100 divisible by 3 or 5:', sum);

const first10Squares = LazyCollection.range(1, 1000000)
  .map(n => n * n)
  .take(10)
  .toArray();

console.log('First 10 squares (from 1M range, but only computed 10):', first10Squares);
console.log();

// Example 3: Complex chaining
console.log('=== Example 3: Complex Data Processing ===\n');

const users = [
  { name: 'Alice', age: 25, score: 85 },
  { name: 'Bob', age: 30, score: 92 },
  { name: 'Charlie', age: 35, score: 78 },
  { name: 'David', age: 28, score: 95 },
  { name: 'Eve', age: 32, score: 88 }
];

const topScorers = LazyCollection.from(users)
  .filter(u => u.score >= 85)
  .map(u => ({ ...u, grade: u.score >= 90 ? 'A' : 'B' }))
  .toArray();

console.log('Users with score >= 85:');
topScorers.forEach(u => console.log(`  ${u.name}: ${u.score} (Grade ${u.grade})`));

const averageAge = LazyCollection.from(users)
  .map(u => u.age)
  .average();

console.log(`\nAverage age: ${averageAge}`);
console.log();

// Example 4: Skip and Take for pagination
console.log('=== Example 4: Pagination with Skip/Take ===\n');

const items = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);
const pageSize = 5;
const page = 3;

const pageItems = LazyCollection.from(items)
  .skip((page - 1) * pageSize)
  .take(pageSize)
  .toArray();

console.log(`Page ${page} (items ${(page - 1) * pageSize + 1}-${page * pageSize}):`);
pageItems.forEach(item => console.log(`  ${item}`));
console.log();

// Example 5: Aggregations
console.log('=== Example 5: Aggregation Operations ===\n');

const values = [15, 42, 8, 23, 16, 4, 37];
console.log('Values:', values);

const collection = LazyCollection.from(values);
console.log('Sum:', LazyCollection.from(values).sum());
console.log('Average:', LazyCollection.from(values).average());
console.log('Min:', LazyCollection.from(values).min());
console.log('Max:', LazyCollection.from(values).max());
console.log('Count:', LazyCollection.from(values).count());
console.log();

// Example 6: Find and predicate operations
console.log('=== Example 6: Find and Predicate Operations ===\n');

const products = [
  { name: 'Laptop', price: 1200, inStock: true },
  { name: 'Mouse', price: 25, inStock: true },
  { name: 'Keyboard', price: 75, inStock: false },
  { name: 'Monitor', price: 350, inStock: true }
];

const firstExpensive = LazyCollection.from(products)
  .find(p => p.price > 100);

console.log('First expensive product:', firstExpensive);

const anyOutOfStock = LazyCollection.from(products)
  .some(p => !p.inStock);

console.log('Any products out of stock?', anyOutOfStock);

const allInStock = LazyCollection.from(products)
  .every(p => p.inStock);

console.log('All products in stock?', allInStock);
console.log();

// Example 7: Tree traversal
console.log('=== Example 7: Tree Traversal Iterators ===\n');

const root = new TreeNode('Root');
const child1 = new TreeNode('Child 1');
const child2 = new TreeNode('Child 2');
const child3 = new TreeNode('Child 3');
const grandchild1 = new TreeNode('Grandchild 1');
const grandchild2 = new TreeNode('Grandchild 2');

root.addChild(child1);
root.addChild(child2);
root.addChild(child3);
child1.addChild(grandchild1);
child1.addChild(grandchild2);

console.log('Tree structure:');
console.log('Root');
console.log('  - Child 1');
console.log('    - Grandchild 1');
console.log('    - Grandchild 2');
console.log('  - Child 2');
console.log('  - Child 3');
console.log();

const dfsIterator = new DepthFirstIterator(root);
console.log('Depth-First Traversal:');
const dfsResults = [];
while (dfsIterator.hasNext()) {
  dfsResults.push(dfsIterator.next());
}
console.log(dfsResults.join(' -> '));

const bfsIterator = new BreadthFirstIterator(root);
console.log('\nBreadth-First Traversal:');
const bfsResults = [];
while (bfsIterator.hasNext()) {
  bfsResults.push(bfsIterator.next());
}
console.log(bfsResults.join(' -> '));
console.log();

// Example 8: Reverse iteration
console.log('=== Example 8: Reverse Iteration ===\n');

const sequence = ['A', 'B', 'C', 'D', 'E'];
const reverseIter = new ReverseIterator(sequence);

console.log('Original:', sequence.join(' -> '));
const reversed = [];
while (reverseIter.hasNext()) {
  reversed.push(reverseIter.next());
}
console.log('Reversed:', reversed.join(' -> '));
console.log();

console.log('=== Pattern Benefits ===\n');
console.log('Real-world advantages:');
console.log('  - Lazy evaluation: operations only execute when needed');
console.log('  - Memory efficient: process large datasets without loading all into memory');
console.log('  - Chainable operations: clean, readable code');
console.log('  - Uniform interface: iterate over different data structures the same way');
console.log('  - Tree traversal: DFS and BFS with simple iterator interface');
console.log('  - Early termination: find() stops as soon as match is found');
console.log();

console.log('=== Demo Complete ===');
