/**
 * Supervising Controller Pattern Implementation
 *
 * The Supervising Controller pattern separates presentation logic into a controller
 * that handles complex view behavior while allowing the view to handle simple
 * data binding directly. The controller supervises the view but doesn't control
 * every aspect of it.
 *
 * Key Components:
 * - Controller: Handles complex presentation logic and user interactions
 * - View: Manages simple data binding and display
 * - Model: Domain data and business logic
 *
 * Use Cases:
 * 1. Form validation with complex business rules
 * 2. Dynamic UI updates based on user actions
 * 3. Multi-step wizards and workflows
 * 4. Dashboard widgets with interactive controls
 * 5. Shopping cart management
 * 6. User profile editing with real-time validation
 * 7. Search interfaces with filters and sorting
 * 8. Data grid with editing capabilities
 * 9. File upload with progress tracking
 * 10. Chat interface with message management
 */

// ============================================================================
// Core Pattern Implementation
// ============================================================================

/**
 * Base View class that handles simple data binding
 */
class View {
  constructor() {
    this.bindings = new Map();
    this.listeners = new Map();
  }

  /**
   * Bind model data to view elements
   */
  bind(property, element, transform = (val) => val) {
    this.bindings.set(property, { element, transform });
  }

  /**
   * Update view element with model data
   */
  update(property, value) {
    const binding = this.bindings.get(property);
    if (binding) {
      const transformedValue = binding.transform(value);
      if (typeof binding.element === 'function') {
        binding.element(transformedValue);
      } else {
        binding.element.value = transformedValue;
      }
    }
  }

  /**
   * Register event listener
   */
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  /**
   * Trigger event
   */
  trigger(event, data) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  /**
   * Render view
   */
  render() {
    throw new Error('render() must be implemented by subclass');
  }
}

/**
 * Base Controller class that supervises view behavior
 */
class SupervisingController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.initialize();
  }

  /**
   * Initialize controller
   */
  initialize() {
    this.bindModelToView();
    this.setupEventHandlers();
  }

  /**
   * Bind model properties to view
   */
  bindModelToView() {
    throw new Error('bindModelToView() must be implemented by subclass');
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    throw new Error('setupEventHandlers() must be implemented by subclass');
  }

  /**
   * Update model from view
   */
  updateModel(property, value) {
    if (this.model[property] !== undefined) {
      this.model[property] = value;
      this.onModelChanged(property, value);
    }
  }

  /**
   * Update view from model
   */
  updateView(property) {
    const value = this.model[property];
    this.view.update(property, value);
  }

  /**
   * Handle model changes
   */
  onModelChanged(property, value) {
    // Can be overridden by subclasses
  }
}

// ============================================================================
// Scenario 1: User Registration Form with Complex Validation
// ============================================================================

class UserRegistrationModel {
  constructor() {
    this.username = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.agreedToTerms = false;
    this.errors = {};
  }

  validate() {
    const errors = {};

    if (this.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      errors.email = 'Invalid email address';
    }

    if (this.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (this.password !== this.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!this.agreedToTerms) {
      errors.terms = 'You must agree to the terms';
    }

    this.errors = errors;
    return Object.keys(errors).length === 0;
  }
}

class UserRegistrationView extends View {
  constructor() {
    super();
    this.elements = {
      username: { value: '', error: '' },
      email: { value: '', error: '' },
      password: { value: '', error: '' },
      confirmPassword: { value: '', error: '' },
      agreedToTerms: { value: false, error: '' },
      submitButton: { enabled: false }
    };
  }

  render() {
    console.log('=== User Registration Form ===');
    console.log(`Username: ${this.elements.username.value}`);
    if (this.elements.username.error) {
      console.log(`  Error: ${this.elements.username.error}`);
    }
    console.log(`Email: ${this.elements.email.value}`);
    if (this.elements.email.error) {
      console.log(`  Error: ${this.elements.email.error}`);
    }
    console.log(`Password: ${'*'.repeat(this.elements.password.value.length)}`);
    if (this.elements.password.error) {
      console.log(`  Error: ${this.elements.password.error}`);
    }
    console.log(`Confirm Password: ${'*'.repeat(this.elements.confirmPassword.value.length)}`);
    if (this.elements.confirmPassword.error) {
      console.log(`  Error: ${this.elements.confirmPassword.error}`);
    }
    console.log(`Agreed to Terms: ${this.elements.agreedToTerms.value}`);
    if (this.elements.agreedToTerms.error) {
      console.log(`  Error: ${this.elements.agreedToTerms.error}`);
    }
    console.log(`Submit Button: ${this.elements.submitButton.enabled ? 'Enabled' : 'Disabled'}`);
    console.log('');
  }

  setError(field, message) {
    if (this.elements[field]) {
      this.elements[field].error = message;
    }
  }

  clearErrors() {
    Object.keys(this.elements).forEach(key => {
      if (this.elements[key].error !== undefined) {
        this.elements[key].error = '';
      }
    });
  }

  setSubmitEnabled(enabled) {
    this.elements.submitButton.enabled = enabled;
  }
}

class UserRegistrationController extends SupervisingController {
  bindModelToView() {
    this.view.bind('username', (val) => { this.view.elements.username.value = val; });
    this.view.bind('email', (val) => { this.view.elements.email.value = val; });
    this.view.bind('password', (val) => { this.view.elements.password.value = val; });
    this.view.bind('confirmPassword', (val) => { this.view.elements.confirmPassword.value = val; });
    this.view.bind('agreedToTerms', (val) => { this.view.elements.agreedToTerms.value = val; });
  }

  setupEventHandlers() {
    this.view.on('usernameChanged', (value) => this.handleFieldChange('username', value));
    this.view.on('emailChanged', (value) => this.handleFieldChange('email', value));
    this.view.on('passwordChanged', (value) => this.handleFieldChange('password', value));
    this.view.on('confirmPasswordChanged', (value) => this.handleFieldChange('confirmPassword', value));
    this.view.on('termsChanged', (value) => this.handleFieldChange('agreedToTerms', value));
    this.view.on('submit', () => this.handleSubmit());
  }

  handleFieldChange(field, value) {
    this.updateModel(field, value);
    this.validateAndUpdateView();
  }

  validateAndUpdateView() {
    this.view.clearErrors();
    this.model.validate();

    Object.keys(this.model.errors).forEach(field => {
      this.view.setError(field, this.model.errors[field]);
    });

    const isValid = Object.keys(this.model.errors).length === 0;
    this.view.setSubmitEnabled(isValid);
    this.view.render();
  }

  handleSubmit() {
    if (this.model.validate()) {
      console.log('Registration successful!');
      console.log('User data:', {
        username: this.model.username,
        email: this.model.email
      });
    }
  }
}

// ============================================================================
// Scenario 2: Shopping Cart with Dynamic Calculations
// ============================================================================

class ShoppingCartModel {
  constructor() {
    this.items = [];
    this.discountCode = '';
    this.shippingMethod = 'standard';
    this.taxRate = 0.08;
  }

  addItem(product, quantity) {
    const existingItem = this.items.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ product, quantity });
    }
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.product.id !== productId);
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.product.id === productId);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.removeItem(productId);
      }
    }
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  getDiscount() {
    if (this.discountCode === 'SAVE10') {
      return this.getSubtotal() * 0.10;
    }
    if (this.discountCode === 'SAVE20') {
      return this.getSubtotal() * 0.20;
    }
    return 0;
  }

  getShippingCost() {
    const shippingRates = {
      'standard': 5.99,
      'express': 12.99,
      'overnight': 24.99,
      'free': 0
    };
    return this.getSubtotal() > 50 ? 0 : shippingRates[this.shippingMethod];
  }

  getTax() {
    const taxableAmount = this.getSubtotal() - this.getDiscount();
    return taxableAmount * this.taxRate;
  }

  getTotal() {
    return this.getSubtotal() - this.getDiscount() + this.getShippingCost() + this.getTax();
  }
}

class ShoppingCartView extends View {
  constructor() {
    super();
    this.displayData = {
      items: [],
      subtotal: 0,
      discount: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      discountCode: '',
      shippingMethod: 'standard'
    };
  }

  render() {
    console.log('=== Shopping Cart ===');
    console.log('Items:');
    this.displayData.items.forEach(item => {
      console.log(`  ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`);
    });
    console.log('');
    console.log(`Subtotal: $${this.displayData.subtotal.toFixed(2)}`);
    if (this.displayData.discount > 0) {
      console.log(`Discount (${this.displayData.discountCode}): -$${this.displayData.discount.toFixed(2)}`);
    }
    console.log(`Shipping (${this.displayData.shippingMethod}): $${this.displayData.shipping.toFixed(2)}`);
    console.log(`Tax: $${this.displayData.tax.toFixed(2)}`);
    console.log(`Total: $${this.displayData.total.toFixed(2)}`);
    console.log('');
  }

  updateCart(items, calculations) {
    this.displayData.items = items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));
    this.displayData.subtotal = calculations.subtotal;
    this.displayData.discount = calculations.discount;
    this.displayData.shipping = calculations.shipping;
    this.displayData.tax = calculations.tax;
    this.displayData.total = calculations.total;
  }
}

class ShoppingCartController extends SupervisingController {
  bindModelToView() {
    // Initial view update
    this.updateCartView();
  }

  setupEventHandlers() {
    this.view.on('addItem', ({ product, quantity }) => this.handleAddItem(product, quantity));
    this.view.on('removeItem', (productId) => this.handleRemoveItem(productId));
    this.view.on('updateQuantity', ({ productId, quantity }) => this.handleUpdateQuantity(productId, quantity));
    this.view.on('applyDiscount', (code) => this.handleApplyDiscount(code));
    this.view.on('changeShipping', (method) => this.handleChangeShipping(method));
  }

  handleAddItem(product, quantity) {
    this.model.addItem(product, quantity);
    this.updateCartView();
  }

  handleRemoveItem(productId) {
    this.model.removeItem(productId);
    this.updateCartView();
  }

  handleUpdateQuantity(productId, quantity) {
    this.model.updateQuantity(productId, quantity);
    this.updateCartView();
  }

  handleApplyDiscount(code) {
    this.model.discountCode = code.toUpperCase();
    this.view.displayData.discountCode = this.model.discountCode;
    this.updateCartView();
  }

  handleChangeShipping(method) {
    this.model.shippingMethod = method;
    this.view.displayData.shippingMethod = method;
    this.updateCartView();
  }

  updateCartView() {
    const calculations = {
      subtotal: this.model.getSubtotal(),
      discount: this.model.getDiscount(),
      shipping: this.model.getShippingCost(),
      tax: this.model.getTax(),
      total: this.model.getTotal()
    };

    this.view.updateCart(this.model.items, calculations);
    this.view.render();
  }
}

// ============================================================================
// Scenario 3: Search Interface with Filters
// ============================================================================

class SearchModel {
  constructor() {
    this.query = '';
    this.filters = {
      category: 'all',
      priceMin: 0,
      priceMax: 1000,
      inStock: false,
      rating: 0
    };
    this.sortBy = 'relevance';
    this.results = [];
    this.totalResults = 0;
    this.page = 1;
    this.pageSize = 10;
  }

  search() {
    // Simulate search
    this.results = this.generateMockResults();
    this.totalResults = this.results.length;
  }

  generateMockResults() {
    const categories = ['electronics', 'clothing', 'books', 'home'];
    const results = [];

    for (let i = 0; i < 25; i++) {
      const result = {
        id: i + 1,
        title: `Product ${i + 1} matching "${this.query}"`,
        category: categories[i % categories.length],
        price: Math.random() * 1000,
        rating: Math.floor(Math.random() * 5) + 1,
        inStock: Math.random() > 0.3
      };

      if (this.matchesFilters(result)) {
        results.push(result);
      }
    }

    return this.sortResults(results);
  }

  matchesFilters(result) {
    if (this.filters.category !== 'all' && result.category !== this.filters.category) {
      return false;
    }
    if (result.price < this.filters.priceMin || result.price > this.filters.priceMax) {
      return false;
    }
    if (this.filters.inStock && !result.inStock) {
      return false;
    }
    if (result.rating < this.filters.rating) {
      return false;
    }
    return true;
  }

  sortResults(results) {
    const sorters = {
      relevance: (a, b) => b.id - a.id,
      price_asc: (a, b) => a.price - b.price,
      price_desc: (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating
    };

    return results.sort(sorters[this.sortBy] || sorters.relevance);
  }

  getPageResults() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.results.slice(start, end);
  }
}

class SearchView extends View {
  constructor() {
    super();
    this.displayData = {
      query: '',
      filters: {},
      sortBy: 'relevance',
      results: [],
      totalResults: 0,
      page: 1,
      totalPages: 0
    };
  }

  render() {
    console.log('=== Search Interface ===');
    console.log(`Query: "${this.displayData.query}"`);
    console.log(`Filters: ${JSON.stringify(this.displayData.filters)}`);
    console.log(`Sort by: ${this.displayData.sortBy}`);
    console.log(`Total results: ${this.displayData.totalResults}`);
    console.log(`Page ${this.displayData.page} of ${this.displayData.totalPages}`);
    console.log('');
    console.log('Results:');
    this.displayData.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title}`);
      console.log(`   Category: ${result.category} | Price: $${result.price.toFixed(2)} | Rating: ${result.rating}/5`);
      console.log(`   ${result.inStock ? 'In Stock' : 'Out of Stock'}`);
    });
    console.log('');
  }

  updateResults(results, totalResults, page, pageSize) {
    this.displayData.results = results;
    this.displayData.totalResults = totalResults;
    this.displayData.page = page;
    this.displayData.totalPages = Math.ceil(totalResults / pageSize);
  }
}

class SearchController extends SupervisingController {
  bindModelToView() {
    this.view.displayData.query = this.model.query;
    this.view.displayData.filters = { ...this.model.filters };
    this.view.displayData.sortBy = this.model.sortBy;
  }

  setupEventHandlers() {
    this.view.on('search', (query) => this.handleSearch(query));
    this.view.on('filterChange', ({ filter, value }) => this.handleFilterChange(filter, value));
    this.view.on('sortChange', (sortBy) => this.handleSortChange(sortBy));
    this.view.on('pageChange', (page) => this.handlePageChange(page));
  }

  handleSearch(query) {
    this.model.query = query;
    this.model.page = 1;
    this.view.displayData.query = query;
    this.performSearch();
  }

  handleFilterChange(filter, value) {
    this.model.filters[filter] = value;
    this.model.page = 1;
    this.view.displayData.filters = { ...this.model.filters };
    this.performSearch();
  }

  handleSortChange(sortBy) {
    this.model.sortBy = sortBy;
    this.view.displayData.sortBy = sortBy;
    this.performSearch();
  }

  handlePageChange(page) {
    this.model.page = page;
    this.updateResultsView();
  }

  performSearch() {
    this.model.search();
    this.updateResultsView();
  }

  updateResultsView() {
    const pageResults = this.model.getPageResults();
    this.view.updateResults(
      pageResults,
      this.model.totalResults,
      this.model.page,
      this.model.pageSize
    );
    this.view.render();
  }
}

// ============================================================================
// Demo Usage
// ============================================================================

function demonstratePatterns() {
  console.log('SUPERVISING CONTROLLER PATTERN DEMONSTRATIONS\n');
  console.log('='.repeat(80));

  // Scenario 1: User Registration Form
  console.log('\nSCENARIO 1: User Registration Form with Validation\n');
  const registrationModel = new UserRegistrationModel();
  const registrationView = new UserRegistrationView();
  const registrationController = new UserRegistrationController(registrationModel, registrationView);

  registrationView.trigger('usernameChanged', 'jo');
  registrationView.trigger('emailChanged', 'invalid-email');
  registrationView.trigger('passwordChanged', 'short');
  registrationView.trigger('confirmPasswordChanged', 'different');

  console.log('\nAfter fixing all errors:');
  registrationView.trigger('usernameChanged', 'john_doe');
  registrationView.trigger('emailChanged', 'john@example.com');
  registrationView.trigger('passwordChanged', 'SecurePass123');
  registrationView.trigger('confirmPasswordChanged', 'SecurePass123');
  registrationView.trigger('termsChanged', true);

  console.log('='.repeat(80));

  // Scenario 2: Shopping Cart
  console.log('\nSCENARIO 2: Shopping Cart with Dynamic Calculations\n');
  const cartModel = new ShoppingCartModel();
  const cartView = new ShoppingCartView();
  const cartController = new ShoppingCartController(cartModel, cartView);

  const products = [
    { id: 1, name: 'Laptop', price: 999.99 },
    { id: 2, name: 'Mouse', price: 29.99 },
    { id: 3, name: 'Keyboard', price: 79.99 }
  ];

  cartView.trigger('addItem', { product: products[0], quantity: 1 });
  cartView.trigger('addItem', { product: products[1], quantity: 2 });

  console.log('After applying discount code:');
  cartView.trigger('applyDiscount', 'SAVE10');

  console.log('After changing shipping method:');
  cartView.trigger('changeShipping', 'express');

  console.log('='.repeat(80));

  // Scenario 3: Search Interface
  console.log('\nSCENARIO 3: Search Interface with Filters\n');
  const searchModel = new SearchModel();
  const searchView = new SearchView();
  const searchController = new SearchController(searchModel, searchView);

  searchView.trigger('search', 'laptop');

  console.log('After applying filters:');
  searchView.trigger('filterChange', { filter: 'category', value: 'electronics' });
  searchView.trigger('filterChange', { filter: 'priceMax', value: 500 });
  searchView.trigger('filterChange', { filter: 'inStock', value: true });

  console.log('After changing sort order:');
  searchView.trigger('sortChange', 'price_asc');
}

// Export for use in other modules
module.exports = {
  View,
  SupervisingController,
  UserRegistrationModel,
  UserRegistrationView,
  UserRegistrationController,
  ShoppingCartModel,
  ShoppingCartView,
  ShoppingCartController,
  SearchModel,
  SearchView,
  SearchController,
  demonstratePatterns
};

// Run demonstration if executed directly
if (require.main === module) {
  demonstratePatterns();
}
