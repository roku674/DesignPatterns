/**
 * ImplicitLock Pattern
 */
class ImplicitLock {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('ImplicitLock executing with config:', this.config);
    return { success: true, pattern: 'ImplicitLock' };
  }
}

module.exports = ImplicitLock;
