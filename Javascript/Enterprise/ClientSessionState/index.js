/**
 * Client Session State Pattern Implementation
 *
 * The Client Session State pattern stores session state on the client side,
 * typically in cookies, local storage, or URL parameters. This reduces server
 * memory usage and allows for stateless server architecture.
 *
 * Key Components:
 * - SessionStore: Manages state storage on client
 * - StateSerializer: Converts state to/from storable format
 * - StateValidator: Ensures data integrity
 *
 * Use Cases:
 * 1. Shopping cart state in e-commerce
 * 2. Multi-step form wizards
 * 3. User preferences and settings
 * 4. Search filters and pagination state
 * 5. Authentication tokens (JWT)
 * 6. Draft content (blog posts, comments)
 * 7. UI state (collapsed panels, selected tabs)
 * 8. Recently viewed items
 * 9. Comparison lists
 * 10. Game state in browser games
 */

const crypto = require('crypto');

// ============================================================================
// Core Pattern Implementation
// ============================================================================

/**
 * Base class for client-side session storage
 */
class ClientSessionStore {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'session_state';
    this.encryptionKey = options.encryptionKey;
    this.maxAge = options.maxAge || 3600000; // 1 hour default
    this.storage = options.storage || new InMemoryStorage();
  }

  /**
   * Set session data
   */
  set(key, value) {
    const state = this.getAll();
    state[key] = value;
    state._timestamp = Date.now();
    this.saveState(state);
  }

  /**
   * Get session data
   */
  get(key) {
    const state = this.getAll();
    if (this.isExpired(state)) {
      this.clear();
      return null;
    }
    return state[key];
  }

  /**
   * Get all session data
   */
  getAll() {
    const data = this.storage.getItem(this.storageKey);
    if (!data) {
      return {};
    }

    try {
      const decrypted = this.encryptionKey ? this.decrypt(data) : data;
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to parse session state:', error);
      return {};
    }
  }

  /**
   * Save entire state
   */
  saveState(state) {
    try {
      const serialized = JSON.stringify(state);
      const data = this.encryptionKey ? this.encrypt(serialized) : serialized;
      this.storage.setItem(this.storageKey, data);
    } catch (error) {
      console.error('Failed to save session state:', error);
    }
  }

  /**
   * Remove session data
   */
  remove(key) {
    const state = this.getAll();
    delete state[key];
    this.saveState(state);
  }

  /**
   * Clear all session data
   */
  clear() {
    this.storage.removeItem(this.storageKey);
  }

  /**
   * Check if session is expired
   */
  isExpired(state) {
    if (!state._timestamp) {
      return false;
    }
    return Date.now() - state._timestamp > this.maxAge;
  }

  /**
   * Encrypt data
   */
  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt data
   */
  decrypt(data) {
    const parts = data.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encrypted = parts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

/**
 * In-memory storage implementation (for Node.js/testing)
 */
class InMemoryStorage {
  constructor() {
    this.data = new Map();
  }

  getItem(key) {
    return this.data.get(key);
  }

  setItem(key, value) {
    this.data.set(key, value);
  }

  removeItem(key) {
    this.data.delete(key);
  }

  clear() {
    this.data.clear();
  }
}

/**
 * Cookie-based storage implementation
 */
class CookieStorage {
  getItem(key) {
    const cookies = this.parseCookies();
    return cookies[key];
  }

  setItem(key, value) {
    document.cookie = `${key}=${value}; path=/; max-age=3600`;
  }

  removeItem(key) {
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  clear() {
    const cookies = this.parseCookies();
    Object.keys(cookies).forEach(key => this.removeItem(key));
  }

  parseCookies() {
    return document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
  }
}

// ============================================================================
// Scenario 1: E-Commerce Shopping Cart
// ============================================================================

class ShoppingCartSession extends ClientSessionStore {
  constructor(options) {
    super({ ...options, storageKey: 'shopping_cart' });
  }

  addItem(product, quantity = 1) {
    const cart = this.getCart();
    const existingItem = cart.items.find(item => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity
      });
    }

    this.saveCart(cart);
  }

  removeItem(productId) {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.productId !== productId);
    this.saveCart(cart);
  }

  updateQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.items.find(item => item.productId === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveCart(cart);
      }
    }
  }

  getCart() {
    const cart = this.get('data');
    return cart || { items: [], discountCode: null };
  }

  saveCart(cart) {
    this.set('data', cart);
  }

  applyDiscount(code) {
    const cart = this.getCart();
    cart.discountCode = code;
    this.saveCart(cart);
  }

  getTotal() {
    const cart = this.getCart();
    let subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cart.discountCode === 'SAVE10') {
      subtotal *= 0.9;
    } else if (cart.discountCode === 'SAVE20') {
      subtotal *= 0.8;
    }

    return subtotal;
  }

  getItemCount() {
    const cart = this.getCart();
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  clearCart() {
    this.clear();
  }
}

// ============================================================================
// Scenario 2: Multi-Step Form Wizard
// ============================================================================

class WizardSession extends ClientSessionStore {
  constructor(options) {
    super({ ...options, storageKey: 'wizard_state' });
  }

  setStep(stepNumber) {
    this.set('currentStep', stepNumber);
  }

  getStep() {
    return this.get('currentStep') || 1;
  }

  saveStepData(stepNumber, data) {
    const allData = this.getAllStepData();
    allData[`step${stepNumber}`] = data;
    this.set('stepData', allData);
  }

  getStepData(stepNumber) {
    const allData = this.getAllStepData();
    return allData[`step${stepNumber}`] || {};
  }

  getAllStepData() {
    return this.get('stepData') || {};
  }

  isStepComplete(stepNumber) {
    const data = this.getStepData(stepNumber);
    return Object.keys(data).length > 0;
  }

  canProceed(stepNumber) {
    return this.isStepComplete(stepNumber);
  }

  reset() {
    this.clear();
  }

  getProgress() {
    const totalSteps = 5; // Example: 5-step wizard
    const currentStep = this.getStep();
    return Math.floor((currentStep / totalSteps) * 100);
  }
}

// ============================================================================
// Scenario 3: User Preferences Manager
// ============================================================================

class PreferencesSession extends ClientSessionStore {
  constructor(options) {
    super({ ...options, storageKey: 'user_preferences', maxAge: 2592000000 }); // 30 days
  }

  setTheme(theme) {
    this.set('theme', theme);
  }

  getTheme() {
    return this.get('theme') || 'light';
  }

  setLanguage(language) {
    this.set('language', language);
  }

  getLanguage() {
    return this.get('language') || 'en';
  }

  setNotifications(enabled) {
    this.set('notifications', enabled);
  }

  getNotifications() {
    return this.get('notifications') !== false;
  }

  setDisplayDensity(density) {
    this.set('displayDensity', density);
  }

  getDisplayDensity() {
    return this.get('displayDensity') || 'comfortable';
  }

  setItemsPerPage(count) {
    this.set('itemsPerPage', count);
  }

  getItemsPerPage() {
    return this.get('itemsPerPage') || 25;
  }

  exportPreferences() {
    return this.getAll();
  }

  importPreferences(preferences) {
    this.saveState(preferences);
  }

  resetToDefaults() {
    this.clear();
  }
}

// ============================================================================
// Scenario 4: Search State Manager
// ============================================================================

class SearchSession extends ClientSessionStore {
  constructor(options) {
    super({ ...options, storageKey: 'search_state' });
  }

  saveSearch(query, filters, sortBy) {
    this.set('query', query);
    this.set('filters', filters);
    this.set('sortBy', sortBy);
    this.addToHistory(query);
  }

  getSearch() {
    return {
      query: this.get('query') || '',
      filters: this.get('filters') || {},
      sortBy: this.get('sortBy') || 'relevance'
    };
  }

  setPage(page) {
    this.set('page', page);
  }

  getPage() {
    return this.get('page') || 1;
  }

  addToHistory(query) {
    if (!query) return;

    const history = this.getHistory();
    const filtered = history.filter(item => item !== query);
    filtered.unshift(query);

    // Keep only last 10 searches
    this.set('history', filtered.slice(0, 10));
  }

  getHistory() {
    return this.get('history') || [];
  }

  clearHistory() {
    this.remove('history');
  }

  saveFilters(filters) {
    this.set('filters', filters);
  }

  getFilters() {
    return this.get('filters') || {};
  }

  clearFilters() {
    this.remove('filters');
  }
}

// ============================================================================
// Scenario 5: JWT Token Manager
// ============================================================================

class TokenSession extends ClientSessionStore {
  constructor(options) {
    super({ ...options, storageKey: 'auth_token', maxAge: 86400000 }); // 24 hours
  }

  setToken(token) {
    const decoded = this.decodeToken(token);
    this.set('token', token);
    this.set('expiresAt', decoded.exp * 1000);
    this.set('userId', decoded.userId);
  }

  getToken() {
    if (this.isTokenExpired()) {
      this.clearToken();
      return null;
    }
    return this.get('token');
  }

  decodeToken(token) {
    // Simplified JWT decode (in production, use a proper JWT library)
    try {
      const parts = token.split('.');
      const payload = Buffer.from(parts[1], 'base64').toString('utf8');
      return JSON.parse(payload);
    } catch (error) {
      return { exp: 0, userId: null };
    }
  }

  isTokenExpired() {
    const expiresAt = this.get('expiresAt');
    if (!expiresAt) return true;
    return Date.now() >= expiresAt;
  }

  getUserId() {
    return this.get('userId');
  }

  clearToken() {
    this.clear();
  }

  refreshToken(newToken) {
    this.setToken(newToken);
  }

  getTimeUntilExpiry() {
    const expiresAt = this.get('expiresAt');
    if (!expiresAt) return 0;
    return Math.max(0, expiresAt - Date.now());
  }
}

// ============================================================================
// Scenario 6: Draft Content Manager
// ============================================================================

class DraftSession extends ClientSessionStore {
  constructor(options) {
    super({ ...options, storageKey: 'draft_content', maxAge: 604800000 }); // 7 days
  }

  saveDraft(contentId, content) {
    const drafts = this.getDrafts();
    drafts[contentId] = {
      content: content,
      savedAt: Date.now()
    };
    this.set('drafts', drafts);
  }

  getDraft(contentId) {
    const drafts = this.getDrafts();
    return drafts[contentId];
  }

  getDrafts() {
    return this.get('drafts') || {};
  }

  deleteDraft(contentId) {
    const drafts = this.getDrafts();
    delete drafts[contentId];
    this.set('drafts', drafts);
  }

  hasDraft(contentId) {
    const drafts = this.getDrafts();
    return !!drafts[contentId];
  }

  getDraftAge(contentId) {
    const draft = this.getDraft(contentId);
    if (!draft) return null;
    return Date.now() - draft.savedAt;
  }

  clearOldDrafts(maxAge = 604800000) {
    const drafts = this.getDrafts();
    const now = Date.now();

    Object.keys(drafts).forEach(key => {
      if (now - drafts[key].savedAt > maxAge) {
        delete drafts[key];
      }
    });

    this.set('drafts', drafts);
  }
}

// ============================================================================
// Demo Usage
// ============================================================================

function demonstratePatterns() {
  console.log('CLIENT SESSION STATE PATTERN DEMONSTRATIONS\n');
  console.log('='.repeat(80));

  // Scenario 1: Shopping Cart
  console.log('\nSCENARIO 1: Shopping Cart State\n');
  const cartSession = new ShoppingCartSession({ storage: new InMemoryStorage() });

  const products = [
    { id: 1, name: 'Laptop', price: 999.99 },
    { id: 2, name: 'Mouse', price: 29.99 },
    { id: 3, name: 'Keyboard', price: 79.99 }
  ];

  cartSession.addItem(products[0], 1);
  cartSession.addItem(products[1], 2);
  console.log('Cart after adding items:', cartSession.getCart());
  console.log('Total items:', cartSession.getItemCount());
  console.log('Cart total: $' + cartSession.getTotal().toFixed(2));

  cartSession.applyDiscount('SAVE10');
  console.log('\nAfter applying discount:');
  console.log('Cart total: $' + cartSession.getTotal().toFixed(2));

  console.log('='.repeat(80));

  // Scenario 2: Multi-Step Wizard
  console.log('\nSCENARIO 2: Multi-Step Form Wizard\n');
  const wizardSession = new WizardSession({ storage: new InMemoryStorage() });

  wizardSession.setStep(1);
  wizardSession.saveStepData(1, { firstName: 'John', lastName: 'Doe' });
  console.log('Step 1 complete, current step:', wizardSession.getStep());
  console.log('Step 1 data:', wizardSession.getStepData(1));

  wizardSession.setStep(2);
  wizardSession.saveStepData(2, { email: 'john@example.com', phone: '555-0100' });
  console.log('\nStep 2 complete, current step:', wizardSession.getStep());
  console.log('Progress:', wizardSession.getProgress() + '%');
  console.log('All data:', wizardSession.getAllStepData());

  console.log('='.repeat(80));

  // Scenario 3: User Preferences
  console.log('\nSCENARIO 3: User Preferences\n');
  const prefsSession = new PreferencesSession({ storage: new InMemoryStorage() });

  prefsSession.setTheme('dark');
  prefsSession.setLanguage('es');
  prefsSession.setItemsPerPage(50);
  prefsSession.setNotifications(true);

  console.log('Current theme:', prefsSession.getTheme());
  console.log('Current language:', prefsSession.getLanguage());
  console.log('Items per page:', prefsSession.getItemsPerPage());
  console.log('Notifications enabled:', prefsSession.getNotifications());

  const exported = prefsSession.exportPreferences();
  console.log('\nExported preferences:', exported);

  console.log('='.repeat(80));

  // Scenario 4: Search State
  console.log('\nSCENARIO 4: Search State Manager\n');
  const searchSession = new SearchSession({ storage: new InMemoryStorage() });

  searchSession.saveSearch('laptop', { category: 'electronics', maxPrice: 1500 }, 'price_asc');
  console.log('Current search:', searchSession.getSearch());

  searchSession.addToHistory('keyboard');
  searchSession.addToHistory('mouse');
  console.log('Search history:', searchSession.getHistory());

  console.log('='.repeat(80));

  // Scenario 5: JWT Token Manager
  console.log('\nSCENARIO 5: JWT Token Manager\n');
  const tokenSession = new TokenSession({ storage: new InMemoryStorage() });

  // Create a mock JWT token
  const mockPayload = { userId: '12345', exp: Math.floor(Date.now() / 1000) + 3600 };
  const mockToken = 'header.' + Buffer.from(JSON.stringify(mockPayload)).toString('base64') + '.signature';

  tokenSession.setToken(mockToken);
  console.log('Token stored:', !!tokenSession.getToken());
  console.log('User ID:', tokenSession.getUserId());
  console.log('Token expired:', tokenSession.isTokenExpired());
  console.log('Time until expiry (ms):', tokenSession.getTimeUntilExpiry());

  console.log('='.repeat(80));

  // Scenario 6: Draft Content
  console.log('\nSCENARIO 6: Draft Content Manager\n');
  const draftSession = new DraftSession({ storage: new InMemoryStorage() });

  draftSession.saveDraft('post-1', 'This is my draft blog post content...');
  draftSession.saveDraft('comment-5', 'This is my draft comment...');

  console.log('Has draft for post-1:', draftSession.hasDraft('post-1'));
  console.log('Draft content:', draftSession.getDraft('post-1'));
  console.log('All drafts:', Object.keys(draftSession.getDrafts()));
}

// Export for use in other modules
module.exports = {
  ClientSessionStore,
  InMemoryStorage,
  CookieStorage,
  ShoppingCartSession,
  WizardSession,
  PreferencesSession,
  SearchSession,
  TokenSession,
  DraftSession,
  demonstratePatterns
};

// Run demonstration if executed directly
if (require.main === module) {
  demonstratePatterns();
}
