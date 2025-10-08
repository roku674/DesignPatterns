/**
 * CoarseGrainedLock Pattern
 */
class CoarseGrainedLock {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('CoarseGrainedLock executing with config:', this.config);
    return { success: true, pattern: 'CoarseGrainedLock' };
  }
}

module.exports = CoarseGrainedLock;
