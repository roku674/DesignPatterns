/**
 * TestMessage Pattern
 */
class TestMessage {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('TestMessage executing with config:', this.config);
    return { success: true, pattern: 'TestMessage' };
  }
}

module.exports = TestMessage;
