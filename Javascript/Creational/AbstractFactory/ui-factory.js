/**
 * Abstract Factory Pattern - Cross-Platform UI Example
 *
 * The Abstract Factory pattern provides an interface for creating families
 * of related or dependent objects without specifying their concrete classes.
 */

// ============= Abstract Products =============

/**
 * Abstract Product: Button
 */
class Button {
  render() {
    throw new Error('Method render() must be implemented');
  }

  onClick(callback) {
    throw new Error('Method onClick() must be implemented');
  }
}

/**
 * Abstract Product: Checkbox
 */
class Checkbox {
  render() {
    throw new Error('Method render() must be implemented');
  }

  toggle() {
    throw new Error('Method toggle() must be implemented');
  }
}

/**
 * Abstract Product: Input
 */
class Input {
  render() {
    throw new Error('Method render() must be implemented');
  }

  getValue() {
    throw new Error('Method getValue() must be implemented');
  }
}

// ============= Concrete Products - Windows =============

class WindowsButton extends Button {
  render() {
    return '[Windows Button] with rounded corners and blue background';
  }

  onClick(callback) {
    console.log('Windows button clicked with native Windows event handler');
    if (callback) callback();
  }
}

class WindowsCheckbox extends Checkbox {
  constructor() {
    super();
    this.checked = false;
  }

  render() {
    return `[Windows Checkbox] ${this.checked ? '☑' : '☐'} with Segoe UI font`;
  }

  toggle() {
    this.checked = !this.checked;
    console.log(`Windows checkbox toggled to: ${this.checked}`);
  }
}

class WindowsInput extends Input {
  constructor() {
    super();
    this.value = '';
  }

  render() {
    return '[Windows Input] with blue focus outline';
  }

  getValue() {
    return this.value;
  }
}

// ============= Concrete Products - macOS =============

class MacButton extends Button {
  render() {
    return '[Mac Button] with subtle shadow and SF Pro font';
  }

  onClick(callback) {
    console.log('Mac button clicked with Cocoa event handler');
    if (callback) callback();
  }
}

class MacCheckbox extends Checkbox {
  constructor() {
    super();
    this.checked = false;
  }

  render() {
    return `[Mac Checkbox] ${this.checked ? '✓' : '○'} with smooth animation`;
  }

  toggle() {
    this.checked = !this.checked;
    console.log(`Mac checkbox toggled to: ${this.checked}`);
  }
}

class MacInput extends Input {
  constructor() {
    super();
    this.value = '';
  }

  render() {
    return '[Mac Input] with blue glow effect';
  }

  getValue() {
    return this.value;
  }
}

// ============= Concrete Products - Linux =============

class LinuxButton extends Button {
  render() {
    return '[Linux Button] with GTK theme styling';
  }

  onClick(callback) {
    console.log('Linux button clicked with GTK signal handler');
    if (callback) callback();
  }
}

class LinuxCheckbox extends Checkbox {
  constructor() {
    super();
    this.checked = false;
  }

  render() {
    return `[Linux Checkbox] ${this.checked ? '[X]' : '[ ]'} with system theme`;
  }

  toggle() {
    this.checked = !this.checked;
    console.log(`Linux checkbox toggled to: ${this.checked}`);
  }
}

class LinuxInput extends Input {
  constructor() {
    super();
    this.value = '';
  }

  render() {
    return '[Linux Input] with GTK focus indicator';
  }

  getValue() {
    return this.value;
  }
}

// ============= Abstract Factory =============

/**
 * Abstract Factory Interface
 */
class GUIFactory {
  createButton() {
    throw new Error('Method createButton() must be implemented');
  }

  createCheckbox() {
    throw new Error('Method createCheckbox() must be implemented');
  }

  createInput() {
    throw new Error('Method createInput() must be implemented');
  }
}

// ============= Concrete Factories =============

class WindowsFactory extends GUIFactory {
  createButton() {
    return new WindowsButton();
  }

  createCheckbox() {
    return new WindowsCheckbox();
  }

  createInput() {
    return new WindowsInput();
  }
}

class MacFactory extends GUIFactory {
  createButton() {
    return new MacButton();
  }

  createCheckbox() {
    return new MacCheckbox();
  }

  createInput() {
    return new MacInput();
  }
}

class LinuxFactory extends GUIFactory {
  createButton() {
    return new LinuxButton();
  }

  createCheckbox() {
    return new LinuxCheckbox();
  }

  createInput() {
    return new LinuxInput();
  }
}

module.exports = {
  GUIFactory,
  WindowsFactory,
  MacFactory,
  LinuxFactory
};
