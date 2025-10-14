package Integration.ChannelAdapter;

import java.util.HashMap;
import java.util.Map;

/**
 * AdapterRegistry manages the lifecycle of channel adapters.
 * It provides a central registry for adapter instances.
 */
public class AdapterRegistry {
    private final Map<String, ChannelAdapter> adapters;

    /**
     * Constructs an AdapterRegistry.
     */
    public AdapterRegistry() {
        this.adapters = new HashMap<>();
    }

    /**
     * Registers an adapter.
     *
     * @param adapter The adapter to register
     */
    public void registerAdapter(ChannelAdapter adapter) {
        adapters.put(adapter.getAdapterName(), adapter);
    }

    /**
     * Gets an adapter by name.
     *
     * @param name The adapter name
     * @return The adapter, or null if not found
     */
    public ChannelAdapter getAdapter(String name) {
        return adapters.get(name);
    }

    /**
     * Unregisters an adapter.
     *
     * @param name The adapter name
     */
    public void unregisterAdapter(String name) {
        ChannelAdapter adapter = adapters.remove(name);
        if (adapter != null && adapter.isRunning()) {
            adapter.stop();
        }
    }

    /**
     * Stops all adapters.
     */
    public void stopAll() {
        for (ChannelAdapter adapter : adapters.values()) {
            if (adapter.isRunning()) {
                adapter.stop();
            }
        }
    }
}
