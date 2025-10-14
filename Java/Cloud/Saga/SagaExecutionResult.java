package Cloud.Saga;

public class SagaExecutionResult {
    private final boolean success;
    private final int completedSteps;
    private final int failedStepIndex;
    private final String failedStep;
    private final String error;
    private final int compensatedSteps;
    private final long durationMillis;

    private SagaExecutionResult(boolean success, int completedSteps, int failedStepIndex,
                                 String failedStep, String error, int compensatedSteps, long durationMillis) {
        this.success = success;
        this.completedSteps = completedSteps;
        this.failedStepIndex = failedStepIndex;
        this.failedStep = failedStep;
        this.error = error;
        this.compensatedSteps = compensatedSteps;
        this.durationMillis = durationMillis;
    }

    public static SagaExecutionResult success(int completedSteps, long durationMillis) {
        return new SagaExecutionResult(true, completedSteps, -1, null, null, 0, durationMillis);
    }

    public static SagaExecutionResult failure(int failedStepIndex, String failedStep, String error,
                                               int compensatedSteps, long durationMillis) {
        return new SagaExecutionResult(false, failedStepIndex, failedStepIndex, failedStep,
                                        error, compensatedSteps, durationMillis);
    }

    public boolean isSuccess() { return success; }
    public int getCompletedSteps() { return completedSteps; }
    public String getFailedStep() { return failedStep; }
    public String getError() { return error; }
    public int getCompensatedSteps() { return compensatedSteps; }
    public long getDurationMillis() { return durationMillis; }
}
