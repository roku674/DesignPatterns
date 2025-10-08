/**
 * Improper Instantiation Pattern
 */
class ImproperInstantiation {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('Improper Instantiation executing with config:', this.config);
    return { success: true, pattern: 'Improper Instantiation' };
  }
}

module.exports = ImproperInstantiation;
