/**
 * No Caching Pattern
 */
class NoCaching {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('No Caching executing with config:', this.config);
    return { success: true, pattern: 'No Caching' };
  }
}

module.exports = NoCaching;
