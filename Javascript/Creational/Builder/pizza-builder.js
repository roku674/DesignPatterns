/**
 * Builder Pattern - Pizza Construction Example
 *
 * The Builder pattern lets you construct complex objects step by step.
 * It allows you to produce different types and representations of an
 * object using the same construction code.
 */

/**
 * Product: Pizza
 * The complex object being built
 */
class Pizza {
  constructor() {
    this.size = null;
    this.crust = null;
    this.cheese = null;
    this.toppings = [];
    this.sauce = null;
    this.cookingMethod = null;
  }

  /**
   * Display pizza details
   */
  describe() {
    const description = [
      `\n🍕 Pizza Details:`,
      `   Size: ${this.size}`,
      `   Crust: ${this.crust}`,
      `   Sauce: ${this.sauce}`,
      `   Cheese: ${this.cheese}`,
      `   Toppings: ${this.toppings.join(', ') || 'None'}`,
      `   Cooking Method: ${this.cookingMethod}`
    ];
    return description.join('\n');
  }

  /**
   * Calculate price based on size and toppings
   */
  getPrice() {
    const basePrice = {
      'Small': 8,
      'Medium': 12,
      'Large': 16,
      'Extra Large': 20
    };

    const toppingPrice = 1.5;
    const total = (basePrice[this.size] || 12) + (this.toppings.length * toppingPrice);
    return `$${total.toFixed(2)}`;
  }
}

/**
 * Abstract Builder Interface
 * Defines all possible construction steps
 */
class PizzaBuilder {
  constructor() {
    this.pizza = new Pizza();
  }

  setSize(size) {
    throw new Error('Method setSize() must be implemented');
  }

  setCrust(crust) {
    throw new Error('Method setCrust() must be implemented');
  }

  setSauce(sauce) {
    throw new Error('Method setSauce() must be implemented');
  }

  setCheese(cheese) {
    throw new Error('Method setCheese() must be implemented');
  }

  addTopping(topping) {
    throw new Error('Method addTopping() must be implemented');
  }

  setCookingMethod(method) {
    throw new Error('Method setCookingMethod() must be implemented');
  }

  build() {
    return this.pizza;
  }

  reset() {
    this.pizza = new Pizza();
    return this;
  }
}

/**
 * Concrete Builder: Standard Pizza Builder
 * Provides fluent interface for step-by-step construction
 */
class StandardPizzaBuilder extends PizzaBuilder {
  setSize(size) {
    this.pizza.size = size;
    return this; // Return this for method chaining
  }

  setCrust(crust) {
    this.pizza.crust = crust;
    return this;
  }

  setSauce(sauce) {
    this.pizza.sauce = sauce;
    return this;
  }

  setCheese(cheese) {
    this.pizza.cheese = cheese;
    return this;
  }

  addTopping(topping) {
    this.pizza.toppings.push(topping);
    return this;
  }

  setCookingMethod(method) {
    this.pizza.cookingMethod = method;
    return this;
  }

  build() {
    const result = this.pizza;
    this.reset(); // Reset builder for reuse
    return result;
  }
}

/**
 * Director: PizzaDirector
 * Defines the order in which to execute building steps
 * to create well-known pizza configurations
 */
class PizzaDirector {
  constructor(builder) {
    this.builder = builder;
  }

  setBuilder(builder) {
    this.builder = builder;
  }

  /**
   * Build a Margherita pizza
   */
  makeMargherita() {
    return this.builder
      .setSize('Medium')
      .setCrust('Thin')
      .setSauce('Tomato')
      .setCheese('Mozzarella')
      .addTopping('Fresh Basil')
      .addTopping('Olive Oil')
      .setCookingMethod('Wood-fired oven')
      .build();
  }

  /**
   * Build a Pepperoni pizza
   */
  makePepperoni() {
    return this.builder
      .setSize('Large')
      .setCrust('Hand-tossed')
      .setSauce('Tomato')
      .setCheese('Mozzarella')
      .addTopping('Pepperoni')
      .addTopping('Italian Sausage')
      .setCookingMethod('Brick oven')
      .build();
  }

  /**
   * Build a Vegetarian pizza
   */
  makeVegetarian() {
    return this.builder
      .setSize('Medium')
      .setCrust('Whole wheat')
      .setSauce('Tomato')
      .setCheese('Mozzarella')
      .addTopping('Bell Peppers')
      .addTopping('Mushrooms')
      .addTopping('Onions')
      .addTopping('Olives')
      .addTopping('Tomatoes')
      .setCookingMethod('Conveyor oven')
      .build();
  }

  /**
   * Build a Hawaiian pizza
   */
  makeHawaiian() {
    return this.builder
      .setSize('Large')
      .setCrust('Pan')
      .setSauce('Tomato')
      .setCheese('Mozzarella')
      .addTopping('Ham')
      .addTopping('Pineapple')
      .setCookingMethod('Deck oven')
      .build();
  }
}

module.exports = {
  Pizza,
  StandardPizzaBuilder,
  PizzaDirector
};
