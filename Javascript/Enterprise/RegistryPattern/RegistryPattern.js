/**
 * Registry Pattern
 */

class Registry {
  constructor() {
    this.services = new Map();
  }

  static getInstance() {
    if (!Registry.instance) {
      Registry.instance = new Registry();
    }
    return Registry.instance;
  }

  register(name, service) {
    this.services.set(name, service);
  }

  get(name) {
    if (!this.services.has(name)) {
      throw new Error(`Service ${name} not registered`);
    }
    return this.services.get(name);
  }

  has(name) {
    return this.services.has(name);
  }
}

module.exports = { Registry };
