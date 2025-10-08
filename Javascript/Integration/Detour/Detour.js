/**
 * Detour Pattern
 */
class Detour {
  constructor(config = {}) {
    this.config = config;
  }

  execute() {
    console.log('Detour executing with config:', this.config);
    return { success: true, pattern: 'Detour' };
  }
}

module.exports = Detour;
