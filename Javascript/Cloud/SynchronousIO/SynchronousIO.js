/**
 * Synchronous IO Pattern
 */
class SynchronousIO {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('Synchronous IO executing with config:', this.config);
    return { success: true, pattern: 'Synchronous IO' };
  }
}

module.exports = SynchronousIO;
