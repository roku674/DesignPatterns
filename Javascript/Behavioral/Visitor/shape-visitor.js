/**
 * Visitor Pattern - Shape Area Calculator
 */

class Shape {
  accept(visitor) {
    throw new Error('accept() must be implemented');
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  accept(visitor) {
    return visitor.visitCircle(this);
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  accept(visitor) {
    return visitor.visitRectangle(this);
  }
}

class Visitor {
  visitCircle(circle) {
    throw new Error('visitCircle() must be implemented');
  }

  visitRectangle(rectangle) {
    throw new Error('visitRectangle() must be implemented');
  }
}

class AreaCalculator extends Visitor {
  visitCircle(circle) {
    const area = Math.PI * circle.radius ** 2;
    console.log(`Circle area: ${area.toFixed(2)}`);
    return area;
  }

  visitRectangle(rectangle) {
    const area = rectangle.width * rectangle.height;
    console.log(`Rectangle area: ${area}`);
    return area;
  }
}

module.exports = { Circle, Rectangle, AreaCalculator };
