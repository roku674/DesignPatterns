/**
 * Passive View Pattern Implementation
 *
 * The Passive View pattern is a variant of MVP where the view is completely passive
 * and contains zero logic. All logic, including presentation logic, resides in the presenter.
 * The view is just a dumb rendering engine that displays what the presenter tells it to display.
 *
 * Key Components:
 * - Model: Business logic and data
 * - Presenter: Contains ALL logic (business + presentation)
 * - Passive View: Zero logic, only displays data
 *
 * Benefits:
 * - Maximum testability (100% logic in presenter)
 * - View is extremely simple
 * - No view logic to test
 * - Easy to swap view implementations
 *
 * @module PassiveView
 */

const EventEmitter = require('events');

/**
 * Base model class
 */
class Model extends EventEmitter {
  constructor(data = {}) {
    super();
    this._data = { ...data };
  }

  get(key) {
    return this._data[key];
  }

  set(key, value) {
    this._data[key] = value;
    this.emit('changed', { key, value });
  }

  getData() {
    return { ...this._data };
  }
}

/**
 * Base passive view - completely logic-free
 * Only method is to display data as instructed by presenter
 */
class PassiveView {
  constructor() {
    this._presenter = null;
    this._displayData = {};
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }

  /**
   * Updates display with exact data from presenter
   * No processing, formatting, or logic whatsoever
   */
  updateDisplay(displayData) {
    this._displayData = displayData;
    this.render();
  }

  /**
   * Simply renders the display data
   * No logic - just output
   */
  render() {
    throw new Error('render() must be implemented');
  }

  /**
   * Notifies presenter of user action
   * No logic - just delegates
   */
  notifyAction(actionName, actionData) {
    if (this._presenter) {
      this._presenter.handleViewAction(actionName, actionData);
    }
  }
}

/**
 * Base presenter - contains ALL logic
 */
class Presenter {
  constructor(model, view) {
    if (!model || !view) {
      throw new Error('Presenter requires model and view');
    }
    this.model = model;
    this.view = view;
    this.view.setPresenter(this);
    this._setupModelListeners();
  }

  _setupModelListeners() {
    this.model.on('changed', () => {
      this.updateView();
    });
  }

  /**
   * Transforms model data into view display data
   * ALL formatting and logic happens here
   */
  updateView() {
    const displayData = this.transformModelToViewData();
    this.view.updateDisplay(displayData);
  }

  /**
   * Transforms model data to display format
   * Must be implemented by concrete presenters
   */
  transformModelToViewData() {
    throw new Error('transformModelToViewData() must be implemented');
  }

  /**
   * Handles all user actions from view
   */
  handleViewAction(actionName, actionData) {
    throw new Error('handleViewAction() must be implemented');
  }
}

// ============================================================================
// Scenario 1: Product Listing
// ============================================================================

class ProductModel extends Model {
  constructor() {
    super();
    this.set('products', []);
    this.set('filters', { category: 'all', maxPrice: null });
  }

  async loadProducts() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.set('products', [
          { id: 1, name: 'Laptop', price: 999, category: 'Electronics', stock: 5 },
          { id: 2, name: 'Mouse', price: 29, category: 'Electronics', stock: 50 },
          { id: 3, name: 'Desk', price: 299, category: 'Furniture', stock: 10 },
          { id: 4, name: 'Chair', price: 149, category: 'Furniture', stock: 0 },
          { id: 5, name: 'Monitor', price: 399, category: 'Electronics', stock: 8 }
        ]);
        resolve();
      }, 300);
    });
  }

  setFilter(filterType, value) {
    const filters = { ...this.get('filters'), [filterType]: value };
    this.set('filters', filters);
  }
}

class ProductPresenter extends Presenter {
  transformModelToViewData() {
    const products = this.model.get('products');
    const filters = this.model.get('filters');

    // ALL filtering logic in presenter
    let filtered = products;
    if (filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }

    // ALL formatting logic in presenter
    const displayProducts = filtered.map(p => ({
      id: p.id,
      displayName: p.name.toUpperCase(),
      displayPrice: `$${p.price.toFixed(2)}`,
      displayStock: p.stock > 0 ? `${p.stock} available` : 'Out of Stock',
      stockColor: p.stock > 10 ? 'green' : p.stock > 0 ? 'yellow' : 'red',
      canOrder: p.stock > 0
    }));

    return {
      title: 'Product Catalog',
      count: `Showing ${filtered.length} of ${products.length} products`,
      products: displayProducts,
      filterCategory: filters.category,
      filterMaxPrice: filters.maxPrice || 'No limit'
    };
  }

  async initialize() {
    await this.model.loadProducts();
    this.updateView();
  }

  handleViewAction(actionName, actionData) {
    switch (actionName) {
      case 'changeCategory':
        this.model.setFilter('category', actionData);
        break;
      case 'changeMaxPrice':
        this.model.setFilter('maxPrice', actionData);
        break;
      case 'orderProduct':
        console.log(`Ordering product ${actionData}`);
        break;
    }
  }
}

class ProductPassiveView extends PassiveView {
  render() {
    const data = this._displayData;
    console.log(`\n=== ${data.title || 'Products'} ===`);
    console.log(data.count || '');
    console.log(`Filter: ${data.filterCategory || 'all'}, Max: ${data.filterMaxPrice || ''}`);

    if (data.products && data.products.length > 0) {
      data.products.forEach(p => {
        console.log(`[${p.stockColor}] ${p.displayName} - ${p.displayPrice} (${p.displayStock})`);
      });
    } else {
      console.log('No products to display');
    }
  }

  onCategoryChange(category) {
    this.notifyAction('changeCategory', category);
  }

  onPriceFilterChange(maxPrice) {
    this.notifyAction('changeMaxPrice', maxPrice);
  }

  onOrderClick(productId) {
    this.notifyAction('orderProduct', productId);
  }
}

// ============================================================================
// Scenario 2: Login Form
// ============================================================================

class LoginModel extends Model {
  constructor() {
    super();
    this.set('username', '');
    this.set('password', '');
    this.set('isAuthenticated', false);
    this.set('attempts', 0);
  }

  async authenticate(username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const attempts = this.get('attempts') + 1;
        this.set('attempts', attempts);

        if (username === 'admin' && password === 'admin123') {
          this.set('isAuthenticated', true);
          this.set('username', username);
          resolve({ success: true });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  }

  reset() {
    this.set('username', '');
    this.set('password', '');
    this.set('isAuthenticated', false);
  }
}

class LoginPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this._isLoading = false;
    this._errorMessage = '';
  }

  transformModelToViewData() {
    const username = this.model.get('username');
    const isAuthenticated = this.model.get('isAuthenticated');
    const attempts = this.model.get('attempts');

    // ALL presentation logic here
    let statusMessage = '';
    let statusColor = 'default';

    if (this._isLoading) {
      statusMessage = 'Authenticating...';
      statusColor = 'blue';
    } else if (this._errorMessage) {
      statusMessage = this._errorMessage;
      statusColor = 'red';
    } else if (isAuthenticated) {
      statusMessage = `Welcome, ${username}!`;
      statusColor = 'green';
    } else if (attempts > 0) {
      statusMessage = `${attempts} failed attempt${attempts > 1 ? 's' : ''}`;
      statusColor = 'yellow';
    }

    return {
      title: 'Login',
      usernameLabel: 'Username:',
      passwordLabel: 'Password:',
      loginButtonText: 'Login',
      loginButtonEnabled: !this._isLoading && !isAuthenticated,
      resetButtonText: 'Reset',
      resetButtonEnabled: !this._isLoading,
      statusMessage,
      statusColor,
      showForm: !isAuthenticated,
      showWelcome: isAuthenticated
    };
  }

  async handleViewAction(actionName, actionData) {
    switch (actionName) {
      case 'login':
        await this._handleLogin(actionData.username, actionData.password);
        break;
      case 'reset':
        this._handleReset();
        break;
    }
  }

  async _handleLogin(username, password) {
    // ALL validation logic in presenter
    if (!username || !password) {
      this._errorMessage = 'Username and password required';
      this.updateView();
      return;
    }

    this._isLoading = true;
    this._errorMessage = '';
    this.updateView();

    try {
      await this.model.authenticate(username, password);
      this._errorMessage = '';
    } catch (error) {
      this._errorMessage = error.message;
    } finally {
      this._isLoading = false;
      this.updateView();
    }
  }

  _handleReset() {
    this.model.reset();
    this._errorMessage = '';
    this.updateView();
  }
}

class LoginPassiveView extends PassiveView {
  render() {
    const data = this._displayData;
    console.log(`\n=== ${data.title || 'Login'} ===`);

    if (data.showForm) {
      console.log(`${data.usernameLabel || 'Username:'} [input field]`);
      console.log(`${data.passwordLabel || 'Password:'} [password field]`);
      console.log(`[${data.loginButtonEnabled ? 'ENABLED' : 'DISABLED'}] ${data.loginButtonText || 'Login'}`);
      console.log(`[${data.resetButtonEnabled ? 'ENABLED' : 'DISABLED'}] ${data.resetButtonText || 'Reset'}`);
    }

    if (data.statusMessage) {
      console.log(`[${data.statusColor}] ${data.statusMessage}`);
    }
  }

  onLoginClick(username, password) {
    this.notifyAction('login', { username, password });
  }

  onResetClick() {
    this.notifyAction('reset');
  }
}

// ============================================================================
// Scenario 3: Task Manager
// ============================================================================

class TaskModel extends Model {
  constructor() {
    super();
    this.set('tasks', []);
    this.set('nextId', 1);
  }

  addTask(title, priority) {
    const tasks = this.get('tasks');
    const newTask = {
      id: this.get('nextId'),
      title,
      priority,
      completed: false,
      createdAt: new Date()
    };
    this.set('tasks', [...tasks, newTask]);
    this.set('nextId', this.get('nextId') + 1);
  }

  toggleTask(id) {
    const tasks = this.get('tasks').map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    this.set('tasks', tasks);
  }

  deleteTask(id) {
    const tasks = this.get('tasks').filter(t => t.id !== id);
    this.set('tasks', tasks);
  }
}

class TaskPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this._filter = 'all'; // all, active, completed
    this._sortBy = 'priority'; // priority, date
  }

  transformModelToViewData() {
    const tasks = this.model.get('tasks');

    // ALL filtering logic
    let filtered = tasks;
    if (this._filter === 'active') {
      filtered = tasks.filter(t => !t.completed);
    } else if (this._filter === 'completed') {
      filtered = tasks.filter(t => t.completed);
    }

    // ALL sorting logic
    const sorted = [...filtered].sort((a, b) => {
      if (this._sortBy === 'priority') {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        return b.createdAt - a.createdAt;
      }
    });

    // ALL formatting logic
    const displayTasks = sorted.map(t => ({
      id: t.id,
      displayTitle: t.title,
      displayPriority: `[${t.priority.toUpperCase()}]`,
      displayStatus: t.completed ? '[✓]' : '[ ]',
      displayDate: t.createdAt.toLocaleDateString(),
      priorityColor: t.priority === 'high' ? 'red' : t.priority === 'medium' ? 'yellow' : 'green',
      strikethrough: t.completed
    }));

    // ALL statistics logic
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      title: 'Task Manager',
      tasks: displayTasks,
      stats: `${active} active, ${completed} completed (${completionRate}% done)`,
      currentFilter: this._filter,
      currentSort: this._sortBy,
      hasActiveTasks: active > 0
    };
  }

  handleViewAction(actionName, actionData) {
    switch (actionName) {
      case 'addTask':
        this.model.addTask(actionData.title, actionData.priority);
        break;
      case 'toggleTask':
        this.model.toggleTask(actionData);
        break;
      case 'deleteTask':
        this.model.deleteTask(actionData);
        break;
      case 'setFilter':
        this._filter = actionData;
        this.updateView();
        break;
      case 'setSort':
        this._sortBy = actionData;
        this.updateView();
        break;
    }
  }
}

class TaskPassiveView extends PassiveView {
  render() {
    const data = this._displayData;
    console.log(`\n=== ${data.title || 'Tasks'} ===`);
    console.log(data.stats || '');
    console.log(`Filter: ${data.currentFilter}, Sort: ${data.currentSort}`);
    console.log('');

    if (data.tasks && data.tasks.length > 0) {
      data.tasks.forEach(t => {
        const text = t.strikethrough ? `~~${t.displayTitle}~~` : t.displayTitle;
        console.log(`${t.displayStatus} ${t.displayPriority} ${text} - ${t.displayDate}`);
      });
    } else {
      console.log('No tasks to display');
    }
  }

  onAddTask(title, priority) {
    this.notifyAction('addTask', { title, priority });
  }

  onToggleTask(id) {
    this.notifyAction('toggleTask', id);
  }

  onDeleteTask(id) {
    this.notifyAction('deleteTask', id);
  }

  onFilterChange(filter) {
    this.notifyAction('setFilter', filter);
  }

  onSortChange(sortBy) {
    this.notifyAction('setSort', sortBy);
  }
}

// ============================================================================
// Scenario 4: Data Dashboard
// ============================================================================

class DashboardModel extends Model {
  constructor() {
    super();
    this.set('metrics', {
      sales: 0,
      customers: 0,
      orders: 0,
      revenue: 0
    });
    this.set('history', []);
  }

  async refresh() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const metrics = {
          sales: Math.floor(Math.random() * 1000),
          customers: Math.floor(Math.random() * 500),
          orders: Math.floor(Math.random() * 200),
          revenue: Math.floor(Math.random() * 50000)
        };
        this.set('metrics', metrics);

        const history = this.get('history');
        this.set('history', [...history, { timestamp: new Date(), metrics }].slice(-10));
        resolve();
      }, 500);
    });
  }
}

class DashboardPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this._isRefreshing = false;
    this._lastRefresh = null;
  }

  transformModelToViewData() {
    const metrics = this.model.get('metrics');
    const history = this.model.get('history');

    // ALL formatting logic
    const displayMetrics = {
      sales: {
        label: 'Total Sales',
        value: metrics.sales.toLocaleString(),
        trend: this._calculateTrend(history, 'sales'),
        trendColor: this._getTrendColor(this._calculateTrend(history, 'sales'))
      },
      customers: {
        label: 'Customers',
        value: metrics.customers.toLocaleString(),
        trend: this._calculateTrend(history, 'customers'),
        trendColor: this._getTrendColor(this._calculateTrend(history, 'customers'))
      },
      orders: {
        label: 'Orders',
        value: metrics.orders.toLocaleString(),
        trend: this._calculateTrend(history, 'orders'),
        trendColor: this._getTrendColor(this._calculateTrend(history, 'orders'))
      },
      revenue: {
        label: 'Revenue',
        value: `$${metrics.revenue.toLocaleString()}`,
        trend: this._calculateTrend(history, 'revenue'),
        trendColor: this._getTrendColor(this._calculateTrend(history, 'revenue'))
      }
    };

    const lastRefreshText = this._lastRefresh
      ? `Last updated: ${this._lastRefresh.toLocaleTimeString()}`
      : 'Never updated';

    return {
      title: 'Dashboard',
      metrics: displayMetrics,
      lastRefresh: lastRefreshText,
      refreshButtonText: this._isRefreshing ? 'Refreshing...' : 'Refresh',
      refreshButtonEnabled: !this._isRefreshing
    };
  }

  // ALL calculation logic in presenter
  _calculateTrend(history, metric) {
    if (history.length < 2) return 0;
    const current = history[history.length - 1].metrics[metric];
    const previous = history[history.length - 2].metrics[metric];
    return current - previous;
  }

  _getTrendColor(trend) {
    if (trend > 0) return 'green';
    if (trend < 0) return 'red';
    return 'gray';
  }

  async handleViewAction(actionName, actionData) {
    if (actionName === 'refresh') {
      await this._handleRefresh();
    }
  }

  async _handleRefresh() {
    this._isRefreshing = true;
    this.updateView();

    await this.model.refresh();
    this._lastRefresh = new Date();

    this._isRefreshing = false;
    this.updateView();
  }

  async initialize() {
    await this._handleRefresh();
  }
}

class DashboardPassiveView extends PassiveView {
  render() {
    const data = this._displayData;
    console.log(`\n=== ${data.title || 'Dashboard'} ===`);
    console.log(data.lastRefresh || '');
    console.log('');

    if (data.metrics) {
      Object.values(data.metrics).forEach(m => {
        const trendIndicator = m.trend > 0 ? '↑' : m.trend < 0 ? '↓' : '→';
        console.log(`${m.label}: ${m.value} [${m.trendColor}] ${trendIndicator}${Math.abs(m.trend)}`);
      });
    }

    console.log('');
    console.log(`[${data.refreshButtonEnabled ? 'ENABLED' : 'DISABLED'}] ${data.refreshButtonText}`);
  }

  onRefreshClick() {
    this.notifyAction('refresh');
  }
}

// ============================================================================
// Scenario 5: Settings Panel
// ============================================================================

class SettingsModel extends Model {
  constructor() {
    super();
    this.set('theme', 'light');
    this.set('notifications', true);
    this.set('autoSave', true);
    this.set('language', 'en');
    this.set('fontSize', 14);
  }

  async save() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Settings saved:', this.getData());
        resolve({ success: true });
      }, 500);
    });
  }
}

class SettingsPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this._isSaving = false;
    this._hasChanges = false;
    this._originalSettings = JSON.stringify(model.getData());
  }

  transformModelToViewData() {
    const theme = this.model.get('theme');
    const notifications = this.model.get('notifications');
    const autoSave = this.model.get('autoSave');
    const language = this.model.get('language');
    const fontSize = this.model.get('fontSize');

    // Check for changes
    const currentSettings = JSON.stringify(this.model.getData());
    this._hasChanges = currentSettings !== this._originalSettings;

    // ALL formatting logic
    return {
      title: 'Settings',
      themeLabel: 'Theme:',
      themeValue: theme === 'light' ? 'Light Mode' : 'Dark Mode',
      themeOptions: ['light', 'dark'],
      notificationsLabel: 'Notifications:',
      notificationsValue: notifications ? 'Enabled' : 'Disabled',
      notificationsChecked: notifications,
      autoSaveLabel: 'Auto-Save:',
      autoSaveValue: autoSave ? 'On' : 'Off',
      autoSaveChecked: autoSave,
      languageLabel: 'Language:',
      languageValue: this._getLanguageName(language),
      fontSizeLabel: 'Font Size:',
      fontSizeValue: `${fontSize}px`,
      fontSizeDisplay: fontSize,
      saveButtonText: this._isSaving ? 'Saving...' : 'Save Changes',
      saveButtonEnabled: !this._isSaving && this._hasChanges,
      statusMessage: this._isSaving ? 'Saving settings...' :
                    this._hasChanges ? 'You have unsaved changes' :
                    'All changes saved'
    };
  }

  _getLanguageName(code) {
    const languages = { en: 'English', es: 'Spanish', fr: 'French', de: 'German' };
    return languages[code] || code;
  }

  async handleViewAction(actionName, actionData) {
    switch (actionName) {
      case 'setTheme':
        this.model.set('theme', actionData);
        break;
      case 'toggleNotifications':
        this.model.set('notifications', !this.model.get('notifications'));
        break;
      case 'toggleAutoSave':
        this.model.set('autoSave', !this.model.get('autoSave'));
        break;
      case 'setLanguage':
        this.model.set('language', actionData);
        break;
      case 'setFontSize':
        this.model.set('fontSize', actionData);
        break;
      case 'save':
        await this._handleSave();
        break;
    }
  }

  async _handleSave() {
    this._isSaving = true;
    this.updateView();

    await this.model.save();
    this._originalSettings = JSON.stringify(this.model.getData());

    this._isSaving = false;
    this.updateView();
  }
}

class SettingsPassiveView extends PassiveView {
  render() {
    const data = this._displayData;
    console.log(`\n=== ${data.title || 'Settings'} ===`);

    console.log(`${data.themeLabel} ${data.themeValue}`);
    console.log(`${data.notificationsLabel} ${data.notificationsValue}`);
    console.log(`${data.autoSaveLabel} ${data.autoSaveValue}`);
    console.log(`${data.languageLabel} ${data.languageValue}`);
    console.log(`${data.fontSizeLabel} ${data.fontSizeValue}`);

    console.log('');
    console.log(`[${data.saveButtonEnabled ? 'ENABLED' : 'DISABLED'}] ${data.saveButtonText}`);
    console.log(data.statusMessage);
  }

  onThemeChange(theme) {
    this.notifyAction('setTheme', theme);
  }

  onNotificationsToggle() {
    this.notifyAction('toggleNotifications');
  }

  onAutoSaveToggle() {
    this.notifyAction('toggleAutoSave');
  }

  onLanguageChange(language) {
    this.notifyAction('setLanguage', language);
  }

  onFontSizeChange(size) {
    this.notifyAction('setFontSize', size);
  }

  onSaveClick() {
    this.notifyAction('save');
  }
}

// ============================================================================
// Demo and Testing
// ============================================================================

async function runDemos() {
  console.log('========================================');
  console.log('Passive View Pattern Demonstrations');
  console.log('========================================\n');

  // Demo 1: Product Listing
  console.log('Demo 1: Product Listing');
  console.log('--------------------');
  const productModel = new ProductModel();
  const productView = new ProductPassiveView();
  const productPresenter = new ProductPresenter(productModel, productView);
  await productPresenter.initialize();
  productView.onCategoryChange('Electronics');
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 2: Login
  console.log('\nDemo 2: Login Form');
  console.log('--------------------');
  const loginModel = new LoginModel();
  const loginView = new LoginPassiveView();
  const loginPresenter = new LoginPresenter(loginModel, loginView);
  loginPresenter.updateView();
  loginView.onLoginClick('admin', 'admin123');
  await new Promise(resolve => setTimeout(resolve, 600));

  // Demo 3: Task Manager
  console.log('\nDemo 3: Task Manager');
  console.log('--------------------');
  const taskModel = new TaskModel();
  const taskView = new TaskPassiveView();
  const taskPresenter = new TaskPresenter(taskModel, taskView);
  taskPresenter.updateView();
  taskView.onAddTask('Complete project', 'high');
  taskView.onAddTask('Review code', 'medium');
  taskView.onToggleTask(1);
  taskView.onFilterChange('active');
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 4: Dashboard
  console.log('\nDemo 4: Data Dashboard');
  console.log('--------------------');
  const dashboardModel = new DashboardModel();
  const dashboardView = new DashboardPassiveView();
  const dashboardPresenter = new DashboardPresenter(dashboardModel, dashboardView);
  await dashboardPresenter.initialize();
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 5: Settings
  console.log('\nDemo 5: Settings Panel');
  console.log('--------------------');
  const settingsModel = new SettingsModel();
  const settingsView = new SettingsPassiveView();
  const settingsPresenter = new SettingsPresenter(settingsModel, settingsView);
  settingsPresenter.updateView();
  settingsView.onThemeChange('dark');
  settingsView.onNotificationsToggle();
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('\n========================================');
  console.log('All Passive View Demonstrations Completed');
  console.log('========================================');
}

if (require.main === module) {
  runDemos().catch(console.error);
}

module.exports = {
  Model,
  PassiveView,
  Presenter,
  ProductModel,
  ProductPresenter,
  ProductPassiveView,
  LoginModel,
  LoginPresenter,
  LoginPassiveView,
  TaskModel,
  TaskPresenter,
  TaskPassiveView,
  DashboardModel,
  DashboardPresenter,
  DashboardPassiveView,
  SettingsModel,
  SettingsPresenter,
  SettingsPassiveView,
  runDemos
};
