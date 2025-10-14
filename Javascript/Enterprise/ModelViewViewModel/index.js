/**
 * Model-View-ViewModel (MVVM) Pattern Implementation
 *
 * The MVVM pattern is a variant of MVC optimized for modern UI development frameworks.
 * It introduces a ViewModel layer that handles view logic and provides data binding
 * between the View and the Model.
 *
 * Key Components:
 * - Model: Contains business logic and data
 * - View: UI layer that binds to ViewModel properties
 * - ViewModel: Exposes data and commands for the View, handles view logic
 *
 * Benefits:
 * - Two-way data binding
 * - Better separation of UI logic from business logic
 * - Improved testability
 * - Declarative UI programming
 * - Reduced code in view layer
 *
 * @module ModelViewViewModel
 */

const EventEmitter = require('events');

/**
 * Base Model class for business logic and data
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
    const oldValue = this._data[key];
    this._data[key] = value;
    this.emit('change', { key, value, oldValue });
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
 * Observable property for data binding
 */
class ObservableProperty extends EventEmitter {
  /**
   * Creates an observable property
   * @param {*} initialValue - Initial value
   */
  constructor(initialValue) {
    super();
    this._value = initialValue;
  }

  /**
   * Gets the current value
   * @returns {*} Current value
   */
  get value() {
    return this._value;
  }

  /**
   * Sets a new value and notifies observers
   * @param {*} newValue - New value
   */
  set value(newValue) {
    if (this._value !== newValue) {
      const oldValue = this._value;
      this._value = newValue;
      this.emit('change', { value: newValue, oldValue });
    }
  }
}

/**
 * Computed property that depends on other observables
 */
class ComputedProperty extends EventEmitter {
  /**
   * Creates a computed property
   * @param {Function} computeFn - Function to compute value
   * @param {Array<ObservableProperty>} dependencies - Observable dependencies
   */
  constructor(computeFn, dependencies = []) {
    super();
    this._computeFn = computeFn;
    this._dependencies = dependencies;
    this._value = null;
    this._compute();
    this._bindDependencies();
  }

  /**
   * Gets the computed value
   * @returns {*} Computed value
   */
  get value() {
    return this._value;
  }

  /**
   * Computes the value
   * @private
   */
  _compute() {
    const newValue = this._computeFn();
    if (this._value !== newValue) {
      const oldValue = this._value;
      this._value = newValue;
      this.emit('change', { value: newValue, oldValue });
    }
  }

  /**
   * Binds to dependency changes
   * @private
   */
  _bindDependencies() {
    this._dependencies.forEach(dep => {
      dep.on('change', () => this._compute());
    });
  }
}

/**
 * Base ViewModel class
 * Provides data binding and commands for the View
 */
class ViewModel extends EventEmitter {
  /**
   * Creates a new ViewModel instance
   * @param {Model} model - The model instance
   */
  constructor(model) {
    super();
    this.model = model;
    this._observables = new Map();
    this._computeds = new Map();
    this._commands = new Map();
    this._bindModelEvents();
  }

  /**
   * Creates an observable property
   * @param {string} name - Property name
   * @param {*} initialValue - Initial value
   * @returns {ObservableProperty} Observable property
   */
  createObservable(name, initialValue) {
    const observable = new ObservableProperty(initialValue);
    this._observables.set(name, observable);
    observable.on('change', ({ value }) => {
      this.emit('propertyChanged', { name, value });
    });
    return observable;
  }

  /**
   * Creates a computed property
   * @param {string} name - Property name
   * @param {Function} computeFn - Compute function
   * @param {Array<ObservableProperty>} dependencies - Dependencies
   * @returns {ComputedProperty} Computed property
   */
  createComputed(name, computeFn, dependencies) {
    const computed = new ComputedProperty(computeFn, dependencies);
    this._computeds.set(name, computed);
    computed.on('change', ({ value }) => {
      this.emit('propertyChanged', { name, value });
    });
    return computed;
  }

  /**
   * Creates a command
   * @param {string} name - Command name
   * @param {Function} execute - Execute function
   * @param {Function} canExecute - Can execute predicate
   * @returns {Object} Command object
   */
  createCommand(name, execute, canExecute = () => true) {
    const command = {
      execute: execute.bind(this),
      canExecute: canExecute.bind(this)
    };
    this._commands.set(name, command);
    return command;
  }

  /**
   * Gets an observable by name
   * @param {string} name - Observable name
   * @returns {ObservableProperty} Observable property
   */
  getObservable(name) {
    return this._observables.get(name);
  }

  /**
   * Gets a computed property by name
   * @param {string} name - Computed name
   * @returns {ComputedProperty} Computed property
   */
  getComputed(name) {
    return this._computeds.get(name);
  }

  /**
   * Gets a command by name
   * @param {string} name - Command name
   * @returns {Object} Command object
   */
  getCommand(name) {
    return this._commands.get(name);
  }

  /**
   * Binds model events
   * @private
   */
  _bindModelEvents() {
    this.model.on('change', ({ key, value }) => {
      this.emit('modelChanged', { key, value });
    });
  }
}

/**
 * Base View class with data binding support
 */
class View extends EventEmitter {
  /**
   * Creates a new View instance
   */
  constructor() {
    super();
    this._viewModel = null;
    this._bindings = new Map();
  }

  /**
   * Sets the ViewModel for this view
   * @param {ViewModel} viewModel - ViewModel instance
   */
  setViewModel(viewModel) {
    this._viewModel = viewModel;
    this._bindViewModel();
  }

  /**
   * Binds to ViewModel properties
   * @param {string} property - Property name
   * @param {Function} updateFn - Update function
   */
  bind(property, updateFn) {
    this._bindings.set(property, updateFn);
  }

  /**
   * Binds ViewModel events
   * @private
   */
  _bindViewModel() {
    this._viewModel.on('propertyChanged', ({ name, value }) => {
      const updateFn = this._bindings.get(name);
      if (updateFn) {
        updateFn(value);
      }
    });
  }

  /**
   * Renders the view (to be implemented by concrete views)
   */
  render() {
    throw new Error('render() must be implemented by concrete view');
  }
}

// ============================================================================
// Usage Scenario 1: User Profile Editor
// ============================================================================

/**
 * User profile model
 */
class UserProfileModel extends Model {
  constructor() {
    super();
    this.set('firstName', '');
    this.set('lastName', '');
    this.set('email', '');
    this.set('bio', '');
  }

  /**
   * Saves user profile
   * @returns {Promise<Object>} Save result
   */
  async save() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: this.getData() });
      }, 500);
    });
  }

  /**
   * Loads user profile
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async load(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          bio: 'Software developer'
        };
        Object.keys(userData).forEach(key => this.set(key, userData[key]));
        resolve(userData);
      }, 300);
    });
  }
}

/**
 * User profile ViewModel
 */
class UserProfileViewModel extends ViewModel {
  constructor(model) {
    super(model);

    // Observable properties
    this.firstName = this.createObservable('firstName', '');
    this.lastName = this.createObservable('lastName', '');
    this.email = this.createObservable('email', '');
    this.bio = this.createObservable('bio', '');
    this.isSaving = this.createObservable('isSaving', false);
    this.saveSuccess = this.createObservable('saveSuccess', false);

    // Computed properties
    this.fullName = this.createComputed(
      'fullName',
      () => `${this.firstName.value} ${this.lastName.value}`.trim(),
      [this.firstName, this.lastName]
    );

    this.isValid = this.createComputed(
      'isValid',
      () => this.firstName.value.length > 0 &&
            this.lastName.value.length > 0 &&
            this.email.value.includes('@'),
      [this.firstName, this.lastName, this.email]
    );

    // Commands
    this.saveCommand = this.createCommand(
      'save',
      this.handleSave,
      () => this.isValid.value && !this.isSaving.value
    );

    this.loadCommand = this.createCommand(
      'load',
      this.handleLoad
    );

    this._syncWithModel();
  }

  /**
   * Syncs ViewModel with Model
   * @private
   */
  _syncWithModel() {
    this.firstName.on('change', ({ value }) => this.model.set('firstName', value));
    this.lastName.on('change', ({ value }) => this.model.set('lastName', value));
    this.email.on('change', ({ value }) => this.model.set('email', value));
    this.bio.on('change', ({ value }) => this.model.set('bio', value));
  }

  /**
   * Handles save command
   */
  async handleSave() {
    this.isSaving.value = true;
    try {
      await this.model.save();
      this.saveSuccess.value = true;
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      this.isSaving.value = false;
    }
  }

  /**
   * Handles load command
   */
  async handleLoad(userId) {
    const data = await this.model.load(userId);
    this.firstName.value = data.firstName;
    this.lastName.value = data.lastName;
    this.email.value = data.email;
    this.bio.value = data.bio;
  }
}

/**
 * User profile view
 */
class UserProfileView extends View {
  constructor() {
    super();
    this._displayState = {};
  }

  setViewModel(viewModel) {
    super.setViewModel(viewModel);

    // Bind to properties
    this.bind('firstName', (value) => {
      this._displayState.firstName = value;
      this.render();
    });

    this.bind('lastName', (value) => {
      this._displayState.lastName = value;
      this.render();
    });

    this.bind('fullName', (value) => {
      this._displayState.fullName = value;
      this.render();
    });

    this.bind('email', (value) => {
      this._displayState.email = value;
      this.render();
    });

    this.bind('isValid', (value) => {
      this._displayState.isValid = value;
      this.render();
    });

    this.bind('isSaving', (value) => {
      this._displayState.isSaving = value;
      this.render();
    });
  }

  render() {
    console.log('\n=== User Profile ===');
    console.log(`Full Name: ${this._displayState.fullName || 'N/A'}`);
    console.log(`Email: ${this._displayState.email || 'N/A'}`);
    console.log(`Form Valid: ${this._displayState.isValid ? 'Yes' : 'No'}`);
    if (this._displayState.isSaving) {
      console.log('Saving...');
    }
  }

  updateFirstName(value) {
    this._viewModel.firstName.value = value;
  }

  updateLastName(value) {
    this._viewModel.lastName.value = value;
  }

  updateEmail(value) {
    this._viewModel.email.value = value;
  }

  save() {
    const command = this._viewModel.saveCommand;
    if (command.canExecute()) {
      command.execute();
    } else {
      console.log('Cannot save: form is invalid');
    }
  }
}

// ============================================================================
// Usage Scenario 2: Todo List with Filtering
// ============================================================================

/**
 * Todo list model
 */
class TodoListModel extends Model {
  constructor() {
    super();
    this.set('todos', []);
    this.set('nextId', 1);
  }

  /**
   * Adds a new todo
   * @param {string} text - Todo text
   */
  addTodo(text) {
    const todos = this.get('todos');
    const newTodo = {
      id: this.get('nextId'),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    this.set('todos', [...todos, newTodo]);
    this.set('nextId', this.get('nextId') + 1);
  }

  /**
   * Toggles todo completion
   * @param {number} id - Todo ID
   */
  toggleTodo(id) {
    const todos = this.get('todos').map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.set('todos', todos);
  }

  /**
   * Removes a todo
   * @param {number} id - Todo ID
   */
  removeTodo(id) {
    const todos = this.get('todos').filter(todo => todo.id !== id);
    this.set('todos', todos);
  }

  /**
   * Clears completed todos
   */
  clearCompleted() {
    const todos = this.get('todos').filter(todo => !todo.completed);
    this.set('todos', todos);
  }
}

/**
 * Todo list ViewModel
 */
class TodoListViewModel extends ViewModel {
  constructor(model) {
    super(model);

    this.newTodoText = this.createObservable('newTodoText', '');
    this.filter = this.createObservable('filter', 'all'); // all, active, completed
    this.todos = this.createObservable('todos', []);

    this.filteredTodos = this.createComputed(
      'filteredTodos',
      () => {
        const todos = this.todos.value;
        const filter = this.filter.value;

        switch (filter) {
          case 'active':
            return todos.filter(t => !t.completed);
          case 'completed':
            return todos.filter(t => t.completed);
          default:
            return todos;
        }
      },
      [this.todos, this.filter]
    );

    this.activeCount = this.createComputed(
      'activeCount',
      () => this.todos.value.filter(t => !t.completed).length,
      [this.todos]
    );

    this.completedCount = this.createComputed(
      'completedCount',
      () => this.todos.value.filter(t => t.completed).length,
      [this.todos]
    );

    this.addCommand = this.createCommand(
      'add',
      this.handleAdd,
      () => this.newTodoText.value.trim().length > 0
    );

    this.toggleCommand = this.createCommand('toggle', this.handleToggle);
    this.removeCommand = this.createCommand('remove', this.handleRemove);
    this.clearCompletedCommand = this.createCommand(
      'clearCompleted',
      this.handleClearCompleted,
      () => this.completedCount.value > 0
    );

    this._syncWithModel();
  }

  _syncWithModel() {
    this.model.on('change', ({ key }) => {
      if (key === 'todos') {
        this.todos.value = this.model.get('todos');
      }
    });
  }

  handleAdd() {
    this.model.addTodo(this.newTodoText.value);
    this.newTodoText.value = '';
  }

  handleToggle(id) {
    this.model.toggleTodo(id);
  }

  handleRemove(id) {
    this.model.removeTodo(id);
  }

  handleClearCompleted() {
    this.model.clearCompleted();
  }
}

/**
 * Todo list view
 */
class TodoListView extends View {
  constructor() {
    super();
    this._displayState = {};
  }

  setViewModel(viewModel) {
    super.setViewModel(viewModel);

    this.bind('filteredTodos', (value) => {
      this._displayState.todos = value;
      this.render();
    });

    this.bind('activeCount', (value) => {
      this._displayState.activeCount = value;
      this.render();
    });

    this.bind('completedCount', (value) => {
      this._displayState.completedCount = value;
      this.render();
    });

    this.bind('filter', (value) => {
      this._displayState.filter = value;
      this.render();
    });
  }

  render() {
    console.log('\n=== Todo List ===');
    console.log(`Filter: ${this._displayState.filter || 'all'}`);
    console.log(`Active: ${this._displayState.activeCount || 0}, Completed: ${this._displayState.completedCount || 0}`);

    const todos = this._displayState.todos || [];
    if (todos.length === 0) {
      console.log('No todos');
    } else {
      todos.forEach(todo => {
        console.log(`${todo.completed ? '[✓]' : '[ ]'} ${todo.text}`);
      });
    }
  }

  addTodo(text) {
    this._viewModel.newTodoText.value = text;
    this._viewModel.addCommand.execute();
  }

  toggleTodo(id) {
    this._viewModel.toggleCommand.execute(id);
  }

  setFilter(filter) {
    this._viewModel.filter.value = filter;
  }
}

// ============================================================================
// Usage Scenario 3: Shopping Cart with Price Calculator
// ============================================================================

/**
 * Shopping cart model
 */
class ShoppingCartModel extends Model {
  constructor() {
    super();
    this.set('items', []);
    this.set('taxRate', 0.08);
    this.set('shippingCost', 10);
  }

  addItem(product, quantity) {
    const items = [...this.get('items')];
    const existing = items.find(item => item.product.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ product, quantity });
    }

    this.set('items', items);
  }

  updateQuantity(productId, quantity) {
    const items = this.get('items').map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    this.set('items', items);
  }

  removeItem(productId) {
    const items = this.get('items').filter(item => item.product.id !== productId);
    this.set('items', items);
  }
}

/**
 * Shopping cart ViewModel
 */
class ShoppingCartViewModel extends ViewModel {
  constructor(model) {
    super(model);

    this.items = this.createObservable('items', []);
    this.taxRate = this.createObservable('taxRate', 0.08);
    this.shippingCost = this.createObservable('shippingCost', 10);

    this.subtotal = this.createComputed(
      'subtotal',
      () => this.items.value.reduce((sum, item) =>
        sum + (item.product.price * item.quantity), 0
      ),
      [this.items]
    );

    this.tax = this.createComputed(
      'tax',
      () => this.subtotal.value * this.taxRate.value,
      [this.subtotal, this.taxRate]
    );

    this.total = this.createComputed(
      'total',
      () => this.subtotal.value + this.tax.value + this.shippingCost.value,
      [this.subtotal, this.tax, this.shippingCost]
    );

    this.itemCount = this.createComputed(
      'itemCount',
      () => this.items.value.reduce((sum, item) => sum + item.quantity, 0),
      [this.items]
    );

    this.addItemCommand = this.createCommand('addItem', this.handleAddItem);
    this.updateQuantityCommand = this.createCommand('updateQuantity', this.handleUpdateQuantity);
    this.removeItemCommand = this.createCommand('removeItem', this.handleRemoveItem);

    this._syncWithModel();
  }

  _syncWithModel() {
    this.model.on('change', ({ key }) => {
      if (key === 'items') {
        this.items.value = this.model.get('items');
      }
    });
  }

  handleAddItem(product, quantity) {
    this.model.addItem(product, quantity);
  }

  handleUpdateQuantity(productId, quantity) {
    this.model.updateQuantity(productId, quantity);
  }

  handleRemoveItem(productId) {
    this.model.removeItem(productId);
  }
}

/**
 * Shopping cart view
 */
class ShoppingCartView extends View {
  constructor() {
    super();
    this._displayState = {};
  }

  setViewModel(viewModel) {
    super.setViewModel(viewModel);

    this.bind('items', (value) => {
      this._displayState.items = value;
      this.render();
    });

    this.bind('subtotal', (value) => {
      this._displayState.subtotal = value;
      this.render();
    });

    this.bind('tax', (value) => {
      this._displayState.tax = value;
      this.render();
    });

    this.bind('total', (value) => {
      this._displayState.total = value;
      this.render();
    });

    this.bind('itemCount', (value) => {
      this._displayState.itemCount = value;
      this.render();
    });
  }

  render() {
    console.log('\n=== Shopping Cart ===');
    console.log(`Items: ${this._displayState.itemCount || 0}`);

    const items = this._displayState.items || [];
    items.forEach(item => {
      console.log(`${item.product.name} x${item.quantity} - $${item.product.price * item.quantity}`);
    });

    console.log(`Subtotal: $${(this._displayState.subtotal || 0).toFixed(2)}`);
    console.log(`Tax: $${(this._displayState.tax || 0).toFixed(2)}`);
    console.log(`Total: $${(this._displayState.total || 0).toFixed(2)}`);
  }

  addItem(product, quantity) {
    this._viewModel.addItemCommand.execute(product, quantity);
  }
}

// ============================================================================
// Usage Scenario 4: Search with Live Results
// ============================================================================

/**
 * Search model
 */
class SearchModel extends Model {
  constructor() {
    super();
    this.set('results', []);
    this.set('isSearching', false);
  }

  async search(query) {
    this.set('isSearching', true);

    return new Promise((resolve) => {
      setTimeout(() => {
        const allResults = [
          { id: 1, title: 'JavaScript Guide', category: 'Programming' },
          { id: 2, title: 'Java Tutorial', category: 'Programming' },
          { id: 3, title: 'Python Basics', category: 'Programming' },
          { id: 4, title: 'Javanese Culture', category: 'Culture' },
          { id: 5, title: 'JavaScript Frameworks', category: 'Programming' }
        ];

        const results = query
          ? allResults.filter(r =>
              r.title.toLowerCase().includes(query.toLowerCase())
            )
          : [];

        this.set('results', results);
        this.set('isSearching', false);
        resolve(results);
      }, 300);
    });
  }
}

/**
 * Search ViewModel
 */
class SearchViewModel extends ViewModel {
  constructor(model) {
    super(model);

    this.searchQuery = this.createObservable('searchQuery', '');
    this.results = this.createObservable('results', []);
    this.isSearching = this.createObservable('isSearching', false);
    this.selectedCategory = this.createObservable('selectedCategory', 'all');

    this.filteredResults = this.createComputed(
      'filteredResults',
      () => {
        const results = this.results.value;
        const category = this.selectedCategory.value;

        if (category === 'all') {
          return results;
        }
        return results.filter(r => r.category === category);
      },
      [this.results, this.selectedCategory]
    );

    this.resultCount = this.createComputed(
      'resultCount',
      () => this.filteredResults.value.length,
      [this.filteredResults]
    );

    this.searchCommand = this.createCommand(
      'search',
      this.handleSearch,
      () => !this.isSearching.value
    );

    this._setupAutoSearch();
    this._syncWithModel();
  }

  _setupAutoSearch() {
    let debounceTimeout;
    this.searchQuery.on('change', () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        if (this.searchQuery.value.length >= 2) {
          this.handleSearch();
        }
      }, 300);
    });
  }

  _syncWithModel() {
    this.model.on('change', ({ key }) => {
      if (key === 'results') {
        this.results.value = this.model.get('results');
      } else if (key === 'isSearching') {
        this.isSearching.value = this.model.get('isSearching');
      }
    });
  }

  async handleSearch() {
    await this.model.search(this.searchQuery.value);
  }
}

/**
 * Search view
 */
class SearchView extends View {
  constructor() {
    super();
    this._displayState = {};
  }

  setViewModel(viewModel) {
    super.setViewModel(viewModel);

    this.bind('filteredResults', (value) => {
      this._displayState.results = value;
      this.render();
    });

    this.bind('resultCount', (value) => {
      this._displayState.count = value;
      this.render();
    });

    this.bind('isSearching', (value) => {
      this._displayState.isSearching = value;
      this.render();
    });

    this.bind('searchQuery', (value) => {
      this._displayState.query = value;
    });
  }

  render() {
    console.log('\n=== Search Results ===');
    if (this._displayState.isSearching) {
      console.log('Searching...');
    } else {
      console.log(`Found ${this._displayState.count || 0} results`);
      const results = this._displayState.results || [];
      results.forEach(r => {
        console.log(`- ${r.title} [${r.category}]`);
      });
    }
  }

  updateSearchQuery(query) {
    this._viewModel.searchQuery.value = query;
  }

  setCategory(category) {
    this._viewModel.selectedCategory.value = category;
  }
}

// ============================================================================
// Usage Scenario 5: Form with Validation
// ============================================================================

/**
 * Registration form model
 */
class RegistrationFormModel extends Model {
  constructor() {
    super();
    this.set('username', '');
    this.set('email', '');
    this.set('password', '');
    this.set('confirmPassword', '');
  }

  async register() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, userId: 123 });
      }, 500);
    });
  }
}

/**
 * Registration form ViewModel
 */
class RegistrationFormViewModel extends ViewModel {
  constructor(model) {
    super(model);

    this.username = this.createObservable('username', '');
    this.email = this.createObservable('email', '');
    this.password = this.createObservable('password', '');
    this.confirmPassword = this.createObservable('confirmPassword', '');
    this.isSubmitting = this.createObservable('isSubmitting', false);

    this.usernameValid = this.createComputed(
      'usernameValid',
      () => this.username.value.length >= 3,
      [this.username]
    );

    this.emailValid = this.createComputed(
      'emailValid',
      () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.value),
      [this.email]
    );

    this.passwordValid = this.createComputed(
      'passwordValid',
      () => this.password.value.length >= 8,
      [this.password]
    );

    this.passwordsMatch = this.createComputed(
      'passwordsMatch',
      () => this.password.value === this.confirmPassword.value &&
            this.confirmPassword.value.length > 0,
      [this.password, this.confirmPassword]
    );

    this.formValid = this.createComputed(
      'formValid',
      () => this.usernameValid.value &&
            this.emailValid.value &&
            this.passwordValid.value &&
            this.passwordsMatch.value,
      [this.usernameValid, this.emailValid, this.passwordValid, this.passwordsMatch]
    );

    this.registerCommand = this.createCommand(
      'register',
      this.handleRegister,
      () => this.formValid.value && !this.isSubmitting.value
    );

    this._syncWithModel();
  }

  _syncWithModel() {
    this.username.on('change', ({ value }) => this.model.set('username', value));
    this.email.on('change', ({ value }) => this.model.set('email', value));
    this.password.on('change', ({ value }) => this.model.set('password', value));
    this.confirmPassword.on('change', ({ value }) => this.model.set('confirmPassword', value));
  }

  async handleRegister() {
    this.isSubmitting.value = true;
    try {
      const result = await this.model.register();
      console.log('Registration successful:', result);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      this.isSubmitting.value = false;
    }
  }
}

/**
 * Registration form view
 */
class RegistrationFormView extends View {
  constructor() {
    super();
    this._displayState = {};
  }

  setViewModel(viewModel) {
    super.setViewModel(viewModel);

    this.bind('formValid', (value) => {
      this._displayState.formValid = value;
      this.render();
    });

    this.bind('usernameValid', (value) => {
      this._displayState.usernameValid = value;
    });

    this.bind('emailValid', (value) => {
      this._displayState.emailValid = value;
    });

    this.bind('passwordValid', (value) => {
      this._displayState.passwordValid = value;
    });

    this.bind('passwordsMatch', (value) => {
      this._displayState.passwordsMatch = value;
    });
  }

  render() {
    console.log('\n=== Registration Form ===');
    console.log(`Username Valid: ${this._displayState.usernameValid ? 'Yes' : 'No'}`);
    console.log(`Email Valid: ${this._displayState.emailValid ? 'Yes' : 'No'}`);
    console.log(`Password Valid: ${this._displayState.passwordValid ? 'Yes' : 'No'}`);
    console.log(`Passwords Match: ${this._displayState.passwordsMatch ? 'Yes' : 'No'}`);
    console.log(`Form Valid: ${this._displayState.formValid ? 'Yes' : 'No'}`);
  }

  updateUsername(value) {
    this._viewModel.username.value = value;
  }

  updateEmail(value) {
    this._viewModel.email.value = value;
  }

  updatePassword(value) {
    this._viewModel.password.value = value;
  }

  updateConfirmPassword(value) {
    this._viewModel.confirmPassword.value = value;
  }

  submit() {
    const command = this._viewModel.registerCommand;
    if (command.canExecute()) {
      command.execute();
    }
  }
}

// ============================================================================
// Demo and Testing
// ============================================================================

/**
 * Runs all MVVM pattern demonstrations
 */
async function runDemos() {
  console.log('========================================');
  console.log('Model-View-ViewModel Pattern Demonstrations');
  console.log('========================================\n');

  // Demo 1: User Profile
  console.log('Demo 1: User Profile Editor');
  console.log('--------------------');
  const profileModel = new UserProfileModel();
  const profileViewModel = new UserProfileViewModel(profileModel);
  const profileView = new UserProfileView();
  profileView.setViewModel(profileViewModel);
  profileView.updateFirstName('John');
  profileView.updateLastName('Doe');
  profileView.updateEmail('john@example.com');
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 2: Todo List
  console.log('\nDemo 2: Todo List');
  console.log('--------------------');
  const todoModel = new TodoListModel();
  const todoViewModel = new TodoListViewModel(todoModel);
  const todoView = new TodoListView();
  todoView.setViewModel(todoViewModel);
  todoView.addTodo('Learn MVVM pattern');
  todoView.addTodo('Build an app');
  todoView.toggleTodo(1);
  todoView.setFilter('active');
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 3: Shopping Cart
  console.log('\nDemo 3: Shopping Cart');
  console.log('--------------------');
  const cartModel = new ShoppingCartModel();
  const cartViewModel = new ShoppingCartViewModel(cartModel);
  const cartView = new ShoppingCartView();
  cartView.setViewModel(cartViewModel);
  cartView.addItem({ id: 1, name: 'Laptop', price: 999 }, 1);
  cartView.addItem({ id: 2, name: 'Mouse', price: 29 }, 2);
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 4: Search
  console.log('\nDemo 4: Live Search');
  console.log('--------------------');
  const searchModel = new SearchModel();
  const searchViewModel = new SearchViewModel(searchModel);
  const searchView = new SearchView();
  searchView.setViewModel(searchViewModel);
  searchView.updateSearchQuery('java');
  await new Promise(resolve => setTimeout(resolve, 700));

  // Demo 5: Registration Form
  console.log('\nDemo 5: Registration Form');
  console.log('--------------------');
  const regModel = new RegistrationFormModel();
  const regViewModel = new RegistrationFormViewModel(regModel);
  const regView = new RegistrationFormView();
  regView.setViewModel(regViewModel);
  regView.updateUsername('johndoe');
  regView.updateEmail('john@example.com');
  regView.updatePassword('password123');
  regView.updateConfirmPassword('password123');
  await new Promise(resolve => setTimeout(resolve, 100));
  regView.submit();
  await new Promise(resolve => setTimeout(resolve, 600));

  console.log('\n========================================');
  console.log('All MVVM Demonstrations Completed');
  console.log('========================================');
}

// Run demonstrations if this file is executed directly
if (require.main === module) {
  runDemos().catch(console.error);
}

// Export all classes
module.exports = {
  Model,
  ObservableProperty,
  ComputedProperty,
  ViewModel,
  View,
  UserProfileModel,
  UserProfileViewModel,
  UserProfileView,
  TodoListModel,
  TodoListViewModel,
  TodoListView,
  ShoppingCartModel,
  ShoppingCartViewModel,
  ShoppingCartView,
  SearchModel,
  SearchViewModel,
  SearchView,
  RegistrationFormModel,
  RegistrationFormViewModel,
  RegistrationFormView,
  runDemos
};
