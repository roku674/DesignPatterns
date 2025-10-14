package Integration.ChannelAdapter;

import java.util.Map;

/**
 * Base interface for channel adapters.
 * Channel adapters connect applications to messaging channels.
 */
public interface ChannelAdapter {
    /**
     * Configures the adapter with settings.
     *
     * @param config Configuration map
     */
    void configure(Map<String, Object> config);

    /**
     * Starts the adapter.
     */
    void start();

    /**
     * Stops the adapter.
     */
    void stop();

    /**
     * Checks if the adapter is running.
     *
     * @return true if running, false otherwise
     */
    boolean isRunning();

    /**
     * Gets the adapter name.
     *
     * @return The adapter name
     */
    String getAdapterName();
}
