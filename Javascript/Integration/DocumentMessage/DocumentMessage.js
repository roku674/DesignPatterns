/**
 * DocumentMessage Pattern
 */
class DocumentMessage {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('DocumentMessage executing with config:', this.config);
    return { success: true, pattern: 'DocumentMessage' };
  }
}

module.exports = DocumentMessage;
