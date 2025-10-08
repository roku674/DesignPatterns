/**
 * Plugin Architecture Pattern
 */

class PluginHost {
  constructor() {
    this.plugins = [];
  }

  loadPlugin(plugin) {
    if (plugin.initialize) {
      plugin.initialize(this);
    }
    this.plugins.push(plugin);
  }

  executeHook(hookName, ...args) {
    this.plugins.forEach(plugin => {
      if (plugin[hookName]) {
        plugin[hookName](...args);
      }
    });
  }
}

class BasePlugin {
  initialize(host) {
    this.host = host;
  }
}

class AuthPlugin extends BasePlugin {
  onRequest(req) {
    console.log(`[Auth Plugin] Authenticating request to ${req.path}`);
  }
}

class LoggingPlugin extends BasePlugin {
  onRequest(req) {
    console.log(`[Logging Plugin] ${req.method} ${req.path}`);
  }

  onResponse(res) {
    console.log(`[Logging Plugin] Response: ${res.status}`);
  }
}

module.exports = {
  PluginHost,
  BasePlugin,
  AuthPlugin,
  LoggingPlugin
};
