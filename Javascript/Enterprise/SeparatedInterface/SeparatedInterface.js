/**
 * SeparatedInterface Pattern
 */
class SeparatedInterface {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('SeparatedInterface executing with config:', this.config);
    return { success: true, pattern: 'SeparatedInterface' };
  }
}

module.exports = SeparatedInterface;
