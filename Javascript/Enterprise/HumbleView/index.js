/**
 * Humble View Pattern Implementation
 *
 * The Humble View pattern (also known as Humble Object) separates hard-to-test components
 * from easy-to-test components. The View contains only the minimal logic necessary to
 * interact with the UI framework, while all testable logic resides in a separate,
 * framework-independent component.
 *
 * Key Components:
 * - Model: Business logic and data
 * - View Logic: Testable presentation logic (framework-independent)
 * - Humble View: Minimal UI framework interaction code (hard to test)
 *
 * Benefits:
 * - Maximizes testable code
 * - Minimizes framework-dependent code
 * - Clear separation between testable and hard-to-test code
 * - Easy to mock UI framework for testing
 *
 * @module HumbleView
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
    this.emit('dataChanged', { key, value });
  }

  getData() {
    return { ...this._data };
  }
}

/**
 * View Logic - Contains all testable presentation logic
 * This is framework-independent and easily testable
 */
class ViewLogic extends EventEmitter {
  constructor(model) {
    super();
    if (!model) {
      throw new Error('ViewLogic requires a model');
    }
    this.model = model;
    this._setupModelListeners();
  }

  _setupModelListeners() {
    this.model.on('dataChanged', () => {
      this._onModelChanged();
    });
  }

  /**
   * Transforms model data into view-friendly format
   * This is testable without UI framework
   */
  _onModelChanged() {
    const viewData = this.transformDataForView();
    this.emit('viewDataChanged', viewData);
  }

  /**
   * Override in subclasses to transform data
   */
  transformDataForView() {
    throw new Error('transformDataForView() must be implemented');
  }

  /**
   * Handles user actions (testable)
   */
  handleUserAction(actionName, actionData) {
    throw new Error('handleUserAction() must be implemented');
  }
}

/**
 * Humble View - Minimal UI framework code
 * Contains only what's absolutely necessary to interact with UI
 */
class HumbleView {
  constructor(viewLogic) {
    if (!viewLogic) {
      throw new Error('HumbleView requires viewLogic');
    }
    this.viewLogic = viewLogic;
    this._setupLogicListeners();
  }

  _setupLogicListeners() {
    this.viewLogic.on('viewDataChanged', (data) => {
      this.updateUI(data);
    });
  }

  /**
   * Updates UI with new data
   * This is the ONLY place that touches UI framework
   */
  updateUI(data) {
    throw new Error('updateUI() must be implemented');
  }

  /**
   * Delegates user action to view logic
   * Minimal code - just passes through
   */
  notifyUserAction(actionName, actionData) {
    this.viewLogic.handleUserAction(actionName, actionData);
  }
}

// ============================================================================
// Scenario 1: Counter Application
// ============================================================================

class CounterModel extends Model {
  constructor() {
    super();
    this.set('count', 0);
    this.set('step', 1);
  }

  increment() {
    const current = this.get('count');
    const step = this.get('step');
    this.set('count', current + step);
  }

  decrement() {
    const current = this.get('count');
    const step = this.get('step');
    this.set('count', current - step);
  }

  reset() {
    this.set('count', 0);
  }

  setStep(step) {
    if (step > 0) {
      this.set('step', step);
    }
  }
}

/**
 * Counter view logic - fully testable
 */
class CounterViewLogic extends ViewLogic {
  transformDataForView() {
    const count = this.model.get('count');
    const step = this.model.get('step');

    // ALL logic here - testable without UI
    return {
      countDisplay: `Count: ${count}`,
      stepDisplay: `Step: ${step}`,
      isPositive: count > 0,
      isNegative: count < 0,
      isZero: count === 0,
      color: count > 0 ? 'green' : count < 0 ? 'red' : 'gray',
      incrementLabel: `+${step}`,
      decrementLabel: `-${step}`,
      canDecrement: true,
      canIncrement: true
    };
  }

  handleUserAction(actionName, actionData) {
    switch (actionName) {
      case 'increment':
        this.model.increment();
        break;
      case 'decrement':
        this.model.decrement();
        break;
      case 'reset':
        this.model.reset();
        break;
      case 'setStep':
        this.model.setStep(actionData);
        break;
    }
  }

  initialize() {
    this._onModelChanged();
  }
}

/**
 * Counter humble view - minimal UI code
 */
class CounterHumbleView extends HumbleView {
  updateUI(data) {
    // Minimal UI framework interaction
    console.log(`\n=== Counter ===`);
    console.log(data.countDisplay);
    console.log(data.stepDisplay);
    console.log(`[${data.color}] ${data.isZero ? 'Zero' : data.isPositive ? 'Positive' : 'Negative'}`);
    console.log(`Buttons: ${data.incrementLabel} | ${data.decrementLabel} | Reset`);
  }

  onIncrementClick() {
    this.notifyUserAction('increment');
  }

  onDecrementClick() {
    this.notifyUserAction('decrement');
  }

  onResetClick() {
    this.notifyUserAction('reset');
  }

  onStepChange(step) {
    this.notifyUserAction('setStep', step);
  }
}

// ============================================================================
// Scenario 2: Temperature Converter
// ============================================================================

class TemperatureModel extends Model {
  constructor() {
    super();
    this.set('celsius', 0);
    this.set('fahrenheit', 32);
  }

  setCelsius(value) {
    const celsius = parseFloat(value);
    if (!isNaN(celsius)) {
      this.set('celsius', celsius);
      this.set('fahrenheit', (celsius * 9/5) + 32);
    }
  }

  setFahrenheit(value) {
    const fahrenheit = parseFloat(value);
    if (!isNaN(fahrenheit)) {
      this.set('fahrenheit', fahrenheit);
      this.set('celsius', (fahrenheit - 32) * 5/9);
    }
  }
}

/**
 * Temperature view logic - testable conversion logic
 */
class TemperatureViewLogic extends ViewLogic {
  transformDataForView() {
    const celsius = this.model.get('celsius');
    const fahrenheit = this.model.get('fahrenheit');

    // Testable formatting and validation
    return {
      celsiusValue: celsius.toFixed(2),
      fahrenheitValue: fahrenheit.toFixed(2),
      celsiusLabel: `${celsius.toFixed(1)}°C`,
      fahrenheitLabel: `${fahrenheit.toFixed(1)}°F`,
      isFreezing: celsius <= 0,
      isBoiling: celsius >= 100,
      temperatureClass: celsius <= 0 ? 'cold' : celsius >= 100 ? 'hot' : 'normal',
      statusMessage: this._getStatusMessage(celsius)
    };
  }

  _getStatusMessage(celsius) {
    if (celsius <= 0) return 'Freezing';
    if (celsius >= 100) return 'Boiling';
    if (celsius >= 37) return 'Hot';
    if (celsius >= 20) return 'Warm';
    return 'Cool';
  }

  handleUserAction(actionName, actionData) {
    switch (actionName) {
      case 'changeCelsius':
        this.model.setCelsius(actionData);
        break;
      case 'changeFahrenheit':
        this.model.setFahrenheit(actionData);
        break;
    }
  }

  initialize() {
    this._onModelChanged();
  }
}

/**
 * Temperature humble view
 */
class TemperatureHumbleView extends HumbleView {
  updateUI(data) {
    console.log('\n=== Temperature Converter ===');
    console.log(`Celsius: ${data.celsiusLabel}`);
    console.log(`Fahrenheit: ${data.fahrenheitLabel}`);
    console.log(`Status: [${data.temperatureClass}] ${data.statusMessage}`);
  }

  onCelsiusChange(value) {
    this.notifyUserAction('changeCelsius', value);
  }

  onFahrenheitChange(value) {
    this.notifyUserAction('changeFahrenheit', value);
  }
}

// ============================================================================
// Scenario 3: Pagination Control
// ============================================================================

class PaginationModel extends Model {
  constructor(totalItems, itemsPerPage) {
    super();
    this.set('totalItems', totalItems);
    this.set('itemsPerPage', itemsPerPage);
    this.set('currentPage', 1);
  }

  goToPage(page) {
    const totalPages = Math.ceil(this.get('totalItems') / this.get('itemsPerPage'));
    if (page >= 1 && page <= totalPages) {
      this.set('currentPage', page);
    }
  }

  nextPage() {
    this.goToPage(this.get('currentPage') + 1);
  }

  previousPage() {
    this.goToPage(this.get('currentPage') - 1);
  }

  setItemsPerPage(itemsPerPage) {
    if (itemsPerPage > 0) {
      this.set('itemsPerPage', itemsPerPage);
      this.goToPage(1); // Reset to first page
    }
  }
}

/**
 * Pagination view logic - testable pagination calculations
 */
class PaginationViewLogic extends ViewLogic {
  transformDataForView() {
    const currentPage = this.model.get('currentPage');
    const totalItems = this.model.get('totalItems');
    const itemsPerPage = this.model.get('itemsPerPage');

    // All testable calculations
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const hasPrevious = currentPage > 1;
    const hasNext = currentPage < totalPages;

    const pageNumbers = this._getPageNumbers(currentPage, totalPages);

    return {
      currentPageDisplay: `Page ${currentPage} of ${totalPages}`,
      itemsRangeDisplay: `${startItem}-${endItem} of ${totalItems} items`,
      previousButtonEnabled: hasPrevious,
      nextButtonEnabled: hasNext,
      pageNumbers,
      currentPage,
      totalPages
    };
  }

  _getPageNumbers(current, total) {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push({
        number: i,
        isCurrent: i === current,
        isEnabled: true
      });
    }

    return pages;
  }

  handleUserAction(actionName, actionData) {
    switch (actionName) {
      case 'goToPage':
        this.model.goToPage(actionData);
        break;
      case 'nextPage':
        this.model.nextPage();
        break;
      case 'previousPage':
        this.model.previousPage();
        break;
      case 'setItemsPerPage':
        this.model.setItemsPerPage(actionData);
        break;
    }
  }

  initialize() {
    this._onModelChanged();
  }
}

/**
 * Pagination humble view
 */
class PaginationHumbleView extends HumbleView {
  updateUI(data) {
    console.log('\n=== Pagination ===');
    console.log(data.currentPageDisplay);
    console.log(data.itemsRangeDisplay);

    const prevBtn = data.previousButtonEnabled ? '< Previous' : '(Previous)';
    const nextBtn = data.nextButtonEnabled ? 'Next >' : '(Next)';

    const pageButtons = data.pageNumbers.map(p =>
      p.isCurrent ? `[${p.number}]` : ` ${p.number} `
    ).join(' ');

    console.log(`${prevBtn} | ${pageButtons} | ${nextBtn}`);
  }

  onPreviousClick() {
    this.notifyUserAction('previousPage');
  }

  onNextClick() {
    this.notifyUserAction('nextPage');
  }

  onPageClick(page) {
    this.notifyUserAction('goToPage', page);
  }
}

// ============================================================================
// Scenario 4: Color Picker
// ============================================================================

class ColorModel extends Model {
  constructor() {
    super();
    this.set('red', 128);
    this.set('green', 128);
    this.set('blue', 128);
  }

  setRed(value) {
    const clamped = Math.max(0, Math.min(255, parseInt(value)));
    this.set('red', clamped);
  }

  setGreen(value) {
    const clamped = Math.max(0, Math.min(255, parseInt(value)));
    this.set('green', clamped);
  }

  setBlue(value) {
    const clamped = Math.max(0, Math.min(255, parseInt(value)));
    this.set('blue', clamped);
  }

  setHex(hex) {
    const cleaned = hex.replace('#', '');
    if (cleaned.length === 6) {
      this.set('red', parseInt(cleaned.substr(0, 2), 16));
      this.set('green', parseInt(cleaned.substr(2, 2), 16));
      this.set('blue', parseInt(cleaned.substr(4, 2), 16));
    }
  }
}

/**
 * Color view logic - testable color conversions
 */
class ColorViewLogic extends ViewLogic {
  transformDataForView() {
    const r = this.model.get('red');
    const g = this.model.get('green');
    const b = this.model.get('blue');

    // Testable color conversions
    const hexColor = `#${this._toHex(r)}${this._toHex(g)}${this._toHex(b)}`;
    const rgbString = `rgb(${r}, ${g}, ${b})`;
    const { h, s, l } = this._rgbToHsl(r, g, b);
    const hslString = `hsl(${h}, ${s}%, ${l}%)`;

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const isDark = brightness < 128;

    return {
      redValue: r,
      greenValue: g,
      blueValue: b,
      hexColor,
      rgbString,
      hslString,
      brightness: Math.round(brightness),
      isDark,
      textColor: isDark ? 'white' : 'black',
      colorName: this._getColorName(r, g, b)
    };
  }

  _toHex(value) {
    return value.toString(16).padStart(2, '0');
  }

  _rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  _getColorName(r, g, b) {
    if (r > 200 && g < 100 && b < 100) return 'Red';
    if (r < 100 && g > 200 && b < 100) return 'Green';
    if (r < 100 && g < 100 && b > 200) return 'Blue';
    if (r > 200 && g > 200 && b < 100) return 'Yellow';
    if (r < 100 && g > 200 && b > 200) return 'Cyan';
    if (r > 200 && g < 100 && b > 200) return 'Magenta';
    if (r > 200 && g > 200 && b > 200) return 'White';
    if (r < 50 && g < 50 && b < 50) return 'Black';
    return 'Gray';
  }

  handleUserAction(actionName, actionData) {
    switch (actionName) {
      case 'setRed':
        this.model.setRed(actionData);
        break;
      case 'setGreen':
        this.model.setGreen(actionData);
        break;
      case 'setBlue':
        this.model.setBlue(actionData);
        break;
      case 'setHex':
        this.model.setHex(actionData);
        break;
    }
  }

  initialize() {
    this._onModelChanged();
  }
}

/**
 * Color humble view
 */
class ColorHumbleView extends HumbleView {
  updateUI(data) {
    console.log('\n=== Color Picker ===');
    console.log(`RGB: ${data.rgbString}`);
    console.log(`HEX: ${data.hexColor}`);
    console.log(`HSL: ${data.hslString}`);
    console.log(`Name: ${data.colorName}`);
    console.log(`Brightness: ${data.brightness} (${data.isDark ? 'Dark' : 'Light'})`);
    console.log(`Text Color: ${data.textColor}`);
  }

  onRedChange(value) {
    this.notifyUserAction('setRed', value);
  }

  onGreenChange(value) {
    this.notifyUserAction('setGreen', value);
  }

  onBlueChange(value) {
    this.notifyUserAction('setBlue', value);
  }

  onHexChange(value) {
    this.notifyUserAction('setHex', value);
  }
}

// ============================================================================
// Scenario 5: Timer Application
// ============================================================================

class TimerModel extends Model {
  constructor() {
    super();
    this.set('seconds', 0);
    this.set('isRunning', false);
    this.set('targetSeconds', 60);
    this._interval = null;
  }

  start() {
    if (!this.get('isRunning')) {
      this.set('isRunning', true);
      this._interval = setInterval(() => {
        const current = this.get('seconds');
        const target = this.get('targetSeconds');

        if (current < target) {
          this.set('seconds', current + 1);
        } else {
          this.stop();
          this.emit('timerComplete');
        }
      }, 1000);
    }
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    this.set('isRunning', false);
  }

  reset() {
    this.stop();
    this.set('seconds', 0);
  }

  setTarget(seconds) {
    if (seconds > 0) {
      this.set('targetSeconds', seconds);
      if (this.get('seconds') > seconds) {
        this.set('seconds', seconds);
      }
    }
  }
}

/**
 * Timer view logic - testable time formatting
 */
class TimerViewLogic extends ViewLogic {
  constructor(model) {
    super(model);
    model.on('timerComplete', () => {
      this.emit('timerComplete');
    });
  }

  transformDataForView() {
    const seconds = this.model.get('seconds');
    const target = this.model.get('targetSeconds');
    const isRunning = this.model.get('isRunning');

    // Testable time calculations
    const elapsed = this._formatTime(seconds);
    const remaining = this._formatTime(target - seconds);
    const progress = Math.round((seconds / target) * 100);

    return {
      elapsedDisplay: `Elapsed: ${elapsed}`,
      remainingDisplay: `Remaining: ${remaining}`,
      progressDisplay: `${progress}%`,
      progress,
      startButtonText: isRunning ? 'Pause' : 'Start',
      startButtonEnabled: true,
      resetButtonEnabled: seconds > 0,
      isRunning,
      isComplete: seconds >= target,
      progressBarWidth: progress
    };
  }

  _formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  handleUserAction(actionName, actionData) {
    switch (actionName) {
      case 'start':
        if (this.model.get('isRunning')) {
          this.model.stop();
        } else {
          this.model.start();
        }
        break;
      case 'reset':
        this.model.reset();
        break;
      case 'setTarget':
        this.model.setTarget(actionData);
        break;
    }
  }

  initialize() {
    this._onModelChanged();
  }

  cleanup() {
    this.model.stop();
  }
}

/**
 * Timer humble view
 */
class TimerHumbleView extends HumbleView {
  constructor(viewLogic) {
    super(viewLogic);
    viewLogic.on('timerComplete', () => {
      this.onTimerComplete();
    });
  }

  updateUI(data) {
    console.log('\n=== Timer ===');
    console.log(data.elapsedDisplay);
    console.log(data.remainingDisplay);
    console.log(`Progress: [${'='.repeat(Math.floor(data.progress / 10))}${' '.repeat(10 - Math.floor(data.progress / 10))}] ${data.progressDisplay}`);
    console.log(`[${data.startButtonEnabled ? 'ENABLED' : 'DISABLED'}] ${data.startButtonText}`);
    console.log(`[${data.resetButtonEnabled ? 'ENABLED' : 'DISABLED'}] Reset`);

    if (data.isComplete) {
      console.log('[COMPLETE] Timer finished!');
    }
  }

  onTimerComplete() {
    console.log('\nTIMER COMPLETE! Beep beep beep!');
  }

  onStartClick() {
    this.notifyUserAction('start');
  }

  onResetClick() {
    this.notifyUserAction('reset');
  }

  onTargetChange(seconds) {
    this.notifyUserAction('setTarget', seconds);
  }
}

// ============================================================================
// Demo and Testing
// ============================================================================

async function runDemos() {
  console.log('========================================');
  console.log('Humble View Pattern Demonstrations');
  console.log('========================================\n');

  // Demo 1: Counter
  console.log('Demo 1: Counter Application');
  console.log('--------------------');
  const counterModel = new CounterModel();
  const counterLogic = new CounterViewLogic(counterModel);
  const counterView = new CounterHumbleView(counterLogic);
  counterLogic.initialize();
  counterView.onIncrementClick();
  counterView.onIncrementClick();
  counterView.onDecrementClick();
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 2: Temperature
  console.log('\nDemo 2: Temperature Converter');
  console.log('--------------------');
  const tempModel = new TemperatureModel();
  const tempLogic = new TemperatureViewLogic(tempModel);
  const tempView = new TemperatureHumbleView(tempLogic);
  tempLogic.initialize();
  tempView.onCelsiusChange(100);
  tempView.onFahrenheitChange(32);
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 3: Pagination
  console.log('\nDemo 3: Pagination Control');
  console.log('--------------------');
  const paginationModel = new PaginationModel(100, 10);
  const paginationLogic = new PaginationViewLogic(paginationModel);
  const paginationView = new PaginationHumbleView(paginationLogic);
  paginationLogic.initialize();
  paginationView.onNextClick();
  paginationView.onNextClick();
  paginationView.onPageClick(5);
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 4: Color Picker
  console.log('\nDemo 4: Color Picker');
  console.log('--------------------');
  const colorModel = new ColorModel();
  const colorLogic = new ColorViewLogic(colorModel);
  const colorView = new ColorHumbleView(colorLogic);
  colorLogic.initialize();
  colorView.onRedChange(255);
  colorView.onGreenChange(0);
  colorView.onBlueChange(0);
  await new Promise(resolve => setTimeout(resolve, 100));

  // Demo 5: Timer
  console.log('\nDemo 5: Timer Application');
  console.log('--------------------');
  const timerModel = new TimerModel();
  const timerLogic = new TimerViewLogic(timerModel);
  const timerView = new TimerHumbleView(timerLogic);
  timerLogic.initialize();
  timerView.onTargetChange(10);
  timerView.onStartClick();
  await new Promise(resolve => setTimeout(resolve, 2000));
  timerView.onStartClick(); // Pause
  timerLogic.cleanup();

  console.log('\n========================================');
  console.log('All Humble View Demonstrations Completed');
  console.log('========================================');
}

if (require.main === module) {
  runDemos().catch(console.error);
}

module.exports = {
  Model,
  ViewLogic,
  HumbleView,
  CounterModel,
  CounterViewLogic,
  CounterHumbleView,
  TemperatureModel,
  TemperatureViewLogic,
  TemperatureHumbleView,
  PaginationModel,
  PaginationViewLogic,
  PaginationHumbleView,
  ColorModel,
  ColorViewLogic,
  ColorHumbleView,
  TimerModel,
  TimerViewLogic,
  TimerHumbleView,
  runDemos
};
