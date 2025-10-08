/**
 * AntiPattern Pattern
 */
class AntiPattern {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('AntiPattern executing with config:', this.config);
    return { success: true, pattern: 'AntiPattern' };
  }
}

module.exports = AntiPattern;
