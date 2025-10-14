/**
 * Model-View-Controller (MVC) Pattern Demonstration
 *
 * MVC separates application concerns into three components:
 * - Model: Data and business logic
 * - View: Presentation and UI
 * - Controller: Coordination and user input handling
 *
 * Real-world scenarios demonstrated:
 * 1. User management system
 * 2. Product catalog with CRUD operations
 * 3. Shopping cart functionality
 * 4. User authentication and sessions
 * 5. Product search and filtering
 * 6. Cart checkout process
 * 7. Observer pattern for view updates
 * 8. Multiple controllers working together
 * 9. State management across components
 * 10. Complete e-commerce flow
 */

const {
  UserModel,
  ProductModel,
  ShoppingCartModel,
  UserView,
  ProductView,
  ShoppingCartView,
  UserController,
  ProductController,
  ShoppingCartController
} = require('./ModelViewController');

console.log('=== MVC Pattern Demonstration ===\n');

// =============================================================================
// Scenario 1: User Management System
// =============================================================================
console.log('=== Scenario 1: User Management System ===\n');

const userModel = new UserModel();
const userView = new UserView();
const userController = new UserController(userModel, userView);

// Initialize (sets up observers)
userController.initialize();

console.log('Creating users...');
const user1 = userController.handleAction('create', {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'customer'
});
console.log('Created user:', user1.id);

const user2 = userController.handleAction('create', {
  name: 'Jane Smith',
  email: 'jane@example.com',
  role: 'customer'
});
console.log('Created user:', user2.id);

console.log('\nLogging in as John...');
userController.handleAction('login', { id: user1.id });

console.log('\nUpdating user profile...');
userController.handleAction('update', {
  id: user1.id,
  updates: { name: 'John Updated Doe' }
});

// =============================================================================
// Scenario 2: Product Catalog Management
// =============================================================================
console.log('\n\n=== Scenario 2: Product Catalog Management ===\n');

const productModel = new ProductModel();
const productView = new ProductView();
const productController = new ProductController(productModel, productView);

productController.initialize();

console.log('Adding products to catalog...');
const laptop = productController.handleAction('create', {
  name: 'Laptop Pro 15',
  price: 1299.99,
  category: 'Electronics',
  description: 'High-performance laptop for professionals',
  stock: 10
});

const phone = productController.handleAction('create', {
  name: 'Smartphone X',
  price: 799.99,
  category: 'Electronics',
  description: 'Latest smartphone with amazing features',
  stock: 25
});

const headphones = productController.handleAction('create', {
  name: 'Wireless Headphones',
  price: 199.99,
  category: 'Audio',
  description: 'Premium noise-canceling headphones',
  stock: 50
});

const keyboard = productController.handleAction('create', {
  name: 'Mechanical Keyboard',
  price: 149.99,
  category: 'Accessories',
  description: 'RGB mechanical gaming keyboard',
  stock: 30
});

console.log('\nProduct IDs:', {
  laptop: laptop.id,
  phone: phone.id,
  headphones: headphones.id,
  keyboard: keyboard.id
});

// =============================================================================
// Scenario 3: Product Search and Filtering
// =============================================================================
console.log('\n\n=== Scenario 3: Product Search and Filtering ===\n');

console.log('Searching for "laptop"...');
const searchResults = productController.handleAction('search', { query: 'laptop' });
console.log('Found', searchResults.length, 'products');
searchResults.forEach(p => console.log(`- ${p.name} ($${p.price})`));

console.log('\nFiltering by Electronics category...');
const electronics = productController.handleAction('category', { category: 'Electronics' });
console.log('Found', electronics.length, 'electronics');
electronics.forEach(p => console.log(`- ${p.name} ($${p.price})`));

// =============================================================================
// Scenario 4: Shopping Cart Operations
// =============================================================================
console.log('\n\n=== Scenario 4: Shopping Cart Operations ===\n');

const cartModel = new ShoppingCartModel();
const cartView = new ShoppingCartView();
const cartController = new ShoppingCartController(cartModel, cartView);

cartController.initialize();

console.log('Adding laptop to cart...');
cartController.handleAction('add', { product: laptop, quantity: 1 });

console.log('\nAdding phone to cart...');
cartController.handleAction('add', { product: phone, quantity: 2 });

console.log('\nAdding headphones to cart...');
cartController.handleAction('add', { product: headphones, quantity: 1 });

// =============================================================================
// Scenario 5: Cart Quantity Updates
// =============================================================================
console.log('\n\n=== Scenario 5: Updating Cart Quantities ===\n');

console.log('Updating phone quantity to 1...');
cartController.handleAction('update', {
  productId: phone.id,
  quantity: 1
});

console.log('\nRemoving headphones from cart...');
cartController.handleAction('remove', { productId: headphones.id });

// =============================================================================
// Scenario 6: Product Updates Reflecting in Cart
// =============================================================================
console.log('\n\n=== Scenario 6: Product Price Updates ===\n');

console.log('Updating laptop price (on sale!)...');
productController.handleAction('update', {
  id: laptop.id,
  updates: { price: 999.99 }
});

console.log('\nNote: Cart still shows old price until re-added');
console.log('In production, you would implement price update notifications\n');

// =============================================================================
// Scenario 7: Multiple Items and Cart Management
// =============================================================================
console.log('\n\n=== Scenario 7: Adding More Items ===\n');

console.log('Adding keyboard to cart...');
cartController.handleAction('add', { product: keyboard, quantity: 2 });

console.log('\nAdding more laptops...');
cartController.handleAction('add', { product: laptop, quantity: 1 });

// =============================================================================
// Scenario 8: Checkout Process
// =============================================================================
console.log('\n\n=== Scenario 8: Checkout Process ===\n');

console.log('Viewing cart before checkout:');
const cartDataBefore = cartModel.getData();
console.log(`Total items: ${cartDataBefore.itemCount}`);
console.log(`Total amount: $${cartDataBefore.total.toFixed(2)}`);

console.log('\nProcessing checkout...');
const checkoutResult = cartController.handleAction('checkout', {});
console.log('\nCheckout Result:');
console.log(JSON.stringify(checkoutResult, null, 2));

console.log('\nCart after checkout (should be empty):');

// =============================================================================
// Scenario 9: Complete E-commerce Flow
// =============================================================================
console.log('\n\n=== Scenario 9: Complete E-commerce Flow ===\n');

console.log('Step 1: New user registration');
const newUser = userController.handleAction('create', {
  name: 'Alice Johnson',
  email: 'alice@example.com',
  role: 'customer'
});

console.log('\nStep 2: User logs in');
userController.handleAction('login', { id: newUser.id });

console.log('\nStep 3: Browse products by category');
const audioProducts = productController.handleAction('category', { category: 'Audio' });
console.log(`Found ${audioProducts.length} audio products`);

console.log('\nStep 4: Add products to cart');
audioProducts.forEach(product => {
  cartController.handleAction('add', { product, quantity: 1 });
  console.log(`Added ${product.name} to cart`);
});

console.log('\nStep 5: Review cart');
const finalCart = cartModel.getData();
console.log(`Cart total: $${finalCart.total.toFixed(2)}`);

console.log('\nStep 6: Complete purchase');
const orderResult = cartController.handleAction('checkout', {});
console.log('Order placed successfully!');
console.log(`Order total: $${orderResult.orderTotal.toFixed(2)}`);

// =============================================================================
// Scenario 10: Demonstrating Observer Pattern
// =============================================================================
console.log('\n\n=== Scenario 10: Observer Pattern in MVC ===\n');

console.log('Creating new components with multiple observers...');

const demoModel = new ProductModel();
const demoView1 = new ProductView();
const demoView2 = new ProductView();

// Subscribe multiple observers
let view1Updates = 0;
let view2Updates = 0;

demoModel.subscribe((data) => {
  view1Updates++;
  console.log(`View 1 updated (${view1Updates} times)`);
});

demoModel.subscribe((data) => {
  view2Updates++;
  console.log(`View 2 updated (${view2Updates} times)`);
});

console.log('\nAdding product (should trigger both observers)...');
demoModel.addProduct({
  name: 'Demo Product',
  price: 99.99,
  category: 'Demo',
  description: 'Test product for observer pattern'
});

console.log('\nUpdating product (should trigger both observers again)...');
const demoProducts = demoModel.getData().products;
if (demoProducts.length > 0) {
  demoModel.updateProduct(demoProducts[0].id, { price: 79.99 });
}

console.log('\nTotal updates - View 1:', view1Updates, '| View 2:', view2Updates);

// =============================================================================
// Scenario 11: User Actions and Product Management
// =============================================================================
console.log('\n\n=== Scenario 11: Admin User Managing Products ===\n');

console.log('Creating admin user...');
const admin = userController.handleAction('create', {
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
});
userController.handleAction('login', { id: admin.id });

console.log('\nAdmin adds new product...');
const newProduct = productController.handleAction('create', {
  name: 'Smart Watch',
  price: 399.99,
  category: 'Electronics',
  description: 'Fitness tracking smart watch',
  stock: 100
});

console.log('\nAdmin updates product stock...');
productController.handleAction('update', {
  id: newProduct.id,
  updates: { stock: 95 }
});

console.log('\nAdmin searches all products...');
const allProducts = productModel.getData().products;
console.log(`Total products in catalog: ${allProducts.length}`);

// =============================================================================
// Scenario 12: State Management Across Controllers
// =============================================================================
console.log('\n\n=== Scenario 12: State Management Demonstration ===\n');

console.log('Current application state:');
console.log('\nUsers:', userModel.getAllUsers().length);
console.log('Products:', productModel.getData().products.length);
console.log('Cart items:', cartModel.getData().itemCount);
console.log('Current user:', userModel.getData().currentUser?.name || 'None');

// =============================================================================
// Summary
// =============================================================================
console.log('\n\n=== MVC Pattern Summary ===');
console.log('\nArchitecture Components:');
console.log('  Model:');
console.log('    - Manages application data');
console.log('    - Contains business logic');
console.log('    - Notifies observers of changes');
console.log('    - Independent of UI');
console.log('\n  View:');
console.log('    - Handles presentation');
console.log('    - Renders data from model');
console.log('    - No business logic');
console.log('    - Multiple views can observe same model');
console.log('\n  Controller:');
console.log('    - Handles user input');
console.log('    - Updates model based on actions');
console.log('    - Coordinates model and view');
console.log('    - Contains flow control logic');

console.log('\nKey Benefits:');
console.log('  ✓ Separation of concerns');
console.log('  ✓ Easier testing and maintenance');
console.log('  ✓ Reusable components');
console.log('  ✓ Multiple views for same data');
console.log('  ✓ Clear responsibility boundaries');
console.log('  ✓ Scalable architecture');

console.log('\nUse Cases:');
console.log('  • Web applications (React, Angular, Vue)');
console.log('  • Desktop applications (Electron)');
console.log('  • Mobile applications (React Native)');
console.log('  • Enterprise software');
console.log('  • E-commerce platforms');
console.log('  • Content management systems');
console.log('  • Admin dashboards');
console.log('  • Data-driven applications');

console.log('\nPattern Variations:');
console.log('  • MVP (Model-View-Presenter)');
console.log('  • MVVM (Model-View-ViewModel)');
console.log('  • MVI (Model-View-Intent)');
console.log('  • Flux/Redux (Unidirectional data flow)');

console.log('\nBest Practices:');
console.log('  • Keep models independent of UI');
console.log('  • Use observers for model-view communication');
console.log('  • Thin controllers, fat models');
console.log('  • Single responsibility per component');
console.log('  • Avoid circular dependencies');
console.log('  • Test models independently');
console.log('  • Keep views dumb (presentation only)');
console.log('  • Use dependency injection');

console.log('\n=== End of MVC Demonstration ===');
