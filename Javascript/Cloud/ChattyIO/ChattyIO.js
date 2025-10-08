/**
 * Chatty IO Pattern
 */
class ChattyIO {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('Chatty IO executing with config:', this.config);
    return { success: true, pattern: 'Chatty IO' };
  }
}

module.exports = ChattyIO;
