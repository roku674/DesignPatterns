/**
 * Sequential Convoy Pattern
 */
class SequentialConvoy {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('Sequential Convoy executing with config:', this.config);
    return { success: true, pattern: 'Sequential Convoy' };
  }
}

module.exports = SequentialConvoy;
