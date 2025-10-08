/**
 * Decorator Pattern - Coffee Shop Example
 *
 * The Decorator pattern lets you attach new behaviors to objects by placing
 * these objects inside special wrapper objects that contain the behaviors.
 */

/**
 * Component: Beverage
 * Base interface for all beverages
 */
class Beverage {
  getDescription() {
    throw new Error('Method getDescription() must be implemented');
  }

  cost() {
    throw new Error('Method cost() must be implemented');
  }
}

// ============= Concrete Components =============

class Espresso extends Beverage {
  getDescription() {
    return 'Espresso';
  }

  cost() {
    return 1.99;
  }
}

class HouseBlend extends Beverage {
  getDescription() {
    return 'House Blend Coffee';
  }

  cost() {
    return 0.89;
  }
}

class DarkRoast extends Beverage {
  getDescription() {
    return 'Dark Roast Coffee';
  }

  cost() {
    return 0.99;
  }
}

class Decaf extends Beverage {
  getDescription() {
    return 'Decaf Coffee';
  }

  cost() {
    return 1.05;
  }
}

// ============= Base Decorator =============

/**
 * BeverageDecorator
 * Base decorator class that wraps a Beverage
 */
class BeverageDecorator extends Beverage {
  constructor(beverage) {
    super();
    this.beverage = beverage;
  }

  getDescription() {
    return this.beverage.getDescription();
  }

  cost() {
    return this.beverage.cost();
  }
}

// ============= Concrete Decorators =============

class Milk extends BeverageDecorator {
  constructor(beverage) {
    super(beverage);
  }

  getDescription() {
    return `${this.beverage.getDescription()}, Milk`;
  }

  cost() {
    return this.beverage.cost() + 0.10;
  }
}

class Mocha extends BeverageDecorator {
  constructor(beverage) {
    super(beverage);
  }

  getDescription() {
    return `${this.beverage.getDescription()}, Mocha`;
  }

  cost() {
    return this.beverage.cost() + 0.20;
  }
}

class Whip extends BeverageDecorator {
  constructor(beverage) {
    super(beverage);
  }

  getDescription() {
    return `${this.beverage.getDescription()}, Whip`;
  }

  cost() {
    return this.beverage.cost() + 0.15;
  }
}

class Soy extends BeverageDecorator {
  constructor(beverage) {
    super(beverage);
  }

  getDescription() {
    return `${this.beverage.getDescription()}, Soy`;
  }

  cost() {
    return this.beverage.cost() + 0.15;
  }
}

class CaramelSyrup extends BeverageDecorator {
  constructor(beverage) {
    super(beverage);
  }

  getDescription() {
    return `${this.beverage.getDescription()}, Caramel Syrup`;
  }

  cost() {
    return this.beverage.cost() + 0.25;
  }
}

class VanillaSyrup extends BeverageDecorator {
  constructor(beverage) {
    super(beverage);
  }

  getDescription() {
    return `${this.beverage.getDescription()}, Vanilla Syrup`;
  }

  cost() {
    return this.beverage.cost() + 0.25;
  }
}

class ExtraShot extends BeverageDecorator {
  constructor(beverage) {
    super(beverage);
  }

  getDescription() {
    return `${this.beverage.getDescription()}, Extra Shot`;
  }

  cost() {
    return this.beverage.cost() + 0.50;
  }
}

module.exports = {
  // Concrete Components
  Espresso,
  HouseBlend,
  DarkRoast,
  Decaf,
  // Decorators
  Milk,
  Mocha,
  Whip,
  Soy,
  CaramelSyrup,
  VanillaSyrup,
  ExtraShot
};
