/**
 * InterceptingFilter Pattern
 */
class InterceptingFilter {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('InterceptingFilter executing with config:', this.config);
    return { success: true, pattern: 'InterceptingFilter' };
  }
}

module.exports = InterceptingFilter;
