/**
 * Decorator Pattern - Demo
 */

const {
  Espresso,
  HouseBlend,
  DarkRoast,
  Decaf,
  Milk,
  Mocha,
  Whip,
  Soy,
  CaramelSyrup,
  VanillaSyrup,
  ExtraShot
} = require('./coffee-shop');

console.log('=== Decorator Pattern Demo ===\n');

/**
 * Helper function to print beverage details
 */
function printOrder(beverage, orderNumber) {
  console.log(`Order #${orderNumber}:`);
  console.log(`  ${beverage.getDescription()}`);
  console.log(`  Cost: $${beverage.cost().toFixed(2)}`);
  console.log();
}

// Example 1: Simple beverage (no decorators)
console.log('=== Example 1: Simple Beverages ===\n');

let beverage1 = new Espresso();
printOrder(beverage1, 1);

let beverage2 = new HouseBlend();
printOrder(beverage2, 2);

// Example 2: Single decorator
console.log('=== Example 2: Single Decorator ===\n');

let beverage3 = new DarkRoast();
beverage3 = new Milk(beverage3);
printOrder(beverage3, 3);

// Example 3: Multiple decorators
console.log('=== Example 3: Multiple Decorators ===\n');

let beverage4 = new Espresso();
beverage4 = new Mocha(beverage4);
beverage4 = new Mocha(beverage4); // Double mocha!
beverage4 = new Whip(beverage4);
printOrder(beverage4, 4);

// Example 4: Complex order
console.log('=== Example 4: Complex Orders ===\n');

// Vanilla Latte with extra shot
let beverage5 = new Espresso();
beverage5 = new VanillaSyrup(beverage5);
beverage5 = new Milk(beverage5);
beverage5 = new ExtraShot(beverage5);
printOrder(beverage5, 5);

// Caramel Macchiato
let beverage6 = new Espresso();
beverage6 = new CaramelSyrup(beverage6);
beverage6 = new Milk(beverage6);
beverage6 = new Whip(beverage6);
printOrder(beverage6, 6);

// Soy Mocha
let beverage7 = new DarkRoast();
beverage7 = new Soy(beverage7);
beverage7 = new Mocha(beverage7);
printOrder(beverage7, 7);

// Example 5: Building orders dynamically
console.log('=== Example 5: Dynamic Order Building ===\n');

function buildCustomOrder(baseBeverage, addons) {
  let beverage = baseBeverage;

  addons.forEach(addon => {
    beverage = new addon(beverage);
  });

  return beverage;
}

const customOrder1 = buildCustomOrder(new HouseBlend(), [Milk, Mocha, Whip]);
printOrder(customOrder1, 8);

const customOrder2 = buildCustomOrder(new Decaf(), [Soy, VanillaSyrup, ExtraShot]);
printOrder(customOrder2, 9);

// Example 6: Order comparison
console.log('=== Example 6: Price Comparison ===\n');

const simpleEspresso = new Espresso();
console.log(`Simple Espresso: $${simpleEspresso.cost().toFixed(2)}`);

let fancyEspresso = new Espresso();
fancyEspresso = new Mocha(fancyEspresso);
fancyEspresso = new Whip(fancyEspresso);
fancyEspresso = new CaramelSyrup(fancyEspresso);
fancyEspresso = new ExtraShot(fancyEspresso);
console.log(`Fancy Espresso: $${fancyEspresso.cost().toFixed(2)}`);
console.log(`Price difference: $${(fancyEspresso.cost() - simpleEspresso.cost()).toFixed(2)}`);

// Example 7: Coffee Shop Menu
console.log('\n=== Example 7: Popular Menu Items ===\n');

const menuItems = [
  {
    name: 'Classic Latte',
    build: () => new Milk(new Espresso())
  },
  {
    name: 'Cappuccino',
    build: () => new Whip(new Milk(new Espresso()))
  },
  {
    name: 'Caramel Macchiato',
    build: () => new Whip(new CaramelSyrup(new Milk(new Espresso())))
  },
  {
    name: 'Vanilla Mocha',
    build: () => new Whip(new Mocha(new VanillaSyrup(new Milk(new Espresso()))))
  },
  {
    name: 'Americano',
    build: () => new ExtraShot(new HouseBlend())
  }
];

menuItems.forEach((item, index) => {
  const beverage = item.build();
  console.log(`${item.name}:`);
  console.log(`  $${beverage.cost().toFixed(2)}`);
});

// Example 8: Demonstrating decorator benefits
console.log('\n=== Example 8: Decorator Pattern Benefits ===\n');

console.log('Without Decorator Pattern:');
console.log('  - Would need classes: EspressoWithMilk, EspressoWithMocha, EspressoWithMilkAndMocha, etc.');
console.log('  - For 4 beverages and 7 add-ons, could need hundreds of classes!');
console.log('  - Adding new add-on requires creating many new classes\n');

console.log('With Decorator Pattern:');
console.log('  ✓ Only need 4 base classes + 7 decorator classes = 11 classes total');
console.log('  ✓ Can combine decorators in any way at runtime');
console.log('  ✓ Adding new add-on = just 1 new decorator class');
console.log('  ✓ Flexible and extensible');
console.log('  ✓ Follows Open/Closed Principle\n');

// Example 9: Practical order system
console.log('=== Example 9: Order Receipt ===\n');

class Order {
  constructor(customerName) {
    this.customerName = customerName;
    this.items = [];
  }

  addItem(beverage) {
    this.items.push(beverage);
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.cost(), 0);
  }

  printReceipt() {
    console.log('═══════════════════════════════════');
    console.log(`Customer: ${this.customerName}`);
    console.log('───────────────────────────────────');

    this.items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.getDescription()}`);
      console.log(`   $${item.cost().toFixed(2)}`);
    });

    console.log('───────────────────────────────────');
    console.log(`Total: $${this.getTotal().toFixed(2)}`);
    console.log('═══════════════════════════════════\n');
  }
}

const order = new Order('John Doe');
order.addItem(new Whip(new Mocha(new Milk(new Espresso()))));
order.addItem(new VanillaSyrup(new Milk(new HouseBlend())));
order.addItem(new ExtraShot(new CaramelSyrup(new Milk(new Espresso()))));
order.printReceipt();

console.log('=== Demo Complete ===');
