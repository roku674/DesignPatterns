/**
 * TransferObject Pattern
 */
class TransferObject {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('TransferObject executing with config:', this.config);
    return { success: true, pattern: 'TransferObject' };
  }
}

module.exports = TransferObject;
