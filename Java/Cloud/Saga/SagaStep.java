package Cloud.Saga;

import java.util.concurrent.Callable;

/**
 * Represents a single step in a saga with forward and compensation actions.
 */
public class SagaStep {
    private final String name;
    private final Callable<String> action;
    private final Callable<String> compensation;

    public SagaStep(String name, Callable<String> action, Callable<String> compensation) {
        this.name = name;
        this.action = action;
        this.compensation = compensation;
    }

    public String getName() {
        return name;
    }

    public String execute() throws Exception {
        System.out.println("  Executing: " + name);
        String result = action.call();
        System.out.println("    ✓ " + result);
        return result;
    }

    public String compensate() throws Exception {
        System.out.println("  Compensating: " + name);
        String result = compensation.call();
        System.out.println("    ↶ " + result);
        return result;
    }
}
