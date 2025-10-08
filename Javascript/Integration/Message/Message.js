/**
 * Message Pattern
 */
class Message {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('Message executing with config:', this.config);
    return { success: true, pattern: 'Message' };
  }
}

module.exports = Message;
