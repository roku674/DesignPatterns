/**
 * Presentation Model Pattern Implementation
 *
 * The Presentation Model pattern separates the presentation logic from the view by creating
 * a model that represents the complete state and behavior of the view. The view becomes
 * a simple renderer that binds to the presentation model.
 *
 * Key Components:
 * - Domain Model: Core business logic and data
 * - Presentation Model: Encapsulates view state and behavior
 * - View: Thin layer that renders the presentation model
 *
 * Benefits:
 * - Complete testability of presentation logic
 * - View becomes a thin rendering layer
 * - Easy to test without UI framework
 * - Clear separation between domain and presentation
 *
 * @module PresentationModel
 */

const EventEmitter = require('events');

/**
 * Base domain model class
 */
class DomainModel extends EventEmitter {
  constructor(data = {}) {
    super();
    this._data = { ...data };
  }

  get(key) {
    return this._data[key];
  }

  set(key, value) {
    this._data[key] = value;
    this.emit('dataChanged', { key, value });
  }

  getData() {
    return { ...this._data };
  }
}

/**
 * Base presentation model class
 * Manages view state and behavior independently of the view
 */
class PresentationModel extends EventEmitter {
  constructor(domainModel) {
    super();
    this.domainModel = domainModel;
    this._viewState = {};
    this._bindDomainModel();
  }

  _bindDomainModel() {
    this.domainModel.on('dataChanged', () => {
      this._updateViewState();
    });
  }

  _updateViewState() {
    this.emit('stateChanged', this.getViewState());
  }

  getViewState() {
    return { ...this._viewState };
  }

  setViewProperty(key, value) {
    this._viewState[key] = value;
    this._updateViewState();
  }
}

/**
 * Base view class
 * Simple renderer that displays presentation model state
 */
class View extends EventEmitter {
  constructor() {
    super();
    this._presentationModel = null;
  }

  setPresentationModel(presentationModel) {
    this._presentationModel = presentationModel;
    this._bindPresentationModel();
  }

  _bindPresentationModel() {
    this._presentationModel.on('stateChanged', (state) => {
      this.render(state);
    });
  }

  render(state) {
    throw new Error('render() must be implemented by concrete view');
  }
}

// ============================================================================
// Usage Scenario 1: Product Details Page
// ============================================================================

class ProductDomainModel extends DomainModel {
  constructor() {
    super();
    this.set('id', 0);
    this.set('name', '');
    this.set('price', 0);
    this.set('description', '');
    this.set('stock', 0);
    this.set('images', []);
  }

  async load(productId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.set('id', productId);
        this.set('name', 'Gaming Laptop');
        this.set('price', 1299.99);
        this.set('description', 'High-performance gaming laptop');
        this.set('stock', 15);
        this.set('images', ['img1.jpg', 'img2.jpg']);
        resolve(this.getData());
      }, 300);
    });
  }

  decrementStock(quantity) {
    const current = this.get('stock');
    if (current >= quantity) {
      this.set('stock', current - quantity);
      return true;
    }
    return false;
  }
}

class ProductPresentationModel extends PresentationModel {
  constructor(domainModel) {
    super(domainModel);
    this._viewState = {
      displayName: '',
      displayPrice: '',
      displayStock: '',
      canAddToCart: false,
      selectedQuantity: 1,
      selectedImage: 0,
      errorMessage: ''
    };
  }

  _updateViewState() {
    const product = this.domainModel.getData();

    this._viewState.displayName = product.name || 'Unknown Product';
    this._viewState.displayPrice = `$${(product.price || 0).toFixed(2)}`;
    this._viewState.displayStock = product.stock > 0
      ? `${product.stock} in stock`
      : 'Out of stock';
    this._viewState.canAddToCart = product.stock > 0 &&
                                    this._viewState.selectedQuantity <= product.stock;

    super._updateViewState();
  }

  async initialize(productId) {
    await this.domainModel.load(productId);
    this._updateViewState();
  }

  setQuantity(quantity) {
    if (quantity > 0 && quantity <= this.domainModel.get('stock')) {
      this._viewState.selectedQuantity = quantity;
      this._viewState.errorMessage = '';
    } else {
      this._viewState.errorMessage = 'Invalid quantity';
    }
    this._updateViewState();
  }

  selectImage(index) {
    const images = this.domainModel.get('images');
    if (index >= 0 && index < images.length) {
      this._viewState.selectedImage = index;
      this._updateViewState();
    }
  }

  addToCart() {
    if (this._viewState.canAddToCart) {
      const success = this.domainModel.decrementStock(this._viewState.selectedQuantity);
      if (success) {
        console.log(`Added ${this._viewState.selectedQuantity} to cart`);
        this._updateViewState();
      }
    }
  }
}

class ProductView extends View {
  render(state) {
    console.log('\n=== Product Details ===');
    console.log(`Product: ${state.displayName}`);
    console.log(`Price: ${state.displayPrice}`);
    console.log(`Stock: ${state.displayStock}`);
    console.log(`Quantity: ${state.selectedQuantity}`);
    console.log(`Can Add to Cart: ${state.canAddToCart ? 'Yes' : 'No'}`);
    if (state.errorMessage) {
      console.log(`Error: ${state.errorMessage}`);
    }
  }

  onQuantityChange(quantity) {
    this._presentationModel.setQuantity(quantity);
  }

  onImageSelect(index) {
    this._presentationModel.selectImage(index);
  }

  onAddToCart() {
    this._presentationModel.addToCart();
  }
}

// ============================================================================
// Usage Scenario 2: Invoice Calculator
// ============================================================================

class InvoiceDomainModel extends DomainModel {
  constructor() {
    super();
    this.set('items', []);
    this.set('taxRate', 0.08);
    this.set('discountPercent', 0);
  }

  addItem(item) {
    const items = [...this.get('items'), item];
    this.set('items', items);
  }

  removeItem(index) {
    const items = this.get('items').filter((_, i) => i !== index);
    this.set('items', items);
  }

  setDiscount(percent) {
    if (percent >= 0 && percent <= 100) {
      this.set('discountPercent', percent);
    }
  }

  calculateSubtotal() {
    return this.get('items').reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  calculateTax(subtotal) {
    return subtotal * this.get('taxRate');
  }

  calculateDiscount(subtotal) {
    return subtotal * (this.get('discountPercent') / 100);
  }

  calculateTotal() {
    const subtotal = this.calculateSubtotal();
    const tax = this.calculateTax(subtotal);
    const discount = this.calculateDiscount(subtotal);
    return subtotal + tax - discount;
  }
}

class InvoicePresentationModel extends PresentationModel {
  constructor(domainModel) {
    super(domainModel);
    this._viewState = {
      items: [],
      subtotalDisplay: '$0.00',
      taxDisplay: '$0.00',
      discountDisplay: '$0.00',
      totalDisplay: '$0.00',
      itemCount: 0
    };
  }

  _updateViewState() {
    const items = this.domainModel.get('items');
    const subtotal = this.domainModel.calculateSubtotal();
    const tax = this.domainModel.calculateTax(subtotal);
    const discount = this.domainModel.calculateDiscount(subtotal);
    const total = this.domainModel.calculateTotal();

    this._viewState.items = items;
    this._viewState.itemCount = items.length;
    this._viewState.subtotalDisplay = `$${subtotal.toFixed(2)}`;
    this._viewState.taxDisplay = `$${tax.toFixed(2)}`;
    this._viewState.discountDisplay = `-$${discount.toFixed(2)}`;
    this._viewState.totalDisplay = `$${total.toFixed(2)}`;

    super._updateViewState();
  }

  addItem(name, price, quantity) {
    this.domainModel.addItem({ name, price, quantity });
  }

  removeItem(index) {
    this.domainModel.removeItem(index);
  }

  applyDiscount(percent) {
    this.domainModel.setDiscount(percent);
    this._updateViewState();
  }
}

class InvoiceView extends View {
  render(state) {
    console.log('\n=== Invoice ===');
    console.log(`Items: ${state.itemCount}`);
    state.items.forEach((item, i) => {
      console.log(`${i + 1}. ${item.name} - $${item.price} x ${item.quantity}`);
    });
    console.log(`Subtotal: ${state.subtotalDisplay}`);
    console.log(`Tax: ${state.taxDisplay}`);
    console.log(`Discount: ${state.discountDisplay}`);
    console.log(`Total: ${state.totalDisplay}`);
  }

  onAddItem(name, price, quantity) {
    this._presentationModel.addItem(name, price, quantity);
  }

  onRemoveItem(index) {
    this._presentationModel.removeItem(index);
  }

  onApplyDiscount(percent) {
    this._presentationModel.applyDiscount(percent);
  }
}

// ============================================================================
// Usage Scenario 3: User Settings Panel
// ============================================================================

class UserSettingsDomainModel extends DomainModel {
  constructor() {
    super();
    this.set('notifications', true);
    this.set('emailUpdates', true);
    this.set('theme', 'light');
    this.set('language', 'en');
    this.set('timezone', 'UTC');
  }

  async save() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Settings saved:', this.getData());
        resolve({ success: true });
      }, 500);
    });
  }

  reset() {
    this.set('notifications', true);
    this.set('emailUpdates', true);
    this.set('theme', 'light');
    this.set('language', 'en');
    this.set('timezone', 'UTC');
  }
}

class UserSettingsPresentationModel extends PresentationModel {
  constructor(domainModel) {
    super(domainModel);
    this._viewState = {
      notificationsEnabled: true,
      emailUpdatesEnabled: true,
      selectedTheme: 'light',
      selectedLanguage: 'en',
      selectedTimezone: 'UTC',
      isSaving: false,
      hasChanges: false,
      availableThemes: ['light', 'dark', 'auto'],
      availableLanguages: ['en', 'es', 'fr', 'de'],
      availableTimezones: ['UTC', 'EST', 'PST', 'GMT']
    };
    this._originalSettings = this.domainModel.getData();
  }

  _updateViewState() {
    this._viewState.notificationsEnabled = this.domainModel.get('notifications');
    this._viewState.emailUpdatesEnabled = this.domainModel.get('emailUpdates');
    this._viewState.selectedTheme = this.domainModel.get('theme');
    this._viewState.selectedLanguage = this.domainModel.get('language');
    this._viewState.selectedTimezone = this.domainModel.get('timezone');
    this._viewState.hasChanges = this._checkForChanges();

    super._updateViewState();
  }

  _checkForChanges() {
    const current = this.domainModel.getData();
    return JSON.stringify(current) !== JSON.stringify(this._originalSettings);
  }

  toggleNotifications() {
    this.domainModel.set('notifications', !this.domainModel.get('notifications'));
  }

  toggleEmailUpdates() {
    this.domainModel.set('emailUpdates', !this.domainModel.get('emailUpdates'));
  }

  setTheme(theme) {
    if (this._viewState.availableThemes.includes(theme)) {
      this.domainModel.set('theme', theme);
    }
  }

  setLanguage(language) {
    if (this._viewState.availableLanguages.includes(language)) {
      this.domainModel.set('language', language);
    }
  }

  setTimezone(timezone) {
    if (this._viewState.availableTimezones.includes(timezone)) {
      this.domainModel.set('timezone', timezone);
    }
  }

  async save() {
    this._viewState.isSaving = true;
    this._updateViewState();

    await this.domainModel.save();
    this._originalSettings = this.domainModel.getData();

    this._viewState.isSaving = false;
    this._updateViewState();
  }

  reset() {
    this.domainModel.reset();
    this._updateViewState();
  }
}

class UserSettingsView extends View {
  render(state) {
    console.log('\n=== User Settings ===');
    console.log(`Notifications: ${state.notificationsEnabled ? 'On' : 'Off'}`);
    console.log(`Email Updates: ${state.emailUpdatesEnabled ? 'On' : 'Off'}`);
    console.log(`Theme: ${state.selectedTheme}`);
    console.log(`Language: ${state.selectedLanguage}`);
    console.log(`Timezone: ${state.selectedTimezone}`);
    console.log(`Has Changes: ${state.hasChanges ? 'Yes' : 'No'}`);
    if (state.isSaving) {
      console.log('Saving...');
    }
  }

  onToggleNotifications() {
    this._presentationModel.toggleNotifications();
  }

  onToggleEmailUpdates() {
    this._presentationModel.toggleEmailUpdates();
  }

  onThemeChange(theme) {
    this._presentationModel.setTheme(theme);
  }

  onSave() {
    this._presentationModel.save();
  }

  onReset() {
    this._presentationModel.reset();
  }
}

// ============================================================================
// Usage Scenario 4: Calendar Event Editor
// ============================================================================

class CalendarEventDomainModel extends DomainModel {
  constructor() {
    super();
    this.set('title', '');
    this.set('startTime', null);
    this.set('endTime', null);
    this.set('location', '');
    this.set('attendees', []);
    this.set('reminder', 15);
  }

  isValid() {
    const title = this.get('title');
    const startTime = this.get('startTime');
    const endTime = this.get('endTime');

    return title.length > 0 &&
           startTime !== null &&
           endTime !== null &&
           new Date(endTime) > new Date(startTime);
  }

  addAttendee(email) {
    const attendees = [...this.get('attendees'), email];
    this.set('attendees', attendees);
  }

  removeAttendee(email) {
    const attendees = this.get('attendees').filter(a => a !== email);
    this.set('attendees', attendees);
  }

  async save() {
    if (!this.isValid()) {
      throw new Error('Invalid event data');
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, eventId: Math.floor(Math.random() * 1000) });
      }, 500);
    });
  }
}

class CalendarEventPresentationModel extends PresentationModel {
  constructor(domainModel) {
    super(domainModel);
    this._viewState = {
      titleValue: '',
      startTimeValue: '',
      endTimeValue: '',
      locationValue: '',
      attendeesList: [],
      reminderValue: 15,
      isValid: false,
      canSave: false,
      validationErrors: [],
      reminderOptions: [5, 10, 15, 30, 60]
    };
  }

  _updateViewState() {
    this._viewState.titleValue = this.domainModel.get('title');
    this._viewState.startTimeValue = this.domainModel.get('startTime');
    this._viewState.endTimeValue = this.domainModel.get('endTime');
    this._viewState.locationValue = this.domainModel.get('location');
    this._viewState.attendeesList = this.domainModel.get('attendees');
    this._viewState.reminderValue = this.domainModel.get('reminder');
    this._viewState.isValid = this.domainModel.isValid();
    this._viewState.canSave = this._viewState.isValid;
    this._viewState.validationErrors = this._getValidationErrors();

    super._updateViewState();
  }

  _getValidationErrors() {
    const errors = [];
    if (!this.domainModel.get('title')) {
      errors.push('Title is required');
    }
    if (!this.domainModel.get('startTime')) {
      errors.push('Start time is required');
    }
    if (!this.domainModel.get('endTime')) {
      errors.push('End time is required');
    }
    const start = new Date(this.domainModel.get('startTime'));
    const end = new Date(this.domainModel.get('endTime'));
    if (end <= start) {
      errors.push('End time must be after start time');
    }
    return errors;
  }

  setTitle(title) {
    this.domainModel.set('title', title);
  }

  setStartTime(time) {
    this.domainModel.set('startTime', time);
  }

  setEndTime(time) {
    this.domainModel.set('endTime', time);
  }

  setLocation(location) {
    this.domainModel.set('location', location);
  }

  setReminder(minutes) {
    this.domainModel.set('reminder', minutes);
  }

  addAttendee(email) {
    if (email && email.includes('@')) {
      this.domainModel.addAttendee(email);
    }
  }

  removeAttendee(email) {
    this.domainModel.removeAttendee(email);
  }

  async save() {
    if (this._viewState.canSave) {
      return await this.domainModel.save();
    }
    throw new Error('Cannot save: validation errors');
  }
}

class CalendarEventView extends View {
  render(state) {
    console.log('\n=== Event Editor ===');
    console.log(`Title: ${state.titleValue || '(empty)'}`);
    console.log(`Start: ${state.startTimeValue || '(not set)'}`);
    console.log(`End: ${state.endTimeValue || '(not set)'}`);
    console.log(`Location: ${state.locationValue || '(empty)'}`);
    console.log(`Attendees: ${state.attendeesList.join(', ') || 'None'}`);
    console.log(`Reminder: ${state.reminderValue} minutes before`);
    console.log(`Valid: ${state.isValid ? 'Yes' : 'No'}`);
    if (state.validationErrors.length > 0) {
      console.log('Errors:');
      state.validationErrors.forEach(err => console.log(`  - ${err}`));
    }
  }

  onTitleChange(title) {
    this._presentationModel.setTitle(title);
  }

  onStartTimeChange(time) {
    this._presentationModel.setStartTime(time);
  }

  onEndTimeChange(time) {
    this._presentationModel.setEndTime(time);
  }

  onAddAttendee(email) {
    this._presentationModel.addAttendee(email);
  }

  async onSave() {
    try {
      const result = await this._presentationModel.save();
      console.log('Event saved:', result);
    } catch (error) {
      console.error('Save failed:', error.message);
    }
  }
}

// ============================================================================
// Usage Scenario 5: Report Filter Panel
// ============================================================================

class ReportFilterDomainModel extends DomainModel {
  constructor() {
    super();
    this.set('startDate', null);
    this.set('endDate', null);
    this.set('selectedDepartments', []);
    this.set('selectedStatuses', []);
    this.set('minimumAmount', 0);
    this.set('maximumAmount', null);
  }

  async generateReport() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reportData = {
          filters: this.getData(),
          recordCount: Math.floor(Math.random() * 1000),
          generatedAt: new Date().toISOString()
        };
        resolve(reportData);
      }, 1000);
    });
  }

  reset() {
    this.set('startDate', null);
    this.set('endDate', null);
    this.set('selectedDepartments', []);
    this.set('selectedStatuses', []);
    this.set('minimumAmount', 0);
    this.set('maximumAmount', null);
  }
}

class ReportFilterPresentationModel extends PresentationModel {
  constructor(domainModel) {
    super(domainModel);
    this._viewState = {
      startDateDisplay: '',
      endDateDisplay: '',
      departmentList: [],
      statusList: [],
      amountRangeDisplay: '',
      filterCount: 0,
      canGenerate: false,
      isGenerating: false,
      availableDepartments: ['Sales', 'Marketing', 'Engineering', 'Support'],
      availableStatuses: ['Active', 'Pending', 'Completed', 'Cancelled']
    };
  }

  _updateViewState() {
    const startDate = this.domainModel.get('startDate');
    const endDate = this.domainModel.get('endDate');
    const minAmount = this.domainModel.get('minimumAmount');
    const maxAmount = this.domainModel.get('maximumAmount');

    this._viewState.startDateDisplay = startDate ? new Date(startDate).toLocaleDateString() : 'Not set';
    this._viewState.endDateDisplay = endDate ? new Date(endDate).toLocaleDateString() : 'Not set';
    this._viewState.departmentList = this.domainModel.get('selectedDepartments');
    this._viewState.statusList = this.domainModel.get('selectedStatuses');
    this._viewState.amountRangeDisplay = `$${minAmount} - ${maxAmount ? '$' + maxAmount : 'No limit'}`;
    this._viewState.filterCount = this._countActiveFilters();
    this._viewState.canGenerate = this._viewState.filterCount > 0;

    super._updateViewState();
  }

  _countActiveFilters() {
    let count = 0;
    if (this.domainModel.get('startDate')) count++;
    if (this.domainModel.get('endDate')) count++;
    if (this.domainModel.get('selectedDepartments').length > 0) count++;
    if (this.domainModel.get('selectedStatuses').length > 0) count++;
    if (this.domainModel.get('minimumAmount') > 0) count++;
    if (this.domainModel.get('maximumAmount')) count++;
    return count;
  }

  setDateRange(startDate, endDate) {
    this.domainModel.set('startDate', startDate);
    this.domainModel.set('endDate', endDate);
  }

  toggleDepartment(department) {
    const selected = this.domainModel.get('selectedDepartments');
    const index = selected.indexOf(department);
    if (index >= 0) {
      selected.splice(index, 1);
    } else {
      selected.push(department);
    }
    this.domainModel.set('selectedDepartments', [...selected]);
  }

  toggleStatus(status) {
    const selected = this.domainModel.get('selectedStatuses');
    const index = selected.indexOf(status);
    if (index >= 0) {
      selected.splice(index, 1);
    } else {
      selected.push(status);
    }
    this.domainModel.set('selectedStatuses', [...selected]);
  }

  setAmountRange(min, max) {
    this.domainModel.set('minimumAmount', min);
    this.domainModel.set('maximumAmount', max);
  }

  async generateReport() {
    if (!this._viewState.canGenerate) {
      throw new Error('No filters selected');
    }

    this._viewState.isGenerating = true;
    this._updateViewState();

    try {
      const result = await this.domainModel.generateReport();
      return result;
    } finally {
      this._viewState.isGenerating = false;
      this._updateViewState();
    }
  }

  reset() {
    this.domainModel.reset();
    this._updateViewState();
  }
}

class ReportFilterView extends View {
  render(state) {
    console.log('\n=== Report Filters ===');
    console.log(`Date Range: ${state.startDateDisplay} to ${state.endDateDisplay}`);
    console.log(`Departments: ${state.departmentList.join(', ') || 'All'}`);
    console.log(`Statuses: ${state.statusList.join(', ') || 'All'}`);
    console.log(`Amount Range: ${state.amountRangeDisplay}`);
    console.log(`Active Filters: ${state.filterCount}`);
    console.log(`Can Generate: ${state.canGenerate ? 'Yes' : 'No'}`);
    if (state.isGenerating) {
      console.log('Generating report...');
    }
  }

  onSetDateRange(startDate, endDate) {
    this._presentationModel.setDateRange(startDate, endDate);
  }

  onToggleDepartment(department) {
    this._presentationModel.toggleDepartment(department);
  }

  onToggleStatus(status) {
    this._presentationModel.toggleStatus(status);
  }

  async onGenerateReport() {
    try {
      const result = await this._presentationModel.generateReport();
      console.log('Report generated:', result);
    } catch (error) {
      console.error('Generation failed:', error.message);
    }
  }

  onReset() {
    this._presentationModel.reset();
  }
}

// ============================================================================
// Demo and Testing
// ============================================================================

async function runDemos() {
  console.log('========================================');
  console.log('Presentation Model Pattern Demonstrations');
  console.log('========================================\n');

  // Demo 1: Product Details
  console.log('Demo 1: Product Details Page');
  console.log('--------------------');
  const productDomain = new ProductDomainModel();
  const productPM = new ProductPresentationModel(productDomain);
  const productView = new ProductView();
  productView.setPresentationModel(productPM);
  await productPM.initialize(1);
  productView.onQuantityChange(2);
  productView.onAddToCart();
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 2: Invoice
  console.log('\nDemo 2: Invoice Calculator');
  console.log('--------------------');
  const invoiceDomain = new InvoiceDomainModel();
  const invoicePM = new InvoicePresentationModel(invoiceDomain);
  const invoiceView = new InvoiceView();
  invoiceView.setPresentationModel(invoicePM);
  invoiceView.onAddItem('Laptop', 999, 1);
  invoiceView.onAddItem('Mouse', 29, 2);
  invoiceView.onApplyDiscount(10);
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 3: User Settings
  console.log('\nDemo 3: User Settings Panel');
  console.log('--------------------');
  const settingsDomain = new UserSettingsDomainModel();
  const settingsPM = new UserSettingsPresentationModel(settingsDomain);
  const settingsView = new UserSettingsView();
  settingsView.setPresentationModel(settingsPM);
  settingsView.onToggleNotifications();
  settingsView.onThemeChange('dark');
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 4: Calendar Event
  console.log('\nDemo 4: Calendar Event Editor');
  console.log('--------------------');
  const eventDomain = new CalendarEventDomainModel();
  const eventPM = new CalendarEventPresentationModel(eventDomain);
  const eventView = new CalendarEventView();
  eventView.setPresentationModel(eventPM);
  eventView.onTitleChange('Team Meeting');
  eventView.onStartTimeChange('2025-01-15T10:00:00');
  eventView.onEndTimeChange('2025-01-15T11:00:00');
  eventView.onAddAttendee('john@example.com');
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 5: Report Filters
  console.log('\nDemo 5: Report Filter Panel');
  console.log('--------------------');
  const filterDomain = new ReportFilterDomainModel();
  const filterPM = new ReportFilterPresentationModel(filterDomain);
  const filterView = new ReportFilterView();
  filterView.setPresentationModel(filterPM);
  filterView.onSetDateRange('2025-01-01', '2025-01-31');
  filterView.onToggleDepartment('Sales');
  filterView.onToggleStatus('Active');
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('\n========================================');
  console.log('All Presentation Model Demonstrations Completed');
  console.log('========================================');
}

if (require.main === module) {
  runDemos().catch(console.error);
}

module.exports = {
  DomainModel,
  PresentationModel,
  View,
  ProductDomainModel,
  ProductPresentationModel,
  ProductView,
  InvoiceDomainModel,
  InvoicePresentationModel,
  InvoiceView,
  UserSettingsDomainModel,
  UserSettingsPresentationModel,
  UserSettingsView,
  CalendarEventDomainModel,
  CalendarEventPresentationModel,
  CalendarEventView,
  ReportFilterDomainModel,
  ReportFilterPresentationModel,
  ReportFilterView,
  runDemos
};
