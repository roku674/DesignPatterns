const { Circle, Rectangle, AreaCalculator } = require('./shape-visitor');

console.log('=== Visitor Pattern Demo ===\n');

const shapes = [
  new Circle(5),
  new Rectangle(4, 6),
  new Circle(3)
];

const areaCalculator = new AreaCalculator();

console.log('Calculating areas:');
shapes.forEach(shape => shape.accept(areaCalculator));

console.log('\n=== Demo Complete ===');
