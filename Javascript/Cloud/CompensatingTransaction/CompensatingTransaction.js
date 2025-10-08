/**
 * CompensatingTransaction Pattern
 */
class CompensatingTransaction {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('CompensatingTransaction executing with config:', this.config);
    return { success: true, pattern: 'CompensatingTransaction' };
  }
}

module.exports = CompensatingTransaction;
