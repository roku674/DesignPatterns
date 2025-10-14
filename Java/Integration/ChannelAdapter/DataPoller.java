package Integration.ChannelAdapter;

import java.util.Map;

/**
 * DataPoller interface for polling external data sources.
 * Used by inbound adapters to fetch data periodically.
 */
public interface DataPoller {
    /**
     * Configures the poller.
     *
     * @param config Configuration map
     */
    void configure(Map<String, Object> config);

    /**
     * Starts polling.
     */
    void start();

    /**
     * Stops polling.
     */
    void stop();
}

/**
 * Legacy system poller for mainframe integration.
 */
class LegacySystemPoller implements DataPoller {
    private Map<String, Object> config;

    @Override
    public void configure(Map<String, Object> config) {
        this.config = config;
    }

    @Override
    public void start() {
        // Start polling legacy system
    }

    @Override
    public void stop() {
        // Stop polling
    }
}

/**
 * Database change poller for CDC operations.
 */
class DatabaseChangePoller implements DataPoller {
    private Map<String, Object> config;

    @Override
    public void configure(Map<String, Object> config) {
        this.config = config;
    }

    @Override
    public void start() {
        // Start monitoring database
    }

    @Override
    public void stop() {
        // Stop monitoring
    }
}

/**
 * File system poller for file watching.
 */
class FileSystemPoller implements DataPoller {
    private Map<String, Object> config;

    @Override
    public void configure(Map<String, Object> config) {
        this.config = config;
    }

    @Override
    public void start() {
        // Start watching file system
    }

    @Override
    public void stop() {
        // Stop watching
    }
}

/**
 * IoT device poller for sensor data.
 */
class IoTDevicePoller implements DataPoller {
    private Map<String, Object> config;

    @Override
    public void configure(Map<String, Object> config) {
        this.config = config;
    }

    @Override
    public void start() {
        // Start receiving IoT data
    }

    @Override
    public void stop() {
        // Stop receiving
    }
}

/**
 * Failure-prone poller for testing error handling.
 */
class FailurePronePoller implements DataPoller {
    private Map<String, Object> config;

    @Override
    public void configure(Map<String, Object> config) {
        this.config = config;
    }

    @Override
    public void start() {
        // Start with potential failures
    }

    @Override
    public void stop() {
        // Stop
    }
}
