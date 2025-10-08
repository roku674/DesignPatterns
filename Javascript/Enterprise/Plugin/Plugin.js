/**
 * Plugin Pattern
 */

class PluginManager {
  constructor() {
    this.plugins = new Map();
  }

  register(name, plugin) {
    this.plugins.set(name, plugin);
  }

  execute(name, ...args) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    return plugin.execute(...args);
  }

  getAllPlugins() {
    return Array.from(this.plugins.keys());
  }
}

class Plugin {
  constructor(name) {
    this.name = name;
  }

  execute(...args) {
    throw new Error('Must implement execute');
  }
}

class LoggerPlugin extends Plugin {
  execute(message) {
    console.log(`[${this.name}] ${message}`);
  }
}

class ValidatorPlugin extends Plugin {
  execute(data) {
    return data && data.length > 0;
  }
}

module.exports = {
  PluginManager,
  Plugin,
  LoggerPlugin,
  ValidatorPlugin
};
