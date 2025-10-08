/**
 * Anti-Pattern Pattern
 */
class Anti-Pattern {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('Anti-Pattern executing with config:', this.config);
    return { success: true, pattern: 'Anti-Pattern' };
  }
}

module.exports = Anti-Pattern;
