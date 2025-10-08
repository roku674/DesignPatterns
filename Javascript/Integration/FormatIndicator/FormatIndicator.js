/**
 * FormatIndicator Pattern
 */
class FormatIndicator {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('FormatIndicator executing with config:', this.config);
    return { success: true, pattern: 'FormatIndicator' };
  }
}

module.exports = FormatIndicator;
