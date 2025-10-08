/**
 * Abstract Factory Pattern - Demo
 * Demonstrates creating cross-platform UI components
 */

const {
  WindowsFactory,
  MacFactory,
  LinuxFactory
} = require('./ui-factory');

console.log('=== Abstract Factory Pattern Demo ===\n');

/**
 * Client code that works with factories and products through abstract interfaces
 * @param {GUIFactory} factory
 */
function createApplication(factory) {
  const button = factory.createButton();
  const checkbox = factory.createCheckbox();
  const input = factory.createInput();

  console.log('Rendering UI components:');
  console.log(`  Button: ${button.render()}`);
  console.log(`  Checkbox: ${checkbox.render()}`);
  console.log(`  Input: ${input.render()}`);
  console.log();

  console.log('Interacting with components:');
  button.onClick(() => console.log('  -> Button action executed!'));
  checkbox.toggle();
  console.log(`  Current checkbox state: ${checkbox.render()}`);
  console.log();
}

// Create Windows Application
console.log('--- Windows Application ---');
const windowsFactory = new WindowsFactory();
createApplication(windowsFactory);

// Create macOS Application
console.log('--- macOS Application ---');
const macFactory = new MacFactory();
createApplication(macFactory);

// Create Linux Application
console.log('--- Linux Application ---');
const linuxFactory = new LinuxFactory();
createApplication(linuxFactory);

// Demonstrate runtime platform detection
console.log('=== Runtime Platform Detection ===\n');

function getFactoryForPlatform(platform) {
  switch (platform.toLowerCase()) {
    case 'windows':
    case 'win32':
      return new WindowsFactory();
    case 'darwin':
    case 'macos':
      return new MacFactory();
    case 'linux':
      return new LinuxFactory();
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

// Simulate different platforms
const platforms = ['Windows', 'macOS', 'Linux'];
platforms.forEach(platform => {
  console.log(`Detected platform: ${platform}`);
  const factory = getFactoryForPlatform(platform);
  const button = factory.createButton();
  console.log(`  Created: ${button.render()}`);
  console.log();
});
