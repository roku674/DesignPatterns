/**
 * Saga Pattern
 */

class SagaStep {
  constructor(name, action, compensation) {
    this.name = name;
    this.action = action;
    this.compensation = compensation;
  }
}

class Saga {
  constructor(name) {
    this.name = name;
    this.steps = [];
    this.completedSteps = [];
  }

  addStep(name, action, compensation) {
    this.steps.push(new SagaStep(name, action, compensation));
    return this;
  }

  async execute() {
    try {
      for (const step of this.steps) {
        console.log(`   Executing: ${step.name}`);
        await step.action();
        this.completedSteps.push(step);
      }
      console.log(`   ✓ Saga ${this.name} completed successfully`);
      return true;
    } catch (error) {
      console.log(`   ✗ Saga ${this.name} failed: ${error.message}`);
      await this.compensate();
      return false;
    }
  }

  async compensate() {
    console.log(`   Starting compensation for ${this.name}`);
    for (let i = this.completedSteps.length - 1; i >= 0; i--) {
      const step = this.completedSteps[i];
      console.log(`   Compensating: ${step.name}`);
      await step.compensation();
    }
    console.log(`   ✓ Compensation completed`);
  }
}

module.exports = { Saga };
