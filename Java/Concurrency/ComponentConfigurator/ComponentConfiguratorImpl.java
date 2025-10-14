package Concurrency.ComponentConfigurator;

import java.util.*;
import java.util.concurrent.*;

/**
 * ComponentConfigurator Pattern Implementation
 *
 * Dynamically configures and reconfigures components at runtime
 * in a thread-safe manner without recompiling or restarting.
 */
public class ComponentConfiguratorImpl {
    
    private final Map<String, Component> components = new ConcurrentHashMap<>();
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
    
    interface Component {
        void execute();
        String getName();
    }
    
    public void configure(String name, Component component) {
        lock.writeLock().lock();
        try {
            components.put(name, component);
            System.out.println("Configured component: " + name);
        } finally {
            lock.writeLock().unlock();
        }
    }
    
    public void reconfigure(String name, Component newComponent) {
        lock.writeLock().lock();
        try {
            components.put(name, newComponent);
            System.out.println("Reconfigured component: " + name);
        } finally {
            lock.writeLock().unlock();
        }
    }
    
    public void remove(String name) {
        lock.writeLock().lock();
        try {
            components.remove(name);
            System.out.println("Removed component: " + name);
        } finally {
            lock.writeLock().unlock();
        }
    }
    
    public void executeComponent(String name) {
        lock.readLock().lock();
        try {
            Component component = components.get(name);
            if (component != null) {
                component.execute();
            }
        } finally {
            lock.readLock().unlock();
        }
    }
    
    public void demonstrate() {
        System.out.println("=== ComponentConfigurator Pattern Demonstration ===\n");
        
        configure("Logger", () -> System.out.println("Logging..."));
        configure("Monitor", () -> System.out.println("Monitoring..."));
        
        executeComponent("Logger");
        executeComponent("Monitor");
        
        reconfigure("Logger", () -> System.out.println("Enhanced logging..."));
        executeComponent("Logger");
        
        remove("Monitor");
        System.out.println("\nComponentConfigurator demonstration complete");
    }
    
    private static interface Component {
        void execute();
        default String getName() { return this.getClass().getSimpleName(); }
    }
}
