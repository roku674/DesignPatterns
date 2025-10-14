package Concurrency.ExtensionInterface;

import java.util.*;
import java.util.concurrent.*;

/**
 * ExtensionInterface Pattern Implementation
 *
 * Allows new functionality to be added to components without modifying
 * their code, using a plugin architecture with thread-safe registration.
 */
public class ExtensionInterfaceImpl {
    
    interface Extension {
        String getName();
        void execute();
    }
    
    private final List<Extension> extensions = new CopyOnWriteArrayList<>();
    
    public void registerExtension(Extension extension) {
        extensions.add(extension);
        System.out.println("Registered extension: " + extension.getName());
    }
    
    public void unregisterExtension(String name) {
        extensions.removeIf(ext -> ext.getName().equals(name));
        System.out.println("Unregistered extension: " + name);
    }
    
    public void executeAll() {
        System.out.println("Executing all extensions:");
        for (Extension ext : extensions) {
            ext.execute();
        }
    }
    
    public void demonstrate() {
        System.out.println("=== ExtensionInterface Pattern Demonstration ===\n");
        
        registerExtension(new Extension() {
            public String getName() { return "LoggingExtension"; }
            public void execute() { System.out.println("  - Logging active"); }
        });
        
        registerExtension(new Extension() {
            public String getName() { return "MonitoringExtension"; }
            public void execute() { System.out.println("  - Monitoring active"); }
        });
        
        executeAll();
        
        unregisterExtension("LoggingExtension");
        System.out.println("\nAfter removing logging:");
        executeAll();
        
        System.out.println("\nExtensionInterface demonstration complete");
    }
}
