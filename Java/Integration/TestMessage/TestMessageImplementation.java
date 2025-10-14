package Integration.TestMessage;

import java.util.*;
import java.time.Instant;
import java.time.Duration;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Implementation of the TestMessage pattern.
 *
 * This class provides the core functionality for sends test messages to verify system functionality.
 *
 * Key Features:
 * - System testing
 * - Health verification
 * - End-to-end testing
 * - Smoke testing
 *
 * @author Enterprise Integration Patterns
 * @version 1.0
 */
public class TestMessageImplementation {

    private final String instanceId;
    private final Map<String, Object> configuration;
    private final Map<String, Object> metrics;
    private final AtomicInteger messageCounter;
    private final Instant startTime;
    private final ExecutorService executorService;

    /**
     * Constructs a new TestMessage implementation.
     */
    public TestMessageImplementation() {
        this.instanceId = UUID.randomUUID().toString().substring(0, 8);
        this.configuration = new ConcurrentHashMap<>();
        this.metrics = new ConcurrentHashMap<>();
        this.messageCounter = new AtomicInteger(0);
        this.startTime = Instant.now();
        this.executorService = Executors.newFixedThreadPool(4);

        initialize();
    }

    /**
     * Initializes the pattern implementation.
     */
    private void initialize() {
        configuration.put("instanceId", instanceId);
        configuration.put("startTime", startTime);
        configuration.put("patternName", "TestMessage");

        metrics.put("messagesProcessed", 0);
        metrics.put("scenariosExecuted", 0);
        metrics.put("errorsEncountered", 0);

        System.out.println("  ℹ TestMessage instance " + instanceId + " initialized");
    }

    /**
     * Processes a specific scenario.
     *
     * @param scenarioName The name of the scenario
     * @param scenarioDescription Description of what the scenario does
     */
    public void processScenario(String scenarioName, String scenarioDescription) {
        System.out.println("  → Processing: " + scenarioName);

        // Simulate message creation
        Message message = createMessage(scenarioName, scenarioDescription);
        System.out.println("  ℹ Created message: " + message.getMessageId());

        // Execute pattern-specific logic
        executePatternLogic(message, scenarioName);

        // Update metrics
        updateMetrics();

        System.out.println("  ✓ Scenario processing completed");
    }

    /**
     * Creates a message for the scenario.
     */
    private Message createMessage(String scenarioName, String description) {
        Message message = new Message(scenarioName);
        message.setHeader("scenarioDescription", description);
        message.setHeader("instanceId", instanceId);
        message.setHeader("messageNumber", messageCounter.incrementAndGet());
        return message;
    }

    /**
     * Executes the core pattern logic.
     */
    private void executePatternLogic(Message message, String scenarioName) {
        System.out.println("  → Executing TestMessage logic...");

        try {
            // Simulate pattern-specific processing
            Thread.sleep(50); // Simulate work

            // Pattern-specific logic would go here
            // In real implementation, this would contain:
            // - Message routing logic
            // - Transformation logic
            // - Channel operations
            // - Error handling
            // - Monitoring and logging

            System.out.println("  ✓ Pattern logic executed for: " + scenarioName);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("  ✗ Execution interrupted");
        } catch (Exception e) {
            System.err.println("  ✗ Error executing pattern logic: " + e.getMessage());
            incrementErrorCount();
        }
    }

    /**
     * Updates processing metrics.
     */
    private void updateMetrics() {
        int processed = (int) metrics.get("messagesProcessed") + 1;
        metrics.put("messagesProcessed", processed);

        int scenarios = (int) metrics.get("scenariosExecuted") + 1;
        metrics.put("scenariosExecuted", scenarios);
    }

    /**
     * Increments error count.
     */
    private void incrementErrorCount() {
        int errors = (int) metrics.get("errorsEncountered") + 1;
        metrics.put("errorsEncountered", errors);
    }

    /**
     * Gets the instance ID.
     *
     * @return The instance ID
     */
    public String getInstanceId() {
        return instanceId;
    }

    /**
     * Gets a configuration value.
     *
     * @param key The configuration key
     * @return The configuration value
     */
    public Object getConfiguration(String key) {
        return configuration.get(key);
    }

    /**
     * Gets a metric value.
     *
     * @param key The metric key
     * @return The metric value
     */
    public Object getMetric(String key) {
        return metrics.get(key);
    }

    /**
     * Gets all metrics.
     *
     * @return Map of all metrics
     */
    public Map<String, Object> getAllMetrics() {
        return new HashMap<>(metrics);
    }

    /**
     * Shuts down the implementation.
     */
    public void shutdown() {
        executorService.shutdown();
        try {
            if (!executorService.awaitTermination(5, TimeUnit.SECONDS)) {
                executorService.shutdownNow();
            }
        } catch (InterruptedException e) {
            executorService.shutdownNow();
            Thread.currentThread().interrupt();
        }

        System.out.println("  ℹ TestMessage instance " + instanceId + " shut down");
    }
}
