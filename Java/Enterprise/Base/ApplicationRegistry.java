package Enterprise.Base;

import java.util.HashMap;
import java.util.Map;

/**
 * Registry Pattern
 * Singleton registry for locating services and resources.
 * Provides a well-known object that other objects can use to find common services.
 */
public class ApplicationRegistry {
    private static ApplicationRegistry instance;
    private final Map<String, Object> services;

    private ApplicationRegistry() {
        this.services = new HashMap<>();
    }

    public static synchronized ApplicationRegistry getInstance() {
        if (instance == null) {
            instance = new ApplicationRegistry();
        }
        return instance;
    }

    public void registerService(String name, Object service) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Service name cannot be null or empty");
        }
        if (service == null) {
            throw new IllegalArgumentException("Service cannot be null");
        }
        services.put(name, service);
    }

    public Object getService(String name) {
        Object service = services.get(name);
        if (service == null) {
            throw new IllegalStateException("Service not found: " + name);
        }
        return service;
    }

    public <T> T getService(String name, Class<T> type) {
        Object service = getService(name);
        if (!type.isInstance(service)) {
            throw new ClassCastException(
                "Service " + name + " is not of type " + type.getName()
            );
        }
        return type.cast(service);
    }

    public boolean hasService(String name) {
        return services.containsKey(name);
    }

    public void unregisterService(String name) {
        services.remove(name);
    }

    public void clear() {
        services.clear();
    }
}
