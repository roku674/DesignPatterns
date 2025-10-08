/**
 * Builder Pattern - Demo
 * Demonstrates building complex Pizza objects step by step
 */

const { StandardPizzaBuilder, PizzaDirector } = require('./pizza-builder');

console.log('=== Builder Pattern Demo ===\n');

// Example 1: Building pizza step by step without director
console.log('--- Building Custom Pizza (No Director) ---');
const builder = new StandardPizzaBuilder();

const customPizza = builder
  .setSize('Extra Large')
  .setCrust('Stuffed crust')
  .setSauce('BBQ')
  .setCheese('Cheddar')
  .addTopping('Grilled Chicken')
  .addTopping('Bacon')
  .addTopping('Red Onion')
  .addTopping('Cilantro')
  .setCookingMethod('Brick oven')
  .build();

console.log(customPizza.describe());
console.log(`   Price: ${customPizza.getPrice()}`);

// Example 2: Using Director for predefined recipes
console.log('\n--- Using Director for Predefined Pizzas ---');

const director = new PizzaDirector(builder);

console.log('\n1. Making Margherita Pizza:');
const margherita = director.makeMargherita();
console.log(margherita.describe());
console.log(`   Price: ${margherita.getPrice()}`);

console.log('\n2. Making Pepperoni Pizza:');
const pepperoni = director.makePepperoni();
console.log(pepperoni.describe());
console.log(`   Price: ${pepperoni.getPrice()}`);

console.log('\n3. Making Vegetarian Pizza:');
const vegetarian = director.makeVegetarian();
console.log(vegetarian.describe());
console.log(`   Price: ${vegetarian.getPrice()}`);

console.log('\n4. Making Hawaiian Pizza:');
const hawaiian = director.makeHawaiian();
console.log(hawaiian.describe());
console.log(`   Price: ${hawaiian.getPrice()}`);

// Example 3: Building multiple pizzas in sequence
console.log('\n--- Building Multiple Custom Pizzas ---');

const pizza1 = builder
  .setSize('Small')
  .setCrust('Thin')
  .setSauce('White sauce')
  .setCheese('Parmesan')
  .addTopping('Spinach')
  .addTopping('Garlic')
  .setCookingMethod('Wood-fired oven')
  .build();

const pizza2 = builder
  .setSize('Medium')
  .setCrust('Gluten-free')
  .setSauce('Pesto')
  .setCheese('Vegan cheese')
  .addTopping('Artichokes')
  .addTopping('Sun-dried tomatoes')
  .setCookingMethod('Conveyor oven')
  .build();

console.log('\nPizza 1:');
console.log(pizza1.describe());
console.log(`   Price: ${pizza1.getPrice()}`);

console.log('\nPizza 2:');
console.log(pizza2.describe());
console.log(`   Price: ${pizza2.getPrice()}`);

// Example 4: Minimal pizza (not all steps required)
console.log('\n--- Minimal Pizza Configuration ---');

const minimalPizza = builder
  .setSize('Small')
  .setCrust('Regular')
  .setSauce('Tomato')
  .setCheese('Mozzarella')
  .setCookingMethod('Regular oven')
  .build(); // No toppings!

console.log(minimalPizza.describe());
console.log(`   Price: ${minimalPizza.getPrice()}`);
