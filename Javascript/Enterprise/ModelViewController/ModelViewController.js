/**
 * Model-View-Controller (MVC) Pattern
 *
 * Separates application logic into three interconnected components:
 * - Model: Manages data and business logic
 * - View: Handles presentation and user interface
 * - Controller: Processes user input and coordinates Model and View
 *
 * Use Cases:
 * - Web applications with complex UI
 * - Desktop applications
 * - Mobile applications
 * - Enterprise software
 * - Content management systems
 * - E-commerce platforms
 */

/**
 * Model Base Class
 * Represents data and business logic
 */
class Model {
  constructor() {
    this.observers = [];
    this.data = {};
  }

  /**
   * Subscribe observer to model changes
   * @param {Function} observer - Observer callback
   */
  subscribe(observer) {
    this.observers.push(observer);
  }

  /**
   * Unsubscribe observer
   * @param {Function} observer - Observer to remove
   */
  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  /**
   * Notify all observers of changes
   */
  notify() {
    this.observers.forEach(observer => observer(this.data));
  }

  /**
   * Get model data
   * @returns {Object} Model data
   */
  getData() {
    return { ...this.data };
  }
}

/**
 * View Base Class
 * Handles presentation logic
 */
class View {
  constructor() {
    this.template = '';
  }

  /**
   * Render view with data
   * @param {Object} data - Data to render
   * @returns {string} Rendered output
   */
  render(data) {
    throw new Error('View must implement render method');
  }

  /**
   * Bind event handlers
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  bindEvent(event, handler) {
    // Override in specific view implementations
  }
}

/**
 * Controller Base Class
 * Coordinates Model and View
 */
class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  /**
   * Initialize controller
   */
  initialize() {
    throw new Error('Controller must implement initialize method');
  }

  /**
   * Handle user input
   * @param {string} action - Action to perform
   * @param {Object} data - Action data
   */
  handleAction(action, data) {
    throw new Error('Controller must implement handleAction method');
  }
}

/**
 * User Model
 * Manages user data and operations
 */
class UserModel extends Model {
  constructor() {
    super();
    this.users = new Map();
    this.currentUser = null;
  }

  /**
   * Add a new user
   * @param {Object} userData - User data
   * @returns {Object} Created user
   */
  addUser(userData) {
    const id = Date.now().toString();
    const user = {
      id,
      ...userData,
      createdAt: new Date()
    };
    this.users.set(id, user);
    this.data.users = Array.from(this.users.values());
    this.notify();
    return user;
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Object|null} User or null
   */
  getUser(id) {
    return this.users.get(id) || null;
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updates - Updates to apply
   * @returns {Object|null} Updated user
   */
  updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return null;

    Object.assign(user, updates, { updatedAt: new Date() });
    this.data.users = Array.from(this.users.values());
    this.notify();
    return user;
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {boolean} Success status
   */
  deleteUser(id) {
    const deleted = this.users.delete(id);
    if (deleted) {
      this.data.users = Array.from(this.users.values());
      this.notify();
    }
    return deleted;
  }

  /**
   * Get all users
   * @returns {Array} All users
   */
  getAllUsers() {
    return Array.from(this.users.values());
  }

  /**
   * Set current user
   * @param {string} id - User ID
   */
  setCurrentUser(id) {
    this.currentUser = this.users.get(id);
    this.data.currentUser = this.currentUser;
    this.notify();
  }
}

/**
 * Product Model
 * Manages product catalog
 */
class ProductModel extends Model {
  constructor() {
    super();
    this.products = new Map();
    this.categories = new Set();
  }

  /**
   * Add a product
   * @param {Object} productData - Product data
   * @returns {Object} Created product
   */
  addProduct(productData) {
    const id = Date.now().toString();
    const product = {
      id,
      ...productData,
      createdAt: new Date()
    };
    this.products.set(id, product);
    this.categories.add(product.category);
    this.data.products = Array.from(this.products.values());
    this.data.categories = Array.from(this.categories);
    this.notify();
    return product;
  }

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Object|null} Product or null
   */
  getProduct(id) {
    return this.products.get(id) || null;
  }

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} updates - Updates to apply
   * @returns {Object|null} Updated product
   */
  updateProduct(id, updates) {
    const product = this.products.get(id);
    if (!product) return null;

    if (updates.category && updates.category !== product.category) {
      this.categories.add(updates.category);
    }

    Object.assign(product, updates, { updatedAt: new Date() });
    this.data.products = Array.from(this.products.values());
    this.notify();
    return product;
  }

  /**
   * Delete product
   * @param {string} id - Product ID
   * @returns {boolean} Success status
   */
  deleteProduct(id) {
    const deleted = this.products.delete(id);
    if (deleted) {
      this.data.products = Array.from(this.products.values());
      this.notify();
    }
    return deleted;
  }

  /**
   * Get products by category
   * @param {string} category - Category name
   * @returns {Array} Filtered products
   */
  getProductsByCategory(category) {
    return Array.from(this.products.values())
      .filter(p => p.category === category);
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @returns {Array} Matching products
   */
  searchProducts(query) {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values())
      .filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
      );
  }
}

/**
 * Shopping Cart Model
 * Manages shopping cart state
 */
class ShoppingCartModel extends Model {
  constructor() {
    super();
    this.items = new Map();
    this.data.items = [];
    this.data.total = 0;
    this.data.itemCount = 0;
  }

  /**
   * Add item to cart
   * @param {Object} product - Product to add
   * @param {number} quantity - Quantity to add
   */
  addItem(product, quantity = 1) {
    const existingItem = this.items.get(product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.set(product.id, {
        product,
        quantity,
        subtotal: product.price * quantity
      });
    }

    this.updateCart();
  }

  /**
   * Remove item from cart
   * @param {string} productId - Product ID to remove
   */
  removeItem(productId) {
    this.items.delete(productId);
    this.updateCart();
  }

  /**
   * Update item quantity
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   */
  updateQuantity(productId, quantity) {
    const item = this.items.get(productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        item.subtotal = item.product.price * quantity;
        this.updateCart();
      }
    }
  }

  /**
   * Clear cart
   */
  clear() {
    this.items.clear();
    this.updateCart();
  }

  /**
   * Update cart totals and notify observers
   */
  updateCart() {
    this.data.items = Array.from(this.items.values());
    this.data.total = this.data.items.reduce((sum, item) => sum + item.subtotal, 0);
    this.data.itemCount = this.data.items.reduce((sum, item) => sum + item.quantity, 0);
    this.notify();
  }
}

/**
 * User View
 * Renders user interface
 */
class UserView extends View {
  render(data) {
    if (data.currentUser) {
      return `
Current User: ${data.currentUser.name} (${data.currentUser.email})

User List:
${data.users?.map(u => `- ${u.name} (${u.email})`).join('\n') || 'No users'}
`;
    } else {
      return `
No user logged in

User List:
${data.users?.map(u => `- ${u.name} (${u.email})`).join('\n') || 'No users'}
`;
    }
  }
}

/**
 * Product View
 * Renders product catalog
 */
class ProductView extends View {
  render(data) {
    return `
Product Catalog (${data.products?.length || 0} products)

Categories: ${data.categories?.join(', ') || 'None'}

Products:
${data.products?.map(p => `
- ${p.name} ($${p.price.toFixed(2)})
  Category: ${p.category}
  ${p.description || 'No description'}
`).join('') || 'No products available'}
`;
  }

  renderProduct(product) {
    return `
${product.name}
Price: $${product.price.toFixed(2)}
Category: ${product.category}
${product.description || 'No description'}
Stock: ${product.stock || 'In stock'}
`;
  }
}

/**
 * Shopping Cart View
 * Renders shopping cart
 */
class ShoppingCartView extends View {
  render(data) {
    if (!data.items || data.items.length === 0) {
      return '\nShopping Cart is empty\n';
    }

    return `
Shopping Cart (${data.itemCount} items)

Items:
${data.items.map(item => `
- ${item.product.name}
  Quantity: ${item.quantity}
  Price: $${item.product.price.toFixed(2)}
  Subtotal: $${item.subtotal.toFixed(2)}
`).join('')}

Total: $${data.total.toFixed(2)}
`;
  }
}

/**
 * User Controller
 * Handles user-related actions
 */
class UserController extends Controller {
  initialize() {
    this.model.subscribe((data) => {
      console.log(this.view.render(data));
    });
  }

  handleAction(action, data) {
    switch (action) {
      case 'create':
        return this.createUser(data);
      case 'update':
        return this.updateUser(data.id, data.updates);
      case 'delete':
        return this.deleteUser(data.id);
      case 'login':
        return this.loginUser(data.id);
      case 'list':
        return this.listUsers();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  createUser(userData) {
    return this.model.addUser(userData);
  }

  updateUser(id, updates) {
    return this.model.updateUser(id, updates);
  }

  deleteUser(id) {
    return this.model.deleteUser(id);
  }

  loginUser(id) {
    this.model.setCurrentUser(id);
    return this.model.currentUser;
  }

  listUsers() {
    return this.model.getAllUsers();
  }
}

/**
 * Product Controller
 * Handles product catalog actions
 */
class ProductController extends Controller {
  initialize() {
    this.model.subscribe((data) => {
      console.log(this.view.render(data));
    });
  }

  handleAction(action, data) {
    switch (action) {
      case 'create':
        return this.createProduct(data);
      case 'update':
        return this.updateProduct(data.id, data.updates);
      case 'delete':
        return this.deleteProduct(data.id);
      case 'get':
        return this.getProduct(data.id);
      case 'search':
        return this.searchProducts(data.query);
      case 'category':
        return this.getByCategory(data.category);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  createProduct(productData) {
    return this.model.addProduct(productData);
  }

  updateProduct(id, updates) {
    return this.model.updateProduct(id, updates);
  }

  deleteProduct(id) {
    return this.model.deleteProduct(id);
  }

  getProduct(id) {
    return this.model.getProduct(id);
  }

  searchProducts(query) {
    return this.model.searchProducts(query);
  }

  getByCategory(category) {
    return this.model.getProductsByCategory(category);
  }
}

/**
 * Shopping Cart Controller
 * Handles cart operations
 */
class ShoppingCartController extends Controller {
  initialize() {
    this.model.subscribe((data) => {
      console.log(this.view.render(data));
    });
  }

  handleAction(action, data) {
    switch (action) {
      case 'add':
        return this.addToCart(data.product, data.quantity);
      case 'remove':
        return this.removeFromCart(data.productId);
      case 'update':
        return this.updateQuantity(data.productId, data.quantity);
      case 'clear':
        return this.clearCart();
      case 'checkout':
        return this.checkout();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  addToCart(product, quantity) {
    this.model.addItem(product, quantity);
    return this.model.getData();
  }

  removeFromCart(productId) {
    this.model.removeItem(productId);
    return this.model.getData();
  }

  updateQuantity(productId, quantity) {
    this.model.updateQuantity(productId, quantity);
    return this.model.getData();
  }

  clearCart() {
    this.model.clear();
    return this.model.getData();
  }

  checkout() {
    const cartData = this.model.getData();
    this.model.clear();
    return {
      success: true,
      orderTotal: cartData.total,
      itemCount: cartData.itemCount,
      message: 'Order placed successfully'
    };
  }
}

module.exports = {
  Model,
  View,
  Controller,
  UserModel,
  ProductModel,
  ShoppingCartModel,
  UserView,
  ProductView,
  ShoppingCartView,
  UserController,
  ProductController,
  ShoppingCartController
};
