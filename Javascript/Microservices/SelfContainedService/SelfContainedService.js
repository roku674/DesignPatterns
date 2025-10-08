/**
 * SelfContainedService Pattern
 */
class SelfContainedService {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('SelfContainedService executing with config:', this.config);
    return { success: true, pattern: 'SelfContainedService' };
  }
}

module.exports = SelfContainedService;
