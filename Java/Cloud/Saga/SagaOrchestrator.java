package Cloud.Saga;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

/**
 * Orchestrates saga execution with compensation on failure.
 */
public class SagaOrchestrator {
    private final List<SagaStep> steps;

    private SagaOrchestrator(Builder builder) {
        this.steps = builder.steps;
    }

    public static Builder builder() {
        return new Builder();
    }

    /**
     * Executes all saga steps sequentially.
     * If any step fails, executes compensation for completed steps in reverse order.
     */
    public SagaExecutionResult execute() {
        long startTime = System.currentTimeMillis();
        Stack<SagaStep> completedSteps = new Stack<>();
        int currentStepIndex = 0;

        try {
            for (SagaStep step : steps) {
                step.execute();
                completedSteps.push(step);
                currentStepIndex++;
            }

            long duration = System.currentTimeMillis() - startTime;
            return SagaExecutionResult.success(steps.size(), duration);

        } catch (Exception e) {
            System.out.println("\n  ✗ Saga failed at step " + (currentStepIndex + 1) + ": " + e.getMessage());
            System.out.println("  Starting compensation...\n");

            // Execute compensations in reverse order
            int compensatedCount = 0;
            while (!completedSteps.isEmpty()) {
                SagaStep step = completedSteps.pop();
                try {
                    step.compensate();
                    compensatedCount++;
                } catch (Exception ce) {
                    System.out.println("    ✗ Compensation failed: " + ce.getMessage());
                }
            }

            long duration = System.currentTimeMillis() - startTime;
            return SagaExecutionResult.failure(
                currentStepIndex,
                steps.get(currentStepIndex).getName(),
                e.getMessage(),
                compensatedCount,
                duration
            );
        }
    }

    public static class Builder {
        private final List<SagaStep> steps = new ArrayList<>();

        public Builder addStep(SagaStep step) {
            steps.add(step);
            return this;
        }

        public SagaOrchestrator build() {
            if (steps.isEmpty()) {
                throw new IllegalStateException("Saga must have at least one step");
            }
            return new SagaOrchestrator(this);
        }
    }
}
