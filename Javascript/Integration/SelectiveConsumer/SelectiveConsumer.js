/**
 * SelectiveConsumer Pattern
 */
class SelectiveConsumer {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('SelectiveConsumer executing with config:', this.config);
    return { success: true, pattern: 'SelectiveConsumer' };
  }
}

module.exports = SelectiveConsumer;
