/**
 * Model-View-Presenter (MVP) Pattern Implementation
 *
 * The MVP pattern is a derivative of MVC that separates presentation logic from business logic.
 * The Presenter acts as a middleman between the View and the Model, handling all presentation logic.
 * The View is completely passive and delegates all user interactions to the Presenter.
 *
 * Key Components:
 * - Model: Contains business logic and data
 * - View: Displays data and forwards user actions to Presenter (interface-based)
 * - Presenter: Handles presentation logic and orchestrates Model-View interactions
 *
 * Benefits:
 * - Improved testability (Presenter can be tested independently)
 * - Better separation of concerns
 * - View becomes a thin interface layer
 * - Easier to maintain and modify
 *
 * @module ModelViewPresenter
 */

const EventEmitter = require('events');

/**
 * Base Model class for data and business logic
 */
class Model extends EventEmitter {
  /**
   * Creates a new Model instance
   * @param {Object} data - Initial data
   */
  constructor(data = {}) {
    super();
    this._data = { ...data };
  }

  /**
   * Gets data by key
   * @param {string} key - Data key
   * @returns {*} Data value
   */
  get(key) {
    return this._data[key];
  }

  /**
   * Sets data by key
   * @param {string} key - Data key
   * @param {*} value - Data value
   */
  set(key, value) {
    this._data[key] = value;
    this.emit('change', { key, value });
  }

  /**
   * Gets all data
   * @returns {Object} All data
   */
  getData() {
    return { ...this._data };
  }
}

/**
 * Base View interface
 * Views should be passive and only respond to Presenter commands
 */
class View extends EventEmitter {
  /**
   * Creates a new View instance
   */
  constructor() {
    super();
    this._presenter = null;
  }

  /**
   * Sets the presenter for this view
   * @param {Presenter} presenter - The presenter instance
   */
  setPresenter(presenter) {
    this._presenter = presenter;
  }

  /**
   * Displays data (to be implemented by concrete views)
   * @param {Object} data - Data to display
   */
  display(data) {
    throw new Error('display() must be implemented by concrete view');
  }

  /**
   * Shows error message
   * @param {string} message - Error message
   */
  showError(message) {
    throw new Error('showError() must be implemented by concrete view');
  }

  /**
   * Shows loading state
   * @param {boolean} isLoading - Loading state
   */
  showLoading(isLoading) {
    throw new Error('showLoading() must be implemented by concrete view');
  }
}

/**
 * Base Presenter class
 * Handles all presentation logic and orchestrates Model-View interactions
 */
class Presenter {
  /**
   * Creates a new Presenter instance
   * @param {Model} model - The model instance
   * @param {View} view - The view instance
   */
  constructor(model, view) {
    if (!model || !view) {
      throw new Error('Presenter requires both model and view');
    }
    this.model = model;
    this.view = view;
    this.view.setPresenter(this);
    this._bindModelEvents();
  }

  /**
   * Binds model events to update view
   * @private
   */
  _bindModelEvents() {
    this.model.on('change', () => {
      this._updateView();
    });
  }

  /**
   * Updates the view with current model data
   * @private
   */
  _updateView() {
    const data = this.model.getData();
    this.view.display(data);
  }

  /**
   * Initializes the presenter
   */
  initialize() {
    this._updateView();
  }
}

// ============================================================================
// Usage Scenario 1: User Authentication Form
// ============================================================================

/**
 * User authentication model
 */
class UserModel extends Model {
  /**
   * Validates user credentials
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} Authentication result
   */
  async authenticate(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'password') {
          const userData = { id: 1, username, role: 'admin', token: 'abc123' };
          this.set('user', userData);
          this.set('authenticated', true);
          resolve(userData);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  }

  /**
   * Logs out the user
   */
  logout() {
    this.set('user', null);
    this.set('authenticated', false);
  }
}

/**
 * Login view implementation
 */
class LoginView extends View {
  constructor() {
    super();
    this._formData = {};
    this._isLoading = false;
  }

  /**
   * Displays user data
   * @param {Object} data - User data
   */
  display(data) {
    if (data.authenticated) {
      console.log(`Welcome, ${data.user.username}! Role: ${data.user.role}`);
    } else {
      console.log('Please log in');
    }
  }

  /**
   * Shows error message
   * @param {string} message - Error message
   */
  showError(message) {
    console.error(`Error: ${message}`);
  }

  /**
   * Shows loading state
   * @param {boolean} isLoading - Loading state
   */
  showLoading(isLoading) {
    this._isLoading = isLoading;
    console.log(isLoading ? 'Loading...' : 'Ready');
  }

  /**
   * Simulates user login action
   * @param {string} username - Username
   * @param {string} password - Password
   */
  onLoginSubmit(username, password) {
    this._formData = { username, password };
    this.emit('login', { username, password });
  }

  /**
   * Simulates user logout action
   */
  onLogoutClick() {
    this.emit('logout');
  }
}

/**
 * Login presenter implementation
 */
class LoginPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this._bindViewEvents();
  }

  /**
   * Binds view events
   * @private
   */
  _bindViewEvents() {
    this.view.on('login', ({ username, password }) => {
      this.handleLogin(username, password);
    });

    this.view.on('logout', () => {
      this.handleLogout();
    });
  }

  /**
   * Handles login action
   * @param {string} username - Username
   * @param {string} password - Password
   */
  async handleLogin(username, password) {
    try {
      this.view.showLoading(true);
      await this.model.authenticate(username, password);
      this.view.showLoading(false);
    } catch (error) {
      this.view.showLoading(false);
      this.view.showError(error.message);
    }
  }

  /**
   * Handles logout action
   */
  handleLogout() {
    this.model.logout();
  }
}

// ============================================================================
// Usage Scenario 2: Product Catalog with Search
// ============================================================================

/**
 * Product catalog model
 */
class ProductCatalogModel extends Model {
  constructor() {
    super();
    this.set('products', []);
    this.set('filteredProducts', []);
    this.set('searchTerm', '');
  }

  /**
   * Loads products from API
   * @returns {Promise<Array>} Product list
   */
  async loadProducts() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const products = [
          { id: 1, name: 'Laptop', price: 999, category: 'Electronics' },
          { id: 2, name: 'Mouse', price: 29, category: 'Electronics' },
          { id: 3, name: 'Desk', price: 199, category: 'Furniture' },
          { id: 4, name: 'Chair', price: 149, category: 'Furniture' },
          { id: 5, name: 'Monitor', price: 299, category: 'Electronics' }
        ];
        this.set('products', products);
        this.set('filteredProducts', products);
        resolve(products);
      }, 300);
    });
  }

  /**
   * Searches products by term
   * @param {string} searchTerm - Search term
   */
  searchProducts(searchTerm) {
    this.set('searchTerm', searchTerm);
    const products = this.get('products');
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.set('filteredProducts', filtered);
  }

  /**
   * Filters products by category
   * @param {string} category - Category name
   */
  filterByCategory(category) {
    const products = this.get('products');
    const filtered = category === 'All'
      ? products
      : products.filter(p => p.category === category);
    this.set('filteredProducts', filtered);
  }
}

/**
 * Product catalog view
 */
class ProductCatalogView extends View {
  display(data) {
    console.log('\n=== Product Catalog ===');
    if (data.searchTerm) {
      console.log(`Search: "${data.searchTerm}"`);
    }
    console.log(`Found ${data.filteredProducts.length} products:`);
    data.filteredProducts.forEach(p => {
      console.log(`- ${p.name} ($${p.price}) [${p.category}]`);
    });
  }

  showError(message) {
    console.error(`Catalog Error: ${message}`);
  }

  showLoading(isLoading) {
    console.log(isLoading ? 'Loading products...' : 'Products loaded');
  }

  onSearch(searchTerm) {
    this.emit('search', searchTerm);
  }

  onFilterCategory(category) {
    this.emit('filterCategory', category);
  }
}

/**
 * Product catalog presenter
 */
class ProductCatalogPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this._bindViewEvents();
  }

  _bindViewEvents() {
    this.view.on('search', (term) => this.handleSearch(term));
    this.view.on('filterCategory', (cat) => this.handleFilterCategory(cat));
  }

  async initialize() {
    this.view.showLoading(true);
    await this.model.loadProducts();
    this.view.showLoading(false);
    super.initialize();
  }

  handleSearch(searchTerm) {
    this.model.searchProducts(searchTerm);
  }

  handleFilterCategory(category) {
    this.model.filterByCategory(category);
  }
}

// ============================================================================
// Usage Scenario 3: Shopping Cart Management
// ============================================================================

/**
 * Shopping cart model
 */
class ShoppingCartModel extends Model {
  constructor() {
    super();
    this.set('items', []);
    this.set('total', 0);
  }

  /**
   * Adds item to cart
   * @param {Object} product - Product to add
   * @param {number} quantity - Quantity
   */
  addItem(product, quantity = 1) {
    if (!product || !product.id) {
      throw new Error('Invalid product');
    }
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    const items = [...this.get('items')];
    const existingIndex = items.findIndex(item => item.product.id === product.id);

    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({ product, quantity });
    }

    this.set('items', items);
    this._calculateTotal();
  }

  /**
   * Removes item from cart
   * @param {number} productId - Product ID
   */
  removeItem(productId) {
    const items = this.get('items').filter(item => item.product.id !== productId);
    this.set('items', items);
    this._calculateTotal();
  }

  /**
   * Updates item quantity
   * @param {number} productId - Product ID
   * @param {number} quantity - New quantity
   */
  updateQuantity(productId, quantity) {
    if (quantity < 1) {
      this.removeItem(productId);
      return;
    }

    const items = [...this.get('items')];
    const item = items.find(i => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.set('items', items);
      this._calculateTotal();
    }
  }

  /**
   * Clears the cart
   */
  clearCart() {
    this.set('items', []);
    this.set('total', 0);
  }

  /**
   * Calculates total price
   * @private
   */
  _calculateTotal() {
    const items = this.get('items');
    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    this.set('total', total);
  }
}

/**
 * Shopping cart view
 */
class ShoppingCartView extends View {
  display(data) {
    console.log('\n=== Shopping Cart ===');
    if (data.items.length === 0) {
      console.log('Cart is empty');
    } else {
      data.items.forEach(item => {
        console.log(`${item.product.name} x${item.quantity} - $${item.product.price * item.quantity}`);
      });
      console.log(`Total: $${data.total.toFixed(2)}`);
    }
  }

  showError(message) {
    console.error(`Cart Error: ${message}`);
  }

  showLoading(isLoading) {
    console.log(isLoading ? 'Updating cart...' : 'Cart updated');
  }

  onAddItem(product, quantity) {
    this.emit('addItem', { product, quantity });
  }

  onRemoveItem(productId) {
    this.emit('removeItem', productId);
  }

  onUpdateQuantity(productId, quantity) {
    this.emit('updateQuantity', { productId, quantity });
  }

  onCheckout() {
    this.emit('checkout');
  }
}

/**
 * Shopping cart presenter
 */
class ShoppingCartPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this._bindViewEvents();
  }

  _bindViewEvents() {
    this.view.on('addItem', ({ product, quantity }) => this.handleAddItem(product, quantity));
    this.view.on('removeItem', (productId) => this.handleRemoveItem(productId));
    this.view.on('updateQuantity', ({ productId, quantity }) => this.handleUpdateQuantity(productId, quantity));
    this.view.on('checkout', () => this.handleCheckout());
  }

  handleAddItem(product, quantity) {
    try {
      this.model.addItem(product, quantity);
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  handleRemoveItem(productId) {
    this.model.removeItem(productId);
  }

  handleUpdateQuantity(productId, quantity) {
    this.model.updateQuantity(productId, quantity);
  }

  async handleCheckout() {
    const items = this.model.get('items');
    if (items.length === 0) {
      this.view.showError('Cart is empty');
      return;
    }

    this.view.showLoading(true);
    // Simulate checkout process
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.model.clearCart();
    this.view.showLoading(false);
    console.log('Checkout completed successfully!');
  }
}

// ============================================================================
// Usage Scenario 4: Real-time Dashboard
// ============================================================================

/**
 * Dashboard data model
 */
class DashboardModel extends Model {
  constructor() {
    super();
    this.set('metrics', {
      users: 0,
      revenue: 0,
      orders: 0,
      activeUsers: 0
    });
    this.set('lastUpdate', null);
  }

  /**
   * Fetches dashboard metrics
   * @returns {Promise<Object>} Metrics data
   */
  async fetchMetrics() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const metrics = {
          users: Math.floor(Math.random() * 10000),
          revenue: Math.floor(Math.random() * 100000),
          orders: Math.floor(Math.random() * 1000),
          activeUsers: Math.floor(Math.random() * 500)
        };
        this.set('metrics', metrics);
        this.set('lastUpdate', new Date().toISOString());
        resolve(metrics);
      }, 500);
    });
  }

  /**
   * Starts auto-refresh
   * @param {number} interval - Refresh interval in ms
   */
  startAutoRefresh(interval = 5000) {
    this._refreshInterval = setInterval(() => {
      this.fetchMetrics();
    }, interval);
  }

  /**
   * Stops auto-refresh
   */
  stopAutoRefresh() {
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
      this._refreshInterval = null;
    }
  }
}

/**
 * Dashboard view
 */
class DashboardView extends View {
  display(data) {
    console.log('\n=== Dashboard ===');
    console.log(`Users: ${data.metrics.users}`);
    console.log(`Revenue: $${data.metrics.revenue}`);
    console.log(`Orders: ${data.metrics.orders}`);
    console.log(`Active Users: ${data.metrics.activeUsers}`);
    if (data.lastUpdate) {
      console.log(`Last Update: ${new Date(data.lastUpdate).toLocaleTimeString()}`);
    }
  }

  showError(message) {
    console.error(`Dashboard Error: ${message}`);
  }

  showLoading(isLoading) {
    console.log(isLoading ? 'Refreshing dashboard...' : 'Dashboard ready');
  }

  onRefresh() {
    this.emit('refresh');
  }

  onToggleAutoRefresh() {
    this.emit('toggleAutoRefresh');
  }
}

/**
 * Dashboard presenter
 */
class DashboardPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this._autoRefreshEnabled = false;
    this._bindViewEvents();
  }

  _bindViewEvents() {
    this.view.on('refresh', () => this.handleRefresh());
    this.view.on('toggleAutoRefresh', () => this.handleToggleAutoRefresh());
  }

  async initialize() {
    await this.handleRefresh();
  }

  async handleRefresh() {
    try {
      this.view.showLoading(true);
      await this.model.fetchMetrics();
      this.view.showLoading(false);
    } catch (error) {
      this.view.showLoading(false);
      this.view.showError(error.message);
    }
  }

  handleToggleAutoRefresh() {
    this._autoRefreshEnabled = !this._autoRefreshEnabled;
    if (this._autoRefreshEnabled) {
      this.model.startAutoRefresh();
      console.log('Auto-refresh enabled');
    } else {
      this.model.stopAutoRefresh();
      console.log('Auto-refresh disabled');
    }
  }

  cleanup() {
    this.model.stopAutoRefresh();
  }
}

// ============================================================================
// Usage Scenario 5: Form Validation
// ============================================================================

/**
 * Form validation model
 */
class FormValidationModel extends Model {
  constructor() {
    super();
    this.set('fields', {});
    this.set('errors', {});
    this.set('isValid', false);
  }

  /**
   * Sets field value
   * @param {string} fieldName - Field name
   * @param {*} value - Field value
   */
  setField(fieldName, value) {
    const fields = { ...this.get('fields'), [fieldName]: value };
    this.set('fields', fields);
    this.validateField(fieldName, value);
  }

  /**
   * Validates a single field
   * @param {string} fieldName - Field name
   * @param {*} value - Field value
   */
  validateField(fieldName, value) {
    const errors = { ...this.get('errors') };

    switch (fieldName) {
      case 'email':
        if (!value || !value.includes('@')) {
          errors.email = 'Invalid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!value || value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        } else {
          delete errors.password;
        }
        break;
      case 'age':
        if (!value || value < 18 || value > 120) {
          errors.age = 'Age must be between 18 and 120';
        } else {
          delete errors.age;
        }
        break;
    }

    this.set('errors', errors);
    this.set('isValid', Object.keys(errors).length === 0);
  }

  /**
   * Validates all fields
   */
  validateAll() {
    const fields = this.get('fields');
    Object.keys(fields).forEach(key => {
      this.validateField(key, fields[key]);
    });
  }

  /**
   * Submits the form
   * @returns {Promise<Object>} Submission result
   */
  async submit() {
    this.validateAll();
    if (!this.get('isValid')) {
      throw new Error('Form has validation errors');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: this.get('fields') });
      }, 500);
    });
  }
}

/**
 * Form validation view
 */
class FormValidationView extends View {
  display(data) {
    console.log('\n=== Form ===');
    console.log('Fields:', data.fields);
    if (Object.keys(data.errors).length > 0) {
      console.log('Errors:', data.errors);
    }
    console.log('Valid:', data.isValid);
  }

  showError(message) {
    console.error(`Form Error: ${message}`);
  }

  showLoading(isLoading) {
    console.log(isLoading ? 'Submitting form...' : 'Form ready');
  }

  onFieldChange(fieldName, value) {
    this.emit('fieldChange', { fieldName, value });
  }

  onSubmit() {
    this.emit('submit');
  }
}

/**
 * Form validation presenter
 */
class FormValidationPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this._bindViewEvents();
  }

  _bindViewEvents() {
    this.view.on('fieldChange', ({ fieldName, value }) => this.handleFieldChange(fieldName, value));
    this.view.on('submit', () => this.handleSubmit());
  }

  handleFieldChange(fieldName, value) {
    this.model.setField(fieldName, value);
  }

  async handleSubmit() {
    try {
      this.view.showLoading(true);
      const result = await this.model.submit();
      this.view.showLoading(false);
      console.log('Form submitted successfully:', result);
    } catch (error) {
      this.view.showLoading(false);
      this.view.showError(error.message);
    }
  }
}

// ============================================================================
// Demo and Testing
// ============================================================================

/**
 * Runs all MVP pattern demonstrations
 */
async function runDemos() {
  console.log('========================================');
  console.log('Model-View-Presenter Pattern Demonstrations');
  console.log('========================================\n');

  // Demo 1: Login System
  console.log('Demo 1: Login System');
  console.log('--------------------');
  const userModel = new UserModel();
  const loginView = new LoginView();
  const loginPresenter = new LoginPresenter(userModel, loginView);
  loginPresenter.initialize();
  loginView.onLoginSubmit('admin', 'password');
  await new Promise(resolve => setTimeout(resolve, 600));

  // Demo 2: Product Catalog
  console.log('\nDemo 2: Product Catalog');
  console.log('--------------------');
  const catalogModel = new ProductCatalogModel();
  const catalogView = new ProductCatalogView();
  const catalogPresenter = new ProductCatalogPresenter(catalogModel, catalogView);
  await catalogPresenter.initialize();
  catalogView.onSearch('electronics');
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 3: Shopping Cart
  console.log('\nDemo 3: Shopping Cart');
  console.log('--------------------');
  const cartModel = new ShoppingCartModel();
  const cartView = new ShoppingCartView();
  const cartPresenter = new ShoppingCartPresenter(cartModel, cartView);
  cartPresenter.initialize();
  cartView.onAddItem({ id: 1, name: 'Laptop', price: 999 }, 1);
  cartView.onAddItem({ id: 2, name: 'Mouse', price: 29 }, 2);

  // Demo 4: Dashboard
  console.log('\nDemo 4: Real-time Dashboard');
  console.log('--------------------');
  const dashboardModel = new DashboardModel();
  const dashboardView = new DashboardView();
  const dashboardPresenter = new DashboardPresenter(dashboardModel, dashboardView);
  await dashboardPresenter.initialize();

  // Demo 5: Form Validation
  console.log('\nDemo 5: Form Validation');
  console.log('--------------------');
  const formModel = new FormValidationModel();
  const formView = new FormValidationView();
  const formPresenter = new FormValidationPresenter(formModel, formView);
  formPresenter.initialize();
  formView.onFieldChange('email', 'user@example.com');
  formView.onFieldChange('password', 'password123');
  formView.onFieldChange('age', 25);
  await new Promise(resolve => setTimeout(resolve, 100));
  formView.onSubmit();
  await new Promise(resolve => setTimeout(resolve, 600));

  console.log('\n========================================');
  console.log('All MVP Demonstrations Completed');
  console.log('========================================');
}

// Run demonstrations if this file is executed directly
if (require.main === module) {
  runDemos().catch(console.error);
}

// Export all classes
module.exports = {
  Model,
  View,
  Presenter,
  UserModel,
  LoginView,
  LoginPresenter,
  ProductCatalogModel,
  ProductCatalogView,
  ProductCatalogPresenter,
  ShoppingCartModel,
  ShoppingCartView,
  ShoppingCartPresenter,
  DashboardModel,
  DashboardView,
  DashboardPresenter,
  FormValidationModel,
  FormValidationView,
  FormValidationPresenter,
  runDemos
};
